import { useEffect, useState } from 'react';
import type { NewsItem } from '@/lib/news-schema';

/**
 * Public Toolz News feed (`GET /api/news?all=1` — published + time-valid,
 * no version filtering). Used by the home section and the /news page.
 * Distinguishes feed failure (`unavailable`) from a genuinely empty feed
 * so the UI can be honest about breakage.
 */
export function usePublicNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // no-store: a heuristically-cached empty feed once made /news look
        // permanently empty; this payload is tiny, freshness wins.
        const res = await fetch('/api/news?all=1', { cache: 'no-store' });
        const data = (await res.json().catch(() => null)) as { news?: NewsItem[]; degraded?: boolean } | null;
        if (cancelled) return;
        if (!res.ok || !data || !Array.isArray(data.news) || data.degraded) {
          setUnavailable(true);
        } else {
          setItems(data.news);
        }
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, unavailable };
}

export function formatNewsDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
