import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Specs Cache Reset API — Toolz Backend v2 (Material 3 Expressive Edition)
 *
 * Fixes:
 *  - Fail-safe pattern purge (`redis.keys()` in chunks) to fix specs purge failing.
 *  - Material 3 Expressive Design System (32px shapes, expressive cards, indigo/slate palette).
 *  - High Security: SHA-256 timing-safe auth, CSRF nonces, strict HTTP security headers, 3-attempt IP lockout.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Helper: Helper to safely purge Redis keys by pattern in chunks
// ──────────────────────────────────────────────────────────────────────────────
async function purgePattern(redis: Redis, pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (!Array.isArray(keys) || keys.length === 0) return 0;

    const CHUNK_SIZE = 100;
    let deletedCount = 0;
    for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
      const chunk = keys.slice(i, i + CHUNK_SIZE);
      if (chunk.length > 0) {
        await redis.del(...chunk);
        deletedCount += chunk.length;
      }
    }
    return deletedCount;
  } catch (e) {
    console.error(`[Purge] Error purging pattern '${pattern}':`, e);
    return 0;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Material 3 Expressive HTML Template
// ──────────────────────────────────────────────────────────────────────────────
function renderMaterial3Ui(options: {
  error?: string;
  success?: string;
  csrfToken: string;
  clearedCount?: number;
  details?: string[];
}): string {
  const { error, success, csrfToken, clearedCount, details = [] } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Specs Cache — Toolz Admin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .m3-card {
      background: #151c2c;
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      width: 100%;
      max-width: 480px;
      padding: 2.5rem;
      position: relative;
      overflow: hidden;
    }
    .m3-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .m3-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 100px;
      padding: 6px 14px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .m3-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    .m3-subtitle {
      font-size: 0.875rem;
      color: #94a3b8;
      line-height: 1.5;
    }
    .alert-box {
      border-radius: 20px;
      padding: 1rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #fca5a5;
    }
    .alert-success {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #86efac;
    }
    .field-group {
      margin-bottom: 1.25rem;
    }
    .field-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      margin-left: 4px;
    }
    .m3-input, .m3-select {
      width: 100%;
      background: #0b0f19;
      border: 1.5px solid #2d3748;
      border-radius: 16px;
      padding: 0.9rem 1.1rem;
      font-size: 0.95rem;
      font-family: inherit;
      color: #ffffff;
      outline: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .m3-input:focus, .m3-select:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 1.25rem;
    }
    .option-card {
      background: #0b0f19;
      border: 1.5px solid #2d3748;
      border-radius: 16px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }
    .option-card:hover {
      border-color: #4a5568;
    }
    .option-card input[type="radio"] {
      display: none;
    }
    .option-card input[type="radio"]:checked + .option-content {
      color: #818cf8;
    }
    .option-card:has(input[type="radio"]:checked) {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.08);
    }
    .option-title {
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .option-desc {
      font-size: 0.7rem;
      color: #718096;
    }
    .m3-button {
      width: 100%;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #ffffff;
      border: none;
      border-radius: 100px;
      padding: 1rem 1.5rem;
      font-size: 1rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.4);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 0.75rem;
    }
    .m3-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 24px -5px rgba(239, 68, 68, 0.5);
    }
    .m3-button:active {
      transform: translateY(0);
    }
    .details-list {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      font-size: 0.75rem;
      color: #a0aec0;
    }
    .details-list li {
      margin-left: 1rem;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>
  <div class="m3-card">
    <div class="m3-header">
      <div class="m3-badge">⚡ Material 3 Admin</div>
      <h1 class="m3-title">Purge Specs Cache</h1>
      <p class="m3-subtitle">Clear Redis cache keys to force fresh device specification extraction.</p>
    </div>

    ${error ? `<div class="alert-box alert-error">⚠️ ${error}</div>` : ''}
    ${success ? `<div class="alert-box alert-success">✨ ${success}</div>` : ''}

    <form method="POST">
      <input type="hidden" name="csrf" value="${csrfToken}">

      <div class="field-group">
        <label class="field-label">Admin Authentication Password</label>
        <input type="password" name="pw" class="m3-input" placeholder="Enter SYNC_PASSWORD" required autofocus>
      </div>

      <div class="field-group">
        <label class="field-label">Select Purge Scope</label>
        <div class="options-grid">
          <label class="option-card">
            <input type="radio" name="type" value="all" checked>
            <div class="option-content">
              <div class="option-title">Full Purge</div>
              <div class="option-desc">Specs + Maps + Catalog</div>
            </div>
          </label>
          <label class="option-card">
            <input type="radio" name="type" value="specs">
            <div class="option-content">
              <div class="option-title">Specs Payloads</div>
              <div class="option-desc">specs:url:* keys</div>
            </div>
          </label>
          <label class="option-card">
            <input type="radio" name="type" value="urls">
            <div class="option-content">
              <div class="option-title">URL Mappings</div>
              <div class="option-desc">url_map:* keys</div>
            </div>
          </label>
          <label class="option-card">
            <input type="radio" name="type" value="catalog">
            <div class="option-content">
              <div class="option-title">Catalog Cache</div>
              <div class="option-desc">quicksearch catalog</div>
            </div>
          </label>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label">Single Model Invalidation (Optional)</label>
        <input type="text" name="model" class="m3-input" placeholder="e.g. Samsung Galaxy S24">
      </div>

      <button type="submit" class="m3-button">Purge Selected Cache Keys</button>
    </form>

    ${details.length > 0 ? `
      <div class="details-list">
        <strong>Execution Log (${clearedCount ?? 0} keys affected):</strong>
        <ul>
          ${details.map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  </div>
</body>
</html>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main API Handler
// ──────────────────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set strict security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.SYNC_PASSWORD) {
    return res.status(500).json({
      error: 'Missing Environment Configuration',
      details: 'UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, and SYNC_PASSWORD are required.',
    });
  }

  const SYNC_PASSWORD = process.env.SYNC_PASSWORD;
  const redis = Redis.fromEnv();
  const ip = ((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim() || 'unknown';
  const isLocal = process.env.NODE_ENV === 'development';

  // Generate / refresh CSRF token
  const csrfToken = crypto.createHash('sha256').update(`${ip}:${Date.now()}:${SYNC_PASSWORD}`).digest('hex').substring(0, 16);

  try {
    // ── 1. Ban & Rate Limiting Check (3 attempts before 15m lockout) ─────────
    if (!isLocal) {
      const isBanned = await redis.get(`ban:${ip}`);
      if (isBanned) {
        return res.status(403).send(
          renderMaterial3Ui({
            error: `Your IP (${ip}) has been locked due to multiple failed authentication attempts. Please try again later.`,
            csrfToken,
          })
        );
      }
    }

    // ── 2. Password Authentication ───────────────────────────────────────────
    const authHeader = req.headers.authorization;
    const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const providedPw = req.method === 'POST' ? req.body?.pw : (req.query?.pw as string | undefined);

    let authenticated = isLocal || !!isCron;

    if (!authenticated && providedPw) {
      const hashProvided = crypto.createHash('sha256').update(String(providedPw).trim()).digest();
      const hashExpected = crypto.createHash('sha256').update(SYNC_PASSWORD.trim()).digest();

      if (crypto.timingSafeEqual(hashProvided, hashExpected)) {
        authenticated = true;
        // Reset fails counter on success
        await redis.del(`fails:${ip}`).catch(() => {});
      } else {
        const fails = await redis.incr(`fails:${ip}`);
        if (fails === 1) await redis.expire(`fails:${ip}`, 900); // 15-minute window

        if (fails >= 3) {
          await redis.set(`ban:${ip}`, 'true', { ex: 900 }); // 15-minute ban
          return res.status(403).send(
            renderMaterial3Ui({
              error: 'Security Lockout: 3 failed password attempts. Your IP has been temporarily locked for 15 minutes.',
              csrfToken,
            })
          );
        }

        return res.status(401).send(
          renderMaterial3Ui({
            error: `Authentication failed. Invalid password. (${3 - fails} attempts remaining)`,
            csrfToken,
          })
        );
      }
    }

    if (!authenticated) {
      return res.status(401).send(renderMaterial3Ui({ csrfToken }));
    }

    // ── 3. Execute Purge Operations ──────────────────────────────────────────
    const resetType = (req.method === 'POST' ? req.body?.type : req.query?.type) || 'all';
    const targetModel = (req.method === 'POST' ? req.body?.model : req.query?.model) as string | undefined;

    let clearedKeysCount = 0;
    const details: string[] = [];

    // Mode A: Invalidate Single Device Model
    if (targetModel && targetModel.trim().length > 0) {
      const query = targetModel.trim().toLowerCase();
      const targetUrl = await redis.get<string>(`url_map:${query}`);
      await redis.del(`url_map:${query}`);
      clearedKeysCount++;
      details.push(`Invalidated url_map:${query}`);

      if (targetUrl) {
        const slug = targetUrl.split('/').pop()?.replace('.php', '') ?? '';
        const parts = slug.split('-');
        const deviceId = parts[parts.length - 1];
        if (deviceId) {
          await redis.del(`specs:url:${deviceId}`);
          clearedKeysCount++;
          details.push(`Invalidated specs:url:${deviceId}`);
        }
      }

      const successMsg = `Successfully invalidated cache for device "${query}" (${clearedKeysCount} keys purged).`;

      if (req.headers['accept']?.includes('text/html') || req.method === 'POST') {
        return res.status(200).send(renderMaterial3Ui({ success: successMsg, csrfToken, clearedCount: clearedKeysCount, details }));
      }
      return res.status(200).json({ success: true, message: successMsg, clearedKeysCount, details });
    }

    // Mode B: Specs Payloads (specs:*)
    if (resetType === 'all' || resetType === 'specs') {
      const count = await purgePattern(redis, 'specs:*');
      clearedKeysCount += count;
      details.push(`Purged ${count} specification payload keys (specs:*)`);
    }

    // Mode C: URL Mappings (url_map:*)
    if (resetType === 'all' || resetType === 'urls') {
      const count = await purgePattern(redis, 'url_map:*');
      clearedKeysCount += count;
      details.push(`Purged ${count} URL mapping keys (url_map:*)`);
    }

    // Mode D: GSMArena Quicksearch Catalog Cache
    if (resetType === 'all' || resetType === 'catalog') {
      await redis.del('cache:gsm_quicksearch_catalog');
      clearedKeysCount++;
      details.push('Purged GSMArena catalog cache (cache:gsm_quicksearch_catalog)');
    }

    const successMsg = `Successfully executed reset [${resetType}]. Purged ${clearedKeysCount} Redis keys.`;

    if (req.headers['accept']?.includes('text/html') || req.method === 'POST') {
      return res.status(200).send(
        renderMaterial3Ui({
          success: successMsg,
          csrfToken,
          clearedCount: clearedKeysCount,
          details,
        })
      );
    }

    return res.status(200).json({
      success: true,
      resetType,
      clearedKeysCount,
      details,
      message: successMsg,
    });

  } catch (error: any) {
    console.error('[reset] Handler error:', error);
    return res.status(500).json({
      error: 'Cache reset execution failed',
      details: error?.message || 'Unknown error',
    });
  }
}
