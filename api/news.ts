import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

/**
 * Toolz News — public feed `GET /api/news`.
 * Serves published, time-valid, version-eligible items from Upstash Redis.
 * Never fails the app: Redis outage returns empty degraded payload.
 */

const FEED_VERSION = 1;
const MAX_ITEMS = 20;

interface NewsItem {
  schemaVersion: number;
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
  priority: 'info' | 'feature' | 'fix' | 'promo' | 'critical';
  status: 'draft' | 'published' | 'archived';
  pinned: boolean;
  publishAt: string | null;
  expiresAt: string | null;
  minAppVersion?: string | null;
  maxAppVersion?: string | null;
  onlyVersions?: string[] | null;
  excludedVersions?: string[] | null;
  delaySeconds: number;
  frequency: 'once' | 'every_launch' | 'daily' | 'weekly' | 'interval';
  intervalHours?: number | null;
  maxImpressions?: number | null;
  dismissible: boolean;
  showInHistory: boolean;
  requiresAction: boolean;
  notify: boolean;
  createdAt: string;
  updatedAt: string;
}

function parseParts(v: string): number[] {
  const clean = String(v || '').trim().split('-')[0].split('+')[0];
  return clean.split('.').map((p) => {
    const n = parseInt(p, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });
}

function compareVersions(a: string, b: string): number {
  const pa = parseParts(a);
  const pb = parseParts(b);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

function versionEligible(item: NewsItem, appVersion: string): boolean {
  const av = (appVersion || '0.0.0').trim() || '0.0.0';
  if (item.minAppVersion && compareVersions(av, item.minAppVersion) < 0) return false;
  if (item.maxAppVersion && compareVersions(av, item.maxAppVersion) > 0) return false;
  if (item.onlyVersions && item.onlyVersions.length > 0) {
    if (!item.onlyVersions.includes(av)) return false;
  }
  if (item.excludedVersions && item.excludedVersions.includes(av)) return false;
  return true;
}

function timeValid(item: NewsItem, now: number): boolean {
  if (item.status !== 'published') return false;
  if (item.publishAt) {
    const t = Date.parse(item.publishAt);
    if (Number.isFinite(t) && now < t) return false;
  }
  if (item.expiresAt) {
    const t = Date.parse(item.expiresAt);
    if (Number.isFinite(t) && now >= t) return false;
  }
  return true;
}

function toPublic(item: NewsItem): NewsItem {
  const rest = { ...(item as unknown as Record<string, unknown>) };
  delete rest['createdBy'];
  return rest as unknown as NewsItem;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const appVersion = String(req.query.appVersion ?? req.query.app_version ?? '0.0.0');
  const preview = req.query.preview === '1';
  // all=1 skips version filtering (public /news page, home previews).
  // Status + time window always apply.
  const allVersions = req.query.all === '1';
  if (!preview) {
    // Explicit browser max-age: without it, browsers may heuristically cache
    // an empty feed far beyond s-maxage and /news looks permanently empty.
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(200).json({
      version: FEED_VERSION,
      appVersion,
      count: 0,
      news: [],
      fetchedAt: new Date().toISOString(),
      degraded: true,
      reason: 'missing-redis-config',
    });
  }

  try {
    const redis = Redis.fromEnv();
    const now = Date.now();
    const [ids, tombKeys] = await Promise.all([
      redis.zrange<string[]>('news:index', 0, -1),
      redis.keys('news:tombstone:*').catch(() => [] as string[]),
    ]);
    const removedIds = (tombKeys ?? []).map((k) => k.replace(/^news:tombstone:/, '')).filter(Boolean).slice(0, 200);
    if (!ids || ids.length === 0) {
      return res.status(200).json({
        version: FEED_VERSION,
        appVersion,
        count: 0,
        news: [],
        removedIds,
        fetchedAt: new Date().toISOString(),
      });
    }
    const keys = ids.slice(0, 100).map((id) => `news:item:${id}`);
    const pipe = redis.pipeline();
    for (const k of keys) pipe.get(k);
    const raw = await pipe.exec();
    const items: NewsItem[] = [];
    for (const r of raw as unknown[]) {
      const v = (r as { result?: unknown })?.result ?? r;
      if (!v) continue;
      const item = (typeof v === 'string' ? safeParse(v) : v) as NewsItem | null;
      if (!item || typeof item !== 'object' || !item.id) continue;
      if (!timeValid(item, now)) continue;
      if (!allVersions && !versionEligible(item, appVersion)) continue;
      items.push(toPublic(item));
    }
    items.sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      const pa = a.publishAt ? Date.parse(a.publishAt) : 0;
      const pb = b.publishAt ? Date.parse(b.publishAt) : 0;
      return pb - pa;
    });
    const sliced = items.slice(0, MAX_ITEMS);
    return res.status(200).json({
      version: FEED_VERSION,
      appVersion,
      count: sliced.length,
      news: sliced,
      removedIds,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e: unknown) {
    console.error('[news] feed error:', e);
    return res.status(200).json({
      version: FEED_VERSION,
      appVersion,
      count: 0,
      news: [],
      fetchedAt: new Date().toISOString(),
      degraded: true,
    });
  }
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
