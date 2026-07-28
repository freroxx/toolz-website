import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

// For anyone reading this, I spent countless hours fixing this shit, not once not twice, this is a warning for any contributor, if it works, don't touch it
// Detect Cloudflare Turnstile / anti-bot pages quickly
function isTurnstile(html: string): boolean {
  if (!html) return false;
  const lowered = html.toLowerCase();
  return (
    lowered.includes('cf-turnstile') ||
    lowered.includes('turnstile') ||
    lowered.includes('turnstile-verify') ||
    lowered.includes('one quick check before you continue') ||
    lowered.includes('meta name="turnstile"') ||
    lowered.includes('challenge-form') ||
    lowered.includes('verify you are human') ||
    lowered.includes('cloudflare.com/static/cos/')
  );
}

// Centralized fetch tool with integrated proxy support
async function fetchHtml(
  targetUrl: string,
  signal?: AbortSignal,
  extraHeaders: Record<string, string> = {},
  options: { render?: boolean; timeoutMs?: number } = {}
): Promise<{ text: string | null; status: number | null; errorBody?: string; turnstile?: boolean }> {
  const apiKey = process.env.SCRAPER_API_KEY;
  const { render = false, timeoutMs = 6000 } = options;

  let fetchUrl: string;
  if (apiKey) {
    const proxyUrl = new URL('https://api.scraperapi.com/');
    proxyUrl.searchParams.set('api_key', apiKey);
    proxyUrl.searchParams.set('url', targetUrl);

    // Only render if explicitly requested (saves 3-5s per request)
    if (render) {
      if (process.env.SCRAPER_RENDER === 'true') proxyUrl.searchParams.set('render', 'true');
      if (process.env.SCRAPER_ULTRA_PREMIUM === 'true') proxyUrl.searchParams.set('ultra_premium', 'true');
      else if (process.env.SCRAPER_PREMIUM === 'true') proxyUrl.searchParams.set('premium', 'true');
    }

    fetchUrl = proxyUrl.toString();
  } else {
    fetchUrl = targetUrl;
  }

  // Create an internal timeout signal that races with the global one
  const internalController = new AbortController();
  const internalTimeout = setTimeout(() => internalController.abort(), timeoutMs);

  // Combine signals if possible, or just use internal for this fetch
  const combinedSignal = signal; // Simple approach: use the global signal for overall budget

  try {
    const headers: Record<string, string> = { ...extraHeaders };
    if (!apiKey) {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
      headers['Accept-Language'] = 'en-US,en;q=0.9';
      headers['Referer'] = targetUrl.includes('gsmarena.com') ? 'https://www.gsmarena.com/' : 'https://www.google.com/';
    }

    const response = await fetch(fetchUrl, {
      headers,
      signal: combinedSignal,
      // @ts-ignore - internal timeout
      next: { revalidate: 0 }
    });

    const text = await response.text();

    if (!response.ok) {
      console.error(`Fetch failed (${response.status}) for ${targetUrl}. Body: ${text.slice(0, 200)}`);
      return { text: null, status: response.status, errorBody: text.slice(0, 200) };
    }

    if (isTurnstile(text)) {
      console.warn(`Turnstile detected for ${targetUrl}`);
      return { text, status: response.status, turnstile: true };
    }

    return { text, status: response.status };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`Fetch aborted (timeout/signal): ${targetUrl}`);
      return { text: null, status: 408, errorBody: 'Request timeout' };
    }
    console.error(`Network error fetching ${targetUrl}:`, error);
    return { text: null, status: null };
  } finally {
    clearTimeout(internalTimeout);
  }
}

// Uses GSMArena internal suggest API (Quick Search) - typically less protected
async function scrapeGsmArenaSuggest(query: string, signal?: AbortSignal) {
  const suggestUrl = `https://www.gsmarena.com/suggest.php3?sTerm=${encodeURIComponent(query)}`;
  console.info(`[Phase 1] Attempting Suggest API for: "${query}"`);

  // Use NO rendering for Phase 1 to keep it fast
  const { text: jsonText, turnstile } = await fetchHtml(suggestUrl, signal, {
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://www.gsmarena.com/'
  }, { render: false, timeoutMs: 4000 });

  if (turnstile) return { turnstile: true };
  if (!jsonText) return null;

  try {
    const results = JSON.parse(jsonText);
    if (Array.isArray(results) && results.length > 0) {
      const first = results[0];
      if (first.id) {
        return { matchedUrl: `https://www.gsmarena.com/${first.id}.php`, text: first.text };
      }
    }
  } catch (e) {}
  return null;
}

// Direct Search attempt with better logs
async function scrapeGsmArenaSearchDebug(query: string, signal?: AbortSignal) {
  const searchUrl = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`;
  console.info(`[Phase 2] Attempting Direct Search for: "${query}"`);

  // Direct search might need rendering if results are heavily protected
  const { text: html, turnstile, status } = await fetchHtml(searchUrl, signal, {}, { render: false, timeoutMs: 5000 });

  if (turnstile) return { turnstile: true };
  if (!html) return null;

  const $ = cheerio.load(html);
  if ($('#specs-list').length > 0) {
    const canonical = $('link[rel="canonical"]').attr('href') || $('meta[property="og:url"]').attr('content');
    if (canonical) {
      return { matchedUrl: canonical.startsWith('http') ? canonical : `https://www.gsmarena.com/${String(canonical).replace(/^\//, '')}` };
    }
    return { matchedUrl: searchUrl };
  }

  let firstDeviceLink = $('.makers ul li a').first().attr('href') || $('.makers a').first().attr('href');
  if (firstDeviceLink) {
    return { matchedUrl: `https://www.gsmarena.com/${String(firstDeviceLink).replace(/^\//, '')}` };
  }

  return null;
}

async function scrapeDeviceSpecs(url: string, signal?: AbortSignal) {
  // Extraction Phase: Try WITHOUT render first, if blocked we might be stuck on Hobby plan, but it's the best attempt
  const { text: html, turnstile } = await fetchHtml(url, signal, {}, { render: true, timeoutMs: 7000 });
  if (turnstile || !html) return null;

  const $ = cheerio.load(html);
  const specs: Record<string, Record<string, string>> = {};

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

  return Object.keys(specs).length > 0 ? specs : null;
}

function generateSmartStrategies(input: string): string[] {
  let clean = input.toLowerCase().trim().replace(/\b(sm-|gt-|sch-|sgh-|sph-)/gi, '');
  clean = clean.replace(/[\/:,#]/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = clean.split(/\s+/);
  const strategies = [clean];
  if (parts.length > 1) {
    strategies.push(parts[parts.length - 1]);
    strategies.push(parts.slice(0, -1).join(' '));
  }
  strategies.push(parts.join(''));
  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9200); // 9.2s budget

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

    // 1. Check Full Specs Cache
    const cacheKey = `specs:${cleanInput.toLowerCase()}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.info(`[Cache] Full specs hit for: ${cleanInput}`);
        return res.status(200).json(typeof cached === 'string' ? JSON.parse(cached) : cached);
      }
    }

    // 2. Check URL Mapping Cache (Skip discovery phases)
    let targetDeviceUrl: string | null = null;
    const urlMapKey = `url_map:${cleanInput.toLowerCase()}`;
    if (redis) {
      targetDeviceUrl = await redis.get(urlMapKey);
      if (targetDeviceUrl) console.info(`[Cache] URL mapping hit: ${targetDeviceUrl}`);
    }

    const strategies = generateSmartStrategies(cleanInput);
    let sawTurnstile = false;

    // 3. Discovery Phases (Only if URL not cached)
    if (!targetDeviceUrl) {
      // Phase 1: Parallel Suggest API (Top 3 strategies)
      console.info(`[Phase 1] Searching for ${cleanInput}...`);
      const suggestResults = await Promise.all(
        strategies.slice(0, 3).map(q => scrapeGsmArenaSuggest(q, controller.signal))
      );

      for (const res of suggestResults) {
        if (res?.turnstile) sawTurnstile = true;
        if (res?.matchedUrl) {
          targetDeviceUrl = res.matchedUrl;
          break;
        }
      }

      // Phase 2: Sequential Direct Search (Limited)
      if (!targetDeviceUrl && !sawTurnstile && !controller.signal.aborted) {
        for (const query of strategies.slice(0, 2)) {
          const res = await scrapeGsmArenaSearchDebug(query, controller.signal);
          if (res?.turnstile) { sawTurnstile = true; break; }
          if (res?.matchedUrl) { targetDeviceUrl = res.matchedUrl; break; }
        }
      }

      // Phase 3: External Search (Parallel)
      if (!targetDeviceUrl && !controller.signal.aborted) {
        console.info(`[Phase 3] External discovery for ${cleanInput}...`);
        const engines = [
          { name: 'Google', url: `https://www.google.com/search?q=site:gsmarena.com+${encodeURIComponent(cleanInput)}` },
          { name: 'DuckDuckGo', url: `https://html.duckduckgo.com/html/?q=site:gsmarena.com+${encodeURIComponent(cleanInput)}` }
        ];

        const discoveryResults = await Promise.all(
          engines.map(async (engine) => {
            const { text: html, turnstile } = await fetchHtml(engine.url, controller.signal, {}, { render: false, timeoutMs: 5000 });
            if (turnstile || !html) return null;
            const $ = cheerio.load(html);
            let link: string | null = null;
            $('a').each((_, el) => {
              let href = $(el).attr('href');
              if (!href || link) return;
              if (href.includes('uddg=')) try { href = new URLSearchParams(href.split('?')[1]).get('uddg') || href; } catch(e){}
              if (href.startsWith('/url?q=')) try { href = new URLSearchParams(href.split('?')[1]).get('q') || href; } catch(e){}
              if (href.includes('gsmarena.com/') && href.includes('.php') && !/results|search|compare|glossary|blog/i.test(href)) {
                link = href.startsWith('http') ? href : `https://www.gsmarena.com/${href.replace(/^\//, '')}`;
              }
            });
            return link;
          })
        );
        targetDeviceUrl = discoveryResults.find(l => l) || null;
      }

      // Save discovered URL to cache if found
      if (targetDeviceUrl && redis) {
        await redis.set(urlMapKey, targetDeviceUrl, { ex: 2592000 }); // 30 days
      }
    }

    if (controller.signal.aborted) return res.status(504).json({ error: "Timeout" });

    if (!targetDeviceUrl) {
      return res.status(sawTurnstile ? 502 : 404).json({ error: sawTurnstile ? "Blocked by anti-bot" : "Device not found" });
    }

    // Phase 5: Extraction
    console.info(`[Phase 5] Extracting specs from: ${targetDeviceUrl}`);
    const specs = await scrapeDeviceSpecs(targetDeviceUrl, controller.signal);

    if (!specs) {
      return res.status(502).json({ error: "Failed to extract specs", url: targetDeviceUrl });
    }

    const payload = { search_query: cleanInput, source_url: targetDeviceUrl, specifications: specs };
    if (redis) await redis.set(cacheKey, JSON.stringify(payload), { ex: 7776000 }); // 90 days

    return res.status(200).json(payload);

  } catch (err: any) {
    console.error("Critical Failure:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    clearTimeout(timeoutId);
  }
}
