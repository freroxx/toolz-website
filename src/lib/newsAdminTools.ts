import type { NewsItem } from './news-schema';

/** Pure admin helpers — no fetch, fully unit-tested. */

export function buildBulkOps(ids: string[], action: 'publish' | 'unpublish' | 'archive' | 'delete') {
  const clean = [...new Set(ids.map((s) => String(s ?? '').trim()).filter(Boolean))].slice(0, 50);
  return clean.map((id) => ({ action, id }));
}

export type NewsSort = 'updated' | 'published' | 'title';

export function filterAdminItems(items: NewsItem[], tab: string, q: string): NewsItem[] {
  const now = Date.now();
  const query = q.trim().toLowerCase();
  return items.filter((n) => {
    if (tab === 'published' && n.status !== 'published') return false;
    if (tab === 'drafts' && n.status !== 'draft') return false;
    if (tab === 'archived' && n.status !== 'archived') return false;
    if (tab === 'critical' && n.priority !== 'critical') return false;
    if (tab === 'scheduled' && !(n.status === 'published' && n.publishAt && Date.parse(n.publishAt) > now)) return false;
    if (tab === 'expired' && !(n.expiresAt && Date.parse(n.expiresAt) <= now)) return false;
    if (query && !`${n.title} ${n.body}`.toLowerCase().includes(query)) return false;
    return true;
  });
}

export function sortAdminItems(items: NewsItem[], sort: NewsSort): NewsItem[] {
  const arr = [...items];
  if (sort === 'title') arr.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'published') arr.sort((a, b) => (Date.parse(b.publishAt ?? b.updatedAt ?? '') || 0) - (Date.parse(a.publishAt ?? a.updatedAt ?? '') || 0));
  else arr.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  return arr;
}

export function exportFilename(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  // UTC so filenames sort the same on every machine.
  return `toolz-news-backup-${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}-${p(now.getUTCHours())}${p(now.getUTCMinutes())}.json`;
}

export function duplicateTitles(items: NewsItem[]): string[] {
  const seen = new Map<string, number>();
  for (const n of items) {
    const k = n.title.trim().toLowerCase();
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, c]) => c > 1).map(([k]) => k);
}
