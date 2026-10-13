import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Toolz Skins admin API — `POST/GET /api/skins-admin?action=...`
 * Reuses the same NEWS_ADMIN_PASSWORD + news_admin_session cookie as /admin/news,
 * so one login unlocks both panels.
 */

const BUILT_IN_ICONS = new Set([
  'midnight', 'mono-grey', 'grape-haze', 'grape-deep', 'lagoon',
  'legacy-citrus', 'legacy-ocean', 'legacy-night',
  'paper-light', 'paper-dark', 'citrus-pop', 'ocean-pop', 'royal', 'rose',
  'mint', 'sand', 'slate', 'snow', 'carbon', 'cobalt', 'sunset', 'forest',
  'lavender', 'peach', 'system-auto', 'dynamic-glow', 'custom',
]);

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

function newId(): string {
  return crypto.randomBytes(9).toString('base64url').replace(/[^A-Za-z0-9]/g, 'x').slice(0, 12) || crypto.randomBytes(6).toString('hex');
}

function cleanStr(v: unknown, max: number): string {
  return String(v ?? '').replace(/<[^>]*>/g, '').trim().slice(0, max);
}

function numOrNull(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 4294967295) return null;
  return Math.floor(n);
}

function validateSkin(d: any): { errors: string[]; clean: any } {
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

async function requireSession(req: VercelRequest, redis: Redis): Promise<{ ok: boolean; csrf?: string }> {
  const secret = process.env.NEWS_ADMIN_PASSWORD || '';
  if (!secret) return { ok: false };
  const cookies = parseCookies(req);
  const raw = cookies['news_admin_session'];
  if (!raw) return { ok: false };
  const dot = raw.lastIndexOf('.');
  if (dot < 0) return { ok: false };
  const tokenId = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  const expect = crypto.createHmac('sha256', secret).update(tokenId).digest('hex');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expect))) return { ok: false };
  } catch { return { ok: false }; }
  const sess = await redis.get<{ csrf: string }>(`news_admin_session:${tokenId}`);
  if (!sess || typeof sess !== 'object' || !sess.csrf) return { ok: false };
  return { ok: true, csrf: sess.csrf };
}

function needCsrf(req: VercelRequest, csrf: string): boolean {
  const got = String(req.headers['x-csrf-token'] || '');
  if (!got || !csrf) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(csrf));
  } catch { return false; }
}

async function bump(redis: Redis): Promise<number> {
  try { return await redis.incr('skins:version'); } catch { return -1; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action || '');
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ error: 'Missing Redis config' });
  }
  const redis = Redis.fromEnv();

  // Session restore (same cookie as news admin).
  if (req.method === 'GET' && action === 'list') {
    const s = await requireSession(req, redis);
    if (!s.ok) return res.status(401).json({ error: 'Unauthorized' });
    const ids = (await redis.zrange<string[]>('skins:index', 0, -1)) ?? [];
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
  const s = await requireSession(req, redis);
  if (!s.ok) return res.status(401).json({ error: 'Unauthorized' });
  if (!needCsrf(req, s.csrf || '')) return res.status(403).json({ error: 'Bad CSRF' });
  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body as any) || {};

  if (action === 'create') {
    const { errors, clean } = validateSkin({ ...(body.item || {}), status: 'draft' });
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });
    const id = newId();
    const now = new Date().toISOString();
    const item = { schemaVersion: 1, id, ...clean, status: 'draft', featured: !!clean.featured, createdAt: now, updatedAt: now };
    await redis.set(`skins:item:${id}`, JSON.stringify(item));
    await redis.zadd('skins:index', { score: Date.now(), member: id });
    await bump(redis);
    return res.status(200).json({ ok: true, item });
  }

  if (action === 'update') {
    const id = cleanStr(body.id, 64);
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const cur = await redis.get<any>(`skins:item:${id}`);
    const curObj = typeof cur === 'string' ? safeParse(cur) : cur;
    if (!curObj) return res.status(404).json({ error: 'Not found' });
    const { errors, clean } = validateSkin({ ...curObj, ...(body.patch || {}) });
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });
    const now = new Date().toISOString();
    const item = { ...curObj, ...clean, id, updatedAt: now };
    await redis.set(`skins:item:${id}`, JSON.stringify(item));
    await bump(redis);
    return res.status(200).json({ ok: true, item });
  }

  const setStatus = async (ids: string[], status: string) => {
    const results: any[] = [];
    for (const rawId of ids.slice(0, 50)) {
      const id = cleanStr(rawId, 64);
      const cur = await redis.get<any>(`skins:item:${id}`);
      const obj = typeof cur === 'string' ? safeParse(cur) : cur;
      if (!obj) { results.push({ id, ok: false }); continue; }
      obj.status = status;
      obj.updatedAt = new Date().toISOString();
      await redis.set(`skins:item:${id}`, JSON.stringify(obj));
      results.push({ id, ok: true });
    }
    await bump(redis);
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
    await bump(redis);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: `Unknown action ${action}` });
}

function safeParse(s: string): any {
  try { return JSON.parse(s); } catch { return null; }
}
