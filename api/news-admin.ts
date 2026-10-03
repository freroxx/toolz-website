import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Toolz News admin API — `POST/GET /api/news-admin?action=...`
 * Same-origin JSON API for the /admin/news SPA.
 * Auth: NEWS_ADMIN_PASSWORD (Vercel env) -> HMAC session cookie + CSRF.
 */

const PRIORITIES = ['info', 'feature', 'fix', 'promo', 'critical'] as const;
const STATUSES = ['draft', 'published', 'archived'] as const;
const FREQS = ['once', 'every_launch', 'daily', 'weekly', 'interval'] as const;
const DEFAULT_HOSTS = ['toolz-app.vercel.app', 'github.com', 'freroxx.github.io', 'raw.githubusercontent.com', 'i.ibb.co', 'ibb.co'];

function sha256(s: string): Buffer {
  return crypto.createHash('sha256').update(s).digest();
}

function newId(): string {
  return crypto.randomBytes(9).toString('base64url').replace(/[^A-Za-z0-9]/g, 'x').slice(0, 12) || crypto.randomBytes(6).toString('hex');
}

function clientIp(req: VercelRequest): string {
  const h = req.headers['x-forwarded-for'];
  const s = Array.isArray(h) ? h[0] : (h as string) || '';
  return s.split(',')[0].trim() || 'unknown';
}

function ipHash(ip: string): string {
  return crypto.createHash('sha256').update(`news-audit:${ip}`).digest('hex').slice(0, 16);
}

function parseCookies(req: VercelRequest): Record<string, string> {
  const out: Record<string, string> = {};
  const h = req.headers.cookie;
  if (!h) return out;
  for (const part of String(h).split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const raw = part.slice(i + 1).trim();
    try {
      out[part.slice(0, i).trim()] = decodeURIComponent(raw);
    } catch {
      out[part.slice(0, i).trim()] = raw;
    }
  }
  return out;
}

function semverOk(v: string): boolean {
  return /^\d+(\.\d+){0,2}(-[A-Za-z0-9.+-]+)?$/.test(v.trim());
}

function urlOk(u: string, allowed: string[]): string | null {
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return 'must be a valid URL';
  }
  if (parsed.protocol !== 'https:' && !(u.startsWith('toolz://'))) return 'must be https:// or toolz://';
  if (/^(javascript|data|file):/i.test(u)) return 'forbidden scheme';
  const host = parsed.hostname.toLowerCase();
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return 'IP hosts not allowed';
  if (parsed.protocol === 'https:' && allowed.length > 0) {
    const ok = allowed.some((h) => host === h || host.endsWith(`.${h}`));
    if (!ok) return `host not allowlisted (${host})`;
  }
  if (u.length > 500) return 'URL too long';
  return null;
}

function sanitizeBody(s: string): string {
  return String(s || '').replace(/<[^>]*>/g, '').slice(0, 2000);
}

interface Draft {
  [k: string]: unknown;
}

function validateItem(d: Draft, allowed: string[], isPatch = false): { errors: string[]; item: Record<string, unknown> } {
  const errors: string[] = [];
  const item: Record<string, unknown> = {};
  const need = (k: string) => !isPatch || d[k] !== undefined;

  if (need('title')) {
    const t = String(d.title ?? '').trim();
    if (t.length < 3 || t.length > 120) errors.push('title must be 3-120 chars');
    else item.title = t;
  }
  if (need('body')) {
    const b = sanitizeBody(String(d.body ?? ''));
    if (b.trim().length < 1) errors.push('body required');
    else item.body = b;
  }
  if (d.imageUrl !== undefined) {
    const s = d.imageUrl === null ? '' : String(d.imageUrl).trim();
    if (s === '') {
      // Explicit clear (patch) or default (create).
      item.imageUrl = null;
    } else if (!s.toLowerCase().startsWith('https://')) {
      errors.push('imageUrl must be an https:// URL (Coil cannot render toolz:// images)');
    } else {
      const e = urlOk(s, allowed);
      if (e) errors.push(`imageUrl: ${e}`);
      else item.imageUrl = s;
    }
  } else if (!isPatch) item.imageUrl = null;
  if (d.actionUrl !== undefined) {
    const s = d.actionUrl === null ? '' : String(d.actionUrl).trim();
    if (s === '') {
      item.actionUrl = null;
      item.actionLabel = null;
    } else {
      const e = urlOk(s, allowed);
      if (e) errors.push(`actionUrl: ${e}`);
      else item.actionUrl = s;
      const l = String(d.actionLabel ?? '').trim().slice(0, 50);
      item.actionLabel = l || null;
    }
  } else if (!isPatch) {
    item.actionUrl = null;
    item.actionLabel = null;
  }
  if (need('priority')) {
    if (!(PRIORITIES as readonly string[]).includes(String(d.priority))) errors.push('bad priority');
    else item.priority = String(d.priority);
  }
  if (need('status')) {
    if (!(STATUSES as readonly string[]).includes(String(d.status))) errors.push('bad status');
    else item.status = String(d.status);
  }
  for (const k of ['pinned', 'dismissible', 'showInHistory', 'requiresAction', 'notify', 'disappearing'] as const) {
    if (d[k] !== undefined) item[k] = !!d[k];
    else if (!isPatch) item[k] = k === 'dismissible' || k === 'showInHistory' || k === 'notify' ? true : false;
  }
  if (item.requiresAction && item.priority !== 'critical' && need('priority')) {
    // requiresAction only meaningful for critical; coerce off otherwise when full create
    if (!isPatch) item.requiresAction = false;
  }
  for (const k of ['publishAt', 'expiresAt'] as const) {
    if (d[k] !== undefined) {
      const s = d[k] === null ? '' : String(d[k]).trim();
      if (s === '') {
        // Explicit clear (patch) or default (create).
        item[k] = null;
      } else {
        const t = Date.parse(s);
        if (!Number.isFinite(t)) errors.push(`${k} must be ISO date`);
        else item[k] = new Date(t).toISOString();
      }
    } else if (!isPatch) item[k] = null;
  }
  if (item.publishAt && item.expiresAt && Date.parse(String(item.expiresAt)) <= Date.parse(String(item.publishAt))) {
    errors.push('expiresAt must be after publishAt');
  }
  for (const k of ['minAppVersion', 'maxAppVersion'] as const) {
    if (d[k] !== undefined) {
      const s = d[k] === null ? '' : String(d[k]).trim();
      if (s === '') item[k] = null;
      else if (!semverOk(s)) errors.push(`${k} must be semver`);
      else item[k] = s;
    } else if (!isPatch) item[k] = null;
  }
  for (const k of ['onlyVersions', 'excludedVersions'] as const) {
    if (d[k] !== undefined) {
      const arr = Array.isArray(d[k]) ? (d[k] as unknown[]) : String(d[k] ?? '').split(',').map((s) => String(s).trim()).filter(Boolean);
      if (arr.length > 30) errors.push(`${k} max 30`);
      const cleaned = arr.map((s) => String(s).trim()).filter((s) => s.length > 0 && s.length <= 32);
      item[k] = cleaned;
    } else if (!isPatch) item[k] = [];
  }
  if (d.delaySeconds !== undefined) {
    const n = Number(d.delaySeconds);
    if (!Number.isFinite(n) || n < 0 || n > 3600) errors.push('delaySeconds 0-3600');
    else item.delaySeconds = Math.floor(n);
  } else if (!isPatch) item.delaySeconds = 0;
  if (d.frequency !== undefined) {
    if (!(FREQS as readonly string[]).includes(String(d.frequency))) errors.push('bad frequency');
    else item.frequency = String(d.frequency);
  } else if (!isPatch) item.frequency = 'once';
  if (d.intervalHours !== undefined) {
    if (d.intervalHours === null || String(d.intervalHours).trim() === '') item.intervalHours = null;
    else {
      const n = Number(d.intervalHours);
      if (!Number.isFinite(n) || n < 1 || n > 720) errors.push('intervalHours 1-720');
      else item.intervalHours = Math.floor(n);
    }
  } else if (!isPatch) item.intervalHours = null;
  if (d.maxImpressions !== undefined) {
    if (d.maxImpressions === null || String(d.maxImpressions).trim() === '') item.maxImpressions = null;
    else {
      const n = Number(d.maxImpressions);
      if (!Number.isFinite(n) || n < 1 || n > 100) errors.push('maxImpressions 1-100');
      else item.maxImpressions = Math.floor(n);
    }
  } else if (!isPatch) item.maxImpressions = null;

  const raw = JSON.stringify(item);
  if (raw.length > 8192) errors.push('item exceeds 8KB');
  return { errors, item };
}

async function allowedHosts(redis: Redis): Promise<string[]> {
  try {
    const cfg = await redis.get<unknown>('news:config');
    const extra = (cfg as { allowedHosts?: unknown })?.allowedHosts;
    const list = Array.isArray(extra) ? extra.map((s) => String(s).toLowerCase()) : [];
    return [...new Set([...DEFAULT_HOSTS, ...list])];
  } catch {
    return [...DEFAULT_HOSTS];
  }
}

export interface FeedHealthItem {
  id: string;
  title: string;
  status: string;
  publishAt: string | null;
  expiresAt: string | null;
  liveOnPublicFeed: boolean;
  reason: string;
}

function verdictFor(raw: unknown): FeedHealthItem | null {
  const item = (typeof raw === 'string' ? safeJsonParse(raw) : raw) as Record<string, unknown> | null;
  if (!item || typeof item !== 'object' || typeof item.id !== 'string') return null;
  const now = Date.now();
  const status = String(item.status ?? '');
  const publishAt = typeof item.publishAt === 'string' ? item.publishAt : null;
  const expiresAt = typeof item.expiresAt === 'string' ? item.expiresAt : null;
  if (status !== 'published') {
    return {
      id: item.id, title: String(item.title ?? '(untitled)'), status,
      publishAt, expiresAt, liveOnPublicFeed: false,
      reason: status === 'draft' ? 'draft (not published)' : status === 'archived' ? 'archived' : `status=${status}`,
    };
  }
  if (publishAt) {
    const t = Date.parse(publishAt);
    if (Number.isFinite(t) && now < t) {
      return { id: item.id, title: String(item.title ?? ''), status, publishAt, expiresAt, liveOnPublicFeed: false, reason: `scheduled at ${publishAt}` };
    }
  }
  if (expiresAt) {
    const t = Date.parse(expiresAt);
    if (Number.isFinite(t) && now >= t) {
      return { id: item.id, title: String(item.title ?? ''), status, publishAt, expiresAt, liveOnPublicFeed: false, reason: `expired at ${expiresAt}` };
    }
  }
  return { id: item.id, title: String(item.title ?? ''), status, publishAt, expiresAt, liveOnPublicFeed: true, reason: 'live' };
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * Feed diagnostics for the admin panel: index size, payload counts and a
 * per-item verdict using the exact same rules as GET /api/news (status +
 * time window; version filtering is per-device and checked separately).
 */
async function feedHealth(redis: Redis): Promise<{
  indexSize: number;
  payloadCount: number;
  liveCount: number;
  orphanIds: string[];
  items: FeedHealthItem[];
}> {
  const ids = (await redis.zrange<string[]>('news:index', 0, -1)) ?? [];
  const items: FeedHealthItem[] = [];
  const orphanIds: string[] = [];
  let payloadCount = 0;
  for (let i = 0; i < ids.length; i += 20) {
    const pipe = redis.pipeline();
    for (const id of ids.slice(i, i + 20)) pipe.get(`news:item:${id}`);
    const chunk = await pipe.exec();
    const slice = ids.slice(i, i + 20);
    (chunk as unknown[]).forEach((r, j) => {
      const v = (r as { result?: unknown })?.result ?? r;
      if (!v) {
        orphanIds.push(slice[j]);
        return;
      }
      payloadCount++;
      const verdict = verdictFor(v);
      if (verdict) items.push(verdict);
      else orphanIds.push(slice[j]);
    });
  }
  items.sort((a, b) => Number(b.liveOnPublicFeed) - Number(a.liveOnPublicFeed));
  return {
    indexSize: ids.length,
    payloadCount,
    liveCount: items.filter((x) => x.liveOnPublicFeed).length,
    orphanIds,
    items,
  };
}

async function audit(redis: Redis, ip: string, action: string, id?: string) {
  try {
    const key = `news:audit:${Date.now()}:${crypto.randomBytes(4).toString('hex')}`;
    await redis.set(key, JSON.stringify({ ts: new Date().toISOString(), ip: ipHash(ip), action, id: id ?? null }), { ex: 90 * 86400 });
    const keys = await redis.keys('news:audit:*');
    if (Array.isArray(keys) && keys.length > 500) {
      keys.sort();
      const drop = keys.slice(0, keys.length - 500);
      for (let i = 0; i < drop.length; i += 100) await redis.del(...drop.slice(i, i + 100));
    }
  } catch { /* best effort */ }
}

async function requireSession(req: VercelRequest, redis: Redis, secret: string): Promise<{ ok: boolean; csrf?: string }> {
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
  } catch {
    return { ok: false };
  }
  const sess = await redis.get<{ csrf: string }>(`news_admin_session:${tokenId}`);
  if (!sess || typeof sess !== 'object' || !sess.csrf) return { ok: false };
  // Header preferred; JSON body fallback. Query-string CSRF is rejected (URL leak risk).
  const headerCsrf = (req.headers['x-csrf-token'] as string) || (req.body?.csrf as string);
  if (req.method !== 'GET' && headerCsrf !== sess.csrf) return { ok: false };
  return { ok: true, csrf: sess.csrf };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  const action = String(req.query.action ?? '');
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.NEWS_ADMIN_PASSWORD) {
    return res.status(500).json({
      error: 'Missing Environment Configuration',
      details: 'UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN and NEWS_ADMIN_PASSWORD are required.',
    });
  }
  const SECRET = process.env.NEWS_ADMIN_PASSWORD as string;
  const redis = Redis.fromEnv();
  const ip = clientIp(req);
  const isLocal = process.env.NODE_ENV === 'development';

  try {
  // Ban check
  if (!isLocal) {
    try {
      const banned = await redis.get(`newsban:${ip}`);
      if (banned) return res.status(403).json({ error: 'IP locked for 15 minutes after failed attempts.' });
    } catch { /* ignore */ }
  }

  // Login (no session needed)
  if (action === 'login' && req.method === 'POST') {
    if ((req.query.pw as string) !== undefined) return res.status(400).json({ error: 'Password in URL is rejected. Use JSON body.' });
    const pw = String(req.body?.password ?? req.body?.pw ?? '');
    if (!pw) return res.status(400).json({ error: 'Password required.' });
    const ok = crypto.timingSafeEqual(sha256(pw.trim()), sha256(SECRET.trim()));
    if (!ok) {
      let fails = 0;
      try {
        fails = await redis.incr(`newsfails:${ip}`);
        if (fails === 1) await redis.expire(`newsfails:${ip}`, 900);
        if (fails >= 5) await redis.set(`newsban:${ip}`, '1', { ex: 900 });
      } catch { /* ignore */ }
      return res.status(401).json({ error: `Invalid password. (${Math.max(0, 5 - fails)} attempts remaining)` });
    }
    try { await redis.del(`newsfails:${ip}`); } catch { /* ignore */ }
    const tokenId = crypto.randomBytes(32).toString('hex');
    const mac = crypto.createHmac('sha256', SECRET).update(tokenId).digest('hex');
    const csrf = crypto.randomBytes(16).toString('hex');
    await redis.set(`news_admin_session:${tokenId}`, JSON.stringify({ csrf }), { ex: 6 * 3600 });
    res.setHeader('Set-Cookie', `news_admin_session=${tokenId}.${mac}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=21600`);
    await audit(redis, ip, 'login');
    return res.status(200).json({ ok: true, csrf });
  }

  // Everything else needs session
  const sess = await requireSession(req, redis, SECRET);
  if (!sess.ok) return res.status(401).json({ error: 'Unauthorized. Login at /admin/news.' });

  if (action === 'logout') {
    const cookies = parseCookies(req);
    const tokenId = (cookies['news_admin_session'] || '').split('.')[0];
    if (tokenId) { try { await redis.del(`news_admin_session:${tokenId}`); } catch { /* ignore */ } }
    res.setHeader('Set-Cookie', 'news_admin_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    return res.status(200).json({ ok: true });
  }

  if (action === 'list' && req.method === 'GET') {
    const ids = await redis.zrange<string[]>('news:index', 0, -1);
    const keys = (ids || []).map((id) => `news:item:${id}`);
    const out: unknown[] = [];
    for (let i = 0; i < keys.length; i += 20) {
      const pipe = redis.pipeline();
      for (const k of keys.slice(i, i + 20)) pipe.get(k);
      const chunk = await pipe.exec();
      for (const r of chunk as unknown[]) {
        const v = (r as { result?: unknown })?.result ?? r;
        if (v) out.push(typeof v === 'string' ? JSON.parse(v as string) : v);
      }
    }
    return res.status(200).json({ items: out, count: out.length, csrf: sess.csrf });
  }

  if (action === 'audit' && req.method === 'GET') {
    const keys = await redis.keys('news:audit:*');
    keys.sort().reverse();
    const out: unknown[] = [];
    for (const k of keys.slice(0, 100)) {
      const v = await redis.get(k);
      out.push(typeof v === 'string' ? JSON.parse(v) : v);
    }
    return res.status(200).json({ audit: out });
  }

  if (action === 'feed-health' && req.method === 'GET') {
    return res.status(200).json(await feedHealth(redis));
  }

  // Remove index members whose payload is gone (failed/partial writes).
  if (action === 'repair-index' && req.method === 'POST') {
    const ids = (await redis.zrange<string[]>('news:index', 0, -1)) ?? [];
    const orphans: string[] = [];
    for (let i = 0; i < ids.length; i += 20) {
      const pipe = redis.pipeline();
      for (const id of ids.slice(i, i + 20)) pipe.get(`news:item:${id}`);
      const chunk = await pipe.exec();
      const slice = ids.slice(i, i + 20);
      (chunk as unknown[]).forEach((r, j) => {
        const v = (r as { result?: unknown })?.result ?? r;
        if (!v) orphans.push(slice[j]);
      });
    }
    if (orphans.length > 0) {
      for (let i = 0; i < orphans.length; i += 100) {
        await redis.zrem('news:index', ...orphans.slice(i, i + 100));
      }
    }
    await audit(redis, ip, 'repair-index');
    return res.status(200).json({ ok: true, removed: orphans.length, orphans });
  }

  const hosts = await allowedHosts(redis);

  if (action === 'create' && req.method === 'POST') {
    const { errors, item } = validateItem((req.body?.item ?? req.body ?? {}) as Draft, hosts);
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });
    const now = new Date().toISOString();
    const full = { schemaVersion: 1, id: newId(), createdAt: now, updatedAt: now, ...item } as Record<string, unknown>;
    await redis.set(`news:item:${full.id}`, JSON.stringify(full));
    const pubRaw = full.publishAt as string | null;
    const score = pubRaw ? Date.parse(String(pubRaw)) : Date.parse(now);
    await redis.zadd('news:index', { score: Number.isFinite(score) ? score : Date.now(), member: String(full.id) });
    await audit(redis, ip, 'create', String(full.id));
    const created = verdictFor(full);
    return res.status(200).json({ ok: true, item: full, visibility: created });
  }

  if ((action === 'update' || action === 'publish' || action === 'unpublish' || action === 'archive') && req.method === 'POST') {
    const id = String(req.body?.id ?? '');
    if (!id) return res.status(400).json({ error: 'id required' });
    const raw = await redis.get(`news:item:${id}`);
    if (!raw) return res.status(404).json({ error: 'not found' });
    const cur = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<string, unknown>;
    let patch: Record<string, unknown> = {};
    if (action === 'publish') patch = { status: 'published' };
    else if (action === 'unpublish') patch = { status: 'draft' };
    else if (action === 'archive') patch = { status: 'archived' };
    else patch = ((req.body?.patch ?? req.body?.item ?? {}) as Record<string, unknown>);
    const { errors, item } = validateItem(patch as Draft, hosts, true);
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });
    const next = { ...cur, ...item, id, updatedAt: new Date().toISOString(), schemaVersion: 1 } as Record<string, unknown>;
    await redis.set(`news:item:${id}`, JSON.stringify(next));
    const nextPub = next.publishAt as string | null;
    if (nextPub) await redis.zadd('news:index', { score: Date.parse(String(nextPub)), member: id });
    await audit(redis, ip, action, id);
    const updated = verdictFor(next);
    return res.status(200).json({ ok: true, item: next, visibility: updated });
  }

  if (action === 'delete' && req.method === 'POST') {
    const id = String(req.body?.id ?? '');
    if (!id) return res.status(400).json({ error: 'id required' });
    await redis.del(`news:item:${id}`);
    await redis.zrem('news:index', id);
    await audit(redis, ip, 'delete', id);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (e: unknown) {
    console.error('[news-admin] handler error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
