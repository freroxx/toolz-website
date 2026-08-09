import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

/**
 * Device Specs API — Next-Gen v2 Architecture
 *
 * Discovery Strategy:
 *  1. Redis cache hit (instant)
 *  2. Static GSMArena Quicksearch Index — 0ms device URL resolution, no bot challenges
 *  3. Direct spec page fetch — direct GSMArena HTML is rarely blocked (~150ms)
 *  4. ScraperAPI proxy fallback if Turnstile detected
 *
 * Features:
 *  - Infinite Redis caching (no TTL) for specs + URL maps
 *  - Request deduplication via Redis locks
 *  - ?refresh=1 to force-bypass cache
 *  - Samsung SM-xxxx / model number normalization
 *  - Brand-aware scoring in quicksearch matching
 */

const TOTAL_BUDGET_MS = 25_000;
// The quicksearch index URL is static — GSMArena updates the numeric suffix on major catalog changes.
// We store it in Redis so we can update it without a redeploy via: redis.set('gsm:quicksearch_url', '<new_url>')
const DEFAULT_QUICKSEARCH_URL = 'https://www.gsmarena.com/quicksearch-82698.jpg';
const REDIS_CATALOG_KEY = 'cache:gsm_quicksearch_catalog';
const REDIS_QUICKSEARCH_URL_KEY = 'gsm:quicksearch_url';

// ──────────────────────────────────────────────────────────────────────────────
// User-Agent rotation
// ──────────────────────────────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
];
const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// ──────────────────────────────────────────────────────────────────────────────
// Turnstile / anti-bot detection
// ──────────────────────────────────────────────────────────────────────────────
function isTurnstile(html: string): boolean {
  if (!html || typeof html !== 'string') return false;
  const t = html.trim();
  if (t.startsWith('{') || t.startsWith('[')) return false;
  const lo = html.toLowerCase();
  return (
    lo.includes('cf-turnstile') ||
    lo.includes('turnstile-verify') ||
    lo.includes('challenge-form') ||
    lo.includes('verify you are human') ||
    lo.includes('one quick check before you continue')
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// HTTP fetch helper — direct first, proxy fallback
// ──────────────────────────────────────────────────────────────────────────────
type FetchResult = { text: string | null; status: number | null; turnstile?: boolean };

async function fetchHtml(
  targetUrl: string,
  signal: AbortSignal | null = null,
  options: { render?: boolean; timeoutMs?: number; forceProxy?: boolean } = {}
): Promise<FetchResult> {
  const { render = false, timeoutMs = render ? 12_000 : 6_000, forceProxy = false } = options;

  const proxyKeys = [
    process.env.SCRAPER_API_KEY,
    process.env.SCRAPER_API_KEY_1,
    process.env.SCRAPER_API_KEY_2,
  ].filter(Boolean) as string[];

  const doFetch = async (url: string, isProxy: boolean): Promise<FetchResult> => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);

    let combinedSignal: AbortSignal = ac.signal;
    if (signal) {
      try {
        // @ts-ignore — AbortSignal.any() is Node 20+
        if (typeof AbortSignal.any === 'function') {
          // @ts-ignore
          combinedSignal = AbortSignal.any([ac.signal, signal]);
        } else {
          signal.addEventListener('abort', () => ac.abort(), { once: true });
        }
      } catch { /* use ac.signal */ }
    }

    try {
      const headers: Record<string, string> = {};
      if (!isProxy) {
        headers['User-Agent'] = randomUA();
        headers['Accept-Language'] = 'en-US,en;q=0.9';
        headers['Referer'] = 'https://www.gsmarena.com/';
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
      }

      const resp = await fetch(url, { headers, signal: combinedSignal });
      const text = await resp.text();

      if (!resp.ok) return { text: null, status: resp.status };
      if (isTurnstile(text)) return { text, status: resp.status, turnstile: true };
      return { text, status: resp.status };
    } catch {
      return { text: null, status: null };
    } finally {
      clearTimeout(timer);
    }
  };

  // Direct fetch (skip if forceProxy set)
  if (!forceProxy) {
    const direct = await doFetch(targetUrl, false);
    if (direct.text && !direct.turnstile) return direct;
  }

  // Proxy fallback — try each key in order
  for (const key of proxyKeys) {
    const pUrl = new URL('https://api.scraperapi.com/');
    pUrl.searchParams.set('api_key', key);
    pUrl.searchParams.set('url', targetUrl);
    if (render) {
      pUrl.searchParams.set('render', 'true');
      pUrl.searchParams.set('premium', 'true');
    }
    const proxyRes = await doFetch(pUrl.toString(), true);
    if (proxyRes.text && !proxyRes.turnstile) return proxyRes;

    // Escalate to JS render if still Turnstile
    if (proxyRes.turnstile && !render) {
      pUrl.searchParams.set('render', 'true');
      pUrl.searchParams.set('premium', 'true');
      const renderRes = await doFetch(pUrl.toString(), true);
      if (renderRes.text && !renderRes.turnstile) return renderRes;
    }
  }

  return { text: null, status: null };
}

// ──────────────────────────────────────────────────────────────────────────────
// Samsung model-number normalization
// "SM-A366B" → ["SM-A366B", "A366B", "A36", "Galaxy A36"]
// ──────────────────────────────────────────────────────────────────────────────
function normalizeSamsungModel(raw: string): string[] {
  const results: string[] = [];
  const upper = raw.toUpperCase().trim();

  // Strip known Samsung prefixes
  const stripped = upper.replace(/^(SM-|GT-|SCH-|SGH-|SPH-|SCV|SC-|SCG|SHV-|SHW-)/, '');
  if (stripped !== upper) results.push(stripped);

  // e.g. A366B → A36 (drop suffix digits/letters after 2-digit model number)
  const baseMatch = stripped.match(/^([A-Z]\d{2,3})/);
  if (baseMatch) results.push(baseMatch[1]);

  return results;
}

// ──────────────────────────────────────────────────────────────────────────────
// Multi-strategy query normalizer
// ──────────────────────────────────────────────────────────────────────────────
function buildStrategies(input: string): string[] {
  const raw = (input || '').trim();
  if (!raw) return [];

  const strategies: string[] = [];
  const add = (s: string) => { const t = s.trim(); if (t.length >= 2) strategies.push(t); };

  add(raw);
  add(raw.toLowerCase());

  // Remove punctuation noise
  const clean = raw.replace(/[\/:,#()\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  add(clean);
  add(clean.toLowerCase());

  // Strip Samsung prefixes and abbreviate
  const samsungNorms = normalizeSamsungModel(raw);
  for (const n of samsungNorms) {
    add(n);
    add(n.toLowerCase());
    add(`samsung ${n}`);
    add(`Galaxy ${n}`);
  }

  // Split camel/number boundaries (e.g. "Pixel8" → "Pixel 8")
  const split = clean.replace(/([a-zA-Z])(\d)/g, '$1 $2').replace(/(\d)([a-zA-Z])/g, '$1 $2');
  add(split);

  // Individual meaningful words (length > 2)
  const parts = split.split(/\s+/).filter(w => w.length > 2);
  if (parts.length > 1) {
    add(parts.slice(-1).join(' ')); // last word (often model number)
    add(parts.join(' '));           // all words
  }

  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}

// ──────────────────────────────────────────────────────────────────────────────
// GSMArena Quicksearch Index — fast 0ms device lookup
// ──────────────────────────────────────────────────────────────────────────────
interface QuicksearchMatch {
  matchedUrl: string;
  matchedName: string;
  image: string;
}

async function getQuicksearchCatalog(redis: Redis | null): Promise<any[] | null> {
  // Try Redis cache first (permanent storage)
  if (redis) {
    try {
      const cached = await redis.get<string>(REDIS_CATALOG_KEY);
      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }
    } catch {}
  }

  // Determine the index URL (updateable via Redis key)
  let indexUrl = DEFAULT_QUICKSEARCH_URL;
  if (redis) {
    try {
      const customUrl = await redis.get<string>(REDIS_QUICKSEARCH_URL_KEY);
      if (customUrl) indexUrl = customUrl;
    } catch {}
  }

  console.info(`[Quicksearch] Fetching catalog from ${indexUrl}`);
  try {
    const resp = await fetch(indexUrl, {
      headers: { 'User-Agent': randomUA() },
    });
    if (!resp.ok) return null;

    const data = await resp.json();
    if (!Array.isArray(data)) return null;

    // Store permanently (no TTL)
    if (redis) {
      await redis.set(REDIS_CATALOG_KEY, JSON.stringify(data)).catch(() => {});
    }

    return data;
  } catch {
    return null;
  }
}

function scoreMatch(tokens: string[], searchable: string, modelName: string, inputLower: string): number {
  const sl = searchable.toLowerCase();
  const matchedCount = tokens.filter(t => sl.includes(t.toLowerCase())).length;
  if (matchedCount === 0) return -1;

  let score = (matchedCount / tokens.length) * 100;

  // Exact model name match
  if (modelName.toLowerCase() === inputLower) score += 200;
  else if (sl.includes(inputLower)) score += 100;

  // Prefer completeness (fewer extra words in model = tighter match)
  score -= Math.max(0, modelName.split(/\s+/).length - tokens.length) * 2;

  return matchedCount === tokens.length ? score : -1; // require ALL tokens to match
}

async function searchQuicksearchIndex(strategies: string[], redis: Redis | null): Promise<QuicksearchMatch | null> {
  const catalog = await getQuicksearchCatalog(redis);
  if (!catalog) return null;

  let best: QuicksearchMatch | null = null;
  let bestScore = -1;

  for (const query of strategies) {
    const inputLower = query.toLowerCase();
    const tokens = inputLower.replace(/[-_]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) continue;

    for (const group of catalog) {
      if (!Array.isArray(group)) continue;

      for (const dev of group) {
        if (!Array.isArray(dev) || dev.length < 5) continue;
        const [, devId, modelName, keywords, imgFile, altName = ''] = dev;

        const searchable = `${modelName} ${keywords} ${altName} ${imgFile}`.replace(/[-_]/g, ' ');
        const score = scoreMatch(tokens, searchable, String(modelName), inputLower);
        if (score < 0 || score <= bestScore) continue;

        const imgSlug = String(imgFile).replace('.jpg', '').replace(/-thumb2|-new$/i, '');
        bestScore = score;
        best = {
          matchedUrl: `https://www.gsmarena.com/${imgSlug}-${devId}.php`,
          matchedName: String(modelName),
          image: imgFile ? `https://fdn2.gsmarena.com/vv/bigpic/${imgFile}` : '',
        };
      }
    }

    if (best && bestScore >= 200) break; // Exact match found, stop early
  }

  return best;
}

// ──────────────────────────────────────────────────────────────────────────────
// Spec page extractor (Cheerio)
// ──────────────────────────────────────────────────────────────────────────────
interface ExtractionResult {
  name: string;
  img: string;
  specifications: Record<string, Record<string, string>> | null;
}

async function extractDeviceSpecs(url: string, signal: AbortSignal): Promise<ExtractionResult> {
  const res = await fetchHtml(url, signal, { timeoutMs: 7_000 });

  if (!res.text || res.turnstile) {
    // One more attempt with proxy if direct failed
    const retryRes = await fetchHtml(url, signal, { timeoutMs: 10_000, forceProxy: true, render: false });
    if (!retryRes.text || retryRes.turnstile) {
      return { name: '', img: '', specifications: null };
    }
    return parseSpecPage(retryRes.text);
  }

  return parseSpecPage(res.text);
}

function parseSpecPage(html: string): ExtractionResult {
  const $ = cheerio.load(html);
  const specs: Record<string, Record<string, string>> = {};

  // Device name
  const name = (
    $('h1.specs-phone-name-title').first().text().trim() ||
    $('.specs-phone-name-title').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')
      ?.replace(/- full phone specifications$/i, '')
      ?.replace(/full phone specifications$/i, '')
      ?.trim() ||
    ''
  );

  // Device image — prefer bigpic CDN, fall back to any img on page
  let img = '';
  const bigpicEl = $('img[src*="/bigpic/"], .specs-photo-main img, #specs-cp-pic img').first();
  if (bigpicEl.length) {
    img = bigpicEl.attr('src') || '';
  }
  if (img && !img.startsWith('http')) {
    img = `https://www.gsmarena.com/${img.replace(/^\//, '')}`;
  }
  // Ensure HTTPS
  img = img.replace(/^http:\/\//i, 'https://');

  // Specs tables
  $('#specs-list table').each((_, table) => {
    const section = $(table).find('th').first().text().trim();
    if (!section) return;

    const sectionData: Record<string, string> = {};
    $(table).find('tr').each((_, tr) => {
      const key = $(tr).find('.ttl').text().trim();
      const val = $(tr).find('.nfo').text().replace(/\s+/g, ' ').trim();
      if (key && val) sectionData[key] = val;
    });

    if (Object.keys(sectionData).length > 0) {
      specs[section] = sectionData;
    }
  });

  return {
    name,
    img,
    specifications: Object.keys(specs).length > 0 ? specs : null,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function getDeviceId(url: string | null): string | null {
  if (!url) return null;
  try {
    const slug = url.split('/').pop()?.replace('.php', '') ?? '';
    // Last segment after final dash is numeric device ID
    const parts = slug.split('-');
    const id = parts[parts.length - 1];
    return /^\d+$/.test(id) ? id : slug;
  } catch {
    return null;
  }
}

async function acquireLock(redis: Redis, key: string, ttlSeconds: number): Promise<boolean> {
  return (await redis.set(key, '1', { nx: true, ex: ttlSeconds })) === 'OK';
}

async function releaseLock(redis: Redis, key: string): Promise<void> {
  await redis.del(key).catch(() => {});
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Handler
// ──────────────────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const controller = new AbortController();
  const budgetTimer = setTimeout(() => controller.abort(), TOTAL_BUDGET_MS);

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    const rawQuery = req.query.model;
    if (!rawQuery || typeof rawQuery !== 'string') {
      return res.status(400).json({ error: "Missing or invalid 'model' query parameter" });
    }

    const cleanInput = rawQuery.trim();
    const forceRefresh = req.query.refresh === '1';

    // ── Init Redis ──────────────────────────────────────────────────────────
    let redis: Redis | null = null;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = Redis.fromEnv();
    }

    const strategies = buildStrategies(cleanInput);
    let targetDeviceUrl: string | null = null;
    let searchName = cleanInput;

    // ── Tier 1: Redis Cache Hit ─────────────────────────────────────────────
    if (redis && !forceRefresh) {
      try {
        // Check url_map for every strategy variant
        const urlMapKeys = strategies.map(s => `url_map:${s.toLowerCase()}`);
        const mappedUrls = await redis.mget<(string | null)[]>(...urlMapKeys);
        targetDeviceUrl = mappedUrls.find(u => !!u) || null;

        // Also check device name translations (from sync-devices)
        const transKeys = strategies.map(s => `device:${s.toLowerCase()}`);
        const translations = await redis.mget<(string | null)[]>(...transKeys);
        const translated = translations.find(t => !!t);
        if (translated) {
          searchName = translated;
          if (!targetDeviceUrl) {
            targetDeviceUrl = await redis.get<string>(`url_map:${searchName.toLowerCase()}`);
          }
        }

        // Full spec cache hit
        if (targetDeviceUrl) {
          const deviceId = getDeviceId(targetDeviceUrl);
          if (deviceId) {
            const cached = await redis.get<any>(`specs:url:${deviceId}`);
            if (cached) {
              const payload = typeof cached === 'string' ? JSON.parse(cached) : cached;
              return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
            }
          }
        }
      } catch (e) {
        console.error('[Cache] Redis lookup failed:', e);
      }
    }

    // ── Tier 2: Request Deduplication Lock ──────────────────────────────────
    const lockKey = `lock:specs:${cleanInput.toLowerCase()}`;
    let lockAcquired = false;

    if (redis && !forceRefresh) {
      lockAcquired = await acquireLock(redis, lockKey, 22);

      if (!lockAcquired) {
        console.info(`[Lock] Waiting for concurrent scrape: "${cleanInput}"`);
        const pollDeadline = Date.now() + 14_000;
        while (Date.now() < pollDeadline) {
          await new Promise(r => setTimeout(r, 500));
          try {
            const urlMapKeys = strategies.map(s => `url_map:${s.toLowerCase()}`);
            const mappedUrls = await redis.mget<(string | null)[]>(...urlMapKeys);
            const polledUrl = mappedUrls.find(u => !!u) || null;
            if (polledUrl) {
              const deviceId = getDeviceId(polledUrl);
              if (deviceId) {
                const cached = await redis.get<any>(`specs:url:${deviceId}`);
                if (cached) {
                  const payload = typeof cached === 'string' ? JSON.parse(cached) : cached;
                  return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
                }
              }
            }
          } catch { /* ignore polling errors */ }
        }
        // Poller timed out — proceed independently
        console.warn(`[Lock] Poll timed out for "${cleanInput}", proceeding with own scrape`);
        lockAcquired = true; // Treat as acquired for release later
      }
    }

    try {
      // ── Tier 3: Quicksearch Index Discovery ──────────────────────────────
      let suggestImage = '';
      let matchedDeviceName = '';

      if (!targetDeviceUrl) {
        console.info(`[Discovery] Quicksearch lookup for: "${cleanInput}" (${strategies.length} strategies)`);
        const match = await searchQuicksearchIndex(strategies, redis);
        if (match) {
          targetDeviceUrl = match.matchedUrl;
          matchedDeviceName = match.matchedName;
          suggestImage = match.image;
          console.info(`[Discovery] Matched: ${matchedDeviceName} → ${targetDeviceUrl}`);
        }
      }

      if (!targetDeviceUrl) {
        return res.status(404).json({
          error: 'Device not found in GSMArena catalog',
          query: cleanInput,
          timing_ms: Date.now() - startTime,
        });
      }

      // Double-check spec cache with resolved URL before scraping
      if (redis && !forceRefresh) {
        const deviceId = getDeviceId(targetDeviceUrl);
        if (deviceId) {
          const cached = await redis.get<any>(`specs:url:${deviceId}`);
          if (cached) {
            const payload = typeof cached === 'string' ? JSON.parse(cached) : cached;
            // Opportunistically store the new url_map entry (no TTL = permanent)
            await redis.set(`url_map:${cleanInput.toLowerCase()}`, targetDeviceUrl).catch(() => {});
            return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
          }
        }
      }

      // ── Tier 4: Spec Page Extraction ─────────────────────────────────────
      console.info(`[Extraction] Fetching: ${targetDeviceUrl}`);
      const extraction = await extractDeviceSpecs(targetDeviceUrl, controller.signal);

      if (!extraction.specifications) {
        return res.status(502).json({
          error: 'Failed to extract specifications from device page (anti-bot or parsing failure)',
          url: targetDeviceUrl,
          timing_ms: Date.now() - startTime,
        });
      }

      const matchedDevice = (extraction.name || matchedDeviceName || searchName || cleanInput).trim();

      const payload = {
        search_query: cleanInput,
        search_name: searchName,
        matched_device: matchedDevice,
        source_url: targetDeviceUrl,
        image: extraction.img || suggestImage || '',
        specifications: extraction.specifications,
        timing_ms: Date.now() - startTime,
        cached: false,
      };

      // ── Tier 5: Redis Storage (Permanent — No TTL) ───────────────────────
      if (redis) {
        const deviceId = getDeviceId(targetDeviceUrl);
        const pipe = redis.pipeline();

        if (deviceId) {
          pipe.set(`specs:url:${deviceId}`, JSON.stringify(payload));
        }

        // Map all query variants → device URL permanently
        pipe.set(`url_map:${cleanInput.toLowerCase()}`, targetDeviceUrl);
        if (searchName !== cleanInput) {
          pipe.set(`url_map:${searchName.toLowerCase()}`, targetDeviceUrl);
        }
        for (const v of strategies) {
          pipe.set(`url_map:${v.toLowerCase()}`, targetDeviceUrl);
        }

        await pipe.exec().catch(e => console.error('[Cache] Pipeline write failed:', e));
      }

      return res.status(200).json(payload);

    } finally {
      if (redis && lockAcquired) {
        await releaseLock(redis, lockKey);
      }
    }

  } catch (err: any) {
    console.error('[specs] Critical failure:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  } finally {
    clearTimeout(budgetTimer);
  }
}
