import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

/**
 * Device Specs Handler — Modernized Next-Gen Architecture
 *
 * Fast path: GSMArena Static Quicksearch Index (/quicksearch-*.jpg)
 * -> Instant 0ms device discovery & URL resolution!
 * Direct Spec Fetch -> 150ms spec extraction.
 * ScraperAPI proxy fallback for Turnstile challenges.
 * Upstash Redis caching & request deduplication.
 */

const TOTAL_BUDGET_MS = 25_000;
const QUICKSEARCH_INDEX_URL = 'https://www.gsmarena.com/quicksearch-82698.jpg';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0'
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function isTurnstile(html: string): boolean {
  if (!html || typeof html !== 'string') return false;
  const trimmed = html.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return false;
  const lower = html.toLowerCase();
  return (
    lower.includes('cf-turnstile') ||
    lower.includes('turnstile') ||
    lower.includes('turnstile-verify') ||
    lower.includes('one quick check before you continue') ||
    lower.includes('challenge-form') ||
    lower.includes('verify you are human')
  );
}

/**
 * Fetch HTML with direct fetch first (fast & reliable for spec pages),
 * falling back to ScraperAPI proxy if Turnstile / 403 / 429 occurs.
 */
async function fetchHtml(
  targetUrl: string,
  signal: AbortSignal | null = null,
  options: { render?: boolean; timeoutMs?: number } = {}
): Promise<{ text: string | null; status: number | null; turnstile?: boolean }> {
  const { render = false, timeoutMs = (render ? 12000 : 5000) } = options;

  const primaryKey = process.env.SCRAPER_API_KEY;
  const backupKey = process.env.SCRAPER_API_KEY_1;
  const tertiaryKey = process.env.SCRAPER_API_KEY_2;
  const proxyKeys = [primaryKey, backupKey, tertiaryKey].filter(Boolean) as string[];

  const performFetch = async (fetchUrl: string, isProxy: boolean = false, extraHeaders: Record<string, string> = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let combinedSignal: AbortSignal = controller.signal;
    if (signal) {
      try {
        // @ts-ignore
        if (typeof AbortSignal.any === 'function') {
          // @ts-ignore
          combinedSignal = AbortSignal.any([controller.signal, signal]);
        } else {
          signal.addEventListener('abort', () => controller.abort());
        }
      } catch {
        combinedSignal = controller.signal;
      }
    }

    try {
      const headers: Record<string, string> = { ...extraHeaders };
      if (!isProxy) {
        headers['User-Agent'] = getRandomUserAgent();
        headers['Accept-Language'] = 'en-US,en;q=0.9';
        headers['Referer'] = 'https://www.gsmarena.com/';
      }

      const response = await fetch(fetchUrl, { headers, signal: combinedSignal });
      const text = await response.text();

      if (!response.ok) {
        return { text: null, status: response.status };
      }

      if (isTurnstile(text)) {
        return { text, status: response.status, turnstile: true };
      }

      return { text, status: response.status };
    } catch {
      return { text: null, status: null };
    } finally {
      clearTimeout(timer);
    }
  };

  // 1. Try Direct Fetch first (Fast path — direct device URLs are rarely blocked)
  const directRes = await performFetch(targetUrl, false);
  if (directRes.text && !directRes.turnstile) {
    return directRes;
  }

  // 2. Fallback to ScraperAPI if direct fetch hit Turnstile or non-200
  if (proxyKeys.length > 0) {
    for (const key of proxyKeys) {
      const pUrl = new URL('https://api.scraperapi.com/');
      pUrl.searchParams.set('api_key', key);
      pUrl.searchParams.set('url', targetUrl);
      if (render) {
        pUrl.searchParams.set('render', 'true');
        pUrl.searchParams.set('premium', 'true');
      }

      const proxyRes = await performFetch(pUrl.toString(), true);
      if (proxyRes.text && !proxyRes.turnstile) {
        return proxyRes;
      }
      if (proxyRes.turnstile && !render) {
        // Escalate to JS render if Turnstile detected on proxy
        pUrl.searchParams.set('render', 'true');
        pUrl.searchParams.set('premium', 'true');
        const renderRes = await performFetch(pUrl.toString(), true);
        if (renderRes.text && !renderRes.turnstile) return renderRes;
      }
    }
  }

  return directRes;
}

/**
 * Generate query normalization strategies
 */
function generateSmartStrategies(input: string): string[] {
  const raw = (input || '').trim();
  if (!raw) return [];
  const lower = raw.toLowerCase();
  const strategies = [lower];

  let clean = lower.replace(/[\/:,#]/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean !== lower) strategies.push(clean);

  const splitSquashed = clean.replace(/([a-z])([0-9])/g, '$1 $2').replace(/([0-9])([a-z])/g, '$1 $2');
  if (splitSquashed !== clean) strategies.push(splitSquashed);

  const stripped = lower.replace(/\b(sm-|gt-|sch-|sgh-|sph-)/gi, '');
  if (stripped !== lower) {
    strategies.push(stripped.trim());
    const cleanStripped = stripped.replace(/[\/:,#]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanStripped !== stripped) strategies.push(cleanStripped);
  }

  const parts = splitSquashed.split(/\s+/);
  if (parts.length > 1) {
    strategies.push(parts[parts.length - 1]);
    strategies.push(parts.slice(0, -1).join(' '));
  }

  strategies.push(parts.join(''));
  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}

/**
 * Fast discovery using GSMArena's static Quicksearch Index (/quicksearch-*.jpg)
 */
async function searchQuicksearchIndex(
  query: string,
  redis: Redis | null
): Promise<{ matchedUrl: string; matchedName: string; image: string } | null> {
  try {
    let catalogData: any[] | null = null;

    // Check Redis for cached catalog index (24-hour TTL)
    if (redis) {
      const cachedCatalog = await redis.get<string>('cache:quicksearch_catalog');
      if (cachedCatalog) {
        catalogData = typeof cachedCatalog === 'string' ? JSON.parse(cachedCatalog) : cachedCatalog;
      }
    }

    // Fetch static catalog index if not cached
    if (!catalogData) {
      console.info('[Quicksearch] Fetching static quicksearch index from GSMArena CDN...');
      const response = await fetch(QUICKSEARCH_INDEX_URL, {
        headers: { 'User-Agent': getRandomUserAgent() }
      });
      if (response.ok) {
        catalogData = await response.json();
        if (redis && catalogData) {
          await redis.set('cache:quicksearch_catalog', JSON.stringify(catalogData), { ex: 86400 });
        }
      }
    }

    if (!catalogData || !Array.isArray(catalogData)) return null;

    const queryTokens = query.toLowerCase().replace(/[-_\/:,#]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    if (queryTokens.length === 0) return null;

    let bestMatch: { matchedUrl: string; matchedName: string; image: string } | null = null;
    let maxScore = -1;

    for (const group of catalogData) {
      if (!Array.isArray(group)) continue;
      for (const dev of group) {
        if (!Array.isArray(dev) || dev.length < 5) continue;
        const bId = dev[0];
        const devId = dev[1];
        const modelName = String(dev[2] || '');
        const keywords = String(dev[3] || '');
        const imgFile = String(dev[4] || '');
        const altName = String(dev[5] || '');

        const fullSearchable = `${modelName} ${keywords} ${altName} ${imgFile}`.toLowerCase().replace(/[-_]/g, ' ');

        // Check token matching
        const matchedTokens = queryTokens.filter(t => fullSearchable.includes(t));
        if (matchedTokens.length === 0) continue;

        let score = (matchedTokens.length / queryTokens.length) * 100;

        // Exact model name match bonus
        const modelLower = modelName.toLowerCase();
        const queryLower = query.toLowerCase().trim();
        if (modelLower === queryLower || fullSearchable.includes(queryLower)) {
          score += 150;
        }

        // Prefer higher device IDs (newer models) on tie
        score += (Number(devId) || 0) / 100000;

        if (score > maxScore && matchedTokens.length === queryTokens.length) {
          maxScore = score;
          const imgSlug = imgFile.replace('.jpg', '').replace('-thumb2', '').replace('-new', '');
          bestMatch = {
            matchedUrl: `https://www.gsmarena.com/${imgSlug}-${devId}.php`,
            matchedName: modelName,
            image: imgFile ? `https://fdn2.gsmarena.com/vv/bigpic/${imgFile}` : ''
          };
        }
      }
    }

    return bestMatch;
  } catch (err) {
    console.warn('[Quicksearch] Quicksearch index lookup warning:', err);
    return null;
  }
}

/**
 * Fallback Discovery via Search Page or DuckDuckGo
 */
async function fallbackDiscovery(query: string, signal: AbortSignal): Promise<{ matchedUrl: string | null; suggestImage: string }> {
  let matchedUrl: string | null = null;

  // DuckDuckGo fallback
  const ddgUrl = `https://html.duckduckgo.com/html/?q=site:gsmarena.com+${encodeURIComponent(query)}`;
  const res = await fetchHtml(ddgUrl, signal, { timeoutMs: 4000 });

  if (res.text) {
    const $ = cheerio.load(res.text);
    $('a').each((_, el) => {
      let href = $(el).attr('href');
      if (!href || matchedUrl) return;
      try {
        if (href.includes('uddg=')) {
          const uObj = new URL(href.startsWith('http') ? href : `https://duckduckgo.com${href}`);
          href = uObj.searchParams.get('uddg') || href;
        }
      } catch {}
      if (href.includes('gsmarena.com/') && href.includes('.php') && !/results|search|compare|glossary|blog/i.test(href)) {
        matchedUrl = href.startsWith('http') ? href : `https://www.gsmarena.com/${href.replace(/^\//, '')}`;
      }
    });
  }

  return { matchedUrl, suggestImage: '' };
}

/**
 * Extract full specifications from device page
 */
async function extractDeviceSpecs(url: string, signal: AbortSignal): Promise<{ name: string; img: string; specifications: Record<string, Record<string, string>> | null }> {
  const res = await fetchHtml(url, signal, { timeoutMs: 6000 });

  if (!res.text || res.turnstile) {
    return { name: '', img: '', specifications: null };
  }

  const $ = cheerio.load(res.text);
  const specs: Record<string, Record<string, string>> = {};

  // Extract phone name
  const name = (
    $('.specs-phone-name-title').text().trim() ||
    $('h1.specs-phone-name-title').text().trim() ||
    $('meta[property="og:title"]').attr('content')?.replace('full phone specifications', '')?.replace('- Full phone specifications', '')?.trim() ||
    ''
  );

  // Extract image
  let img = '';
  const imgEl = $('.specs-photo-main img, #specs-cp-pic img, #specs-cp-main img, img[src*="/bigpic/"]').first();
  if (imgEl.length > 0) {
    img = imgEl.attr('src') || '';
    if (img && !img.startsWith('http')) {
      img = `https://www.gsmarena.com/${img.replace(/^\//, '')}`;
    }
  }

  // Extract specification tables
  $('#specs-list table').each((_, table) => {
    const rawSection = $(table).find('th').text().trim();
    if (!rawSection) return;

    specs[rawSection] = {};
    $(table).find('tr').each((_, tr) => {
      const key = $(tr).find('.ttl').text().trim();
      const value = $(tr).find('.nfo').text().trim();
      if (key && value) {
        specs[rawSection][key] = value;
      }
    });
  });

  return {
    name,
    img,
    specifications: Object.keys(specs).length > 0 ? specs : null
  };
}

function getDeviceId(url: string | null): string | null {
  if (!url) return null;
  try {
    const slug = url.split('/').pop()?.replace('.php', '');
    if (!slug) return null;
    return slug.split('-').pop() || slug.split('-')[0] || null;
  } catch {
    return null;
  }
}

async function acquireLock(redis: Redis, key: string, ttlSeconds: number): Promise<boolean> {
  const result = await redis.set(key, '1', { nx: true, ex: ttlSeconds });
  return result === 'OK';
}

async function releaseLock(redis: Redis, key: string): Promise<void> {
  await redis.del(key).catch(() => {});
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

    let redis: Redis | null = null;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = Redis.fromEnv();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tier 1: Redis Strategy Cache Check
    // ─────────────────────────────────────────────────────────────────────────
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
        console.error('[Cache] Strategy lookup failed:', redisError);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tier 2: Redis Lock Deduplication
    // ─────────────────────────────────────────────────────────────────────────
    const lockKey = `lock:specs:${cleanInput.toLowerCase()}`;
    let lockAcquired = false;

    if (redis) {
      lockAcquired = await acquireLock(redis, lockKey, 20);

      if (!lockAcquired) {
        console.info(`[Lock] Waiting for concurrent scrape of "${cleanInput}"...`);
        const pollStart = Date.now();
        while (Date.now() - pollStart < 12_000) {
          await new Promise(r => setTimeout(r, 500));

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
                  return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
                }
              }
            }
          } catch {}
        }
      }
    }

    try {
      // ───────────────────────────────────────────────────────────────────────
      // Tier 3: Fast Discovery via Static Quicksearch Index
      // ───────────────────────────────────────────────────────────────────────
      let suggestImage = '';
      let matchedDeviceName = '';

      for (const strat of inputStrategies.slice(0, 3)) {
        const quickMatch = await searchQuicksearchIndex(strat, redis);
        if (quickMatch) {
          targetDeviceUrl = quickMatch.matchedUrl;
          matchedDeviceName = quickMatch.matchedName;
          suggestImage = quickMatch.image;
          console.info(`[Discovery] Quicksearch match in 0ms: ${matchedDeviceName} -> ${targetDeviceUrl}`);
          break;
        }
      }

      // Fallback discovery if quicksearch index didn't match
      if (!targetDeviceUrl) {
        console.info(`[Discovery] Quicksearch index miss, attempting fallback discovery for: "${searchName}"`);
        const fallback = await fallbackDiscovery(searchName, controller.signal);
        targetDeviceUrl = fallback.matchedUrl;
      }

      if (!targetDeviceUrl) {
        return res.status(404).json({
          error: 'Device not found',
          query: cleanInput,
          timing_ms: Date.now() - startTime
        });
      }

      // Check cache again with resolved URL
      if (redis) {
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

      // ───────────────────────────────────────────────────────────────────────
      // Tier 4: Direct Spec Extraction
      // ───────────────────────────────────────────────────────────────────────
      console.info(`[Extraction] Extracting specs from: ${targetDeviceUrl}`);
      const extraction = await extractDeviceSpecs(targetDeviceUrl, controller.signal);

      if (!extraction || !extraction.specifications) {
        return res.status(502).json({
          error: 'Failed to extract specs from device page',
          url: targetDeviceUrl,
          timing_ms: Date.now() - startTime
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

      // ───────────────────────────────────────────────────────────────────────
      // Tier 5: Redis Storage
      // ───────────────────────────────────────────────────────────────────────
      if (redis) {
        const deviceId = getDeviceId(targetDeviceUrl);
        const pipe = redis.pipeline();

        if (deviceId) {
          pipe.set(`specs:url:${deviceId}`, JSON.stringify(payload), { ex: 7_776_000 });
        }

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
