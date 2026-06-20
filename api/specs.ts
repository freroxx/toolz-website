import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

// Centralized fetch tool with integrated proxy support
async function fetchHtml(targetUrl: string): Promise<{ text: string | null; status: number | null }> {
  const apiKey = process.env.SCRAPER_API_KEY;
  
  let fetchUrl: string;
  if (apiKey) {
    const proxyUrl = new URL('https://api.scraperapi.com/');
    proxyUrl.searchParams.set('api_key', apiKey);
    proxyUrl.searchParams.set('url', targetUrl);
    fetchUrl = proxyUrl.toString();
  } else {
    fetchUrl = targetUrl;
  }

  try {
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      console.error(`Fetch failed with status ${response.status} for ${targetUrl}`);
      return { text: null, status: response.status };
    }
    const text = await response.text();
    return { text, status: response.status };
  } catch (error) {
    console.error(`Network error fetching ${targetUrl}:`, error);
    return { text: null, status: null };
  }
}

// Returns detailed debug information about the search attempt
async function scrapeGsmArenaSearchDebug(query: string) {
  const searchUrl = new URL('https://www.gsmarena.com/results.php3');
  searchUrl.searchParams.set('sQuickSearch', 'yes');
  searchUrl.searchParams.set('sName', query);

  const { text: html, status } = await fetchHtml(searchUrl.toString());
  const debug: any = {
    query,
    searchUrl: searchUrl.toString(),
    httpStatus: status,
    responseLength: html ? html.length : 0,
    specsListPresent: false,
    firstDeviceLink: null,
    canonical: null,
    matchedUrl: null
  };

  if (!html) return debug;

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

async function scrapeDeviceSpecs(url: string) {
  const { text: html } = await fetchHtml(url);
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

  // 1. Grab commercial mapping from the Redis database 
  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const redis = Redis.fromEnv();
      const cachedValue = await redis.get(`device:${cleanInput.toLowerCase()}`);
      if (cachedValue) {
        translatedQuery = String(cachedValue).trim();
      }
    }
  } catch (e) {
    console.error("Redis lookup error:", e);
  }

  // 2. Queue lookups (Translated title first, raw title second)
  const strategies = translatedQuery 
    ? [translatedQuery, ...generateSmartStrategies(cleanInput)] 
    : generateSmartStrategies(cleanInput);

  console.info('Spec lookup strategies:', strategies);

  const debugAttempts: Array<any> = [];
  let targetDeviceUrl: string | null = null;

  // 3. Resolve the page location (with debug logging)
  for (const query of strategies) {
    const debug = await scrapeGsmArenaSearchDebug(query);
    debugAttempts.push(debug);
    console.info('GSM search attempt:', JSON.stringify(debug));
    if (debug.matchedUrl) {
      targetDeviceUrl = debug.matchedUrl;
      break;
    }
  }

  if (!targetDeviceUrl) {
    return res.status(404).json({ 
      error: `Hardware profile execution exhausted for lookup input: '${cleanInput}'`,
      hint: "The device could not be resolved. Verify your search query spelling or check proxy health status parameters.",
      tried: debugAttempts
    });
  }

  // 4. Scrape the table metrics
  const technicalSpecs = await scrapeDeviceSpecs(targetDeviceUrl);

  if (!technicalSpecs) {
    return res.status(502).json({ error: "Failed to extract web structural blocks from target profile.", source_url: targetDeviceUrl });
  }

  return res.status(200).json({
    search_query: cleanInput,
    matched_device: translatedQuery || cleanInput,
    source_url: targetDeviceUrl,
    specifications: technicalSpecs
  });
}
