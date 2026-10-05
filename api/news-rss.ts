import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

/**
 * Toolz News RSS — `GET /api/news-rss` (RSS 2.0).
 * Same visibility rules as the public feed (published + time window, no
 * version filtering). CDN-cached like /api/news. Never fails hard.
 */
const SITE = 'https://toolz-app.vercel.app';

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripMd(s: string): string {
  return String(s ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[>\s-]+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).end();
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  const empty = (reason: string) =>
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Toolz news</title><link>${SITE}/news</link><description>Announcements from the Toolz team. ${esc(reason)}</description></channel></rss>`;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(200).send(empty('Feed unavailable.'));
  }
  try {
    const redis = Redis.fromEnv();
    const ids = (await redis.zrange<string[]>('news:index', 0, -1)) ?? [];
    if (ids.length === 0) return res.status(200).send(empty('No announcements yet.'));
    const pipe = redis.pipeline();
    for (const id of ids.slice(0, 100)) pipe.get(`news:item:${id}`);
    const raw = await pipe.exec();
    const now = Date.now();
    const items: { id: string; title: string; body: string; publishAt: string | null; imageUrl?: string | null }[] = [];
    for (const r of raw as unknown[]) {
      const v = (r as { result?: unknown })?.result ?? r;
      const it = (typeof v === 'string' ? safeParse(v) : v) as Record<string, unknown> | null;
      if (!it || typeof it !== 'object' || typeof it.id !== 'string') continue;
      if (String(it.status ?? '') !== 'published') continue;
      const pub = typeof it.publishAt === 'string' ? it.publishAt : null;
      const exp = typeof it.expiresAt === 'string' ? it.expiresAt : null;
      if (pub) { const t = Date.parse(pub); if (Number.isFinite(t) && now < t) continue; }
      if (exp) { const t = Date.parse(exp); if (Number.isFinite(t) && now >= t) continue; }
      items.push({
        id: String(it.id),
        title: String(it.title ?? '(untitled)'),
        body: String(it.body ?? ''),
        publishAt: pub,
        imageUrl: typeof it.imageUrl === 'string' ? it.imageUrl : null,
      });
    }
    items.sort((a, b) => {
      const pa = a.publishAt ? Date.parse(a.publishAt) : 0;
      const pb = b.publishAt ? Date.parse(b.publishAt) : 0;
      return pb - pa;
    });
    const top = items.slice(0, 20);
    const xmlItems = top
      .map((n) => {
        const pubDate = n.publishAt ? new Date(n.publishAt).toUTCString() : new Date().toUTCString();
        const link = `${SITE}/news#news-${encodeURIComponent(n.id)}`;
        const desc = stripMd(n.body);
        const enclosure =
          n.imageUrl && n.imageUrl.startsWith('https://')
            ? `<enclosure url="${esc(n.imageUrl)}" type="image/jpeg" />`
            : '';
        return `<item><title>${esc(n.title)}</title><link>${esc(link)}</link><guid isPermaLink="true">${esc(link)}</guid><pubDate>${esc(pubDate)}</pubDate><description>${esc(desc)}</description>${enclosure}</item>`;
      })
      .join('');
    const rss =
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>` +
      `<title>Toolz news</title><link>${SITE}/news</link>` +
      `<description>Every Toolz announcement — changelogs, fixes and notices.</description>` +
      `<language>en</language><lastBuildDate>${esc(new Date().toUTCString())}</lastBuildDate>` +
      xmlItems +
      `</channel></rss>`;
    return res.status(200).send(rss);
  } catch (e: unknown) {
    console.error('[news-rss] error:', e);
    return res.status(200).send(empty('Feed unavailable.'));
  }
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}
