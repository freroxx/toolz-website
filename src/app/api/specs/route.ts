// @ts-ignore
import gsmarena from 'gsmarena-api';

interface GsmArenaSearchMatch {
  id: string;
  name: string;
  img: string;
}

const CACHE_FRESH_SEC = 15 * 24 * 60 * 60; 
const CACHE_STALE_SEC = 30 * 24 * 60 * 60;
const CACHE_HEADER = `public, max-age=0, s-maxage=${CACHE_FRESH_SEC}, stale-while-revalidate=${CACHE_STALE_SEC}`;

// --- ADVANCED SMART FALLBACK GENERATOR ---
function generateSmartStrategies(rawQuery: string): string[] {
  let clean = rawQuery.trim();

  // 1. Convert localized factory/carrier patterns to general series names
  // Handles common anomalies found in Android Build properties
  clean = clean
    .replace(/\b(Galaxy Note)\s*(\d+)/gi, 'Note $2')
    .replace(/\b(Galaxy S)\s*(\d+)/gi, 'S$2')
    .replace(/\b(Galaxy A)\s*(\d+)/gi, 'A$2')
    .replace(/ (unlocked|carrier|5g|lte|wifi|4g|dual sim|global|ds|edit|pro\+|plus)/gi, '')
    .trim();

  const words = clean.split(/\s+|_|-/); // Split by space, underscore, or dashes

  const strategies: string[] = [
    rawQuery.trim(),                            // Tier 1: Raw untouched string
    clean,                                      // Tier 2: Normalized baseline string
  ];

  // Tier 3: Isolate the commercial family code + version number
  if (words.length >= 3) {
    strategies.push(`${words[0]} ${words[1]} ${words[2]}`);
  }

  // Tier 4: Drop the manufacturer brand name completely (e.g., "Pixel 7 Pro" instead of "Google Pixel 7 Pro")
  if (words.length > 1) {
    strategies.push(words.slice(1).join(' '));
  }

  // Tier 5: Purely grab the first and last structural tokens
  if (words.length > 2) {
    strategies.push(`${words[0]} ${words[words.length - 1]}`);
  }

  // Tier 6: Core Brand + Initial Family Model (e.g., "Samsung S23")
  if (words.length >= 2) {
    strategies.push(`${words[0]} ${words[1]}`);
  }

  // Deduplicate entries and remove tiny/empty token lookups
  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}

// --- MAIN HANDLER ---
export default async function handler(req: any, res: any) {
  try {
    const rawQuery = req.query.model;

    if (!rawQuery || typeof rawQuery !== 'string' || rawQuery.trim() === '') {
      return res.status(400).json({ error: "Missing 'model' parameter." });
    }

    const strategies = generateSmartStrategies(rawQuery);
    let searchResults: GsmArenaSearchMatch[] = [];
    let successfulQuery = "";

    // Sequential Fallback Execution Layer
    for (const query of strategies) {
      const results = await gsmarena.search.search(query);
      if (results && Array.isArray(results) && results.length > 0) {
        searchResults = results;
        successfulQuery = query;
        break; 
      }
    }

    // 🛑 ULTIMATE FAILSAFE: If everything above returned zero hits
    if (searchResults.length === 0) {
      const words = rawQuery.trim().split(/\s+/);
      if (words.length > 0) {
        // Attempt a broader query using ONLY the brand manufacturer name (e.g., "Nothing" or "OnePlus")
        // This avoids a total 404 block and gives the app a list of matching company phones
        const emergencyResults = await gsmarena.search.search(words[0]);
        if (emergencyResults && emergencyResults.length > 0) {
          searchResults = emergencyResults;
          successfulQuery = `${words[0]} [Emergency Brand Fallback]`;
        }
      }
    }

    // Handle completely blank database state
    if (searchResults.length === 0) {
      res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store, must-revalidate');
      return res.status(404).json({ 
        error: `Hardware lookup permanently exhausted for input: '${rawQuery}'` 
      });
    }

    // Fetch the detailed specifications payload
    const bestMatchId = searchResults[0].id;
    const deviceDetails = await gsmarena.catalog.getDevice(bestMatchId);

    // Apply cache rules and tracking headers
    res.setHeader('Cache-Control', CACHE_HEADER);
    res.setHeader('X-Matched-Query', encodeURIComponent(successfulQuery));

    return res.status(200).json(deviceDetails);

  } catch (error: any) {
    res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store, must-revalidate');
    return res.status(500).json({ 
      error: "Internal server error analyzing phone specs.", 
      details: error?.message || "Unknown context" 
    });
  }
}
