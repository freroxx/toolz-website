import { Redis } from '@upstash/redis';

export const config = {
  cron: "0 0 1,15 * *",
};

export async function GET(req: any) {
  try {
    const authHeader = req.headers.get('authorization');
    const isLocal = process.env.NODE_ENV === 'development';
    
    if (!isLocal && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized cron execution" }), { status: 401 });
    }

    // Connect automatically using Upstash environment variables
    const redis = Redis.fromEnv();

    const url = 'https://raw.githubusercontent.com/PolymerJames/android-device-list/master/devices.json';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch source device list: ${response.statusText}`);
    }

    const rawDevices = await response.json();
    let processedCount = 0;
    
    // Create an Upstash multi-command pipeline
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

    // Execute the batched pipeline commands natively on Upstash
    await pipeline.exec();

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully synchronized ${processedCount} Android devices into Upstash Redis.` 
    }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: "Failed to run background device synchronization mapping.",
      details: error?.message 
    }), { status: 500 });
  }
}
