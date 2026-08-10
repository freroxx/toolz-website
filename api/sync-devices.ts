import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Device Model Sync API
 *
 * Syncs the android-device-list to Upstash Redis as `device:<model>` → `<brand> <marketName>` keys.
 * Keys are stored permanently (no TTL).
 *
 * Also supports:
 *  - POST /api/sync-devices?action=invalidate-catalog  → wipes the quicksearch catalog cache
 *  - POST /api/sync-devices?action=invalidate-specs    → wipes all specs:url:* and url_map:* keys
 */

const getPasswordPrompt = (error?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Protected Sync — Toolz</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f4f4f5; }
    form { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.15); width: 100%; max-width: 380px; }
    h1 { margin: 0 0 0.25rem 0; font-size: 1.3rem; font-weight: 700; text-align: center; }
    p { color: #6b7280; font-size: 0.875rem; text-align: center; margin: 0 0 1.5rem; }
    input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; }
    input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    button { width: 100%; padding: 0.75rem; background: #1f2937; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: background 0.2s; }
    button:hover { background: #111827; }
    .error { color: #ef4444; font-size: 0.85rem; margin-bottom: 1rem; text-align: center; background: #fef2f2; padding: 0.6rem; border-radius: 6px; border: 1px solid #fee2e2; }
  </style>
</head>
<body>
  <form method="POST">
    <h1>🔐 Secure Sync</h1>
    <p>Authentication required to run device model sync.</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <input type="password" name="pw" placeholder="Enter password" required autofocus>
    <button type="submit">Unlock &amp; Synchronize</button>
  </form>
</body>
</html>
`;

function normalizeSamsungModel(model: string): string[] {
  const upper = model.toUpperCase().trim();
  const stripped = upper.replace(/^(SM-|GT-|SCH-|SGH-|SPH-|SCV|SC-|SCG|SHV-|SHW-)/, '');
  const variants: string[] = [upper];
  if (stripped !== upper) variants.push(stripped);
  // e.g. A366B → A36
  const baseMatch = stripped.match(/^([A-Z]\d{2,3})/);
  if (baseMatch) variants.push(baseMatch[1]);
  return [...new Set(variants)];
}

function* buildModelKeys(manufacturer: string, marketName: string, model: string) {
  const brand = manufacturer.trim();
  const name = marketName.trim();

  const cleanValue = name.toLowerCase().startsWith(brand.toLowerCase())
    ? name
    : `${brand} ${name}`.trim();

  if (name) {
    yield [`device:${name.toLowerCase()}`, cleanValue];
    yield [`device:${brand.toLowerCase()} ${name.toLowerCase()}`, cleanValue];
  }

  if (model) {
    const modelLower = model.toLowerCase();
    yield [`device:${modelLower}`, cleanValue];

    // Samsung extra normalization
    if (/^(SM-|GT-|SCH-|SGH-|SPH-)/i.test(model)) {
      for (const variant of normalizeSamsungModel(model)) {
        yield [`device:${variant.toLowerCase()}`, cleanValue];
      }
    }
  }
}

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
  const action = req.query.action as string | undefined;

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

    // ── Special Admin Actions ─────────────────────────────────────────────────
    if (action === 'invalidate-catalog') {
      await redis.del('cache:gsm_quicksearch_catalog');
      return res.status(200).json({ success: true, message: 'Quicksearch catalog cache cleared. It will be refreshed on next request.' });
    }

    if (action === 'invalidate-specs') {
      const purgePattern = async (pattern: string): Promise<number> => {
        try {
          const keys = await redis.keys(pattern);
          if (!Array.isArray(keys) || keys.length === 0) return 0;
          let deleted = 0;
          for (let i = 0; i < keys.length; i += 100) {
            const chunk = keys.slice(i, i + 100);
            if (chunk.length > 0) {
              await redis.del(...chunk);
              deleted += chunk.length;
            }
          }
          return deleted;
        } catch { return 0; }
      };

      const specsCount = await purgePattern('specs:url:*');
      const urlsCount = await purgePattern('url_map:*');
      const totalDeleted = specsCount + urlsCount;

      return res.status(200).json({
        success: true,
        message: `Cleared ${totalDeleted} spec payload & URL map cache keys.`,
        specsCount,
        urlsCount,
      });
    }

    // ── Cooldown Check ────────────────────────────────────────────────────────
    if (!isLocal) {
      const cooldown = await redis.get('sync_cooldown');
      if (cooldown) {
        return res.status(429).json({
          error: 'Cooldown Active',
          message: 'Sync was recently run. Please wait at least 2 minutes between syncs.',
        });
      }
    }

    // ── Fetch Device List ─────────────────────────────────────────────────────
    const sourceUrl = 'https://raw.githubusercontent.com/pbakondy/android-device-list/master/devices.json';
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch device list: HTTP ${response.status} ${response.statusText}`);
    }

    const rawDevices: any[] = await response.json();
    let processedKeys = 0;
    let chunkCount = 0;
    const CHUNK_SIZE = 2000;

    let pipe = redis.pipeline();

    for (const item of rawDevices) {
      const manufacturer = String(item.brand || item.manufacturer || '').trim();
      const marketName = String(item.name || item.market_name || '').trim();
      const model = String(item.model || '').trim();

      if (!marketName) continue;

      for (const [key, value] of buildModelKeys(manufacturer, marketName, model)) {
        pipe.set(key, value); // No TTL = permanent
        processedKeys++;
        chunkCount++;

        if (chunkCount >= CHUNK_SIZE) {
          await pipe.exec();
          pipe = redis.pipeline();
          chunkCount = 0;
        }
      }
    }

    if (chunkCount > 0) {
      await pipe.exec();
    }

    // Cooldown (2 minutes)
    await redis.set('sync_cooldown', 'active', { ex: 120 });

    return res.status(200).json({
      success: true,
      message: `Synchronized ${processedKeys} model → device name keys into Redis (permanent, no TTL).`,
      source_devices: rawDevices.length,
    });

  } catch (error: any) {
    console.error('[sync-devices] Error:', error);
    return res.status(500).json({
      error: 'Sync failed',
      details: error?.message || 'Unknown error',
    });
  }
}
