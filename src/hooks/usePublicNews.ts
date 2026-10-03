import { useEffect, useState } from 'react';
import type { NewsItem } from '@/lib/news-schema';

/**
 * Public Toolz News feed (`GET /api/news?all=1` — published + time-valid,
 * no version filtering). Used by the home section and the /news page.
 * Never throws; empty list on any failure.
 */
export function usePublicNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/news?all=1');
        const data = (await res.json()) as { news?: NewsItem[] };
        if (!cancelled && res.ok && Array.isArray(data.news)) {
          setItems(data.news);
        }
      } catch {
        /* empty state handles it */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading };
}

export function formatNewsDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
