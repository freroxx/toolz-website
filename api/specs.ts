import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

/**
 * Device Specs API — Server-Side Resolution Engine v3
 *
 * Architecture:
 *  1. Server-Side Model Code Resolution:
 *     - Built-in MODEL_MAP table (Samsung, Xiaomi, Poco, Redmi, OnePlus, Google Pixel, Realme, Moto)
 *     - Dynamic Samsung SM- / GT- pattern parser (SM-S928B → Samsung Galaxy S24 Ultra, SM-A556B → Samsung Galaxy A55, etc.)
 *     - Upstash Redis `device:<model>` global device dictionary lookup (25,000+ devices synced)
 *
 *  2. GSMArena Static Catalog Matching:
 *     - Fetches /quicksearch-*.jpg (Data structure: data[0] = Brands dict, data[1] = Devices array)
 *     - Brand-aware search: combines brandName + modelName into authoritative full names
 *     - Strict token matching: ignores 1-letter/junk tokens to prevent false positives
 *     - Priority scoring: exact matches stop early with 2000+ score
 *
 *  3. Spec Page Scraper (Cheerio + Direct Fetch + ScraperAPI Proxy Fallback)
 *  4. Permanent Redis Caching (no TTL) for instant subsequent responses
 */

const TOTAL_BUDGET_MS = 25_000;
const DEFAULT_QUICKSEARCH_URL = 'https://www.gsmarena.com/quicksearch-82698.jpg';
const REDIS_CATALOG_KEY = 'cache:gsm_quicksearch_catalog';
const REDIS_QUICKSEARCH_URL_KEY = 'gsm:quicksearch_url';

// ──────────────────────────────────────────────────────────────────────────────
// Built-in Model Code Resolution Table
// Maps internal hardware model codes (Build.MODEL) to commercial market names
// ──────────────────────────────────────────────────────────────────────────────
const BUILTIN_MODEL_MAP: Record<string, string> = {
  // Samsung S-Series
  'S928': 'Samsung Galaxy S24 Ultra', 'S926': 'Samsung Galaxy S24+', 'S921': 'Samsung Galaxy S24',
  'S918': 'Samsung Galaxy S23 Ultra', 'S916': 'Samsung Galaxy S23+', 'S911': 'Samsung Galaxy S23',
  'S908': 'Samsung Galaxy S22 Ultra', 'S906': 'Samsung Galaxy S22+', 'S901': 'Samsung Galaxy S22',
  'G998': 'Samsung Galaxy S21 Ultra', 'G996': 'Samsung Galaxy S21+', 'G991': 'Samsung Galaxy S21',
  'G780': 'Samsung Galaxy S20 FE', 'G781': 'Samsung Galaxy S20 FE 5G',
  'G988': 'Samsung Galaxy S20 Ultra', 'G986': 'Samsung Galaxy S20+', 'G981': 'Samsung Galaxy S20',
  'G975': 'Samsung Galaxy S10+', 'G973': 'Samsung Galaxy S10', 'G970': 'Samsung Galaxy S10e',

  // Samsung A-Series
  'A556': 'Samsung Galaxy A55', 'A546': 'Samsung Galaxy A54', 'A536': 'Samsung Galaxy A53', 'A526': 'Samsung Galaxy A52 5G', 'A515': 'Samsung Galaxy A51',
  'A366': 'Samsung Galaxy A36', 'A356': 'Samsung Galaxy A35', 'A346': 'Samsung Galaxy A34', 'A336': 'Samsung Galaxy A33 5G', 'A325': 'Samsung Galaxy A32',
  'A256': 'Samsung Galaxy A25', 'A245': 'Samsung Galaxy A24', 'A236': 'Samsung Galaxy A23 5G',
  'A156': 'Samsung Galaxy A15 5G', 'A155': 'Samsung Galaxy A15', 'A146': 'Samsung Galaxy A14 5G', 'A145': 'Samsung Galaxy A14',
  'A065': 'Samsung Galaxy A06', 'A057': 'Samsung Galaxy A05s', 'A055': 'Samsung Galaxy A05', 'A047': 'Samsung Galaxy A04s',

  // Samsung Z-Series
  'F956': 'Samsung Galaxy Z Fold6', 'F946': 'Samsung Galaxy Z Fold5', 'F936': 'Samsung Galaxy Z Fold4', 'F926': 'Samsung Galaxy Z Fold3',
  'F741': 'Samsung Galaxy Z Flip6', 'F731': 'Samsung Galaxy Z Flip5', 'F721': 'Samsung Galaxy Z Flip4', 'F711': 'Samsung Galaxy Z Flip3',

  // Google Pixel Codenames & Models
  'HUSKY': 'Google Pixel 8 Pro', 'SHIBA': 'Google Pixel 8', 'AKITA': 'Google Pixel 8a',
  'CHEETAH': 'Google Pixel 7 Pro', 'PANTHER': 'Google Pixel 7', 'BLUEJAY': 'Google Pixel 6a',
  'ORIOLE': 'Google Pixel 6', 'RAVEN': 'Google Pixel 6 Pro',
  'CAIMAN': 'Google Pixel 9 Pro', 'KOMODO': 'Google Pixel 9 Pro XL', 'TOKY': 'Google Pixel 9',

  // Xiaomi / Poco / Redmi Codes
  '2201116SG': 'Xiaomi Poco X4 Pro 5G', '2201116SI': 'Xiaomi Poco X4 Pro 5G',
  '2312DRA50G': 'Redmi Note 13 Pro+', '2312DRA50C': 'Redmi Note 13 Pro+',
  '2407FPN8EG': 'Xiaomi 14T Pro', '2311DRK48G': 'Xiaomi Poco X6 Pro',
  '23127PN0CG': 'Xiaomi 14', '24031PN0DC': 'Xiaomi 14 Ultra',

  // OnePlus / Oppo / Realme Codes
  'CPH2581': 'OnePlus 12', 'CPH2609': 'OnePlus Nord 4', 'CPH2449': 'OnePlus 11', 'CPH2413': 'OnePlus 11R',
  'CPH2573': 'OnePlus 12R', 'CPH2493': 'OnePlus Nord 3', 'CPH2401': 'OnePlus 10T',
};

/**
 * Dynamic Samsung model parser (SM-A366B → Samsung Galaxy A36, SM-S928B → Samsung Galaxy S24 Ultra, etc.)
 */
function parseSamsungDynamic(rawInput: string): string | null {
  const upper = rawInput.trim().toUpperCase();
  const match = upper.match(/(?:SM-|GT-|SCH-|SGH-|SPH-|SCV|SC-|SCG|SHV-|SHW-)?([ASFGMEZT])(\d{2,3})[0-9A-Z]*/);
  if (!match) return null;

  const letter = match[1];
  const num = match[2];

  if (letter === 'S' && num.length === 3) {
    const genDigit = num[1]; // 2 → S24, 1 → S23, 0 → S22
    const variantDigit = num[2]; // 8 → Ultra, 6 → +, 1 → Base
    const genMap: Record<string, string> = { '2': '24', '1': '23', '0': '22' };
    const gen = genMap[genDigit];
    if (gen) {
      if (variantDigit === '8') return `Samsung Galaxy S${gen} Ultra`;
      if (variantDigit === '6') return `Samsung Galaxy S${gen}+`;
      if (variantDigit === '1') return `Samsung Galaxy S${gen}`;
    }
  }

  if (letter === 'A' && num.length === 3) {
    const modelNum = num.substring(0, 2); // e.g. 55, 36, 35, 25, 15, 06
    return `Samsung Galaxy A${modelNum}`;
  }

  if (letter === 'F' && num.length === 3) {
    if (num[0] === '9') {
      const foldGen = ({ '5': '6', '4': '5', '3': '4', '2': '3' } as Record<string, string>)[num[1]];
      if (foldGen) return `Samsung Galaxy Z Fold${foldGen}`;
    } else if (num[0] === '7') {
      const flipGen = ({ '4': '6', '3': '5', '2': '4', '1': '3' } as Record<string, string>)[num[1]];
      if (flipGen) return `Samsung Galaxy Z Flip${flipGen}`;
    }
  }

  if (['M', 'E', 'Z'].includes(letter) && num.length === 3) {
    const modelNum = num.substring(0, 2);
    return `Samsung Galaxy ${letter}${modelNum}`;
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// User-Agent rotation & Fetch Helpers
// ──────────────────────────────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
];
const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

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

  if (!forceProxy) {
    const direct = await doFetch(targetUrl, false);
    if (direct.text && !direct.turnstile) return direct;
  }

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
// Catalog Data Parser & Matching Engine
// ──────────────────────────────────────────────────────────────────────────────
interface QuicksearchMatch {
  matchedUrl: string;
  matchedName: string;
  image: string;
}

interface CatalogDevice {
  devId: number | string;
  brand: string;
  model: string;
  fullName: string;
  searchable: string;
  img: string;
}

async function getRawCatalog(redis: Redis | null): Promise<any | null> {
  if (redis) {
    try {
      const cached = await redis.get<string>(REDIS_CATALOG_KEY);
      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }
    } catch {}
  }

  let indexUrl = DEFAULT_QUICKSEARCH_URL;
  if (redis) {
    try {
      const customUrl = await redis.get<string>(REDIS_QUICKSEARCH_URL_KEY);
      if (customUrl) indexUrl = customUrl;
    } catch {}
  }

  console.info(`[Quicksearch] Fetching catalog index from ${indexUrl}`);
  try {
    const resp = await fetch(indexUrl, {
      headers: { 'User-Agent': randomUA() },
    });
    if (!resp.ok) return null;

    const data = await resp.json();
    if (redis && data) {
      await redis.set(REDIS_CATALOG_KEY, JSON.stringify(data)).catch(() => {});
    }
    return data;
  } catch {
    return null;
  }
}

function parseCatalogDevices(rawCatalog: any): CatalogDevice[] {
  if (!rawCatalog) return [];

  let brands: Record<string, string> = {};
  let rawDevices: any[] = [];

  if (Array.isArray(rawCatalog) && rawCatalog.length >= 2) {
    brands = typeof rawCatalog[0] === 'object' ? rawCatalog[0] : {};
    rawDevices = Array.isArray(rawCatalog[1]) ? rawCatalog[1] : [];
  } else if (Array.isArray(rawCatalog)) {
    rawDevices = rawCatalog;
  }

  const catalog: CatalogDevice[] = [];

  for (const dev of rawDevices) {
    if (!Array.isArray(dev) || dev.length < 4) continue;
    const [brandId, devId, modelName, keywords = '', imgFile = '', altName = ''] = dev;

    const brandName = brands[String(brandId)] || '';
    const cleanModel = String(modelName || '').trim();
    const fullName = brandName ? `${brandName} ${cleanModel}`.trim() : cleanModel;
    const searchable = `${fullName} ${keywords} ${altName} ${imgFile}`.toLowerCase();

    catalog.push({
      devId: devId,
      brand: brandName,
      model: cleanModel,
      fullName: fullName,
      searchable: searchable,
      img: String(imgFile),
    });
  }

  return catalog;
}

const STOP_WORDS = new Set(['5g', '4g', 'lte', 'sm', 'gt', 'sch', 'sgh', 'sph']);

function tokenizeQuery(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2 && !STOP_WORDS.has(t));
}

function searchCatalog(catalog: CatalogDevice[], queryStr: string): QuicksearchMatch | null {
  const cleanQ = queryStr.trim().toLowerCase();
  if (!cleanQ || cleanQ.length < 2) return null;

  const tokens = tokenizeQuery(cleanQ);
  if (tokens.length === 0) return null;

  let bestDev: CatalogDevice | null = null;
  let bestScore = -1;

  for (const dev of catalog) {
    const searchable = dev.searchable;
    const fullLower = dev.fullName.toLowerCase();

    // REQUIRE ALL non-stop tokens of the query to exist in searchable
    if (!tokens.every(t => searchable.includes(t))) {
      continue;
    }

    let score = (tokens.filter(t => searchable.includes(t)).length / tokens.length) * 100;

    if (cleanQ === fullLower) {
      score += 2000;
    } else if (fullLower.startsWith(cleanQ)) {
      score += 1000;
    } else if (fullLower.includes(cleanQ)) {
      score += 500;
    } else if (searchable.includes(cleanQ)) {
      score += 200;
    }

    // Tie-breaker: penalty for extra words in model name to favor tight matches
    const extraWords = Math.max(0, dev.model.split(/\s+/).length - tokens.length);
    score -= extraWords * 2;

    if (score > bestScore) {
      bestScore = score;
      bestDev = dev;
    }
  }

  if (bestDev && bestScore >= 100) {
    const imgSlug = bestDev.img.replace('.jpg', '').replace(/-thumb2|-new$/i, '');
    return {
      matchedUrl: `https://www.gsmarena.com/${imgSlug}-${bestDev.devId}.php`,
      matchedName: bestDev.fullName,
      image: bestDev.img ? `https://fdn2.gsmarena.com/vv/bigpic/${bestDev.img}` : '',
    };
  }

  return null;
}

/**
 * Strategy-driven catalog discovery with model resolution
 */
async function discoverDeviceUrl(
  inputQuery: string,
  redis: Redis | null
): Promise<{ url: string; matchedName: string; image: string } | null> {
  const rawCatalog = await getRawCatalog(redis);
  const catalog = parseCatalogDevices(rawCatalog);
  if (catalog.length === 0) return null;

  const cleanInput = inputQuery.trim();
  const candidateQueries: string[] = [];

  // 1. Built-in dictionary check
  const upperRaw = cleanInput.toUpperCase();
  if (BUILTIN_MODEL_MAP[upperRaw]) {
    candidateQueries.push(BUILTIN_MODEL_MAP[upperRaw]);
  }
  // Strip SM- / GT- prefix for BUILTIN_MODEL_MAP lookup
  const strippedCode = upperRaw.replace(/^(?:SM-|GT-|SCH-|SGH-|SPH-)?([A-Z0-9]+)$/, '$1');
  if (BUILTIN_MODEL_MAP[strippedCode]) {
    candidateQueries.push(BUILTIN_MODEL_MAP[strippedCode]);
  }

  // 2. Dynamic Samsung parser
  const samsungParsed = parseSamsungDynamic(cleanInput);
  if (samsungParsed) {
    candidateQueries.push(samsungParsed);
  }

  // 3. Redis device:<model> translation lookup (from sync-devices.ts database)
  if (redis) {
    try {
      const lower = cleanInput.toLowerCase();
      const keysToCheck = [
        `device:${lower}`,
        `device:${lower.replace(/^(samsung|google|xiaomi|poco|redmi|oneplus|oppo|realme|motorola|apple)\s+/, '')}`,
        `device:${lower.split('/')[0]}`,
        `device:${lower.replace(/^(sm-|gt-|sch-|sgh-|sph-)/, '')}`,
      ];
      const uniqueKeys = [...new Set(keysToCheck)];
      const translations = await redis.mget<(string | null)[]>(...uniqueKeys);
      for (const t of translations) {
        if (t && typeof t === 'string' && t.trim().length >= 2) {
          candidateQueries.push(t.trim());
        }
      }
    } catch (e) {
      console.error('[Redis] Model translation lookup failed:', e);
    }
  }

  // 4. Clean raw input as query
  candidateQueries.push(cleanInput);

  // 5. Cleaned input without punctuation
  const cleanPunctuation = cleanInput.replace(/[\/:,#()\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanPunctuation !== cleanInput) {
    candidateQueries.push(cleanPunctuation);
  }

  const uniqueCandidates = [...new Set(candidateQueries.filter(q => q && q.length >= 2))];

  for (const q of uniqueCandidates) {
    const match = searchCatalog(catalog, q);
    if (match) {
      console.info(`[Discovery] Query "${inputQuery}" matched via candidate "${q}" → ${match.matchedName}`);
      return {
        url: match.matchedUrl,
        matchedName: match.matchedName,
        image: match.image,
      };
    }
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Spec Page Extractor (Cheerio)
// ──────────────────────────────────────────────────────────────────────────────
interface ExtractionResult {
  name: string;
  img: string;
  specifications: Record<string, Record<string, string>> | null;
}

async function extractDeviceSpecs(url: string, signal: AbortSignal): Promise<ExtractionResult> {
  const res = await fetchHtml(url, signal, { timeoutMs: 7_000 });

  if (!res.text || res.turnstile) {
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

  const name = (
    $('h1.specs-phone-name-title').first().text().trim() ||
    $('.specs-phone-name-title').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')
      ?.replace(/- full phone specifications$/i, '')
      ?.replace(/full phone specifications$/i, '')
      ?.trim() ||
    ''
  );

  let img = '';
  const bigpicEl = $('img[src*="/bigpic/"], .specs-photo-main img, #specs-cp-pic img').first();
  if (bigpicEl.length) {
    img = bigpicEl.attr('src') || '';
  }
  if (img && !img.startsWith('http')) {
    img = `https://www.gsmarena.com/${img.replace(/^\//, '')}`;
  }
  img = img.replace(/^http:\/\//i, 'https://');

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

function getDeviceId(url: string | null): string | null {
  if (!url) return null;
  try {
    const slug = url.split('/').pop()?.replace('.php', '') ?? '';
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

    let redis: Redis | null = null;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = Redis.fromEnv();
    }

    let targetDeviceUrl: string | null = null;
    let suggestImage = '';
    let matchedDeviceName = cleanInput;

    // ── Tier 1: Redis Cache Hit ─────────────────────────────────────────────
    if (redis && !forceRefresh) {
      try {
        targetDeviceUrl = await redis.get<string>(`url_map:${cleanInput.toLowerCase()}`);

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
            const polledUrl = await redis.get<string>(`url_map:${cleanInput.toLowerCase()}`);
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
          } catch {}
        }
        lockAcquired = true;
      }
    }

    try {
      // ── Tier 3: Discovery Engine ─────────────────────────────────────────
      if (!targetDeviceUrl) {
        const discovery = await discoverDeviceUrl(cleanInput, redis);
        if (discovery) {
          targetDeviceUrl = discovery.url;
          matchedDeviceName = discovery.matchedName;
          suggestImage = discovery.image;
        }
      }

      if (!targetDeviceUrl) {
        return res.status(404).json({
          error: 'Device not found in GSMArena catalog',
          query: cleanInput,
          timing_ms: Date.now() - startTime,
        });
      }

      if (redis && !forceRefresh) {
        const deviceId = getDeviceId(targetDeviceUrl);
        if (deviceId) {
          const cached = await redis.get<any>(`specs:url:${deviceId}`);
          if (cached) {
            const payload = typeof cached === 'string' ? JSON.parse(cached) : cached;
            await redis.set(`url_map:${cleanInput.toLowerCase()}`, targetDeviceUrl).catch(() => {});
            return res.status(200).json({ ...payload, timing_ms: Date.now() - startTime, cached: true });
          }
        }
      }

      // ── Tier 4: Spec Extraction ──────────────────────────────────────────
      console.info(`[Extraction] Fetching: ${targetDeviceUrl}`);
      const extraction = await extractDeviceSpecs(targetDeviceUrl, controller.signal);

      if (!extraction.specifications) {
        return res.status(502).json({
          error: 'Failed to extract specifications from device page',
          url: targetDeviceUrl,
          timing_ms: Date.now() - startTime,
        });
      }

      const finalDeviceName = (extraction.name || matchedDeviceName || cleanInput).trim();

      const payload = {
        search_query: cleanInput,
        search_name: matchedDeviceName,
        matched_device: finalDeviceName,
        source_url: targetDeviceUrl,
        image: extraction.img || suggestImage || '',
        specifications: extraction.specifications,
        timing_ms: Date.now() - startTime,
        cached: false,
      };

      // ── Tier 5: Redis Storage (Permanent — Infinite TTL) ──────────────────
      if (redis) {
        const deviceId = getDeviceId(targetDeviceUrl);
        const pipe = redis.pipeline();

        if (deviceId) {
          pipe.set(`specs:url:${deviceId}`, JSON.stringify(payload));
        }

        pipe.set(`url_map:${cleanInput.toLowerCase()}`, targetDeviceUrl);
        if (finalDeviceName.toLowerCase() !== cleanInput.toLowerCase()) {
          pipe.set(`url_map:${finalDeviceName.toLowerCase()}`, targetDeviceUrl);
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
