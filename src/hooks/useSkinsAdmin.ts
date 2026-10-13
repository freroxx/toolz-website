import { useCallback, useState } from 'react';
import type { SkinItem } from '@/lib/skin-schema';

async function post(action: string, body: unknown, csrf?: string | null) {
  const res = await fetch(`/api/skins?action=${action}`, {
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
  const res = await fetch(`/api/skins?action=${action}`, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as Record<string, unknown>;
}

export function useSkinsAdmin() {
  const [csrf, setCsrf] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SkinItem[]>([]);

  const refresh = useCallback(async () => {
    const data = await get('list');
    const list = ((data.items as SkinItem[]) ?? []).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    setItems(list);
    if (data.csrf) setCsrf(String(data.csrf));
    setAuthed(true);
    return list;
  }, []);

  const restore = useCallback(async () => {
    setRestoring(true);
    try {
      await get('list').then((data) => {
        const list = ((data.items as SkinItem[]) ?? []).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        setItems(list);
        if (data.csrf) setCsrf(String(data.csrf));
        setAuthed(true);
      });
    } catch {
      setAuthed(false);
    } finally {
      setRestoring(false);
    }
  }, []);

  const mutate = useCallback(async (action: string, body: unknown) => {
    const data = await post(action, body, csrf);
    await refresh().catch(() => {});
    return data;
  }, [csrf, refresh]);

  return { authed, restoring, loading, setLoading, items, csrf, refresh, restore, mutate };
}
