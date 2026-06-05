import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import * as cheerio from 'cheerio';

const CACHE_FRESH_SEC = 15 * 24 * 60 * 60; 
const CACHE_STALE_SEC = 30 * 24 * 60 * 60;
const CACHE_HEADER = `public, max-age=0, s-maxage=${CACHE_FRESH_SEC}, stale-while-revalidate=${CACHE_STALE_SEC}`;

// --- PURE FETCH ENGINE FOR GSMARENA ---
async function scrapeGsmArenaSearch(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://www.gsmarena.com/res.php3?sSearch=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find the first device link inside the makers list grid layout
    const firstDeviceLink = $('.makers ul li a').first().attr('href');
    return firstDeviceLink ? `https://www.gsmarena.com/${firstDeviceLink}` : null;
  } catch {
    return null;
  }
}

async function scrapeDeviceSpecs(deviceUrl: string) {
  const response = await fetch(deviceUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  
  if (!response.ok) throw new Error("Failed to pull specs HTML sheet");
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const title = $('.specs-phone-name-title').text().trim();
  const mainImg = $('.specs-photo-main img').attr('src') || "";
  const specs: Record<string, Record<string, string>> = {};

  // Parse the specifications table grids cleanly
  $('#specs-list table').each((_, table) => {
    const category = $(table).find('th').text().trim();
    if (!category) return;
    
    specs[category] = {};
    $(table).find('tr').each((_, tr) => {
      const key = $(tr).find('.ttl').text().trim().replace(/&nbsp;/g, '');
      const value = $(tr).find('.nfo').text().trim();
      if (key || value) {
        specs[category][key || "Info"] = value;
      }
    });
  });

  return { title, mainImg, specifications: specs };
}

function generateSmartStrategies(rawQuery: string): string[] {
  let clean = rawQuery.trim();
  clean = clean
    .replace(/\b(Galaxy Note)\s*(\d+)/gi, 'Note $2')
    .replace(/\b(Galaxy S)\s*(\d+)/gi, 'S$2')
    .replace(/\b(Galaxy A)\s*(\d+)/gi, 'A$2')
    .replace(/ (unlocked|carrier|5g|lte|wifi|4g|dual sim|global|ds|edit|pro\+|plus)/gi, '')
    .trim();

  const words = clean.split(/\s+|_|-/);
  const strategies = [rawQuery.trim(), clean];

  if (words.length >= 3) strategies.push(`${words[0]} ${words[1]} ${words[2]}`);
  if (words.length > 1) strategies.push(words.slice(1).join(' '));
  if (words.length >= 2) strategies.push(`${words[0]} ${words[1]}`);

  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}

// --- MAIN HANDLER ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('model');

    if (!rawQuery || rawQuery.trim() === '') {
      return NextResponse.json({ error: "Missing 'model' parameter." }, { status: 400 });
    }

    const cleanInput = rawQuery.trim();
    let translatedQuery: string | null = null;
    let isDatabaseMatch = false;

    try {
      const redis = Redis.fromEnv();
      const cachedValue = await redis.get(`device:${cleanInput.toLowerCase()}`);
      if (cachedValue) {
        translatedQuery = String(cachedValue).trim();
        isDatabaseMatch = true;
      }
    } catch (e) {
      console.error("Redis lookup bypass:", e);
    }

    let strategies = translatedQuery 
      ? [translatedQuery, ...generateSmartStrategies(cleanInput)] 
      : generateSmartStrategies(cleanInput);

    let targetDeviceUrl: string | null = null;
    let successfulQuery = "";

    // Sequential Fallback Loop Pass via HTTP fetch requests
    for (const query of strategies) {
      const matchedUrl = await scrapeGsmArenaSearch(query);
      if (matchedUrl) {
        targetDeviceUrl = matchedUrl;
        successfulQuery = query;
        break;
      }
    }

    if (!targetDeviceUrl) {
      return NextResponse.json(
        { error: `Hardware profile execution exhausted for lookup input: '${cleanInput}'` },
        { status: 404, headers: { 'Cache-Control': 'public, max-age=0, no-cache, no-store, must-revalidate' } }
      );
    }

    // Scrape details from the targeted page URL match
    const deviceDetails = await scrapeDeviceSpecs(targetDeviceUrl);
    const trackingTag = isDatabaseMatch ? `[Google Play Direct Match] ${successfulQuery}` : successfulQuery;

    return NextResponse.json(deviceDetails, {
      status: 200,
      headers: {
        'Cache-Control': CACHE_HEADER,
        'X-Matched-Query': encodeURIComponent(trackingTag)
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error analyzing phone specs.", details: error?.message },
      { status: 500, headers: { 'Cache-Control': 'public, max-age=0, no-cache, no-store, must-revalidate' } }
    );
  }
}
