import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Toolz Skins — public feed `GET /api/skins` + community submit `POST /api/skins`.
 * GET serves published skins from Upstash Redis. Fail-open (degraded empty).
 * POST creates a draft for admin review (rate-limited, validated).
 */

const FEED_VERSION = 1;
const MAX_ITEMS = 100;

const BUILT_IN_ICONS = new Set([
  'midnight', 'mono-grey', 'grape-haze', 'grape-deep', 'lagoon',
  'legacy-citrus', 'legacy-ocean', 'legacy-night',
  'paper-light', 'paper-dark', 'citrus-pop', 'ocean-pop', 'royal', 'rose',
  'mint', 'sand', 'slate', 'snow', 'carbon', 'cobalt', 'sunset', 'forest',
  'lavender', 'peach', 'system-auto', 'dynamic-glow', 'custom',
]);

function newId(): string {
  return crypto.randomBytes(9).toString('base64url').replace(/[^A-Za-z0-9]/g, 'x').slice(0, 12) || crypto.randomBytes(6).toString('hex');
}

function cleanStr(v: unknown, max: number): string {
  return String(v ?? '').replace(/<[^>]*>/g, '').trim().slice(0, max);
}

function validSkin(s: any): string | null {
  if (!s || typeof s !== 'object') return 'bad payload';
  const name = cleanStr(s.name, 32);
  if (name.length < 3) return 'Name too short';
  if (!['SYSTEM', 'LIGHT', 'DARK'].includes(s.themeMode)) return 'Bad themeMode';
  if (typeof s.dynamicColor !== 'boolean') return 'Bad dynamicColor';
  if (!BUILT_IN_ICONS.has(String(s.iconPresetId || ''))) return 'Unknown icon';
  const shape = String(s.iconShape || 'HEXAGON').toUpperCase();
  if (!['HEXAGON', 'CIRCLE', 'PILL'].includes(shape)) return 'Bad iconShape';
  return null;
}

async function rateLimited(redis: any, ip: string, key: string, limit = 60): Promise<boolean> {
  try {
    const minute = new Date().toISOString().slice(0, 16);
    const k = `skins:rl:${key}:${ip}:${minute}`;
    const n = await redis.incr(k);
    if (n === 1) await redis.expire(k, 90).catch(() => {});
    return n > limit;
  } catch { return false; }
}

function clientIp(req: VercelRequest): string {
  const h = req.headers['x-forwarded-for'];
  const s = Array.isArray(h) ? h[0] : (h as string) || '';
  return s.split(',')[0].trim() || 'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(200).json({ version: FEED_VERSION, count: 0, skins: [], removedIds: [], v: -1, fetchedAt: new Date().toISOString(), degraded: true });
    }
    try {
      const redis = Redis.fromEnv();
      const [ids, feedV] = await Promise.all([
        redis.zrange<string[]>('skins:index', 0, -1),
        redis.get<number>('skins:version').catch(() => -1),
      ]);
      if (!ids || ids.length === 0) {
        return res.status(200).json({ version: FEED_VERSION, count: 0, skins: [], removedIds: [], v: typeof feedV === 'number' ? feedV : -1, fetchedAt: new Date().toISOString() });
      }
      const pipe = redis.pipeline();
      for (const id of ids.slice(0, 100)) pipe.get(`skins:item:${id}`);
      const raw = await pipe.exec();
      const out: any[] = [];
      for (const r of raw as unknown[]) {
        const v = (r as any)?.result ?? r;
        if (!v) continue;
        const item = typeof v === 'string' ? safeParse(v) : v;
        if (!item || typeof item !== 'object' || !item.id) continue;
        if (item.status !== 'published') continue;
        if (validSkin(item) !== null) continue;
        const { createdBy, ...pub } = item;
        out.push(pub);
      }
      out.sort((a, b) => (Number(b.featured) - Number(a.featured)) || String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
      return res.status(200).json({ version: FEED_VERSION, count: out.length, skins: out.slice(0, MAX_ITEMS), removedIds: [], v: typeof feedV === 'number' ? feedV : -1, fetchedAt: new Date().toISOString() });
    } catch (e) {
      console.error('[skins] feed error', e);
      return res.status(200).json({ version: FEED_VERSION, count: 0, skins: [], removedIds: [], v: -1, fetchedAt: new Date().toISOString(), degraded: true });
    }
  }

  if (req.method === 'POST') {
    // Community submit -> draft
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(200).json({ ok: false, error: 'Backend not configured yet' });
    }
    try {
      const redis = Redis.fromEnv();
      const ip = clientIp(req);
      if (await rateLimited(redis, ip, 'submit', 5)) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ ok: false, error: 'Too many submits — try later' });
      }
      const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body as any);
      const name = cleanStr(body?.name, 32);
      const skin = body?.skin && typeof body.skin === 'object' ? body.skin : null;
      const candidate = { ...(skin || {}), name, status: 'draft' };
      const err = validSkin(candidate);
      if (err) return res.status(400).json({ ok: false, error: err });
      const id = newId();
      const now = new Date().toISOString();
      const item = {
        schemaVersion: 1,
        id,
        name,
        author: cleanStr(skin?.author, 32) || null,
        description: cleanStr(skin?.description, 200) || null,
        themeMode: candidate.themeMode,
        dynamicColor: !!candidate.dynamicColor,
        primary: numOrNull(candidate.primary),
        secondary: numOrNull(candidate.secondary),
        gradient: candidate.gradient !== false,
        iconPresetId: String(candidate.iconPresetId),
        iconAdaptTheme: candidate.iconAdaptTheme !== false,
        iconFollowDynamic: candidate.iconFollowDynamic !== false,
        iconShape: String(candidate.iconShape || 'HEXAGON').toUpperCase(),
        featured: false,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        createdBy: 'community',
      };
      await redis.set(`skins:item:${id}`, JSON.stringify(item));
      await redis.zadd('skins:index', { score: Date.now(), member: id });
      await redis.incr('skins:version').catch(() => {});
      return res.status(200).json({ ok: true, id });
    } catch (e) {
      console.error('[skins] submit error', e);
      return res.status(500).json({ ok: false, error: 'Submit failed' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

function numOrNull(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 4294967295) return null;
  return Math.floor(n);
}

function safeParse(s: string): any {
  try { return JSON.parse(s); } catch { return null; }
}
