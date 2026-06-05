import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export async function GET(request: Request) {
  try {
    // 1. Validate Cron Security Secret
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const isLocal = process.env.NODE_ENV === 'development';
    
    if (!isLocal && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    // 2. Initialize Upstash Client
    const redis = Redis.fromEnv();

    // 3. Fetch device database file from GitHub
    const url = 'https://raw.githubusercontent.com/PolymerJames/android-device-list/master/devices.json';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch source device list: ${response.statusText}`);
    }

    const rawDevices = await response.json();
    let processedCount = 0;
    
    // 4. Batch items via multi-command pipeline
    const pipeline = redis.pipeline();

    for (const item of rawDevices) {
      if (!item.model) continue;

      const key = `device:${String(item.model).trim().toLowerCase()}`;
      const manufacturer = String(item.manufacturer).trim();
      const marketName = String(item.market_name || item.name).trim();
      
      const cleanValue = marketName.toLowerCase().startsWith(manufacturer.toLowerCase())
        ? marketName
        : `${manufacturer} ${marketName}`;

      if (cleanValue) {
        pipeline.set(key, cleanValue);
        processedCount++;
      }
    }

    // Run atomically over the server connection
    await pipeline.exec();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synchronized ${processedCount} Android devices into Upstash Redis.` 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to run background device synchronization mapping.",
      details: error?.message || "Unknown execution error context"
    }, { status: 500 });
  }
}
