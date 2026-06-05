import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

// 🔄 Centralized connection mechanism with a Cloudflare bypass mechanism
async function fetchHtml(targetUrl: string): Promise<string | null> {
  const apiKey = process.env.SCRAPER_API_KEY;
  
  // Routes through ScraperAPI if present, otherwise attempts a direct fallback fetch
  const url = apiKey 
    ? `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}`
    : targetUrl;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      console.error(`Fetch failed with status ${response.status} for ${targetUrl}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`Network error fetching ${targetUrl}:`, error);
    return null;
  }
}

async function scrapeGsmArenaSearch(query: string): Promise<string | null> {
  const searchUrl = `https://www.gsmarena.com/res.php3?sSearch=${encodeURIComponent(query)}`;
  const html = await fetchHtml(searchUrl);
  if (!html) return null;

  const $ = cheerio.load(html);
  const firstDeviceLink = $('.makers ul li a').first().attr('href');
  
  return firstDeviceLink ? `https://www.gsmarena.com/${firstDeviceLink}` : null;
}

async function scrapeDeviceSpecs(url: string) {
  const html = await fetchHtml(url);
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
  const clean = input.toLowerCase().trim();
  const parts = clean.split(/\s+/);
  if (parts.length > 1) {
    return [clean, parts[parts.length - 1], parts.slice(0, -1).join(' ')];
  }
  return [clean];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Setup standard cross-origin security headers
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

  // 1. Pull the commercial name directly out of your 75k synced Redis database
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

  // 2. Build prioritized list of fallback query strategies
  const strategies = translatedQuery 
    ? [translatedQuery, ...generateSmartStrategies(cleanInput)] 
    : generateSmartStrategies(cleanInput);

  let targetDeviceUrl: string | null = null;

  // 3. Resolve the matching profile URL
  for (const query of strategies) {
    const matchedUrl = await scrapeGsmArenaSearch(query);
    if (matchedUrl) {
      targetDeviceUrl = matchedUrl;
      break;
    }
  }

  if (!targetDeviceUrl) {
    return res.status(404).json({ 
      error: `Hardware profile execution exhausted for lookup input: '${cleanInput}'`,
      hint: !process.env.SCRAPER_API_KEY 
        ? "Your Redis translation worked, but GSMArena blocked Vercel from searching. Add SCRAPER_API_KEY to your Vercel variables to bypass Cloudflare." 
        : "The device could not be found via search metrics."
    });
  }

  // 4. Scrape the specifications from the resolved device page
  const technicalSpecs = await scrapeDeviceSpecs(targetDeviceUrl);

  if (!technicalSpecs) {
    return res.status(502).json({ error: "Failed to extract web structural blocks from target profile." });
  }

  return res.status(200).json({
    search_query: cleanInput,
    matched_device: translatedQuery || cleanInput,
    source_url: targetDeviceUrl,
    specifications: technicalSpecs
  });
}
