import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Toolz News image upload — `POST /api/news-image`.
 * Same session+CSRF auth as news-admin. Accepts a base64 image (raw or
 * data-URL), downscaled client-side by the editor, and forwards it to ImgBB
 * using the server-side IMGBB_API_KEY (never exposed to the browser).
 * Returns the public display URL for use as a news imageUrl.
 *
 * Mirrors the Whisper pipeline (whisper-image-upload edge function → i.ibb.co
 * URLs) without requiring a Supabase session: the admin session is enough.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_HOSTS = ['i.ibb.co', 'ibb.co'];

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

async function authed(req: VercelRequest, redis: Redis, secret: string): Promise<boolean> {
  const raw = parseCookies(req)['news_admin_session'];
  if (!raw) return false;
  const dot = raw.lastIndexOf('.');
  if (dot < 0) return false;
  const tokenId = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  const expect = crypto.createHmac('sha256', secret).update(tokenId).digest('hex');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expect))) return false;
  } catch {
    return false;
  }
  const sess = await redis.get<{ csrf: string }>(`news_admin_session:${tokenId}`);
  if (!sess || typeof sess !== 'object' || !sess.csrf) return false;
  const csrf = (req.headers['x-csrf-token'] as string) || (req.body?.csrf as string);
  return csrf === sess.csrf;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.NEWS_ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Missing Environment Configuration' });
  }
  if (!process.env.IMGBB_API_KEY) {
    return res.status(500).json({ error: 'Image uploads are not configured (IMGBB_API_KEY missing).' });
  }

  try {
    const redis = Redis.fromEnv();
    const SECRET = process.env.NEWS_ADMIN_PASSWORD as string;
    if (!(await authed(req, redis, SECRET))) {
      return res.status(401).json({ error: 'Unauthorized. Login at /admin/news.' });
    }

    let b64 = String(req.body?.image ?? '');
    const name = String(req.body?.name ?? 'toolz-news').slice(0, 80);
    if (!b64) return res.status(400).json({ error: 'image (base64) required.' });
    // Accept data URLs by stripping the prefix.
    const comma = b64.indexOf(',');
    if (b64.startsWith('data:') && comma >= 0) b64 = b64.slice(comma + 1);
    b64 = b64.replace(/\s+/g, '');
    if (!/^[A-Za-z0-9+/=]+$/.test(b64)) return res.status(400).json({ error: 'Invalid base64 image.' });

    let bytes: Buffer;
    try {
      bytes = Buffer.from(b64, 'base64');
    } catch {
      return res.status(400).json({ error: 'Invalid base64 image.' });
    }
    if (bytes.length === 0 || bytes.length > MAX_BYTES) {
      return res.status(400).json({ error: `Image must be 1 byte–5 MB (got ${(bytes.length / 1024).toFixed(0)} KB).` });
    }

    const form = new URLSearchParams();
    form.set('key', process.env.IMGBB_API_KEY as string);
    form.set('image', b64);
    form.set('name', name);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30_000);
    let up: Response;
    try {
      up = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    const payload = (await up.json().catch(() => null)) as {
      success?: boolean;
      data?: { display_url?: string; delete_url?: string };
      error?: { message?: string };
    } | null;
    if (!up.ok || !payload?.success || !payload.data?.display_url) {
      const msg = payload?.error?.message || `ImgBB HTTP ${up.status}`;
      return res.status(502).json({ error: `Image host rejected the upload: ${msg}` });
    }
    const url = payload.data.display_url;
    let host = '';
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch {
      return res.status(502).json({ error: 'Image host returned an invalid URL.' });
    }
    if (!ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      return res.status(502).json({ error: 'Image host returned an unexpected host.' });
    }
    return res.status(200).json({ ok: true, url, deleteUrl: payload.data.delete_url ?? null });
  } catch (e: unknown) {
    console.error('[news-image] handler error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
