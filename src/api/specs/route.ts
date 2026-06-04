import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - gsmarena-api doesn't provide built-in TS typings
import gsmarena from 'gsmarena-api';

// Interface for what the client can expect to receive
interface DeviceSpecResponse {
  name: string;
  img: string;
  quickSpec: Array<{ name: string; value: string }>;
  detailSpec: Array<{
    category: string;
    specifications: Array<{ name: string; value: string }>;
  }>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('model');

  if (!query) {
    return NextResponse.json(
      { error: "Missing 'model' query parameter. Example: ?model=Pixel 7" }, 
      { status: 400 }
    );
  }

  try {
    // 1. Query GSMArena using the phone model string passed from Android
    const searchResults = await gsmarena.search.search(query);
    
    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json(
        { error: `No device matching '${query}' found on GSMArena database.` }, 
        { status: 404 }
      );
    }

    // 2. Pick the first result match and retrieve the full hardware spec layout
    const bestMatchId = searchResults[0].id;
    const deviceDetails: DeviceSpecResponse = await gsmarena.catalog.getDevice(bestMatchId);

    // Return the response cleanly with structured JSON
    return NextResponse.json(deviceDetails, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "Failed to parse data from external GSMArena server.", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
