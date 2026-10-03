import { useCallback, useState } from 'react';
import type { NewsItem } from '@/lib/news-schema';

async function post(action: string, body: unknown, csrf?: string | null) {
  const res = await fetch(`/api/news-admin?action=${action}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as Record<string, unknown>;
}

async function get(action: string) {
  const res = await fetch(`/api/news-admin?action=${action}`, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as Record<string, unknown>;
}

export function useNewsAdmin() {
  const [csrf, setCsrf] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [audit, setAudit] = useState<unknown[]>([]);

  const login = useCallback(async (password: string) => {
    setLoading(true);
    try {
      const data = await post('login', { password });
      setCsrf(String(data.csrf));
      setAuthed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await post('logout', {}, csrf);
    } catch { /* ignore */ }
    setCsrf(null);
    setAuthed(false);
    setItems([]);
  }, [csrf]);

  const refresh = useCallback(async () => {
    const data = await get('list');
    setItems(((data.items as NewsItem[]) ?? []).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
    if (data.csrf) setCsrf(String(data.csrf));
    setAuthed(true);
    return data.items;
  }, []);

  // Session restore: a valid HttpOnly cookie survives page refresh, so try
  // an authed read before forcing re-login. Never throws.
  const restore = useCallback(async () => {
    setRestoring(true);
    try {
      await get('list').then((data) => {
        setItems(((data.items as NewsItem[]) ?? []).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
        if (data.csrf) setCsrf(String(data.csrf));
        setAuthed(true);
      });
    } catch {
      setAuthed(false);
    } finally {
      setRestoring(false);
    }
  }, []);

  const refreshAudit = useCallback(async () => {
    const data = await get('audit');
    setAudit((data.audit as unknown[]) ?? []);
  }, []);

  const mutate = useCallback(
    async (action: string, body: unknown) => {
      const data = await post(action, body, csrf);
      await refresh().catch(() => {});
      return data;
    },
    [csrf, refresh],
  );

  return { csrf, authed, restoring, loading, items, audit, login, logout, refresh, refreshAudit, restore, mutate };
}
