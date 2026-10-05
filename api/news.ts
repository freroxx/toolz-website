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

/** Non-blocking key scan with KEYS fallback (Upstash REST supports SCAN). */
async function scanKeys(redis: unknown, pattern: string): Promise<string[]> {
  try {
    const r = redis as {
      scan?: (cursor: number, opts?: { match?: string; count?: number }) => Promise<[number | string, string[]] | unknown>;
      keys?: (p: string) => Promise<string[]>;
    };
    if (typeof r.scan === 'function') {
      const out: string[] = [];
      let cursor = 0;
      for (let i = 0; i < 20; i++) {
        const res = (await r.scan(cursor, { match: pattern, count: 200 })) as unknown;
        let next = 0;
        let batch: string[] = [];
        if (Array.isArray(res) && res.length >= 2) {
          next = Number(res[0]);
          batch = (res[1] as string[]) ?? [];
        }
        out.push(...batch);
        if (!Number.isFinite(next) || next === 0) break;
        cursor = next;
        if (out.length >= 500) break;
      }
      return out.slice(0, 500);
    }
    if (typeof r.keys === 'function') return ((await r.keys(pattern)) ?? []).slice(0, 500);
    return [];
  } catch {
    return [];
  }
}

/** Simple Redis fixed-window rate limit (60 req/min/IP). Fail-open. */
async function rateLimited(redis: unknown, ip: string): Promise<boolean> {
  try {
    const r = redis as {
      incr?: (k: string) => Promise<number>;
      expire?: (k: string, s: number) => Promise<unknown>;
    };
    if (typeof r.incr !== 'function') return false;
    const day = new Date().toISOString().slice(0, 16);
    const key = `news:rl:${ip}:${day}`;
    const n = await r.incr(key);
    if (n === 1 && typeof r.expire === 'function') await r.expire(key, 90).catch(() => {});
    return n > 120;
  } catch {
    return false;
  }
}

function clientIpFromHeaders(req: VercelRequest): string {
  const h = req.headers['x-forwarded-for'];
  const s = Array.isArray(h) ? h[0] : (h as string) || '';
  return s.split(',')[0].trim() || 'unknown';
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
    // Short CDN window: mutations must propagate in about a minute without
    // any manual action. Browsers are capped at 60 s; the site fetches no-store.
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
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
    // Fail-open per-IP throttle (abuse safety, no new deps).
    try {
      if (await rateLimited(redis, clientIpFromHeaders(req))) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ error: 'Too many requests', version: FEED_VERSION, appVersion, count: 0, news: [] });
      }
    } catch { /* fail open */ }
    const [ids, tombKeys, feedV] = await Promise.all([
      redis.zrange<string[]>('news:index', 0, -1),
      scanKeys(redis, 'news:tombstone:*'),
      redis.get<number>('news:version').catch(() => -1),
    ]);
    const feedVersion = typeof feedV === 'number' ? feedV : -1;
    const removedIds = (tombKeys ?? []).map((k) => k.replace(/^news:tombstone:/, '')).filter(Boolean).slice(0, 200);
    if (!ids || ids.length === 0) {
      const etagEmpty = `W/"v${feedVersion}-0"`;
      res.setHeader('ETag', etagEmpty);
      if (req.headers['if-none-match'] === etagEmpty && !preview) return res.status(304).end();
      return res.status(200).json({
        version: FEED_VERSION,
        appVersion,
        count: 0,
        news: [],
        removedIds,
        v: feedVersion,
        nextTransitionAt: null,
        fetchedAt: new Date().toISOString(),
      });
    }
    const keys = ids.slice(0, 100).map((id) => `news:item:${id}`);
    const pipe = redis.pipeline();
    for (const k of keys) pipe.get(k);
    const raw = await pipe.exec();
    const items: NewsItem[] = [];
    // Earliest future publishAt/expiresAt across ALL payloads (not just the
    // filtered slice) so clients can wake exactly when the feed changes with
    // zero mutations (scheduled publish / expiry otherwise never bumps v).
    let nextTransitionAt: string | null = null;
    let nextTransitionMs = Number.POSITIVE_INFINITY;
    const considerTransition = (iso: unknown) => {
      if (typeof iso !== 'string' || !iso) return;
      const t = Date.parse(iso);
      if (!Number.isFinite(t) || t <= now) return;
      if (t < nextTransitionMs) { nextTransitionMs = t; nextTransitionAt = iso; }
    };
    for (const r of raw as unknown[]) {
      const v = (r as { result?: unknown })?.result ?? r;
      if (!v) continue;
      const item = (typeof v === 'string' ? safeParse(v) : v) as NewsItem | null;
      if (!item || typeof item !== 'object' || !item.id) continue;
      considerTransition(item.publishAt);
      considerTransition(item.expiresAt);
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
    const etag = `W/"v${feedVersion}-${sliced.length}-${sliced[0]?.id ?? 'empty'}"`;
    res.setHeader('ETag', etag);
    if (req.headers['if-none-match'] === etag && !preview) return res.status(304).end();
    return res.status(200).json({
      version: FEED_VERSION,
      appVersion,
      count: sliced.length,
      news: sliced,
      removedIds,
      v: feedVersion,
      nextTransitionAt,
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
