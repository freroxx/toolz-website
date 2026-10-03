import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

/**
 * Toolz News generation counter — `GET /api/news-version` → `{ v: number }`.
 * Bumped on every admin mutation (create/update/publish/unpublish/archive/
 * delete/repair). Devices poll this cheap endpoint and only run a full sync
 * when the generation changed, so deletes and edits propagate within minutes
 * instead of waiting out the 6-hour sync window.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(200).json({ v: -1, degraded: true });
  }

  try {
    const redis = Redis.fromEnv();
    const v = await redis.get<number>('news:version');
    return res.status(200).json({ v: typeof v === 'number' ? v : -1 });
  } catch (e: unknown) {
    console.error('[news-version] error:', e);
    return res.status(200).json({ v: -1, degraded: true });
  }
}
