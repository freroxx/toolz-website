import { useEffect, useState } from 'react';
import type { NewsItem } from '@/lib/news-schema';

/**
 * Public Toolz News feed (`GET /api/news?all=1` — published + time-valid,
 * no version filtering). Used by the home section and the /news page.
 * Distinguishes feed failure (`unavailable`) from a genuinely empty feed
 * so the UI can be honest about breakage.
 *
 * Shared module cache: home teaser + /news mount fetch once per page-load.
 * Polls the cheap `news-version` counter every 60 s and refetches only when
 * the generation (or next transition hint) moves — deletes/edits land
 * without a full reload.
 */
type CacheState = { items: NewsItem[]; v: number; transition: string | null; at: number };
let sharedCache: CacheState | null = null;
let sharedPromise: Promise<CacheState> | null = null;

async function fetchFeed(): Promise<CacheState> {
  // no-store: a heuristically-cached empty feed once made /news look
  // permanently empty; this payload is tiny, freshness wins.
  const res = await fetch('/api/news?all=1', { cache: 'no-store' });
  const data = (await res.json().catch(() => null)) as { news?: NewsItem[]; degraded?: boolean; v?: unknown; nextTransitionAt?: unknown } | null;
  if (!res.ok || !data || !Array.isArray(data.news) || data.degraded) throw new Error('unavailable');
  const v = typeof data.v === 'number' ? data.v : -1;
  const transition = typeof data.nextTransitionAt === 'string' ? data.nextTransitionAt : null;
  sharedCache = { items: data.news, v, transition, at: Date.now() };
  return sharedCache;
}

function cachedFeed(): Promise<CacheState> {
  if (sharedCache) return Promise.resolve(sharedCache);
  if (!sharedPromise) sharedPromise = fetchFeed().finally(() => { sharedPromise = null; });
  return sharedPromise;
}

export function usePublicNews(pollMs = 60_000) {
  const [items, setItems] = useState<NewsItem[]>(() => sharedCache?.items ?? []);
  const [loading, setLoading] = useState(() => sharedCache == null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    (async () => {
      try {
        const cached = await cachedFeed();
        if (cancelled) return;
        setItems(cached.items);
      } catch {
        if (!cancelled && sharedCache == null) setUnavailable(true);
        else if (!cancelled && sharedCache) setItems(sharedCache.items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    // Poll the tiny version counter; refetch the full feed only on change.
    // Also wakes at nextTransitionAt so scheduled/expiring items flip on time.
    if (pollMs > 0) {
      timer = setInterval(async () => {
        try {
          const res = await fetch('/api/news-version', { cache: 'no-store' });
          const data = (await res.json().catch(() => null)) as { v?: unknown; nextTransitionAt?: unknown } | null;
          if (!res.ok || !data) return;
          const rv = typeof data.v === 'number' ? data.v : -1;
          const rt = typeof data.nextTransitionAt === 'string' ? data.nextTransitionAt : null;
          const cur = sharedCache;
          const changed = !cur || (rv >= 0 && rv !== cur.v) || rt !== cur.transition;
          // Scheduled transition due: the version counter doesn't move on time
          // transitions, so refetch when we pass the hinted time.
          const due = cur?.transition ? Date.parse(cur.transition) <= Date.now() : false;
          if (changed || due) {
            const fresh = await fetchFeed();
            if (!cancelled) { setItems(fresh.items); setUnavailable(false); }
          }
        } catch { /* keep stale cache; next tick retries */ }
      }, pollMs);
    }
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [pollMs]);

  return { items, loading, unavailable };
}

export function formatNewsDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
