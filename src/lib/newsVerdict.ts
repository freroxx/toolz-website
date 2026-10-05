import type { NewsItemForm } from './news-schema';

export type NewsVerdict =
  | { live: true; reason: 'live' }
  | { live: false; reason: 'draft (not published)' | 'archived' | `status=${string}` | `scheduled at ${string}` | `expired at ${string}` };

/**
 * Single implementation of the public-feed visibility verdict (status + time
 * window — the same rules as GET /api/news and ?action=feed-health).
 * Version targeting is per-device and checked separately via versionEligible.
 */
export function getVisibilityVerdict(
  item: Pick<NewsItemForm, 'status' | 'publishAt' | 'expiresAt'>,
  now: number = Date.now(),
): NewsVerdict {
  if (item.status !== 'published') {
    if (item.status === 'draft') return { live: false, reason: 'draft (not published)' };
    if (item.status === 'archived') return { live: false, reason: 'archived' };
    return { live: false, reason: `status=${item.status}` };
  }
  if (item.publishAt) {
    const t = Date.parse(item.publishAt);
    if (Number.isFinite(t) && now < t) {
      return { live: false, reason: `scheduled at ${item.publishAt}` };
    }
  }
  if (item.expiresAt) {
    const t = Date.parse(item.expiresAt);
    if (Number.isFinite(t) && now >= t) {
      return { live: false, reason: `expired at ${item.expiresAt}` };
    }
  }
  return { live: true, reason: 'live' };
}

/** Short relative description ("in 3h", "2d ago", "now") for schedule chips. */
export function describeWhen(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return 'now';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 'invalid date';
  const diff = t - now;
  if (Math.abs(diff) < 60_000) return 'now';
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const qty = days > 0 ? `${days}d` : hours > 0 ? `${hours}h` : `${mins}m`;
  return diff > 0 ? `in ${qty}` : `${qty} ago`;
}

export interface SavedSnapshot {
  status?: unknown;
  title?: unknown;
  imageUrl?: unknown;
  publishAt?: unknown;
  expiresAt?: unknown;
}

export interface FeedCheckItem {
  id?: unknown;
  status?: unknown;
  title?: unknown;
  imageUrl?: unknown;
  publishAt?: unknown;
  expiresAt?: unknown;
}

/**
 * Compares what was just saved against what the public feed actually serves
 * (fetched with preview=1 so CDN staleness can't hide a mismatch).
 * Returns confirmed=true only when the id is present AND the key fields match.
 */
export function compareSavedVsFeed(
  saved: SavedSnapshot,
  feedItem: FeedCheckItem | null | undefined,
): { confirmed: boolean; detail: string } {
  if (!feedItem) {
    return { confirmed: false, detail: 'not in the public feed yet (CDN ≤1 min, or filtered)' };
  }
  const mismatches: string[] = [];
  const norm = (v: unknown) => (v === null || v === undefined ? '' : String(v));
  if (norm(saved.status) && norm(feedItem.status) && norm(saved.status) !== norm(feedItem.status)) {
    mismatches.push(`status is ${norm(feedItem.status)}`);
  }
  if (norm(saved.title) !== norm(feedItem.title)) mismatches.push('title differs');
  if (norm(saved.imageUrl) !== norm(feedItem.imageUrl)) mismatches.push('image differs');
  if (norm(saved.publishAt) !== norm(feedItem.publishAt)) mismatches.push('publish time differs');
  if (norm(saved.expiresAt) !== norm(feedItem.expiresAt)) mismatches.push('expiry differs');
  if (mismatches.length > 0) {
    return { confirmed: false, detail: `feed shows stale values (${mismatches.join(', ')})` };
  }
  return { confirmed: true, detail: 'feed matches what was saved' };
}
