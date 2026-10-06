import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNewsAdmin } from '@/hooks/useNewsAdmin';
import type { NewsItem } from '@/lib/news-schema';
import { duplicateTitles, filterAdminItems, sortAdminItems, type NewsSort } from '@/lib/newsAdminTools';
import { NewsLoginCard } from '@/components/news-admin/NewsLoginCard';
import { NewsListTable } from '@/components/news-admin/NewsListTable';
import { NewsEditorDialog } from '@/components/news-admin/NewsEditorDialog';
import { NewsAuditLog } from '@/components/news-admin/NewsAuditLog';
import { NewsFeedCheck } from '@/components/news-admin/NewsFeedCheck';
import { NewsTestLab } from '@/components/news-admin/NewsTestLab';
import { NewsStatusDashboard } from '@/components/news-admin/NewsStatusDashboard';

export default function AdminNews() {
  const { authed, restoring, loading, items, audit, login, logout, refresh, refreshAudit, restore, feedHealth, bulk, restoreItem, feedHistory, simulate, exportBackup, importBackup, uploadImage, verifySaved, mutate } = useNewsAdmin();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<NewsSort>('updated');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<{ id: string; title: string } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<{ live: boolean; text: string } | null>(null);

  useEffect(() => {
    restore().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authed) {
      refresh().catch((e) => setErr(e instanceof Error ? e.message : 'Load failed'));
      refreshAudit().catch(() => {});
    }
  }, [authed, refresh, refreshAudit]);

  const filtered = useMemo(() => {
    return sortAdminItems(filterAdminItems(items, tab, q), sort);
  }, [items, tab, q, sort]);

  const dupes = useMemo(() => duplicateTitles(items), [items]);

  // Keyboard shortcuts: n = new, / = search. No AI slop — plain, predictable.
  useEffect(() => {
    if (!authed) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') { setEditing(null); setEditorOpen(true); }
      if (e.key === '/') { e.preventDefault(); document.querySelector<HTMLInputElement>('input[placeholder^="Search"]')?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authed]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulk = async (action: 'publish' | 'unpublish' | 'archive' | 'delete') => {
    const ids = [...selected].filter((id) => filtered.some((n) => n.id === id));
    if (ids.length === 0) return;
    if (!confirm(`${action} ${ids.length} selected item(s)?`)) return;
    setBulkBusy(true);
    setErr(null);
    try {
      const r = await bulk(action, ids);
      const failed = (r.results ?? []).filter((x) => !x.ok);
      if (failed.length > 0) setErr(`Bulk ${action}: ${failed.length} failed (${failed.slice(0, 3).map((f) => f.id).join(', ')})`);
      if (action === 'delete') setLastDeleted(null);
      setSelected(new Set());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Bulk action failed');
    } finally {
      setBulkBusy(false);
    }
  };

  if (restoring) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  if (!authed) return <NewsLoginCard onLogin={login} loading={loading} />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Toolz News Admin</h1>
          <p className="text-sm text-muted-foreground">
            {items.filter((i) => i.status === 'published').length} published · {items.filter((i) => i.status === 'draft').length} drafts · visible to apps within ~1 min (auto-sync on change)
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => window.open('/api/news?appVersion=1.1.6', '_blank')}>Public JSON</Button>
          <Button variant="outline" className="rounded-full" onClick={() => logout()}>Lock</Button>
          <Button
            className="rounded-full font-bold"
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
          >
            + New announcement
          </Button>
        </div>
      </div>

      {err && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{err}</div>}
      {saveNote && (
        <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${saveNote.live ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
          {saveNote.text}
        </div>
      )}

      {dupes.length > 0 && (
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
          Duplicate titles: {dupes.slice(0, 3).join(' · ')}{dupes.length > 3 ? ` +${dupes.length - 3} more` : ''} — consider renaming before publishing.
        </div>
      )}
      {lastDeleted && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold">
          Deleted “{lastDeleted.title}”. Undo within 7 days?
          <span className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={async () => {
                setErr(null);
                try {
                  await restoreItem(lastDeleted.id);
                  setLastDeleted(null);
                } catch (e) {
                  setErr(e instanceof Error ? e.message : 'Restore failed');
                }
              }}
            >
              Undo delete
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setLastDeleted(null)}>Dismiss</Button>
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-full">
            <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
            <TabsTrigger value="published" className="rounded-full">Published</TabsTrigger>
            <TabsTrigger value="drafts" className="rounded-full">Drafts</TabsTrigger>
            <TabsTrigger value="archived" className="rounded-full">Archived</TabsTrigger>
            <TabsTrigger value="critical" className="rounded-full">Critical</TabsTrigger>
            <TabsTrigger value="scheduled" className="rounded-full">Scheduled</TabsTrigger>
            <TabsTrigger value="expired" className="rounded-full">Expired</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title/body… (/ focuses)" className="max-w-xs rounded-full" />
        <select value={sort} onChange={(e) => setSort(e.target.value as NewsSort)} className="h-10 rounded-full border border-input bg-background px-3 text-sm" aria-label="Sort">
          <option value="updated">Updated</option>
          <option value="published">Publish date</option>
          <option value="title">Title</option>
        </select>
        <Button variant="ghost" className="rounded-full" onClick={() => { refresh().catch(() => {}); refreshAudit().catch(() => {}); }}>Refresh</Button>
        <span className="text-xs text-muted-foreground">{filtered.length}/{items.length}{selected.size > 0 ? ` · ${selected.size} selected` : ''}</span>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm">
          <span className="font-bold">{selected.size} selected</span>
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setSelected(new Set(filtered.map((n) => n.id)))}>Select shown</Button>
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setSelected(new Set())}>Clear</Button>
          <span className="ml-auto flex flex-wrap gap-2">
            {(['publish', 'unpublish', 'archive', 'delete'] as const).map((a) => (
              <Button key={a} size="sm" variant={a === 'delete' ? 'destructive' : 'outline'} className="rounded-full capitalize" disabled={bulkBusy} onClick={() => runBulk(a)}>
                {bulkBusy ? 'Working…' : a}
              </Button>
            ))}
          </span>
        </div>
      )}

      <NewsListTable
        items={filtered}
        selected={selected}
        onToggleSelect={toggleSelect}
        onEdit={(n) => {
          setEditing(n);
          setEditorOpen(true);
        }}
        onClone={(n) => {
          const { id: _drop, ...rest } = n;
          void _drop;
          setEditing({ ...rest, id: '', title: `${n.title} (copy)`, status: 'draft', createdAt: '', updatedAt: '' } as NewsItem);
          setEditorOpen(true);
        }}
        onAction={async (action, id) => {
          setErr(null);
          try {
            const target = items.find((n) => n.id === id);
            await mutate(action, { id });
            if (action === 'delete' && target) setLastDeleted({ id, title: target.title });
          } catch (e) {
            setErr(e instanceof Error ? e.message : 'Action failed');
          }
        }}
      />

      <h2 className="mb-3 mt-10 text-lg font-extrabold">Test lab</h2>
      <NewsTestLab items={items} onSimulate={simulate} />

      <h2 className="mb-3 mt-10 text-lg font-extrabold">Feed check</h2>
      <NewsFeedCheck
        onCheck={feedHealth}
        onRepair={async () => {
          const data = await mutate('repair-index', {});
          return { removed: Number((data as Record<string, unknown>).removed ?? 0) };
        }}
      />

      <h2 className="mb-3 mt-10 text-lg font-extrabold">Status + backups</h2>
      <NewsStatusDashboard onHistory={feedHistory} onExport={exportBackup} onImport={importBackup} />

      <h2 className="mb-3 mt-10 text-lg font-extrabold">Audit log</h2>
      <NewsAuditLog audit={audit} />

      <NewsEditorDialog
        open={editorOpen}
        initial={editing}
        saving={saving}
        onClose={() => setEditorOpen(false)}
        onUploadImage={uploadImage}
        onSave={async (form) => {
          setSaving(true);
          setSaveNote(null);
          try {
            let res: Record<string, unknown>;
            if (editing && editing.id) res = (await mutate('update', { id: editing.id, patch: form })) as Record<string, unknown>;
            else res = (await mutate('create', { item: form })) as Record<string, unknown>;
            const vis = res.visibility as { liveOnPublicFeed?: boolean; reason?: string } | undefined;
            const savedItem = (res.item ?? {}) as { id?: unknown; status?: unknown; title?: unknown; imageUrl?: unknown; publishAt?: unknown; expiresAt?: unknown };
            const serverLive = !!vis?.liveOnPublicFeed;
            if (!vis || !serverLive) {
              setSaveNote({ live: false, text: `Saved — NOT live on /news: ${String(vis?.reason ?? 'unknown reason')}.` });
            } else {
              // Server says live — confirm against the actual public feed.
              const check = await verifySaved(String(savedItem.id ?? ''), {
                status: savedItem.status,
                title: savedItem.title,
                imageUrl: savedItem.imageUrl,
                publishAt: savedItem.publishAt,
                expiresAt: savedItem.expiresAt,
              });
              setSaveNote(
                check.confirmed
                  ? { live: true, text: 'Saved & verified live on /news.' }
                  : { live: false, text: `Saved (server: live) — public feed hasn't caught up: ${check.detail}. Apps auto-sync within minutes on change.` },
              );
            }
            setEditorOpen(false);
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
