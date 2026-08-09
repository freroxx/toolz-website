import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
// @ts-ignore - The toolz-gsmarena-api library acts as a robust scraping helper
import { discoverDevice, catalog } from 'gsmarena-api';
import { generateSmartStrategies } from 'gsmarena-api/src/services/utils';

/**
 * Device Specs Handler
 * Orchestrates device discovery and extraction using the gsmarena-api library
 * as a helper, while maintaining website-specific Redis caching.
 */

function getDeviceId(url: string | null): string | null {
  if (!url) return null;
  try {
    const slug = url.split('/').pop()?.replace('.php', '');
    if (!slug) return null;
    return slug.split('-')[0] || null;
  } catch (e) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const controller = new AbortController();
  const totalBudget = 9600;
  const timeoutId = setTimeout(() => controller.abort(), totalBudget);

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
    let redis: Redis | null = null;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = Redis.fromEnv();
    }

    // --- Tier 1: Strategy-based Cache Check ---
    const inputStrategies = generateSmartStrategies(cleanInput);
    let targetDeviceUrl: string | null = null;
    let searchName = cleanInput;

    if (redis && inputStrategies.length > 0) {
      try {
        const urlMapKeys = inputStrategies.map(s => `url_map:${s.toLowerCase()}`);
        const mappedUrls = await redis.mget<(string | null)[]>(...urlMapKeys);
        targetDeviceUrl = mappedUrls.find(u => !!u) || null;

        const translationKeys = inputStrategies.map(s => `device:${s.toLowerCase()}`);
        const translations = await redis.mget<(string | null)[]>(...translationKeys);
        const firstTranslation = translations.find(t => !!t);

        if (firstTranslation) {
          searchName = firstTranslation;
          if (!targetDeviceUrl) {
            targetDeviceUrl = await redis.get<string>(`url_map:${searchName.toLowerCase()}`);
          }
        }

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
        console.error("[Cache] Strategy lookup failed:", redisError);
      }
    }

    // --- Tier 2: Discovery via Library Helper ---
    let suggestImage: string = '';
    let sawTurnstile = false;

    if (!targetDeviceUrl) {
      console.info(`[Discovery] Handing off to gsmarena-api helper for: ${searchName}`);

      // Use the library's robust multi-phase discovery (Suggest -> Search -> External)
      const discovery = await discoverDevice(searchName, controller.signal, { totalBudget });

      targetDeviceUrl = discovery.matchedUrl;
      suggestImage = discovery.suggestImage;
      sawTurnstile = discovery.turnstile;

      // Double-check cache with discovered URL
      if (targetDeviceUrl && redis) {
        const deviceId = getDeviceId(targetDeviceUrl);
        if (deviceId) {
          const canonicalData = await redis.get(`specs:url:${deviceId}`);
          if (canonicalData) {
            const payload = typeof canonicalData === 'string' ? JSON.parse(canonicalData) : canonicalData;
            await redis.set(`url_map:${cleanInput.toLowerCase()}`, targetDeviceUrl, { ex: 2592000 });
            return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
          }
        }
      }
    }

    if (!targetDeviceUrl) {
      return res.status(sawTurnstile ? 502 : 404).json({
          error: sawTurnstile ? "Blocked by anti-bot during discovery" : "Device not found",
          timing_ms: Date.now() - startTime
      });
    }

    // --- Tier 3: Extraction via Library Helper ---
    const remaining = totalBudget - (Date.now() - startTime);

    const extraction = await catalog.getDevice(targetDeviceUrl, {
        signal: controller.signal,
        allowRender: remaining > 5000 // Only escalate to rendering if budget allows
    });

    if (!extraction || !extraction.specifications) {
      return res.status(502).json({ error: "Failed to extract specs", url: targetDeviceUrl, timing_ms: Date.now() - startTime });
    }

    const payload = {
      search_query: cleanInput,
      search_name: searchName,
      source_url: targetDeviceUrl,
      image: extraction.img || suggestImage || '',
      specifications: extraction.specifications,
      timing_ms: Date.now() - startTime
    };

    // --- Tier 4: Storage ---
    if (redis) {
      const deviceId = getDeviceId(targetDeviceUrl);
      const pipe = redis.pipeline();

      if (deviceId) {
        pipe.set(`specs:url:${deviceId}`, JSON.stringify(payload), { ex: 7776000 });
      }

      pipe.set(`url_map:${cleanInput.toLowerCase()}`, targetDeviceUrl, { ex: 2592000 });
      if (searchName !== cleanInput) {
        pipe.set(`url_map:${searchName.toLowerCase()}`, targetDeviceUrl, { ex: 2592000 });
      }

      for (const variant of inputStrategies) {
          pipe.set(`url_map:${variant.toLowerCase()}`, targetDeviceUrl, { ex: 2592000 });
      }

      await pipe.exec();
    }

    return res.status(200).json(payload);

  } catch (err: any) {
    console.error("Critical Failure:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    clearTimeout(timeoutId);
  }
}
