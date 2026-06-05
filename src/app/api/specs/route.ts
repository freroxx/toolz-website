import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
// @ts-ignore
import gsmarena from 'gsmarena-api';

const CACHE_FRESH_SEC = 15 * 24 * 60 * 60; 
const CACHE_STALE_SEC = 30 * 24 * 60 * 60;
const CACHE_HEADER = `public, max-age=0, s-maxage=${CACHE_FRESH_SEC}, stale-while-revalidate=${CACHE_STALE_SEC}`;

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('model');

    if (!rawQuery || rawQuery.trim() === '') {
      return NextResponse.json({ error: "Missing 'model' parameter." }, { status: 400 });
    }

    const cleanInput = rawQuery.trim();
    let translatedQuery: string | null = null;

    const redis = Redis.fromEnv();
    try {
      translatedQuery = await redis.get(`device:${cleanInput.toLowerCase()}`);
    } catch (e) {
      console.error("Redis lookup bypass:", e);
    }

    let strategies = translatedQuery 
      ? [translatedQuery, ...generateSmartStrategies(cleanInput)] 
      : generateSmartStrategies(cleanInput);

    let searchResults: any[] = [];
    let successfulQuery = "";

    for (const query of strategies) {
      const results = await gsmarena.search.search(query);
      if (results && Array.isArray(results) && results.length > 0) {
        searchResults = results;
        successfulQuery = query;
        break; 
      }
    }

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

    if (searchResults.length === 0) {
      return NextResponse.json(
        { error: `Hardware lookup permanently exhausted for input: '${cleanInput}'` },
        { status: 404, headers: { 'Cache-Control': 'public, max-age=0, no-cache, no-store, must-revalidate' } }
      );
    }

    const deviceDetails = await gsmarena.catalog.getDevice(searchResults[0].id);

    // Return using Web headers dictionary
    return NextResponse.json(deviceDetails, {
      status: 200,
      headers: {
        'Cache-Control': CACHE_HEADER,
        'X-Matched-Query': encodeURIComponent(successfulQuery)
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error analyzing phone specs.", details: error?.message },
      { status: 500, headers: { 'Cache-Control': 'public, max-age=0, no-cache, no-store, must-revalidate' } }
    );
  }
}
