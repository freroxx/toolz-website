import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

/**
 * Device Specs Handler — Modernized & Standalone
 *
 * Fully self-contained GSMArena scraping service with multi-phase discovery,
 * ScraperAPI proxy fallback, Turnstile anti-bot bypass, and Upstash Redis caching.
 */

const TOTAL_BUDGET_MS = 25_000;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0'
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

async function fetchHtml(
  targetUrl: string,
  signal: AbortSignal | null = null,
  extraHeaders: Record<string, string> = {},
  options: { render?: boolean; useProxy?: boolean; timeoutMs?: number } = {}
): Promise<{ text: string | null; status: number | null; turnstile?: boolean }> {
  const primaryKey = process.env.SCRAPER_API_KEY;
  const backupKey = process.env.SCRAPER_API_KEY_1;
  const tertiaryKey = process.env.SCRAPER_API_KEY_2;
  const keys = [primaryKey, backupKey, tertiaryKey].filter(Boolean) as string[];

  const { render = false, useProxy = true } = options;
  const timeoutMs = options.timeoutMs || (render ? 12000 : 5000);

  const attemptFetch = async (apiKey?: string) => {
    let fetchUrl = targetUrl;
    const isProxyActive = apiKey && useProxy;

    if (isProxyActive) {
      const pUrl = new URL('https://api.scraperapi.com/');
      pUrl.searchParams.set('api_key', apiKey);
      pUrl.searchParams.set('url', targetUrl);
      if (render) {
        pUrl.searchParams.set('render', 'true');
        pUrl.searchParams.set('premium', 'true');
      }
      fetchUrl = pUrl.toString();
    }

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
      if (!isProxyActive) {
        headers['User-Agent'] = getRandomUserAgent();
        headers['Accept-Language'] = 'en-US,en;q=0.9';
        headers['Referer'] = targetUrl.includes('gsmarena.com') ? 'https://www.gsmarena.com/' : 'https://www.google.com/';
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

  // 1. Try direct fetch if useProxy is false or no keys available
  if (!useProxy || keys.length === 0) {
    return attemptFetch();
  }

  // 2. Try proxy keys in order
  for (const key of keys) {
    const res = await attemptFetch(key);
    if (res.text && !res.turnstile) return res;
    if (res.status === 403 || res.status === 429) continue;
    if (res.turnstile) return res;
  }

  // Fallback to direct fetch
  return attemptFetch();
}

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

async function discoverDevice(query: string, signal: AbortSignal): Promise<{ matchedUrl: string | null; suggestImage: string; turnstile: boolean }> {
  const strategies = generateSmartStrategies(query);
  let matchedUrl: string | null = null;
  let suggestImage = '';
  let sawTurnstile = false;

  // Phase 1: GSMArena Suggest API (Super fast JSON autocomplete)
  for (const q of strategies.slice(0, 3)) {
    const suggestUrl = `https://www.gsmarena.com/suggest.php3?sSearch=${encodeURIComponent(q)}`;
    let res = await fetchHtml(suggestUrl, signal, {
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.gsmarena.com/'
    }, { render: false, useProxy: false, timeoutMs: 3000 });

    if (res.turnstile || (!res.text && res.status && res.status >= 400)) {
      res = await fetchHtml(suggestUrl, signal, {
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.gsmarena.com/'
      }, { render: false, useProxy: true, timeoutMs: 4000 });
    }

    if (res.turnstile) sawTurnstile = true;

    if (res.text && !res.turnstile) {
      try {
        const data = JSON.parse(res.text);
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const id = first.id || first.u;
          const image = first.image || first.i;
          if (id) {
            matchedUrl = id.startsWith('http')
              ? id
              : `https://www.gsmarena.com/${String(id).replace(/^\//, '').replace(/\.php$/, '')}.php`;
            if (image) {
              suggestImage = image.startsWith('http') ? image : `https://fdn2.gsmarena.com/vv/bigpic/${image}`;
            }
            break;
          }
        }
      } catch {}
    }
  }

  // Phase 2: Search Page (results.php3)
  if (!matchedUrl && !signal.aborted) {
    for (const q of strategies.slice(0, 2)) {
      const searchUrl = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(q)}`;
      let res = await fetchHtml(searchUrl, signal, {}, { render: false, useProxy: true, timeoutMs: 5000 });

      if (res.turnstile) {
        sawTurnstile = true;
        res = await fetchHtml(searchUrl, signal, {}, { render: true, useProxy: true, timeoutMs: 10000 });
      }

      if (res.text && !res.turnstile) {
        const $ = cheerio.load(res.text);
        if ($('#specs-list').length > 0) {
          matchedUrl = $('link[rel="canonical"]').attr('href') || $('meta[property="og:url"]').attr('content') || searchUrl;
          break;
        }
        const firstLink = $('.makers ul li a').first().attr('href') || $('.makers a').first().attr('href');
        if (firstLink) {
          matchedUrl = `https://www.gsmarena.com/${String(firstLink).replace(/^\//, '')}`;
          break;
        }
      }
    }
  }

  // Phase 3: DuckDuckGo Fallback Search
  if (!matchedUrl && !signal.aborted) {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=site:gsmarena.com+${encodeURIComponent(query)}`;
    const res = await fetchHtml(ddgUrl, signal, {}, { render: false, useProxy: false, timeoutMs: 4000 });

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
  }

  return { matchedUrl, suggestImage, turnstile: sawTurnstile };
}

async function extractDeviceSpecs(url: string, signal: AbortSignal): Promise<{ name: string; img: string; specifications: Record<string, Record<string, string>> | null }> {
  let res = await fetchHtml(url, signal, {}, { render: false, useProxy: true, timeoutMs: 6000 });

  if ((!res.text || res.turnstile)) {
    res = await fetchHtml(url, signal, {}, { render: true, useProxy: true, timeoutMs: 12000 });
  }

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
    const sectionName = $(table).find('th').text().trim();
    if (!sectionName) return;

    specs[sectionName] = {};
    $(table).find('tr').each((_, tr) => {
      const key = $(tr).find('.ttl').text().trim();
      const value = $(tr).find('.nfo').text().trim();
      if (key && value) {
        specs[sectionName][key] = value;
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
    return slug.split('-')[0] || null;
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

    // Tier 1: Redis Strategy Cache Check
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

    // Tier 2: Redis Lock Deduplication
    const lockKey = `lock:specs:${cleanInput.toLowerCase()}`;
    let lockAcquired = false;

    if (redis) {
      lockAcquired = await acquireLock(redis, lockKey, 28);

      if (!lockAcquired) {
        console.info(`[Lock] Waiting for concurrent scrape of "${cleanInput}"...`);
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
                  return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
                }
              }
            }
          } catch {}
        }
      }
    }

    try {
      // Tier 3: Discovery
      let suggestImage = '';
      let sawTurnstile = false;

      if (!targetDeviceUrl) {
        console.info(`[Discovery] Starting discovery for: "${searchName}"`);
        const discovery = await discoverDevice(searchName, controller.signal);
        targetDeviceUrl = discovery.matchedUrl;
        suggestImage = discovery.suggestImage;
        sawTurnstile = discovery.turnstile;

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

      // Tier 4: Extraction
      console.info(`[Extraction] Extracting specs from: ${targetDeviceUrl}`);
      const extraction = await extractDeviceSpecs(targetDeviceUrl, controller.signal);

      if (!extraction || !extraction.specifications) {
        return res.status(502).json({
          error: 'Failed to extract specs from device page',
          url: targetDeviceUrl,
          timing_ms: Date.now() - startTime
        });
      }

      const matchedDevice = (extraction.name || searchName || cleanInput).trim();

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

      // Tier 5: Redis Storage
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
