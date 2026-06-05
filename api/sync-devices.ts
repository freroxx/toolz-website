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

    // 3. Fetch from the robust open-source device repository alternate
    const url = 'https://raw.githubusercontent.com/pbakondy/android-device-list/master/devices.json';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch source device list: ${response.statusText}`);
    }

    const rawDevices = await response.json();
    let processedCount = 0;
    let chunkCount = 0;
    
    // 4. Batch items via multi-command pipeline
    let pipeline = redis.pipeline();

    for (const item of rawDevices) {
      // Cross-compatible property reading for any data schema shifts
      const manufacturer = String(item.brand || item.manufacturer || '').trim();
      const marketName = String(item.name || item.market_name || '').trim();
      const model = String(item.model || '').trim();
      
      if (!marketName) continue;

      // Construct descriptive value (e.g., "Oppo A36")
      const cleanValue = marketName.toLowerCase().startsWith(manufacturer.toLowerCase())
        ? marketName
        : `${manufacturer} ${marketName}`;

      // Strategy A: Index by hardware model identifier (e.g., pesm10)
      if (model) {
        pipeline.set(`device:${model.toLowerCase()}`, cleanValue);
        processedCount++;
        chunkCount++;
      }

      // Strategy B: Index by commercial marketing name (e.g., a36)
      pipeline.set(`device:${marketName.toLowerCase()}`, cleanValue);
      processedCount++;
      chunkCount++;

      // ⚡ Chunk executions in batches of 2000 to keep memory low and prevent Vercel timeouts
      if (chunkCount >= 2000) {
        await pipeline.exec();
        pipeline = redis.pipeline(); // reset pipeline container
        chunkCount = 0;
      }
    }

    // Execute any remaining tail records
    if (chunkCount > 0) {
      await pipeline.exec();
    }

    return res.status(200).json({ 
      success: true, 
      message: `Successfully synchronized ${processedCount} operational keys into Upstash Redis.` 
    });

  } catch (error: any) {
    return res.status(500).json({ 
      error: "Failed to run background device synchronization mapping.",
      details: error?.message || "Unknown execution error context"
    });
  }
}
