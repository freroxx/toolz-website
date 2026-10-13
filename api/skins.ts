import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Toolz Skins — public feed `GET /api/skins` + community submit `POST /api/skins`.
 * GET serves published skins from Upstash Redis. Fail-open (degraded empty).
 * POST creates a draft for admin review (rate-limited, validated).
 *
 * Also serves the admin ops at `?action=` (migrated from /api/skins-admin):
 * session+CSRF authed list/create/update/publish/unpublish/archive/delete.
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

function parseCookies(req: VercelRequest): Record<string, string> {
  const out: Record<string, string> = {};
  const h = req.headers.cookie;
  if (!h) return out;
  for (const part of String(h).split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    try { out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()); }
    catch { out[part.slice(0, i).trim()] = part.slice(i + 1).trim(); }
  }
  return out;
}

/** Admin session (same NEWS_ADMIN_PASSWORD + news_admin_session cookie as /admin/news). */
async function requireAdminSession(req: VercelRequest, redis: any): Promise<{ ok: boolean; csrf?: string }> {
  const secret = process.env.NEWS_ADMIN_PASSWORD || '';
  if (!secret) return { ok: false };
  const raw = parseCookies(req)['news_admin_session'];
  if (!raw) return { ok: false };
  const dot = raw.lastIndexOf('.');
  if (dot < 0) return { ok: false };
  const tokenId = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  const expect = crypto.createHmac('sha256', secret).update(tokenId).digest('hex');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expect))) return { ok: false };
  } catch { return { ok: false }; }
  const sess = await redis.get(`news_admin_session:${tokenId}`);
  const obj = typeof sess === 'string' ? safeParse(sess) : sess;
  if (!obj || typeof obj !== 'object' || !obj.csrf) return { ok: false };
  return { ok: true, csrf: obj.csrf };
}

function needCsrf(req: VercelRequest, csrf: string): boolean {
  const got = String(req.headers['x-csrf-token'] || '');
  if (!got || !csrf) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(csrf));
  } catch { return false; }
}

function validateSkinAdmin(d: any): { errors: string[]; clean: any } {
  const errors: string[] = [];
  const clean: any = {};
  const name = cleanStr(d.name, 32);
  if (name.length < 3) errors.push('name must be 3-32 chars');
  else clean.name = name;
  if (!['SYSTEM', 'LIGHT', 'DARK'].includes(d.themeMode)) errors.push('bad themeMode');
  else clean.themeMode = d.themeMode;
  clean.dynamicColor = !!d.dynamicColor;
  clean.primary = d.primary == null ? null : numOrNull(d.primary);
  clean.secondary = d.secondary == null ? null : numOrNull(d.secondary);
  clean.gradient = d.gradient !== false;
  if (!BUILT_IN_ICONS.has(String(d.iconPresetId || ''))) errors.push('Unknown icon');
  else clean.iconPresetId = String(d.iconPresetId);
  clean.iconAdaptTheme = d.iconAdaptTheme !== false;
  clean.iconFollowDynamic = d.iconFollowDynamic !== false;
  const shape = String(d.iconShape || 'HEXAGON').toUpperCase();
  if (!['HEXAGON', 'CIRCLE', 'PILL'].includes(shape)) errors.push('Bad iconShape');
  else clean.iconShape = shape;
  if (d.status !== undefined) {
    if (!['draft', 'published', 'archived'].includes(String(d.status))) errors.push('bad status');
    else clean.status = String(d.status);
  }
  if (d.featured !== undefined) clean.featured = !!d.featured;
  if (d.author !== undefined) clean.author = cleanStr(d.author, 32) || null;
  if (d.description !== undefined) clean.description = cleanStr(d.description, 200) || null;
  return { errors, clean };
}

/** Admin ops (migrated from /api/skins-admin). Routed by ?action=. */
async function handleAdmin(req: VercelRequest, res: VercelResponse, action: string, redis: any) {
  // Session restore (same cookie as news admin).
  if (req.method === 'GET' && action === 'list') {
    const s = await requireAdminSession(req, redis);
    if (!s.ok) return res.status(401).json({ error: 'Unauthorized' });
    const ids = (await redis.zrange('skins:index', 0, -1)) ?? [];
    const pipe = redis.pipeline();
    for (const id of ids.slice(0, 200)) pipe.get(`skins:item:${id}`);
    const raw = await pipe.exec();
    const items: any[] = [];
    for (const r of raw as unknown[]) {
      const v = (r as any)?.result ?? r;
      const it = typeof v === 'string' ? safeParse(v) : v;
      if (it && typeof it === 'object' && it.id) items.push(it);
    }
    items.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    return res.status(200).json({ items, csrf: s.csrf });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const s = await requireAdminSession(req, redis);
  if (!s.ok) return res.status(401).json({ error: 'Unauthorized' });
  if (!needCsrf(req, s.csrf || '')) return res.status(403).json({ error: 'Bad CSRF' });
  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body as any) || {};
  const bump = () => redis.incr('skins:version').catch(() => -1);

  if (action === 'create') {
    const { errors, clean } = validateSkinAdmin({ ...(body.item || {}), status: 'draft' });
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });
    const id = newId();
    const now = new Date().toISOString();
    const item = { schemaVersion: 1, id, ...clean, status: 'draft', featured: !!clean.featured, createdAt: now, updatedAt: now };
    await redis.set(`skins:item:${id}`, JSON.stringify(item));
    await redis.zadd('skins:index', { score: Date.now(), member: id });
    await bump();
    return res.status(200).json({ ok: true, item });
  }

  if (action === 'update') {
    const id = cleanStr(body.id, 64);
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const cur = await redis.get(`skins:item:${id}`);
    const curObj = typeof cur === 'string' ? safeParse(cur) : cur;
    if (!curObj) return res.status(404).json({ error: 'Not found' });
    const { errors, clean } = validateSkinAdmin({ ...curObj, ...(body.patch || {}) });
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });
    const now = new Date().toISOString();
    const item = { ...curObj, ...clean, id, updatedAt: now };
    await redis.set(`skins:item:${id}`, JSON.stringify(item));
    await bump();
    return res.status(200).json({ ok: true, item });
  }

  const setStatus = async (ids: string[], status: string) => {
    const results: any[] = [];
    for (const rawId of ids.slice(0, 50)) {
      const id = cleanStr(rawId, 64);
      const cur = await redis.get(`skins:item:${id}`);
      const obj = typeof cur === 'string' ? safeParse(cur) : cur;
      if (!obj) { results.push({ id, ok: false }); continue; }
      obj.status = status;
      obj.updatedAt = new Date().toISOString();
      await redis.set(`skins:item:${id}`, JSON.stringify(obj));
      results.push({ id, ok: true });
    }
    await bump();
    return results;
  };

  if (['publish', 'unpublish', 'archive'].includes(action)) {
    const ids: string[] = Array.isArray(body.ids) ? body.ids : [body.id].filter(Boolean);
    const status = action === 'publish' ? 'published' : action === 'archive' ? 'archived' : 'draft';
    const results = await setStatus(ids.map((x) => String(x)), status);
    return res.status(200).json({ ok: true, results });
  }

  if (action === 'delete') {
    const ids: string[] = Array.isArray(body.ids) ? body.ids : [body.id].filter(Boolean);
    for (const rawId of ids.slice(0, 50)) {
      const id = cleanStr(rawId, 64);
      await redis.del(`skins:item:${id}`);
      await redis.zrem('skins:index', id);
    }
    await bump();
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: `Unknown action ${action}` });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Admin ops (migrated from /api/skins-admin). Routed by ?action=.
  const adminAction = String(req.query.action || '');
  if (adminAction) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.NEWS_ADMIN_PASSWORD) {
      return res.status(500).json({ error: 'Missing Redis config' });
    }
    const redis = Redis.fromEnv();
    return handleAdmin(req, res, adminAction, redis);
  }

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
