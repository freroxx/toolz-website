import { kv } from '@vercel/kv';

// Vercel Cron Config: Run at midnight on the 1st and 15th of every month
export const config = {
  cron: "0 0 1,15 * *",
};

export async function GET(req: any) {
  try {
    // Optional basic auth check for Cron security
    const authHeader = req.headers.get('authorization');
    const isLocal = process.env.NODE_ENV === 'development';
    
    if (!isLocal && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized cron execution" }), { status: 401 });
    }

    // Fetching clean community-processed Google Play Device list from GitHub
    const url = 'https://raw.githubusercontent.com/PolymerJames/android-device-list/master/devices.json';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch source device list: ${response.statusText}`);
    }

    const rawDevices = await response.json(); // Expected structural shape: Array of device objects
    
    let processedCount = 0;
    const pipeline = kv.pipeline();

    // Loop and map into KV Store
    for (const item of rawDevices) {
      // We target the technical build model as the Lookup Key
      const key = `device:${String(item.model).trim().toLowerCase()}`;
      
      // We construct a clean commercial phrase (e.g., "Samsung Galaxy S24 Ultra")
      const manufacturer = String(item.manufacturer).trim();
      const marketName = String(item.market_name || item.name).trim();
      
      const cleanValue = marketName.toLowerCase().startsWith(manufacturer.toLowerCase())
        ? marketName
        : `${manufacturer} ${marketName}`;

      if (item.model && cleanValue) {
        pipeline.set(key, cleanValue);
        processedCount++;
      }
    }

    // Execute all batch changes at once natively inside Redis
    await pipeline.exec();

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully synchronized ${processedCount} Android devices into Edge KV memory.` 
    }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: "Failed to run background device synchronization mapping.",
      details: error?.message 
    }), { status: 500 });
  }
}
