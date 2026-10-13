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
  if (!res.ok) throw httpError(res.status, (data as { error?: string }).error);
  return data as Record<string, unknown>;
}

async function get(action: string) {
  const res = await fetch(`/api/skins?action=${action}`, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(res.status, (data as { error?: string }).error);
  return data as Record<string, unknown>;
}

function httpError(status: number, message?: string) {
  const err = new Error(message || `Request failed (${status})`);
  (err as unknown as { status: number }).status = status;
  return err;
}

function isAuthError(e: unknown) {
  return e instanceof Error && (e as unknown as { status?: number }).status === 401;
}

export function useSkinsAdmin() {
  const [csrf, setCsrf] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SkinItem[]>([]);

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
    try {
      const data = await get('list');
      const list = ((data.items as SkinItem[]) ?? []).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      setItems(list);
      if (data.csrf) setCsrf(String(data.csrf));
      setAuthed(true);
      return list;
    } catch (e) {
      // Only an expired/invalid session logs out. Server/network errors keep
      // the session so a bad refresh never kicks back to login.
      if (isAuthError(e)) {
        setCsrf(null);
        setAuthed(false);
        setItems([]);
      }
      throw e;
    }
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
    } catch (e) {
      // No session (401) means show login. Anything else (500/network) leaves
      // existing state alone so a transient failure never wipes the session.
      if (isAuthError(e)) {
        setAuthed(false);
      }
    } finally {
      setRestoring(false);
    }
  }, []);

  const mutate = useCallback(async (action: string, body: unknown) => {
    const data = await post(action, body, csrf);
    await refresh().catch(() => {});
    return data;
  }, [csrf, refresh]);

  return { authed, restoring, loading, setLoading, items, csrf, login, logout, refresh, restore, mutate };
}
