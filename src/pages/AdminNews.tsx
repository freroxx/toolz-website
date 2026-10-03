import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNewsAdmin } from '@/hooks/useNewsAdmin';
import type { NewsItem } from '@/lib/news-schema';
import { NewsLoginCard } from '@/components/news-admin/NewsLoginCard';
import { NewsListTable } from '@/components/news-admin/NewsListTable';
import { NewsEditorDialog } from '@/components/news-admin/NewsEditorDialog';
import { NewsAuditLog } from '@/components/news-admin/NewsAuditLog';

export default function AdminNews() {
  const { authed, restoring, loading, items, audit, login, logout, refresh, refreshAudit, restore, mutate } = useNewsAdmin();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    const now = Date.now();
    return items.filter((n) => {
      if (tab === 'published' && n.status !== 'published') return false;
      if (tab === 'drafts' && n.status !== 'draft') return false;
      if (tab === 'archived' && n.status !== 'archived') return false;
      if (tab === 'expired' && !(n.expiresAt && Date.parse(n.expiresAt) <= now)) return false;
      if (q && !`${n.title} ${n.body}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, tab, q]);

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
            {items.filter((i) => i.status === 'published').length} published · {items.filter((i) => i.status === 'draft').length} drafts · visible to apps within ~5 min
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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-full">
            <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
            <TabsTrigger value="published" className="rounded-full">Published</TabsTrigger>
            <TabsTrigger value="drafts" className="rounded-full">Drafts</TabsTrigger>
            <TabsTrigger value="archived" className="rounded-full">Archived</TabsTrigger>
            <TabsTrigger value="expired" className="rounded-full">Expired</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title/body…" className="max-w-xs rounded-full" />
        <Button variant="ghost" className="rounded-full" onClick={() => { refresh().catch(() => {}); refreshAudit().catch(() => {}); }}>Refresh</Button>
      </div>

      <NewsListTable
        items={filtered}
        onEdit={(n) => {
          setEditing(n);
          setEditorOpen(true);
        }}
        onAction={async (action, id) => {
          setErr(null);
          try {
            await mutate(action, { id });
          } catch (e) {
            setErr(e instanceof Error ? e.message : 'Action failed');
          }
        }}
      />

      <h2 className="mb-3 mt-10 text-lg font-extrabold">Audit log</h2>
      <NewsAuditLog audit={audit} />

      <NewsEditorDialog
        open={editorOpen}
        initial={editing}
        saving={saving}
        onClose={() => setEditorOpen(false)}
        onSave={async (form) => {
          setSaving(true);
          try {
            if (editing) await mutate('update', { id: editing.id, patch: form });
            else await mutate('create', { item: form });
            setEditorOpen(false);
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
