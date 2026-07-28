import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

// Detect Cloudflare Turnstile / anti-bot pages quickly
function isTurnstile(html: string): boolean {
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
  extraHeaders: Record<string, string> = {}
): Promise<{ text: string | null; status: number | null; errorBody?: string; turnstile?: boolean }> {
  const apiKey = process.env.SCRAPER_API_KEY;
  
  let fetchUrl: string;
  if (apiKey) {
    const proxyUrl = new URL('https://api.scraperapi.com/');
    proxyUrl.searchParams.set('api_key', apiKey);
    proxyUrl.searchParams.set('url', targetUrl);

    if (process.env.SCRAPER_RENDER === 'true') proxyUrl.searchParams.set('render', 'true');
    if (process.env.SCRAPER_ULTRA_PREMIUM === 'true') proxyUrl.searchParams.set('ultra_premium', 'true');
    else if (process.env.SCRAPER_PREMIUM === 'true') proxyUrl.searchParams.set('premium', 'true');

    fetchUrl = proxyUrl.toString();
  } else {
    fetchUrl = targetUrl;
  }

  try {
    const headers: Record<string, string> = { ...extraHeaders };
    if (!apiKey) {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
      headers['Accept-Language'] = 'en-US,en;q=0.9';
      headers['Referer'] = targetUrl.includes('gsmarena.com') ? 'https://www.gsmarena.com/' : 'https://www.google.com/';
    }

    const response = await fetch(fetchUrl, { headers, signal });
    const text = await response.text();

    if (!response.ok) {
      console.error(`Fetch failed with status ${response.status} for ${targetUrl}. Body: ${text.slice(0, 500)}`);
      return { text: null, status: response.status, errorBody: text.slice(0, 500) };
    }

    if (isTurnstile(text)) {
      console.warn(`Turnstile detected for ${targetUrl}`);
      return { text, status: response.status, turnstile: true };
    }

    return { text, status: response.status };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`Fetch aborted due to timeout: ${targetUrl}`);
      return { text: null, status: 408, errorBody: 'Request timeout' };
    }
    console.error(`Network error fetching ${targetUrl}:`, error);
    return { text: null, status: null };
  }
}

// Uses GSMArena internal suggest API (Quick Search) - typically less protected
async function scrapeGsmArenaSuggest(query: string, signal?: AbortSignal) {
  const suggestUrl = `https://www.gsmarena.com/suggest.php3?sTerm=${encodeURIComponent(query)}`;
  console.info(`[Phase 1] Attempting Suggest API for query: "${query}"`);

  const { text: jsonText, status, turnstile } = await fetchHtml(suggestUrl, signal, {
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://www.gsmarena.com/'
  });

  if (turnstile) {
    console.warn(`[Phase 1] Suggest API blocked by Turnstile for query: "${query}"`);
    return { turnstile: true };
  }
  if (!jsonText) {
    console.info(`[Phase 1] Suggest API returned no data for query: "${query}"`);
    return null;
  }

  try {
    const results = JSON.parse(jsonText);
    if (Array.isArray(results) && results.length > 0) {
      const first = results[0];
      if (first.id) {
        console.info(`[Phase 1] Suggest API match found: ${first.text} (${first.id})`);
        return {
          matchedUrl: `https://www.gsmarena.com/${first.id}.php`,
          text: first.text
        };
      }
    }
    console.info(`[Phase 1] Suggest API found no results for query: "${query}"`);
  } catch (e) {
    console.error(`[Phase 1] Failed to parse Suggest API JSON for query: "${query}":`, e);
  }
  return null;
}

// Returns detailed debug information about the search attempt
async function scrapeGsmArenaSearchDebug(query: string, signal?: AbortSignal) {
  const searchUrl = new URL('https://www.gsmarena.com/results.php3');
  searchUrl.searchParams.set('sQuickSearch', 'yes');
  searchUrl.searchParams.set('sName', query);

  console.info(`[Phase 2] Attempting Direct Search for query: "${query}"`);
  const { text: html, status, errorBody, turnstile } = await fetchHtml(searchUrl.toString(), signal);

  const debug: any = {
    query,
    searchUrl: searchUrl.toString(),
    httpStatus: status,
    responseLength: html ? html.length : 0,
    specsListPresent: false,
    firstDeviceLink: null,
    canonical: null,
    matchedUrl: null,
    turnstile: !!turnstile,
    proxyError: errorBody || null
  };

  if (turnstile) {
    console.warn(`[Phase 2] Direct Search blocked by Turnstile for query: "${query}"`);
    return debug;
  }
  if (!html) {
    console.info(`[Phase 2] Direct Search returned no HTML for query: "${query}"`);
    return debug;
  }

  const $ = cheerio.load(html);

  if ($('#specs-list').length > 0) {
    console.info(`[Phase 2] Direct Search landed directly on specs page for query: "${query}"`);
    debug.specsListPresent = true;
    const canonical = $('link[rel="canonical"]').attr('href') || $('meta[property="og:url"]').attr('content');
    debug.canonical = canonical || null;
    if (canonical) {
      debug.matchedUrl = canonical.startsWith('http') ? canonical : `https://www.gsmarena.com/${String(canonical).replace(/^\//, '')}`;
      return debug;
    }
    debug.matchedUrl = searchUrl.toString();
    return debug;
  }

  let firstDeviceLink = $('.makers ul li a').first().attr('href') || $('.makers a').first().attr('href');
  if (firstDeviceLink) {
    firstDeviceLink = String(firstDeviceLink).replace(/^\//, '');
    debug.firstDeviceLink = firstDeviceLink;
    debug.matchedUrl = `https://www.gsmarena.com/${firstDeviceLink}`;
    console.info(`[Phase 2] Direct Search found result link: ${debug.matchedUrl}`);
  } else {
    console.info(`[Phase 2] Direct Search found no results on makers page for query: "${query}"`);
  }

  return debug;
}

async function scrapeDeviceSpecs(url: string, signal?: AbortSignal) {
  const { text: html, turnstile } = await fetchHtml(url, signal);
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
  
  const lastWord = parts[parts.length - 1];
  const baseModelMatch = lastWord.match(/[a-z]{1,2}\d{2}/i);
  if (baseModelMatch) {
    strategies.push(baseModelMatch[0]);
  }

  const brandHints: Record<string, string> = {
    pixel: 'google',
    "galaxy": 'samsung',
    iphone: 'apple'
  };

  for (const [hintKey, hintBrand] of Object.entries(brandHints)) {
    if (clean.includes(hintKey) && !clean.includes(hintBrand)) {
      strategies.unshift(`${hintBrand} ${clean}`);
    }
  }

  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}
2
// Parallel discovery is now handled directly in the handler handler

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8500);

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
    let translatedQuery: string | null = null;
    let redis: Redis | null = null;

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = Redis.fromEnv();
      const cachedValue = await redis.get(`device:${cleanInput.toLowerCase()}`);
      if (cachedValue) translatedQuery = String(cachedValue).trim();
    }

    const cacheKeyIdentifier = (translatedQuery || cleanInput).toLowerCase();
    const specsCacheKey = `specs:${cacheKeyIdentifier}`;
    const CACHE_TTL_SECONDS = 90 * 24 * 60 * 60;

    if (redis) {
      const cachedSpecs = await redis.get(specsCacheKey);
      if (cachedSpecs) {
        console.info(`Cache hit: ${specsCacheKey}`);
        return res.status(200).json(typeof cachedSpecs === 'string' ? JSON.parse(cachedSpecs) : cachedSpecs);
      }
    }

    const strategies = translatedQuery
      ? [translatedQuery, ...generateSmartStrategies(cleanInput)]
      : generateSmartStrategies(cleanInput);

    console.info('Spec lookup strategies:', strategies);

    let targetDeviceUrl: string | null = null;
    let sawTurnstile = false;
    const debugAttempts: any[] = [];

    // Phase 1: Try Suggest API (Autocomplete) - Fast and less protected
    // Parallelize all strategies for Phase 1 to save time
    console.info(`[Phase 1] Attempting parallel Suggest API for ${strategies.length} strategies`);
    const suggestResults = await Promise.all(
      strategies.map(query => scrapeGsmArenaSuggest(query, controller.signal))
    );

    for (const res of suggestResults) {
      if (res?.turnstile) sawTurnstile = true;
      if (res?.matchedUrl) {
        targetDeviceUrl = res.matchedUrl;
        console.info(`[Phase 1] Suggest API found match: ${targetDeviceUrl}`);
        break;
      }
    }

    // Phase 2: Try Search Page (Original method) - Sequential but limited
    if (!targetDeviceUrl && !controller.signal.aborted) {
      // Only try the first 2 most relevant strategies for Phase 2 to avoid timeout
      const limitedStrategies = strategies.slice(0, 2);
      console.info(`[Phase 2] Attempting Direct Search for limited strategies: ${limitedStrategies.join(', ')}`);

      for (const query of limitedStrategies) {
        if (controller.signal.aborted) break;
        const debug = await scrapeGsmArenaSearchDebug(query, controller.signal);
        debugAttempts.push(debug);
        if (debug.turnstile) sawTurnstile = true;
        if (debug.matchedUrl) {
          targetDeviceUrl = debug.matchedUrl;
          console.info(`[Phase 2] Direct Search found match: ${targetDeviceUrl}`);
          break;
        }
      }
    }

    // Phase 3: Try External Search Discovery (Google/DDG) - Parallel
    if (!targetDeviceUrl && !controller.signal.aborted) {
      console.info('[Phase 3] Attempting parallel external search discovery...');
      const discoveryEngines = [
        { name: 'Google', url: `https://www.google.com/search?q=site:gsmarena.com+${encodeURIComponent(cleanInput)}` },
        { name: 'DuckDuckGo', url: `https://html.duckduckgo.com/html/?q=site:gsmarena.com+${encodeURIComponent(cleanInput)}` }
      ];

      const discoveryResults = await Promise.all(
        discoveryEngines.map(async (engine) => {
          if (controller.signal.aborted) return null;
          console.info(`[Phase 3] Requesting ${engine.name}...`);
          const { text: html, status, turnstile } = await fetchHtml(engine.url, controller.signal);

          if (turnstile || !html) {
            console.warn(`[Phase 3] ${engine.name} failed (Turnstile: ${!!turnstile}, Status: ${status})`);
            return null;
          }

          const $ = cheerio.load(html);
          let foundLink: string | null = null;

          $('a').each((_, el) => {
            let href = $(el).attr('href');
            if (!href || foundLink) return;

            if (href.includes('uddg=')) {
              try { const p = new URLSearchParams(href.substring(href.indexOf('?'))); href = p.get('uddg') || href; } catch (e) {}
            }
            if (href.startsWith('/url?q=')) {
              try { const p = new URLSearchParams(href.substring(href.indexOf('?'))); href = p.get('q') || href; } catch (e) {}
            }

            if (href.includes('gsmarena.com/') && href.includes('.php')) {
              if (!/results|search|compare|glossary|blog|news|reviews/i.test(href)) {
                foundLink = href.startsWith('http') ? href : `https://www.gsmarena.com/${href.replace(/^\//, '')}`;
              }
            }
          });

          return foundLink ? { matchedUrl: foundLink, engine: engine.name } : null;
        })
      );

      for (const res of discoveryResults) {
        if (res?.matchedUrl) {
          targetDeviceUrl = res.matchedUrl;
          console.info(`[Phase 3] Discovery (${res.engine}) found match: ${targetDeviceUrl}`);
          break;
        }
      }
    }

    // Phase 4: Try Fallback API if configured
    if (!targetDeviceUrl && sawTurnstile && !controller.signal.aborted && process.env.FALLBACK_GSMARENA_API_URL) {
      const fallbackUrl = `${process.env.FALLBACK_GSMARENA_API_URL.replace(/\/$/, '')}/api/specs?model=${encodeURIComponent(cleanInput)}`;
      try {
        console.info(`[Phase 4] Attempting fallback API: ${fallbackUrl}`);
        const r = await fetch(fallbackUrl, { signal: controller.signal });
        const text = await r.text();

        if (r.ok) {
          try {
            const parsed = JSON.parse(text);
            if (parsed && (parsed.specifications || parsed.specs || Object.keys(parsed).length > 0)) {
              console.info(`[Phase 4] Fallback API succeeded for: "${cleanInput}"`);
              if (redis) await redis.set(specsCacheKey, JSON.stringify(parsed), { ex: CACHE_TTL_SECONDS });
              return res.status(200).json(parsed);
            }
          } catch (e) {
            console.error(`[Phase 4] Failed to parse fallback API JSON: ${text.slice(0, 100)}`);
          }
        } else {
          console.warn(`[Phase 4] Fallback API returned status ${r.status}: ${text.slice(0, 100)}`);
        }
      } catch (e) {
        console.error('[Phase 4] Fallback API request failed:', e);
      }
    }

    if (controller.signal.aborted) {
      console.warn(`[Final] Request timed out after 8.5s for: "${cleanInput}"`);
      return res.status(504).json({ error: "Timeout" });
    }

    if (!targetDeviceUrl) {
      console.error(`[Final] All strategies exhausted for: "${cleanInput}". Turnstile hit: ${sawTurnstile}`);
      return res.status(sawTurnstile ? 502 : 404).json({
        error: sawTurnstile ? "Blocked by Cloudflare Turnstile" : "Device not found",
        tried: debugAttempts
      });
    }

    // Phase 5: Scrape actual specs from the resolved URL
    console.info(`[Phase 5] Extracting specifications from: ${targetDeviceUrl}`);
    const technicalSpecs = await scrapeDeviceSpecs(targetDeviceUrl, controller.signal);
    if (!technicalSpecs) {
      console.error(`[Phase 5] Failed to parse specs table from: ${targetDeviceUrl}`);
      return res.status(502).json({ error: "Failed to parse specs table", source_url: targetDeviceUrl, turnstile: sawTurnstile });
    }

    console.info(`[Phase 5] Successfully extracted specs for: "${cleanInput}"`);
    const finalPayload = {
      search_query: cleanInput,
      matched_device: translatedQuery || cleanInput,
      source_url: targetDeviceUrl,
      specifications: technicalSpecs
    };

    if (redis) await redis.set(specsCacheKey, JSON.stringify(finalPayload), { ex: CACHE_TTL_SECONDS });

    return res.status(200).json(finalPayload);

  } catch (globalError: any) {
    console.error("CRITICAL API FAILURE:", globalError);
    return res.status(500).json({ error: "Internal Server Error", message: globalError.message });
  } finally {
    clearTimeout(timeoutId);
  }
}
