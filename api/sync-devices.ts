import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const getPasswordPrompt = (error?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Protected Sync - Toolz</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f4f5; }
    form { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); width: 100%; max-width: 360px; }
    h1 { margin: 0 0 0.5rem 0; font-size: 1.25rem; font-weight: 600; text-align: center; }
    p { color: #6b7280; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem; }
    input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-size: 1rem; }
    button { width: 100%; padding: 0.75rem; background: #000; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 1rem; transition: background 0.2s; }
    button:hover { background: #1f2937; }
    .error { color: #ef4444; font-size: 0.875rem; margin-bottom: 1rem; text-align: center; background: #fef2f2; padding: 0.5rem; border-radius: 4px; border: 1px solid #fee2e2; }
  </style>
</head>
<body>
  <form method="POST">
    <h1>Secure Sync</h1>
    <p>Authentication required to run device sync.</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <input type="password" name="pw" placeholder="Enter password" required autofocus>
    <button type="submit">Unlock & Synchronize</button>
  </form>
</body>
</html>
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 🛑 Explicitly catch missing environment variables before executing
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.SYNC_PASSWORD) {
    return res.status(500).json({ 
      error: "Missing Required Environment Variables",
      details: "Please add UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, and SYNC_PASSWORD to your environment settings."
    });
  }

  const SYNC_PASSWORD = process.env.SYNC_PASSWORD;
  const redis = Redis.fromEnv();
  const ip = (req.headers['x-forwarded-for'] as string || '').split(',')[0].trim() || 'unknown';
  const isLocal = process.env.NODE_ENV === 'development';

  try {
    // 1. Check for Ban (Production only)
    if (!isLocal) {
      const isBanned = await redis.get(`ban:${ip}`);
      if (isBanned) {
        return res.status(403).send(`
          <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
            <h1 style="color: #ef4444;">403 Forbidden</h1>
            <p>Your IP (${ip}) has been banned due to multiple failed attempts.</p>
          </div>
        `);
      }
    }

    // 2. Determine Authentication Status
    const authHeader = req.headers.authorization;
    const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    // Cookie auth removed for better security as requested
    const providedPw = req.method === 'POST' ? req.body?.pw : req.query?.pw;

    let authenticated = isLocal || isCron;

    // 3. Handle Password Submission
    if (!authenticated && providedPw) {
      const bufProvided = Buffer.from(String(providedPw));
      const bufExpected = Buffer.from(SYNC_PASSWORD);

      if (bufProvided.length === bufExpected.length && crypto.timingSafeEqual(bufProvided, bufExpected)) {
        authenticated = true;
        // Cookie logic removed
      } else {
        // Increment fails
        const fails = await redis.incr(`fails:${ip}`);
        if (fails === 1) await redis.expire(`fails:${ip}`, 86400); // 24h window

        if (fails > 3) {
          await redis.set(`ban:${ip}`, true);
          return res.status(403).send("<h1>403 Forbidden</h1><p>Too many failed attempts. Your IP has been banned.</p>");
        }
        return res.status(401).send(getPasswordPrompt(`Invalid password. ${4 - fails} attempts remaining.`));
      }
    }

    // 4. Show Prompt if not authenticated
    if (!authenticated) {
      return res.status(401).send(getPasswordPrompt());
    }

    // 5. Cooldown Check (1 minute)
    if (!isLocal) {
      const cooldown = await redis.get('sync_cooldown');
      if (cooldown) {
        return res.status(429).json({
          error: "Cooldown Active",
          message: "Synchronization was recently performed. Please wait at least 1 minute between syncs."
        });
      }
    }

    // --- Original Sync Logic ---
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

    // Set cooldown for 1 minute
    await redis.set('sync_cooldown', 'active', { ex: 60 });

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
