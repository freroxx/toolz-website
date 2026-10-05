import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

/**
 * Toolz News generation counter — `GET /api/news-version` → `{ v: number }`.
 * Bumped on every admin mutation (create/update/publish/unpublish/archive/
 * delete/repair). Devices poll this cheap endpoint and only run a full sync
 * when the generation changed, so deletes and edits propagate within minutes
 * instead of waiting out the 6-hour sync window.
 * Also serves `nextTransitionAt` (earliest future publishAt/expiresAt) so
 * devices can wake exactly when scheduled/expiring items flip with no mutation.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(200).json({ v: -1, nextTransitionAt: null, degraded: true });
  }

  try {
    const redis = Redis.fromEnv();
    const v = await redis.get<number>('news:version');
    const num = typeof v === 'number' ? v : -1;
    // Best-effort transition hint: cheapest possible — index + payload dates.
    // Fail-open to null; the full feed always carries the authoritative value.
    let nextTransitionAt: string | null = null;
    try {
      const ids = (await redis.zrange<string[]>('news:index', 0, -1)) ?? [];
      if (ids.length > 0) {
        const pipe = redis.pipeline();
        for (const id of ids.slice(0, 100)) pipe.get(`news:item:${id}`);
        const raw = await pipe.exec();
        const now = Date.now();
        let best = Number.POSITIVE_INFINITY;
        for (const r of raw as unknown[]) {
          const val = (r as { result?: unknown })?.result ?? r;
          const obj = (typeof val === 'string' ? safeParse(val) : val) as Record<string, unknown> | null;
          if (!obj || typeof obj !== 'object') continue;
          for (const k of ['publishAt', 'expiresAt'] as const) {
            const iso = obj[k];
            if (typeof iso !== 'string' || !iso) continue;
            const t = Date.parse(iso);
            if (Number.isFinite(t) && t > now && t < best) { best = t; nextTransitionAt = iso; }
          }
        }
      }
    } catch { /* hint stays null */ }
    const etag = `W/"nv${num}-${nextTransitionAt ?? 'none'}"`;
    res.setHeader('ETag', etag);
    if (req.headers['if-none-match'] === etag) return res.status(304).end();
    return res.status(200).json({ v: num, nextTransitionAt });
  } catch (e: unknown) {
    console.error('[news-version] error:', e);
    return res.status(200).json({ v: -1, nextTransitionAt: null, degraded: true });
  }
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}
