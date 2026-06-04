import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - gsmarena-api lacks built-in TypeScript declarations
import gsmarena from 'gsmarena-api';

// Enforce Node.js runtime since gsmarena-api uses web-scraping libraries (like cheerio/axios) 
// which require full Node.js network capability rather than the Edge runtime.
export const runtime = 'nodejs';

// Explicit interfaces matching the exact schema returned by the gsmarena-api library
interface QuickSpec {
  name: string;
  value: string;
}

interface SpecificationDetail {
  name: string;
  value: string;
}

interface SpecificationCategory {
  category: string;
  specifications: SpecificationDetail[];
}

interface DeviceSpecResponse {
  name: string;
  img: string;
  quickSpec: QuickSpec[];
  detailSpec: SpecificationCategory[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('model');

    // Edge Case 1: URL hit without providing a model parameter
    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: "Missing required 'model' query parameter. Example usage: ?model=Pixel+7" }, 
        { status: 400 }
      );
    }

    // 1. Query the GSMArena search directory
    const searchResults = await gsmarena.search.search(query.trim());
    
    // Edge Case 2: The query returned no valid devices matching the model string
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      return NextResponse.json(
        { error: `No device matching '${query}' found in the GSMArena database.` }, 
        { status: 404 }
      );
    }

    // 2. Safely grab the closest match ID and pull full specifications
    const bestMatchId = searchResults[0].id;
    if (!bestMatchId) {
      return NextResponse.json(
        { error: "Failed to retrieve a valid device identifier from search results." }, 
        { status: 500 }
      );
    }

    const deviceDetails: DeviceSpecResponse = await gsmarena.catalog.getDevice(bestMatchId);

    // Return the polished specification payload directly to Toolz
    return NextResponse.json(deviceDetails, { status: 200 });

  } catch (error: any) {
    // Edge Case 3: Network failures, timeouts, or GSMArena changing its HTML layout structure
    return NextResponse.json(
      { 
        error: "Internal server error processing the phone hardware specification request.", 
        details: error?.message || "Unknown error context" 
      }, 
      { status: 500 }
    );
  }
}
