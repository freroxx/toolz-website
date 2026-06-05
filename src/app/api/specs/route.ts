// @ts-ignore - gsmarena-api lacks built-in TypeScript declarations
import gsmarena from 'gsmarena-api';

// --- TYPE DEFINITIONS ---
// Providing custom types since gsmarena-api doesn't have them
interface GsmArenaSearchMatch {
  id: string;
  name: string;
  img: string;
}

// --- CONFIGURATION ---
// 15 days of fresh cache, up to 30 days of stale allowance while background fetching
const CACHE_FRESH_SEC = 15 * 24 * 60 * 60; 
const CACHE_STALE_SEC = 30 * 24 * 60 * 60;
const CACHE_HEADER = `public, max-age=0, s-maxage=${CACHE_FRESH_SEC}, stale-while-revalidate=${CACHE_STALE_SEC}`;

// --- HELPER: FALLBACK GENERATOR ---
function generateSearchStrategies(rawQuery: string): string[] {
  const clean = rawQuery.trim();
  // Strip out radio/carrier noise that ruins exact database matches
  const noNoise = clean.replace(/ (unlocked|carrier|5g|lte|wifi|4g|dual sim)/gi, '').trim();
  const words = noNoise.split(' ');

  // Create an array of increasingly fuzzy searches, removing duplicates
  const strategies = [
    clean,                                      // 1. Exact raw query
    noNoise,                                    // 2. Cleaned of carrier noise
    words.slice(0, 3).join(' '),                // 3. First 3 words (e.g., "Google Pixel 7")
    words.slice(1).join(' '),                   // 4. Drop manufacturer (e.g., "Pixel 7 Pro")
    words.slice(0, 2).join(' ')                 // 5. Aggressive trim (e.g., "Google Pixel")
  ];

  return [...new Set(strategies)].filter(q => q && q.length >= 2);
}

// --- MAIN HANDLER ---
export default async function handler(req: any, res: any) {
  try {
    const rawQuery = req.query.model;

    // 1. Validate Input
    if (!rawQuery || typeof rawQuery !== 'string' || rawQuery.trim() === '') {
      return res.status(400).json({ 
        error: "Missing or invalid 'model' parameter. Example: ?model=Pixel+7" 
      });
    }

    const strategies = generateSearchStrategies(rawQuery);
    let searchResults: GsmArenaSearchMatch[] = [];
    let successfulQuery = "";

    // 2. The Progressive Search Loop (Vercel's datacenter makes this lightning fast)
    for (const query of strategies) {
      const results = await gsmarena.search.search(query);
      if (results && Array.isArray(results) && results.length > 0) {
        searchResults = results;
        successfulQuery = query;
        break; // Stop immediately upon finding a match
      }
    }

    // 3. Handle Complete Miss
    if (searchResults.length === 0) {
      // Do NOT cache 404s, so if the device is added to GSMArena tomorrow, it works.
      res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store, must-revalidate');
      return res.status(404).json({ 
        error: `No hardware profile found for '${rawQuery}'.` 
      });
    }

    // 4. Fetch Full Device Specs
    const bestMatchId = searchResults[0].id;
    const deviceDetails = await gsmarena.catalog.getDevice(bestMatchId);

    // 5. Lock in the Global Edge Cache
    res.setHeader('Cache-Control', CACHE_HEADER);

    // 6. Provide a Debug Header (optional, invisible to standard app users)
    res.setHeader('X-Matched-Query', successfulQuery);

    // 7. Fire the polished payload back to Toolz
    return res.status(200).json(deviceDetails);

  } catch (error: any) {
    // Prevent caching of server crash states
    res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store, must-revalidate');
    return res.status(500).json({ 
      error: "Internal server error processing the hardware profile.", 
      details: error?.message || "Unknown error context" 
    });
  }
}
