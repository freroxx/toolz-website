import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Specs Cache Reset API — Toolz Backend
 *
 * Secures cache reset operations using the exact same password auth and IP protection
 * as sync-devices.ts.
 *
 * Endpoints / Query Parameters:
 *  - /api/reset (or /reset)
 *  - ?pw=<SYNC_PASSWORD>
 *  - ?type=all | specs | urls | catalog | single
 *  - ?model=<device_model_query> (for resetting a specific device cache)
 */

const getPasswordPrompt = (error?: string, successMsg?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Specs Cache — Toolz</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; padding: 2.25rem; border-radius: 16px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); width: 100%; max-width: 420px; border: 1px solid #334155; }
    h1 { margin: 0 0 0.5rem 0; font-size: 1.4rem; font-weight: 700; text-align: center; color: #f1f5f9; }
    p { color: #94a3b8; font-size: 0.875rem; text-align: center; margin: 0 0 1.5rem; line-height: 1.4; }
    label { display: block; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #cbd5e1; margin-bottom: 0.4rem; }
    input[type="password"], input[type="text"], select { width: 100%; padding: 0.75rem; margin-bottom: 1rem; background: #0f172a; border: 1px solid #475569; border-radius: 8px; font-size: 0.95rem; color: #f8fafc; outline: none; transition: border-color 0.2s; }
    input:focus, select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
    button { width: 100%; padding: 0.85rem; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: background 0.2s; margin-top: 0.5rem; }
    button:hover { background: #dc2626; }
    .error { color: #fca5a5; font-size: 0.85rem; margin-bottom: 1rem; text-align: center; background: #451a1a; padding: 0.65rem; border-radius: 8px; border: 1px solid #7f1d1d; }
    .success { color: #86efac; font-size: 0.85rem; margin-bottom: 1rem; text-align: center; background: #14532d; padding: 0.65rem; border-radius: 8px; border: 1px solid #166534; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🗑️ Reset Specs Cache</h1>
    <p>Administrative authentication required to purge Redis cache.</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    ${successMsg ? `<div class="success">${successMsg}</div>` : ''}
    <form method="POST">
      <label>Authentication Password</label>
      <input type="password" name="pw" placeholder="Enter SYNC_PASSWORD" required autofocus>
      
      <label>Reset Mode</label>
      <select name="type">
        <option value="all">Purge Everything (Specs + Map + Catalog)</option>
        <option value="specs">Purge Spec Payloads (specs:url:*)</option>
        <option value="urls">Purge URL Mappings (url_map:*)</option>
        <option value="catalog">Purge GSMArena Catalog Cache</option>
        <option value="single">Invalidate Single Device Model</option>
      </select>

      <label>Specific Model (Only for Single Model mode)</label>
      <input type="text" name="model" placeholder="e.g. Samsung Galaxy S24">

      <button type="submit">Execute Cache Reset</button>
    </form>
  </div>
</body>
</html>
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.SYNC_PASSWORD) {
    return res.status(500).json({
      error: 'Missing Required Environment Variables',
      details: 'Please add UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, and SYNC_PASSWORD.',
    });
  }

  const SYNC_PASSWORD = process.env.SYNC_PASSWORD;
  const redis = Redis.fromEnv();
  const ip = ((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim() || 'unknown';
  const isLocal = process.env.NODE_ENV === 'development';

  try {
    // ── Ban Check ────────────────────────────────────────────────────────────
    if (!isLocal) {
      const isBanned = await redis.get(`ban:${ip}`);
      if (isBanned) {
        return res.status(403).send(`<h1 style="font-family:sans-serif;color:#ef4444;text-align:center;padding:2rem">403 Forbidden — IP Banned</h1>`);
      }
    }

    // ── Authentication ───────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const providedPw = req.method === 'POST' ? req.body?.pw : (req.query?.pw as string | undefined);

    let authenticated = isLocal || !!isCron;

    if (!authenticated && providedPw) {
      const bufA = Buffer.from(String(providedPw));
      const bufB = Buffer.from(SYNC_PASSWORD);
      const match = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

      if (match) {
        authenticated = true;
      } else {
        const fails = await redis.incr(`fails:${ip}`);
        if (fails === 1) await redis.expire(`fails:${ip}`, 86400);
        if (fails > 5) {
          await redis.set(`ban:${ip}`, 'true');
          return res.status(403).send('<h1>403 Forbidden — IP Banned</h1>');
        }
        return res.status(401).send(getPasswordPrompt(`Invalid password. ${6 - fails} attempts remaining.`));
      }
    }

    if (!authenticated) {
      return res.status(401).send(getPasswordPrompt());
    }

    // ── Reset Execution ───────────────────────────────────────────────────────
    const resetType = (req.method === 'POST' ? req.body?.type : req.query?.type) || 'all';
    const targetModel = (req.method === 'POST' ? req.body?.model : req.query?.model) as string | undefined;

    let clearedKeysCount = 0;
    const details: string[] = [];

    // Mode 1: Single Model Invalidation
    if (resetType === 'single' || targetModel) {
      const query = (targetModel || '').trim().toLowerCase();
      if (!query) {
        return res.status(400).json({ error: "Missing 'model' parameter for single device invalidation." });
      }

      const targetUrl = await redis.get<string>(`url_map:${query}`);
      await redis.del(`url_map:${query}`);
      clearedKeysCount++;
      details.push(`Deleted url_map:${query}`);

      if (targetUrl) {
        const slug = targetUrl.split('/').pop()?.replace('.php', '') ?? '';
        const parts = slug.split('-');
        const deviceId = parts[parts.length - 1];
        if (deviceId) {
          await redis.del(`specs:url:${deviceId}`);
          clearedKeysCount++;
          details.push(`Deleted specs:url:${deviceId}`);
        }
      }

      const message = `Invalidated cache for device query "${query}" (${clearedKeysCount} keys removed).`;

      if (req.headers['accept']?.includes('text/html')) {
        return res.status(200).send(getPasswordPrompt(undefined, message));
      }
      return res.status(200).json({ success: true, message, clearedKeysCount, details });
    }

    // Mode 2: Clear Specs Payloads (specs:url:*)
    if (resetType === 'all' || resetType === 'specs') {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, { match: 'specs:url:*', count: 100 });
        cursor = Number(nextCursor);
        if (keys.length > 0) {
          await redis.del(...keys);
          clearedKeysCount += keys.length;
        }
      } while (cursor !== 0);
      details.push('Cleared specs:url:* payloads');
    }

    // Mode 3: Clear URL Mappings (url_map:*)
    if (resetType === 'all' || resetType === 'urls') {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, { match: 'url_map:*', count: 100 });
        cursor = Number(nextCursor);
        if (keys.length > 0) {
          await redis.del(...keys);
          clearedKeysCount += keys.length;
        }
      } while (cursor !== 0);
      details.push('Cleared url_map:* mappings');
    }

    // Mode 4: Clear GSMArena Catalog Cache
    if (resetType === 'all' || resetType === 'catalog') {
      await redis.del('cache:gsm_quicksearch_catalog');
      clearedKeysCount++;
      details.push('Cleared cache:gsm_quicksearch_catalog');
    }

    const message = `Successfully executed reset [${resetType}]. Purged ${clearedKeysCount} keys from Upstash Redis.`;

    if (req.headers['accept']?.includes('text/html')) {
      return res.status(200).send(getPasswordPrompt(undefined, message));
    }

    return res.status(200).json({
      success: true,
      resetType,
      clearedKeysCount,
      details,
      message,
    });

  } catch (error: any) {
    console.error('[reset] Execution error:', error);
    return res.status(500).json({
      error: 'Cache reset failed',
      details: error?.message || 'Unknown error',
    });
  }
}
