import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Toolz Skins — public feed `GET /api/skins` + community submit `POST /api/skins`.
 * GET serves published skins from Upstash Redis. Fail-open (degraded empty).
 * POST creates a draft for admin review (rate-limited, validated).
 *
 * Also serves the admin ops at `?action=`:
 * login/logout/list/create/update/publish/unpublish/archive/delete,
 * authed by SKINS_ADMIN_PASSWORD (Vercel env) -> HMAC session cookie + CSRF.
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

function sha256(s: string): Buffer {
  return crypto.createHash('sha256').update(s).digest();
}

/** Admin session (SKINS_ADMIN_PASSWORD + skins_admin_session cookie, separate from news). */
async function requireAdminSession(req: VercelRequest, redis: any): Promise<{ ok: boolean; csrf?: string }> {
  const secret = process.env.SKINS_ADMIN_PASSWORD || '';
  if (!secret) return { ok: false };
  const raw = parseCookies(req)['skins_admin_session'];
  if (!raw) return { ok: false };
  const dot = raw.lastIndexOf('.');
  if (dot < 0) return { ok: false };
  const tokenId = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  const expect = crypto.createHmac('sha256', secret).update(tokenId).digest('hex');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expect))) return { ok: false };
  } catch { return { ok: false }; }
  const sess = await redis.get(`skins_admin_session:${tokenId}`);
  const obj = typeof sess === 'string' ? safeParse(sess) : sess;
  if (!obj || typeof obj !== 'object' || !obj.csrf) return { ok: false };
  return { ok: true, csrf: obj.csrf };
}

/** Secure flag only on https (localhost dev is http — Secure would drop the cookie). */
function sessionCookie(tokenId: string, mac: string, maxAge: number, req: VercelRequest): string {
  const proto = String(req.headers['x-forwarded-proto'] ?? '');
  const host = String(req.headers.host ?? req.headers['x-forwarded-host'] ?? '');
  const isLocal = /localhost|127\.0\.0\.1/i.test(host) || process.env.NODE_ENV === 'development';
  const secure = !isLocal && (proto.includes('https') || process.env.NODE_ENV === 'production' || proto === '');
  return `skins_admin_session=${tokenId}.${mac}; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

function clearSessionCookie(req: VercelRequest): string {
  const proto = String(req.headers['x-forwarded-proto'] ?? '');
  const host = String(req.headers.host ?? req.headers['x-forwarded-host'] ?? '');
  const isLocal = /localhost|127\.0\.0\.1/i.test(host) || process.env.NODE_ENV === 'development';
  const secure = !isLocal && (proto.includes('https') || process.env.NODE_ENV === 'production' || proto === '');
  return `skins_admin_session=; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=0`;
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

/** Admin ops. Routed by ?action=. */
async function handleAdmin(req: VercelRequest, res: VercelResponse, action: string, redis: any) {
  const ip = clientIp(req);
  const SECRET = process.env.SKINS_ADMIN_PASSWORD || '';

  // Login (no session needed).
  if (action === 'login' && req.method === 'POST') {
    if ((req.query.pw as string) !== undefined) return res.status(400).json({ error: 'Password in URL is rejected. Use JSON body.' });
    if (!SECRET) return res.status(500).json({ error: 'Skins admin not configured. Set SKINS_ADMIN_PASSWORD on Vercel.' });
    const pw = String((typeof req.body === 'string' ? safeParse(req.body) : req.body)?.password ?? '');
    if (!pw) return res.status(400).json({ error: 'Password required.' });
    let ok = false;
    try {
      ok = crypto.timingSafeEqual(sha256(pw.trim()), sha256(SECRET.trim()));
    } catch { ok = false; }
    if (!ok) {
      try {
        const fails = await redis.incr(`skinsfails:${ip}`);
        if (fails === 1) await redis.expire(`skinsfails:${ip}`, 900);
        if (fails >= 5) await redis.set(`skinsban:${ip}`, '1', { ex: 900 });
      } catch { /* ignore */ }
      return res.status(401).json({ error: 'Invalid password.' });
    }
    try { await redis.del(`skinsfails:${ip}`); } catch { /* ignore */ }
    const tokenId = crypto.randomBytes(32).toString('hex');
    const mac = crypto.createHmac('sha256', SECRET).update(tokenId).digest('hex');
    const csrf = crypto.randomBytes(16).toString('hex');
    await redis.set(`skins_admin_session:${tokenId}`, JSON.stringify({ csrf }), { ex: 6 * 3600 });
    res.setHeader('Set-Cookie', sessionCookie(tokenId, mac, 21600, req));
    return res.status(200).json({ ok: true, csrf });
  }

  // Ban check (mirrors news-admin).
  if (process.env.NODE_ENV !== 'development') {
    try {
      const banned = await redis.get(`skinsban:${ip}`);
      if (banned) return res.status(403).json({ error: 'IP locked for 15 minutes after failed attempts.' });
    } catch { /* ignore */ }
  }

  // Session restore (own cookie, not the news one).
  if (req.method === 'GET' && action === 'list') {
    const s = await requireAdminSession(req, redis);
    if (!s.ok) return res.status(401).json({ error: 'Unauthorized' });
    const ids = (await redis.zrange('skins:index', 0, -1)) ?? [];
    if (ids.length === 0) {
      return res.status(200).json({ items: [], csrf: s.csrf });
    }
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

  if (action === 'logout') {
    const tokenId = (parseCookies(req)['skins_admin_session'] || '').split('.')[0];
    if (tokenId) { try { await redis.del(`skins_admin_session:${tokenId}`); } catch { /* ignore */ } }
    res.setHeader('Set-Cookie', clearSessionCookie(req));
    return res.status(200).json({ ok: true });
  }

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

  // Admin ops (own SKINS_ADMIN_PASSWORD session). Routed by ?action=.
  const adminAction = String(req.query.action || '');
  if (adminAction) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.SKINS_ADMIN_PASSWORD) {
      return res.status(500).json({ error: 'Missing config. Set UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN and SKINS_ADMIN_PASSWORD on Vercel.' });
    }
    const redis = Redis.fromEnv();
    try {
      return await handleAdmin(req, res, adminAction, redis);
    } catch (e) {
      console.error('[skins] admin error:', e);
      return res.status(500).json({ error: `Admin failed: ${e instanceof Error ? e.message : 'unknown error'}` });
    }
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
