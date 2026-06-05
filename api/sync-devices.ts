import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Validate Cron Security Secret
    const authHeader = req.headers.authorization;
    const isLocal = process.env.NODE_ENV === 'development';
    
    if (!isLocal && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized cron execution" });
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
      const manufacturer = String(item.manufacturer || '').trim();
      const marketName = String(item.market_name || item.name || '').trim();
      
      if (!marketName) continue;

      // Construct clean, descriptive target text (e.g., "Oppo A36")
      const cleanValue = marketName.toLowerCase().startsWith(manufacturer.toLowerCase())
        ? marketName
        : `${manufacturer} ${marketName}`;

      // Strategy A: Index by Google Play hardware model (e.g., device:pesm10)
      if (item.model) {
        const modelKey = `device:${String(item.model).trim().toLowerCase()}`;
        pipeline.set(modelKey, cleanValue);
        processedCount++;
      }

      // Strategy B: Index by commercial marketing name (e.g., device:a36 or device:oppo a36)
      const marketKey = `device:${marketName.toLowerCase()}`;
      pipeline.set(marketKey, cleanValue);
      processedCount++;
    }

    // Run atomically over the server connection
    await pipeline.exec();

    return res.status(200).json({ 
      success: true, 
      message: `Successfully synchronized ${processedCount} translation keys into Upstash Redis.` 
    });

  } catch (error: any) {
    return res.status(500).json({ 
      error: "Failed to run background device synchronization mapping.",
      details: error?.message || "Unknown execution error context"
    });
  }
}
