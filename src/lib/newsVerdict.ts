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
