// @ts-ignore
import gsmarena from 'gsmarena-api';
import { Redis } from '@upstash/redis';

interface GsmArenaSearchMatch {
  id: string;
  name: string;
  img: string;
}

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

  const strategies: string[] = [
    rawQuery.trim(),
    clean,
  ];

  if (words.length >= 3) {
    strategies.push(`${words[0]} ${words[1]} ${words[2]}`);
  }
  if (words.length > 1) {
    strategies.push(words.slice(1).join(' '));
  }
  if (words.length > 2) {
    strategies.push(`${words[0]} ${words[words.length - 1]}`);
  }
  if (words.length >= 2) {
    strategies.push(`${words[0]} ${words[1]}`);
  }

  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}

export default async function handler(req: any, res: any) {
  try {
    const rawQuery = req.query.model;

    if (!rawQuery || typeof rawQuery !== 'string' || rawQuery.trim() === '') {
      return res.status(400).json({ error: "Missing 'model' parameter." });
    }

    const cleanInput = rawQuery.trim();
    let translatedQuery: string | null = null;

    // Connect to Upstash Redis database instances
    const redis = Redis.fromEnv();

    // ⚡ STEP 1 INTERCEPTOR: Quick query against Upstash Redis
    try {
      const kvKey = `device:${cleanInput.toLowerCase()}`;
      translatedQuery = await redis.get(kvKey); // Upstash safely infers the type directly here
    } catch (kvError) {
      console.error("Redis Lookup bypassed due to error:", kvError);
    }

    let strategies: string[];
    let validationLogPrefix = "";

    if (translatedQuery) {
      strategies = [translatedQuery, ...generateSmartStrategies(cleanInput)];
      validationLogPrefix = "[Google Play Direct Match] ";
    } else {
      strategies = generateSmartStrategies(cleanInput);
    }

    let searchResults: GsmArenaSearchMatch[] = [];
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
      res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store, must-revalidate');
      return res.status(404).json({ 
        error: `Hardware lookup permanently exhausted for input: '${cleanInput}'` 
      });
    }

    const bestMatchId = searchResults[0].id;
    const deviceDetails = await gsmarena.catalog.getDevice(bestMatchId);

    res.setHeader('Cache-Control', CACHE_HEADER);
    res.setHeader('X-Matched-Query', encodeURIComponent(`${validationLogPrefix}${successfulQuery}`));

    return res.status(200).json(deviceDetails);

  } catch (error: any) {
    res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store, must-revalidate');
    return res.status(500).json({ 
      error: "Internal server error analyzing phone specs.", 
      details: error?.message || "Unknown context" 
    });
  }
}
