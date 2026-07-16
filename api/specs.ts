import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

// Centralized fetch tool with integrated proxy support
async function fetchHtml(targetUrl: string, signal?: AbortSignal): Promise<{ text: string | null; status: number | null; errorBody?: string }> {
  const apiKey = process.env.SCRAPER_API_KEY;
  
  let fetchUrl: string;
  if (apiKey) {
    const proxyUrl = new URL('https://api.scraperapi.com/');
    proxyUrl.searchParams.set('api_key', apiKey);
    proxyUrl.searchParams.set('url', targetUrl);
    // GSMArena gates results.php3 (and device pages) behind Cloudflare Turnstile.
    // Bypassing it needs ScraperAPI's render/premium/ultra_premium tiers — but those
    // are NOT available on the free plan and ScraperAPI will 403 the whole request
    // if you ask for a feature your plan doesn't include. So these are opt-in via
    // env vars, defaulting to OFF, so a free-plan key still makes a valid (if
    // likely Turnstile-blocked) request instead of getting rejected outright.
    if (process.env.SCRAPER_RENDER === 'true') proxyUrl.searchParams.set('render', 'true');
    if (process.env.SCRAPER_ULTRA_PREMIUM === 'true') proxyUrl.searchParams.set('ultra_premium', 'true');
    else if (process.env.SCRAPER_PREMIUM === 'true') proxyUrl.searchParams.set('premium', 'true');
    fetchUrl = proxyUrl.toString();
  } else {
    fetchUrl = targetUrl;
  }

  try {
    // Only apply fixed headers if NOT using ScraperAPI to prevent TLS fingerprint mismatches
    const headers: Record<string, string> = {};
    if (!apiKey) {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
      headers['Accept-Language'] = 'en-US,en;q=0.9';
      headers['Referer'] = 'https://www.google.com/';
    }

    const response = await fetch(fetchUrl, { headers, signal });

    // Always read the body, even on non-2xx — ScraperAPI returns a JSON/text
    // error message (invalid key, plan restriction, etc.) that we need to see
    // instead of silently discarding it as "null".
    const text = await response.text();

    if (!response.ok) {
      console.error(`Fetch failed with status ${response.status} for ${targetUrl}. Body: ${text.slice(0, 500)}`);
      return { text: null, status: response.status, errorBody: text.slice(0, 500) };
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

// Returns detailed debug information about the search attempt
async function scrapeGsmArenaSearchDebug(query: string, signal?: AbortSignal) {
  const searchUrl = new URL('https://www.gsmarena.com/results.php3');
  searchUrl.searchParams.set('sQuickSearch', 'yes');
  searchUrl.searchParams.set('sName', query);

  const { text: html, status, errorBody } = await fetchHtml(searchUrl.toString(), signal);
  const debug: any = {
    query,
    searchUrl: searchUrl.toString(),
    httpStatus: status,
    responseLength: html ? html.length : 0,
    specsListPresent: false,
    firstDeviceLink: null,
    canonical: null,
    matchedUrl: null,
    turnstile: false,
    proxyError: errorBody || null
  };

  if (!html) return debug;

  // Detect Cloudflare Turnstile / anti-bot pages quickly
  const lowered = html.toLowerCase();
  if (
    lowered.includes('cf-turnstile') ||
    lowered.includes('turnstile') ||
    lowered.includes('turnstile-verify') ||
    lowered.includes('one quick check before you continue') ||
    lowered.includes('meta name="turnstile"') ||
    lowered.includes('challenge-form') ||
    lowered.includes('verify you are human')
  ) {
    debug.turnstile = true;
    return debug;
  }

  const $ = cheerio.load(html);

  if ($('#specs-list').length > 0) {
    debug.specsListPresent = true;
    const canonical = $('link[rel="canonical"]').attr('href') || $('meta[property="og:url"]').attr('content');
    debug.canonical = canonical || null;
    if (canonical) {
      debug.matchedUrl = canonical.startsWith('http') ? canonical : `https://www.gsmarena.com/${String(canonical).replace(/^\//, '')}`;
      return debug;
    }
    // No canonical, still mark matched by specs-list
    debug.matchedUrl = searchUrl.toString();
    return debug;
  }

  let firstDeviceLink = $('.makers ul li a').first().attr('href') || $('.makers a').first().attr('href');
  if (firstDeviceLink) {
    firstDeviceLink = String(firstDeviceLink).replace(/^\//, '');
    debug.firstDeviceLink = firstDeviceLink;
    debug.matchedUrl = `https://www.gsmarena.com/${firstDeviceLink}`;
  }

  return debug;
}

async function scrapeDeviceSpecs(url: string, signal?: AbortSignal) {
  const { text: html } = await fetchHtml(url, signal);
  if (!html) return null;

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
  // Strip common factory prefixes (like Samsung's SM-, GT-, etc.) that break GSMArena searches
  let clean = input.toLowerCase().trim().replace(/\b(sm-|gt-|sch-|sgh-|sph-)/gi, '');
  // Remove extra punctuation that can confuse search
  clean = clean.replace(/[\/:,#]/g, ' ').replace(/\s+/g, ' ').trim();
  
  const parts = clean.split(/\s+/);
  const strategies = [clean];

  if (parts.length > 1) {
    strategies.push(parts[parts.length - 1]); // Try just the specific model code (e.g., "a366e")
    strategies.push(parts.slice(0, -1).join(' ')); // Try just the brand/series
  }

  // Joined version (e.g., "pixel7")
  strategies.push(parts.join(''));
  
  // Extract the base consumer model (e.g., turns "a366e" into "a36")
  const lastWord = parts[parts.length - 1];
  const baseModelMatch = lastWord.match(/[a-z]{1,2}\d{2}/i);
  if (baseModelMatch) {
    strategies.push(baseModelMatch[0]);
  }

  // Brand hinting: some models (like Pixel) work better when prefixed with the vendor
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

  // Return unique strategies, filtering out empty strings
  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8500); // 8.5s timeout for Vercel Hobby

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

    // 1. Grab commercial mapping from the Redis database
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = Redis.fromEnv();
        const cachedValue = await redis.get(`device:${cleanInput.toLowerCase()}`);
        if (cachedValue) {
          translatedQuery = String(cachedValue).trim();
        }
      }
    } catch (e) {
      console.error("Redis lookup error:", e);
    }

  // 1.5. Check specs cache using the final unified device identifier to speed up loading
  const cacheKeyIdentifier = (translatedQuery || cleanInput).toLowerCase();
  const specsCacheKey = `specs:${cacheKeyIdentifier}`;
  const CACHE_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days expiration window (7,776,000 seconds)

  if (redis) {
    try {
      const cachedSpecs = await redis.get(specsCacheKey);
      if (cachedSpecs) {
        console.info(`Cache hit for hardware specifications key: ${specsCacheKey}`);
        const parsedPayload = typeof cachedSpecs === 'string' ? JSON.parse(cachedSpecs) : cachedSpecs;
        return res.status(200).json(parsedPayload);
      }
    } catch (cacheReadError) {
      console.error("Redis hardware cache read error:", cacheReadError);
    }
  }

  // 2. Queue lookups (Translated title first, raw title second)
  const strategies = translatedQuery
    ? [translatedQuery, ...generateSmartStrategies(cleanInput)]
    : generateSmartStrategies(cleanInput);

  console.info('Spec lookup strategies:', strategies);

  const debugAttempts: Array<any> = [];
  let targetDeviceUrl: string | null = null;
  let sawTurnstile = false;

  // 3. Resolve the page location (with debug logging)
  for (const query of strategies) {
    if (controller.signal.aborted) break;
    const debug = await scrapeGsmArenaSearchDebug(query, controller.signal);
    debugAttempts.push(debug);
    console.info('GSM search attempt:', JSON.stringify(debug));
    if (debug.turnstile) sawTurnstile = true;
    if (debug.matchedUrl) {
      targetDeviceUrl = debug.matchedUrl;
      break;
    }
  }

  // 3.5 Fallback Search Engine Discovery (Triggers if internal search was blocked or empty)
  if (!targetDeviceUrl && !controller.signal.aborted) {
    console.info('GSMArena internal search engine blocked or failed. Attempting search engine index discovery...');
    try {
      const ddgUrl = new URL('https://html.duckduckgo.com/html/');
      ddgUrl.searchParams.set('q', `site:gsmarena.com ${cleanInput}`);
      const { text: ddgHtml } = await fetchHtml(ddgUrl.toString(), controller.signal);

      if (ddgHtml) {
        const $ddg = cheerio.load(ddgHtml);
        const discoveredLinks: string[] = [];
        
        $ddg('a').each((_, el) => {
          let href = $ddg(el).attr('href');
          if (href && href.includes('gsmarena.com/')) {
            if (href.includes('uddg=')) {
              try {
                const urlParams = new URLSearchParams(href.substring(href.indexOf('?')));
                const exactUrl = urlParams.get('uddg');
                if (exactUrl) href = exactUrl;
              } catch (e) {}
            }

            // Clean paths and drop platform utility routes
            if (
              href.includes('.php') &&
              !href.includes('results.php') &&
              !href.includes('search.php') &&
              !href.includes('compare.php') &&
              !href.includes('glossary.php') &&
              !href.includes('blog.php')
            ) {
              discoveredLinks.push(href.startsWith('http') ? href : `https://www.gsmarena.com/${href.replace(/^\//, '')}`);
            }
          }
        });

        if (discoveredLinks.length > 0) {
          targetDeviceUrl = discoveredLinks[0];
          console.info('Successfully bypassed search block via search index discovery extraction:', targetDeviceUrl);
          debugAttempts.push({
            query: cleanInput,
            searchUrl: ddgUrl.toString(),
            httpStatus: 200,
            specsListPresent: false,
            matchedUrl: targetDeviceUrl,
            discoveryMethod: 'duckduckgo'
          });
        }
      }
    } catch (ddgError) {
      console.error('Search Engine Discovery failure:', ddgError);
    }
  }

  // If we detected a Turnstile barrier and both direct strategies failed, try to use configured fallback service
  if (!targetDeviceUrl && sawTurnstile && !controller.signal.aborted) {
    const fallbackRaw = process.env.FALLBACK_GSMARENA_API_URL;
    if (fallbackRaw) {
      const base = String(fallbackRaw).replace(/\/$/, '');

      // The fallback's actual (and only) contract is GET /api/specs?model=<model>.
      // We previously guessed at 4 different shapes (/api/specs, /specs, /api, /)
      // which wasted requests on 404s and made debugging harder. Call it directly.
      const fallbackUrl = base.includes('/api/specs')
        ? `${base}${base.includes('?') ? '&' : '?'}model=${encodeURIComponent(cleanInput)}`
        : `${base}/api/specs?model=${encodeURIComponent(cleanInput)}`;

      const triedFallbacks: any[] = [];
      const candidatePaths = [fallbackUrl];

      for (const url of candidatePaths) {
        try {
          console.info('Attempting fallback endpoint:', url);
          const r = await fetch(url, {
            headers: { 'User-Agent': 'Toolz/1.0 (fallback)', 'Accept': 'application/json' },
            signal: controller.signal
          });
          const text = await r.text();
          let parsed: any = null;
          try { parsed = text ? JSON.parse(text) : null; } catch (e) { /* not JSON */ }

          triedFallbacks.push({ url, status: r.status, body_length: text ? text.length : 0, parsed: parsed ? true : false });

          if (r.ok && parsed) {
            // Accept responses that include specifications or source_url
            if (parsed.specifications || parsed.source_url || (parsed.specs)) {
              console.info('Fallback succeeded with:', url);
              const fallbackPayload = {
                search_query: cleanInput,
                matched_device: translatedQuery || cleanInput,
                source_url: parsed.source_url || parsed.specs?.source_url || null,
                specifications: parsed.specifications || parsed.specs || parsed
              };

              // Cache fallback parsed output payload
              if (redis) {
                await redis.set(specsCacheKey, JSON.stringify(fallbackPayload), { ex: CACHE_TTL_SECONDS })
                  .catch(err => console.error("Redis write error (fallback payload):", err));
              }

              return res.status(200).json(fallbackPayload);
            }

            // If parsed but doesn't include specs, maybe it's the raw format we expect
            if (parsed && Object.keys(parsed).length > 0) {
              console.info('Fallback returned JSON but without expected fields:', Object.keys(parsed));

              // Cache generic fallback object structure
              if (redis) {
                await redis.set(specsCacheKey, JSON.stringify(parsed), { ex: CACHE_TTL_SECONDS })
                  .catch(err => console.error("Redis write error (generic fallback JSON):", err));
              }

              return res.status(200).json(parsed);
            }
          }
        } catch (e) {
          console.error('Error calling fallback endpoint', url, e);
          triedFallbacks.push({ url, error: String(e) });
        }
      }

      // If we reach here, fallback attempts failed
      return res.status(502).json({
        error: 'Blocked by Cloudflare Turnstile and fallback attempts failed',
        hint: 'GSMArena returned an anti-bot challenge (Turnstile). The configured FALLBACK_GSMARENA_API_URL did not respond with usable JSON.',
        tried: debugAttempts,
        fallback_tried: triedFallbacks,
        suggestion: {
          ensure_fallback_route: 'Deploy a parsing endpoint that accepts GET /api/specs?model=<model> and returns JSON { source_url, specifications }',
          use_scraper_provider: 'Or configure SCRAPER_API_KEY on the fallback to a provider that supports Turnstile.'
        }
      });
    }

    return res.status(502).json({
      error: 'Blocked by Cloudflare Turnstile / anti-bot gate',
      hint: 'GSMArena returned an anti-bot challenge (Turnstile). Use a scraping provider that supports Turnstile or configure a fallback scraping API.',
      tried: debugAttempts,
      suggestion: {
        use_scraper_provider: 'Set SCRAPER_API_KEY to a provider that explicitly supports Cloudflare Turnstile (e.g., a paid ScraperAPI/ScrapingBee plan).',
        use_fallback_service: 'Set FALLBACK_GSMARENA_API_URL to a deployed gsmarena parsing service that can be used as a proxy.'
      }
    });
  }

  if (controller.signal.aborted) {
    return res.status(504).json({ error: "Execution timed out", hint: "The request took too long and was aborted." });
  }

  if (!targetDeviceUrl) {
    return res.status(404).json({
      error: `Hardware profile execution exhausted for lookup input: '${cleanInput}'`,
      hint: "The device could not be resolved. Verify your search query spelling or check proxy health status parameters.",
      tried: debugAttempts
    });
  }

  // 4. Scrape the table metrics
  const technicalSpecs = await scrapeDeviceSpecs(targetDeviceUrl, controller.signal);

  if (!technicalSpecs) {
    return res.status(502).json({ error: "Failed to extract web structural blocks from target profile.", source_url: targetDeviceUrl });
  }

  const finalPayload = {
    search_query: cleanInput,
    matched_device: translatedQuery || cleanInput,
    source_url: targetDeviceUrl,
    specifications: technicalSpecs
  };

  // 5. Store data in Upstash Redis cache namespace before returning the response
  if (redis) {
    try {
      await redis.set(specsCacheKey, JSON.stringify(finalPayload), { ex: CACHE_TTL_SECONDS });
      console.info(`Successfully cached specifications for key: ${specsCacheKey}`);
    } catch (cacheWriteError) {
      console.error("Redis hardware cache save error:", cacheWriteError);
    }
  }

  return res.status(200).json(finalPayload);
  } catch (globalError: any) {
    console.error("CRITICAL API FAILURE:", globalError);
    return res.status(500).json({
      error: "Internal Server Error",
      message: globalError.message || "An unexpected error occurred"
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
