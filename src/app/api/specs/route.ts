import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
// @ts-ignore
import gsmarena from 'gsmarena-api';

const CACHE_FRESH_SEC = 15 * 24 * 60 * 60; 
const CACHE_STALE_SEC = 30 * 24 * 60 * 60;
const CACHE_HEADER = `public, max-age=0, s-maxage=${CACHE_FRESH_SEC}, stale-while-revalidate=${CACHE_STALE_SEC}`;

// --- SMART STRATEGIES FALLBACK MATRIX ---
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
  if (words.length > 2) strategies.push(`${words[0]} ${words[words.length - 1]}`);
  if (words.length >= 2) strategies.push(`${words[0]} ${words[1]}`);

  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}

// --- APP ROUTER GET HANDLER ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('model');

    // Guard against blank input params
    if (!rawQuery || rawQuery.trim() === '') {
      return NextResponse.json({ error: "Missing 'model' parameter." }, { status: 400 });
    }

    const cleanInput = rawQuery.trim();
    let translatedQuery: string | null = null;
    let isDatabaseMatch = false;

    // ⚡ SAFE INTERCEPTOR: Read Google Device translation layer from Upstash Redis
    try {
      const redis = Redis.fromEnv();
      const cachedValue = await redis.get(`device:${cleanInput.toLowerCase()}`);
      if (cachedValue) {
        translatedQuery = String(cachedValue).trim();
        isDatabaseMatch = true;
      }
    } catch (redisError) {
      // Safe fallback if Upstash environment variables aren't linked or have network blips
      console.error("[Toolz Backend Backend Warning] Upstash connection skipped:", redisError);
    }

    // Build the query loop sequence
    let strategies: string[] = [];
    if (translatedQuery && translatedQuery.length > 1) {
      strategies = [translatedQuery, ...generateSmartStrategies(cleanInput)];
    } else {
      strategies = generateSmartStrategies(cleanInput);
    }

    let searchResults: any[] = [];
    let successfulQuery = "";

    // Execution search pass
    for (const query of strategies) {
      const results = await gsmarena.search.search(query);
      if (results && Array.isArray(results) && results.length > 0) {
        searchResults = results;
        successfulQuery = query;
        break; 
      }
    }

    // Ultimate Brand Failsafe
    if (searchResults.length === 0) {
      const words = cleanInput.split(/\s+/);
      if (words.length > 0) {
        const emergencyResults = await gsmarena.search.search(words[0]);
        if (emergencyResults && emergencyResults.length > 0) {
          searchResults = emergencyResults;
          successfulQuery = `${words[0]} [Emergency Brand Fallback]`;
        }
      }
    }

    // If both exact lookup and emergency scraping completely strike out
    if (searchResults.length === 0) {
      return NextResponse.json(
        { error: `Hardware profile execution exhausted for lookup input: '${cleanInput}'` },
        { 
          status: 404, 
          headers: { 'Cache-Control': 'public, max-age=0, no-cache, no-store, must-revalidate' } 
        }
      );
    }

    // Fetch full catalog specification payload data sheet
    const targetDeviceId = searchResults[0].id;
    const deviceDetails = await gsmarena.catalog.getDevice(targetDeviceId);

    // Build monitoring logging tag prefix
    const trackingTag = isDatabaseMatch 
      ? `[Google Play Direct Match] ${successfulQuery}` 
      : successfulQuery;

    // Return specs with extreme edge caching rules active
    return NextResponse.json(deviceDetails, {
      status: 200,
      headers: {
        'Cache-Control': CACHE_HEADER,
        'X-Matched-Query': encodeURIComponent(trackingTag)
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "Internal server error parsing target hardware specs.", 
        details: error?.message || "Unknown context mapping failure" 
      },
      { 
        status: 500, 
        headers: { 'Cache-Control': 'public, max-age=0, no-cache, no-store, must-revalidate' } 
      }
    );
  }
}
