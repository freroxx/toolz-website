// @ts-ignore - gsmarena-api lacks built-in TypeScript declarations
import gsmarena from 'gsmarena-api';

export default async function handler(req: any, res: any) {
  try {
    // Read query parameter using Node's standard request object
    const query = req.query.model;

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        error: "Missing required 'model' query parameter. Example usage: ?model=Pixel+7" 
      });
    }

    // 1. Query the GSMArena search directory
    const searchResults = await gsmarena.search.search(query.trim());
    
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      return res.status(404).json({ 
        error: `No device matching '${query}' found in the GSMArena database.` 
      });
    }

    // 2. Safely grab the closest match ID and pull full specifications
    const bestMatchId = searchResults[0].id;
    if (!bestMatchId) {
      return res.status(500).json({ 
        error: "Failed to retrieve a valid device identifier from search results." 
      });
    }

    const deviceDetails = await gsmarena.catalog.getDevice(bestMatchId);

    // Return the polished specification payload directly to Toolz
    return res.status(200).json(deviceDetails);

  } catch (error: any) {
    return res.status(500).json({ 
      error: "Internal server error processing the phone hardware specification request.", 
      details: error?.message || "Unknown error context" 
    });
  }
}
