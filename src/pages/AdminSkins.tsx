import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSkinsAdmin } from '@/hooks/useSkinsAdmin';
import { SkinsLoginCard } from '@/components/skins-admin/SkinsLoginCard';
import type { SkinItem } from '@/lib/skin-schema';

function argbToCss(n: number | null | undefined): string {
  if (n == null) return 'transparent';
  const a = (n >>> 24) & 0xff;
  const r = (n >>> 16) & 0xff;
  const g = (n >>> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r},${g},${b},${(a / 255).toFixed(2)})`;
}

export default function AdminSkins() {
  const skins = useSkinsAdmin();
  const [tab, setTab] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [q, setQ] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    skins.restore().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skins.authed) skins.refresh().catch((e) => setErr(e instanceof Error ? e.message : 'Load failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skins.authed]);

  const filtered = useMemo(() => {
    return skins.items.filter((s) => {
      if (tab !== 'all' && s.status !== tab) return false;
      if (q && !`${s.name} ${s.author || ''} ${s.id}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [skins.items, tab, q]);

  if (skins.restoring) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  if (!skins.authed) {
    return (
      <SkinsLoginCard
        onLogin={async (password: string) => {
          // Own SKINS_ADMIN_PASSWORD session (set it on Vercel), then load skins.
          await skins.login(password);
          await skins.refresh();
        }}
        loading={skins.loading}
      />
    );
  }

  const setStatus = async (action: 'publish' | 'unpublish' | 'archive' | 'delete', id: string) => {
    setErr(null);
    try {
      await skins.mutate(action === 'unpublish' ? 'unpublish' : action, action === 'delete' ? { id } : { ids: [id] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Action failed');
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Toolz Skins Admin</h1>
          <p className="text-sm text-muted-foreground">
            {skins.items.filter((i) => i.status === 'published').length} published · {skins.items.filter((i) => i.status === 'draft').length} drafts · community submits land here as drafts
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => window.open('/api/skins', '_blank')}>Public JSON</Button>
          <Button variant="outline" className="rounded-full" onClick={() => window.open('/admin/news', '_self')}>News admin</Button>
          <Button variant="ghost" className="rounded-full" onClick={() => skins.refresh().catch((e) => setErr(e instanceof Error ? e.message : 'Refresh failed'))}>Refresh</Button>
        </div>
      </div>

      {err && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{err}</div>}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'published', 'draft', 'archived'] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} className="rounded-full capitalize" onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/author…" className="max-w-xs rounded-full" />
        <span className="text-xs text-muted-foreground">{filtered.length}/{skins.items.length}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((s: SkinItem) => (
          <div key={s.id} className="rounded-3xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl font-black" style={{ background: argbToCss(s.primary ?? 0xff7b2fbe) }}>
                {s.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{s.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {s.themeMode.toLowerCase()} · {s.dynamicColor ? 'dynamic' : 'custom'} · {s.iconPresetId} · {s.author || 'community'}
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${s.status === 'published' ? 'bg-emerald-500/15 text-emerald-300' : s.status === 'draft' ? 'bg-amber-500/15 text-amber-200' : 'bg-white/10 text-muted-foreground'}`}>
                {s.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: argbToCss(s.primary ?? 0xff7b2fbe) }} />
                <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: argbToCss(s.secondary ?? 0xffb07fe8) }} />
              </div>
              <span className="ml-auto flex gap-2">
                {s.status !== 'published' && (
                  <Button size="sm" className="rounded-full" onClick={() => setStatus('publish', s.id)}>Approve</Button>
                )}
                {s.status === 'published' && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus('unpublish', s.id)}>Unpublish</Button>
                )}
                {s.status !== 'archived' && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setStatus('archive', s.id)}>Archive</Button>
                )}
                <Button size="sm" variant="destructive" className="rounded-full" onClick={() => { if (confirm(`Delete ${s.name}?`)) setStatus('delete', s.id); }}>Delete</Button>
              </span>
            </div>
            <pre className="mt-3 max-h-32 overflow-auto rounded-2xl bg-black/30 p-3 text-[11px] text-muted-foreground">{JSON.stringify(s, null, 2)}</pre>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-white/15 p-10 text-center text-sm text-muted-foreground">
          No skins here yet. Community submits from the app appear as drafts. The app always ships 6 legacy presets offline.
        </div>
      )}
    </div>
  );
}
