import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
// @ts-ignore - The toolz-gsmarena-api library acts as a robust scraping helper
import { discoverDevice, catalog, generateSmartStrategies } from 'gsmarena-api';

/**
 * Device Specs Handler — Revamped
 *
 * Architecture:
 *  1. Strategy-based Redis cache check  → instant hit
 *  2. Redis lock acquired               → prevents concurrent scrapes for same device
 *  3. discoverDevice()                  → Suggest → Search → External discovery
 *  4. catalog.getDevice()               → scrapes spec page
 *  5. Store canonical result            → future requests are cache hits
 *
 * Response shape (matches Android DeviceSpecResponse):
 *  {
 *    search_query:   string,
 *    matched_device: string,  ← was always blank before; now always populated
 *    source_url:     string,
 *    image:          string,
 *    specifications: Record<string, Record<string, string>>,
 *    timing_ms:      number,
 *    cached:         boolean,
 *  }
 */

// Increased from 9600 to 25000; vercel.json sets maxDuration:25 to allow this
const TOTAL_BUDGET_MS = 25_000;

function getDeviceId(url: string | null): string | null {
  if (!url) return null;
  try {
    const slug = url.split('/').pop()?.replace('.php', '');
    if (!slug) return null;
    return slug.split('-')[0] || null;
  } catch {
    return null;
  }
}

/**
 * Acquires a Redis lock using SET NX EX.
 * Returns true if the lock was acquired, false if already held.
 */
async function acquireLock(redis: Redis, key: string, ttlSeconds: number): Promise<boolean> {
  const result = await redis.set(key, '1', { nx: true, ex: ttlSeconds });
  return result === 'OK';
}

async function releaseLock(redis: Redis, key: string): Promise<void> {
  await redis.del(key).catch(() => {/* ignore */});
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TOTAL_BUDGET_MS);

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    const rawQuery = req.query.model;
    if (!rawQuery || typeof rawQuery !== 'string') {
      return res.status(400).json({ error: "Missing or invalid 'model' parameter" });
    }

    const cleanInput = rawQuery.trim();

    // --- Redis setup (optional but strongly recommended) ---
    let redis: Redis | null = null;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = Redis.fromEnv();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tier 1: Strategy-based Cache Check
    // ─────────────────────────────────────────────────────────────────────────
    const inputStrategies = generateSmartStrategies(cleanInput);
    let targetDeviceUrl: string | null = null;
    let searchName = cleanInput;

    if (redis && inputStrategies.length > 0) {
      try {
        // Check if any strategy variant maps to a known device URL
        const urlMapKeys = inputStrategies.map(s => `url_map:${s.toLowerCase()}`);
        const mappedUrls = await redis.mget<(string | null)[]>(...urlMapKeys);
        targetDeviceUrl = mappedUrls.find(u => !!u) || null;

        // Check if any strategy maps to a canonical device name
        const translationKeys = inputStrategies.map(s => `device:${s.toLowerCase()}`);
        const translations = await redis.mget<(string | null)[]>(...translationKeys);
        const firstTranslation = translations.find(t => !!t);

        if (firstTranslation) {
          searchName = firstTranslation;
          if (!targetDeviceUrl) {
            targetDeviceUrl = await redis.get<string>(`url_map:${searchName.toLowerCase()}`);
          }
        }

        // If we have a URL, check for cached canonical spec data
        if (targetDeviceUrl) {
          const deviceId = getDeviceId(targetDeviceUrl);
          if (deviceId) {
            const canonicalData = await redis.get<any>(`specs:url:${deviceId}`);
            if (canonicalData) {
              const payload = typeof canonicalData === 'string' ? JSON.parse(canonicalData) : canonicalData;
              return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
            }
          }
        }
      } catch (redisError) {
        console.error('[Cache] Strategy lookup failed:', redisError);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tier 2: Request Deduplication via Redis Lock
    //
    // Prevents concurrent requests for the same device from all hammering
    // ScraperAPI simultaneously. Losers poll the cache for up to 18 s.
    // ─────────────────────────────────────────────────────────────────────────
    const lockKey = `lock:specs:${cleanInput.toLowerCase()}`;
    let lockAcquired = false;

    if (redis) {
      lockAcquired = await acquireLock(redis, lockKey, 28 /* slightly longer than budget */);

      if (!lockAcquired) {
        // Another request is already scraping this device — poll cache
        console.info(`[Lock] Waiting for concurrent scrape of "${cleanInput}" to complete...`);
        const pollStart = Date.now();
        while (Date.now() - pollStart < 18_000) {
          await new Promise(r => setTimeout(r, 600));

          try {
            const urlMapKeys = inputStrategies.map(s => `url_map:${s.toLowerCase()}`);
            const mappedUrls = await redis.mget<(string | null)[]>(...urlMapKeys);
            const polledUrl = mappedUrls.find(u => !!u) || null;

            if (polledUrl) {
              const deviceId = getDeviceId(polledUrl);
              if (deviceId) {
                const canonicalData = await redis.get<any>(`specs:url:${deviceId}`);
                if (canonicalData) {
                  const payload = typeof canonicalData === 'string' ? JSON.parse(canonicalData) : canonicalData;
                  console.info(`[Lock] Cache populated by concurrent request, returning cached result.`);
                  return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
                }
              }
            }
          } catch { /* ignore polling errors */ }
        }
        // Lock poller timed out — proceed to scrape ourselves as a fallback
        console.warn(`[Lock] Poller timed out for "${cleanInput}", proceeding with own scrape.`);
      }
    }

    try {
      // ───────────────────────────────────────────────────────────────────────
      // Tier 3: Discovery via Library Helper (Suggest → Search → External)
      // ───────────────────────────────────────────────────────────────────────
      let suggestImage: string = '';
      let sawTurnstile = false;

      if (!targetDeviceUrl) {
        console.info(`[Discovery] Starting multi-phase discovery for: "${searchName}"`);

        const discovery = await discoverDevice(searchName, controller.signal, {
          totalBudget: TOTAL_BUDGET_MS,
          startTime
        });

        targetDeviceUrl = discovery.matchedUrl;
        suggestImage = discovery.suggestImage;
        sawTurnstile = discovery.turnstile;

        // Double-check cache with newly discovered URL
        if (targetDeviceUrl && redis) {
          const deviceId = getDeviceId(targetDeviceUrl);
          if (deviceId) {
            const canonicalData = await redis.get(`specs:url:${deviceId}`);
            if (canonicalData) {
              const payload = typeof canonicalData === 'string' ? JSON.parse(canonicalData) : canonicalData;
              await redis.set(`url_map:${cleanInput.toLowerCase()}`, targetDeviceUrl, { ex: 2_592_000 });
              return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
            }
          }
        }
      }

      if (!targetDeviceUrl) {
        return res.status(sawTurnstile ? 502 : 404).json({
          error: sawTurnstile ? 'Blocked by anti-bot protection during discovery' : 'Device not found',
          query: cleanInput,
          timing_ms: Date.now() - startTime
        });
      }

      // ───────────────────────────────────────────────────────────────────────
      // Tier 4: Extraction via Library Helper
      // ───────────────────────────────────────────────────────────────────────
      const elapsed = Date.now() - startTime;
      const remaining = TOTAL_BUDGET_MS - elapsed;

      console.info(`[Extraction] Fetching specs from: ${targetDeviceUrl} (${remaining}ms remaining)`);

      const extraction = await catalog.getDevice(targetDeviceUrl, {
        signal: controller.signal,
        // Allow JS-render escalation if we have at least 8 s left
        allowRender: remaining > 8_000,
      });

      if (!extraction || !extraction.specifications) {
        return res.status(502).json({
          error: 'Failed to extract specs from device page',
          url: targetDeviceUrl,
          timing_ms: Date.now() - startTime
        });
      }

      // ───────────────────────────────────────────────────────────────────────
      // Build response payload — matched_device is now always populated
      // ───────────────────────────────────────────────────────────────────────
      const matchedDevice = (extraction.name || searchName || cleanInput).trim();

      const payload = {
        search_query: cleanInput,
        search_name: searchName,
        matched_device: matchedDevice,       // ← Android DeviceSpecResponse.matchedDevice
        source_url: targetDeviceUrl,
        image: extraction.img || suggestImage || '',
        specifications: extraction.specifications,
        timing_ms: Date.now() - startTime,
        cached: false,
      };

      // ───────────────────────────────────────────────────────────────────────
      // Tier 5: Cache Storage
      // ───────────────────────────────────────────────────────────────────────
      if (redis) {
        const deviceId = getDeviceId(targetDeviceUrl);
        const pipe = redis.pipeline();

        if (deviceId) {
          // Store canonical data keyed by device ID (90 days)
          pipe.set(`specs:url:${deviceId}`, JSON.stringify(payload), { ex: 7_776_000 });
        }

        // Map input + all strategy variants → device URL (30 days)
        pipe.set(`url_map:${cleanInput.toLowerCase()}`, targetDeviceUrl, { ex: 2_592_000 });
        if (searchName !== cleanInput) {
          pipe.set(`url_map:${searchName.toLowerCase()}`, targetDeviceUrl, { ex: 2_592_000 });
        }
        for (const variant of inputStrategies) {
          pipe.set(`url_map:${variant.toLowerCase()}`, targetDeviceUrl, { ex: 2_592_000 });
        }

        await pipe.exec();
      }

      return res.status(200).json(payload);

    } finally {
      // Always release the lock regardless of success or failure
      if (redis && lockAcquired) {
        await releaseLock(redis, lockKey);
      }
    }

  } catch (err: any) {
    console.error('[specs] Critical failure:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  } finally {
    clearTimeout(timeoutId);
  }
}
