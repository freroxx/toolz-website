import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 🛑 Explicitly catch missing environment variables before executing
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ 
      error: "Missing Upstash Redis Credentials", 
      details: "Please add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your Vercel Environment Variables settings." 
    });
  }

  try {
    const authHeader = req.headers.authorization;
    const isLocal = process.env.NODE_ENV === 'development';
    
    if (!isLocal && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized cron execution" });
    }

    const redis = Redis.fromEnv();

    const url = 'https://raw.githubusercontent.com/pbakondy/android-device-list/master/devices.json';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch source device list: ${response.statusText}`);
    }

    const rawDevices = await response.json();
    let processedCount = 0;
    let chunkCount = 0;
    
    let pipeline = redis.pipeline();

    for (const item of rawDevices) {
      const manufacturer = String(item.brand || item.manufacturer || '').trim();
      const marketName = String(item.name || item.market_name || '').trim();
      const model = String(item.model || '').trim();
      
      if (!marketName) continue;

      const cleanValue = marketName.toLowerCase().startsWith(manufacturer.toLowerCase())
        ? marketName
        : `${manufacturer} ${marketName}`;

      if (model) {
        pipeline.set(`device:${model.toLowerCase()}`, cleanValue);
        processedCount++;
        chunkCount++;
      }

      pipeline.set(`device:${marketName.toLowerCase()}`, cleanValue);
      processedCount++;
      chunkCount++;

      if (chunkCount >= 2000) {
        await pipeline.exec();
        pipeline = redis.pipeline();
        chunkCount = 0;
      }
    }

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
