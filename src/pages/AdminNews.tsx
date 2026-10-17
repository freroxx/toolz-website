import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, Loader2, Plus, RefreshCw } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNewsAdmin } from '@/hooks/useNewsAdmin';
import type { NewsItem } from '@/lib/news-schema';
import { duplicateTitles, filterAdminItems, sortAdminItems, type NewsSort } from '@/lib/newsAdminTools';
import { getVisibilityVerdict } from '@/lib/newsVerdict';
import { NewsLoginCard } from '@/components/news-admin/NewsLoginCard';
import { NewsListTable } from '@/components/news-admin/NewsListTable';
import { NewsEditorDialog } from '@/components/news-admin/NewsEditorDialog';
import { NewsAuditLog } from '@/components/news-admin/NewsAuditLog';
import { NewsFeedCheck } from '@/components/news-admin/NewsFeedCheck';
import { NewsTestLab } from '@/components/news-admin/NewsTestLab';
import { NewsStatusDashboard } from '@/components/news-admin/NewsStatusDashboard';

/* Shared M3 expressive motion: springs tuned like the landing page, one
   entrance gesture — nothing loops, nothing bounces for decoration. */
const GESTURE = { type: 'spring', stiffness: 260, damping: 26 } as const;

/**
 * M3 collapsible disclosure for the audit trail. <h2><button> is the proper
 * pattern (valid HTML, one tab stop); chevron mirrors the open state.
 */
function AuditSection({ count, children }: { count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-10">
      <h2>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-xl py-2 pl-2 pr-3 text-left transition-colors hover:bg-[hsl(var(--md-surface-container-low))]"
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[hsl(var(--md-on-surface-variant))] transition-transform ${open ? '' : '-rotate-90'}`}
            aria-hidden="true"
          />
          <span className="font-extrabold">Audit log</span>
          <span className="rounded-md bg-[hsl(var(--md-surface-container-high))] px-1.5 py-0.5 text-xs tabular-nums text-[hsl(var(--md-on-surface-variant))]">{count}</span>
          {!open && (
            <span className="ml-auto hidden text-xs text-[hsl(var(--md-on-surface-variant))] sm:inline">Login, publish and edit history — 90 days</span>
          )}
        </button>
      </h2>
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

/**
 * Consolidated M3 notice banner. Tones come straight from Material roles:
 * ok → secondary container (positive), warn → tertiary container, error →
 * error container, info → surface container high. Enters with one spring.
 */
function Notice({ tone = 'info', children }: { tone?: 'ok' | 'warn' | 'error' | 'info'; children: ReactNode }) {
  const styles: Record<string, string> = {
    ok: 'border-[hsl(var(--md-secondary-container))] bg-[hsl(var(--md-secondary-container))] text-[hsl(var(--md-on-secondary-container))]',
    warn: 'border-[hsl(var(--md-tertiary-container))] bg-[hsl(var(--md-tertiary-container))] text-[hsl(var(--md-on-tertiary-container))]',
    error: 'border-[hsl(var(--md-error-container))] bg-[hsl(var(--md-error-container))] text-[hsl(var(--md-on-error-container))]',
    info: 'border-[hsl(var(--md-outline-variant))] bg-[hsl(var(--md-surface-container-high))] text-[hsl(var(--md-on-surface))]',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={GESTURE}
      className={`mb-3 rounded-xl border px-4 py-3 text-sm font-semibold ${styles[tone]}`}
    >
      {children}
    </motion.div>
  );
}

/* Filter tiles: the overview IS the list filter. Active tile fills with its
   Material container; every tile keeps a 2px category accent so the palette
   reads at a glance. */
const TILES: { id: string; label: string; accent: string; active: string }[] = [
  { id: 'all', label: 'All', accent: 'hsl(var(--md-outline-variant))', active: 'bg-[hsl(var(--md-surface-container-high))]' },
  { id: 'live', label: 'Live on /news', accent: 'hsl(var(--md-primary))', active: 'bg-[hsl(var(--md-primary-container))] text-[hsl(var(--md-on-primary-container))]' },
  { id: 'published', label: 'Published', accent: 'hsl(var(--md-secondary))', active: 'bg-[hsl(var(--md-secondary-container))] text-[hsl(var(--md-on-secondary-container))]' },
  { id: 'drafts', label: 'Drafts', accent: 'hsl(var(--md-tertiary))', active: 'bg-[hsl(var(--md-tertiary-container))] text-[hsl(var(--md-on-tertiary-container))]' },
  { id: 'scheduled', label: 'Scheduled', accent: 'hsl(var(--md-on-surface-variant))', active: 'bg-[hsl(var(--md-surface-container-high))]' },
  { id: 'critical', label: 'Critical', accent: 'hsl(var(--md-error))', active: 'bg-[hsl(var(--md-error-container))] text-[hsl(var(--md-on-error-container))]' },
  { id: 'expired', label: 'Expired', accent: 'hsl(var(--md-outline))', active: 'bg-[hsl(var(--md-surface-container-high))]' },
  { id: 'archived', label: 'Archived', accent: 'hsl(var(--md-outline))', active: 'bg-[hsl(var(--md-surface-container-high))]' },
];

/** Plain-language per-tile empty copy, used when no search term is active. */
const EMPTY_TAB_COPY: Record<string, string> = {
  all: 'No announcements yet — create the first one.',
  live: 'Nothing is visible on /news right now.',
  published: 'Nothing published right now.',
  drafts: 'No drafts. New items start as drafts.',
  archived: 'Nothing archived.',
  critical: 'No critical announcements. That is usually good news.',
  scheduled: 'Nothing scheduled in the future.',
  expired: 'No expired items.',
};

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
  const [refreshing, setRefreshing] = useState(false);

  // Headline numbers: what is on /news right now, and how the list splits.
  const counts = useMemo(() => {
    const keys = ['all', 'published', 'drafts', 'archived', 'critical', 'scheduled', 'expired'] as const;
    const base = Object.fromEntries(keys.map((k) => [k, filterAdminItems(items, k, '').length])) as Record<(typeof keys)[number], number>;
    return { ...base, live: items.filter((n) => getVisibilityVerdict(n).live).length };
  }, [items]);

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

  // 'live' is a client-side view over the same time-window rules the feed uses.
  const filtered = useMemo(() => {
    const base = tab === 'live' ? items.filter((n) => getVisibilityVerdict(n).live) : filterAdminItems(items, tab, q);
    return sortAdminItems(base, sort);
  }, [items, tab, q, sort]);

  const dupes = useMemo(() => duplicateTitles(items), [items]);

  // Keyboard shortcuts: n = new, / = search. Plain, predictable.
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
      // The banner sits at the top of the page; bring it into view instead
      // of failing silently offscreen while the user is scrolled deep.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBulkBusy(false);
    }
  };

  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-[hsl(var(--md-on-surface-variant))]">Checking session…</p>
      </div>
    );
  }

  if (!authed) return <NewsLoginCard onLogin={login} loading={loading} />;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16">
      {/* Header: identity + live pulse + global actions */}
      <div className="flex flex-wrap items-center gap-3 py-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">News admin</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-[hsl(var(--md-on-surface-variant))]">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: 'hsl(var(--md-secondary))' }}
                aria-hidden="true"
              />
              <span className="tabular-nums">{counts.live}</span> live on /news
            </span>
            <span className="tabular-nums">{counts.published} published</span>
            <span className="tabular-nums">{counts.drafts} drafts</span>
            <span>apps pick up changes within ~1 min</span>
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-xl font-semibold" onClick={() => window.open('/api/news?appVersion=1.1.6', '_blank')}>
            Public JSON (app)
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl font-semibold" onClick={() => logout()}>
            Lock
          </Button>
          <Button
            size="sm"
            className="rounded-xl font-bold"
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New announcement
          </Button>
        </div>
      </div>

      {/* Notices */}
      {err && <Notice tone="error">{err}</Notice>}
      {saveNote && <Notice tone={saveNote.live ? 'ok' : 'warn'}>{saveNote.text}</Notice>}
      {dupes.length > 0 && (
        <Notice tone="warn">
          Duplicate titles: {dupes.slice(0, 3).join(' · ')}{dupes.length > 3 ? ` +${dupes.length - 3} more` : ''} — consider renaming before publishing.
        </Notice>
      )}
      {lastDeleted && (
        <Notice tone="info">
          <span className="flex flex-wrap items-center gap-2">
            <span>
              Deleted “{lastDeleted.title}”. Undo within 7 days?
            </span>
            <span className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl font-semibold"
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
              <Button size="sm" variant="ghost" className="rounded-xl font-semibold" onClick={() => setLastDeleted(null)}>Dismiss</Button>
            </span>
          </span>
        </Notice>
      )}

      {/* Overview tiles = one-click filters */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {TILES.map((t, i) => {
          const active = tab === t.id;
          const value = counts[t.id as keyof typeof counts] ?? 0;
          return (
            <motion.button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(t.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...GESTURE, delay: Math.min(i * 0.04, 0.28) }}
              whileTap={{ scale: 0.97 }}
              className={`relative overflow-hidden rounded-2xl p-3 text-left transition-colors ${
                active
                  ? t.active
                  : 'bg-[hsl(var(--md-surface-container-lowest))] text-[hsl(var(--md-on-surface))] hover:bg-[hsl(var(--md-surface-container-low))]'
              }`}
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: t.accent, opacity: active ? 1 : 0.55 }} />
              <span className={`block text-2xl font-extrabold tabular-nums ${!active && t.id === 'critical' && value > 0 ? 'text-[hsl(var(--md-error))]' : ''}`}>
                {value}
              </span>
              <span className={`mt-0.5 block text-xs ${active ? 'opacity-80' : 'text-[hsl(var(--md-on-surface-variant))]'}`}>{t.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Sticky command bar: search / sort / refresh stay reachable, bulk bar
          slides in under them so selections made deep in the list stay actionable. */}
      <div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-[hsl(var(--md-outline-variant)/0.5)] bg-[hsl(var(--md-surface)/0.92)] px-4 py-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title/body… (/ focuses)"
            className="w-full max-w-sm rounded-xl border-[hsl(var(--md-outline-variant)/0.6)] bg-[hsl(var(--md-surface-container-low))]"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as NewsSort)}
            aria-label="Sort"
            className="h-10 rounded-xl border border-[hsl(var(--md-outline-variant)/0.6)] bg-[hsl(var(--md-surface-container-low))] px-3 text-sm"
          >
            <option value="updated">Updated</option>
            <option value="published">Publish date</option>
            <option value="title">Title</option>
          </select>
          <Button variant="outline" size="sm" className="rounded-xl font-semibold" disabled={refreshing} onClick={async () => { setRefreshing(true); try { await refresh(); await refreshAudit(); } catch { /* list keeps its last state */ } finally { setRefreshing(false); } }}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
          <span className="tabular-nums text-xs text-[hsl(var(--md-on-surface-variant))]">
            {filtered.length}/{items.length}
            {selected.size > 0 ? ` · ${selected.size} selected` : ''}
          </span>
        </div>

        <AnimatePresence initial={false}>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={GESTURE}
              className="overflow-hidden"
            >
              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--md-outline-variant)/0.5)] pt-2.5 text-sm">
                <span className="font-bold tabular-nums">{selected.size} selected</span>
                <Button size="sm" variant="ghost" className="rounded-xl font-semibold" onClick={() => setSelected(new Set(filtered.map((n) => n.id)))}>Select shown</Button>
                <Button size="sm" variant="ghost" className="rounded-xl font-semibold" onClick={() => setSelected(new Set())}>Clear</Button>
                <span className="ml-auto flex flex-wrap gap-2">
                  {(['publish', 'unpublish', 'archive', 'delete'] as const).map((a) => (
                    <Button key={a} size="sm" variant={a === 'delete' ? 'destructive' : 'outline'} className="rounded-xl font-semibold capitalize" disabled={bulkBusy} onClick={() => runBulk(a)}>
                      {bulkBusy ? 'Working…' : a}
                    </Button>
                  ))}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main dashboard: list first, tools in the rail; stacks on small screens. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <NewsListTable
            items={filtered}
            loading={loading}
            selected={selected}
            onToggleSelect={toggleSelect}
            emptyTitle={q.trim() ? `No matches for “${q.trim().slice(0, 60)}”` : (EMPTY_TAB_COPY[tab] ?? 'No announcements here')}
            emptyHint={q.trim() ? 'Try another filter or clear the search.' : undefined}
            onCreate={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
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
                // Same as bulk: surface the page-top banner instead of failing offscreen.
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />

          <AuditSection count={audit.length}>
            <NewsAuditLog audit={audit} />
          </AuditSection>
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-[72px]">
          <NewsFeedCheck
            onCheck={feedHealth}
            onRepair={async () => {
              const data = await mutate('repair-index', {});
              return { removed: Number((data as Record<string, unknown>).removed ?? 0) };
            }}
          />
          <NewsTestLab items={items} onSimulate={simulate} />
          <NewsStatusDashboard onHistory={feedHistory} onExport={exportBackup} onImport={importBackup} />
        </aside>
      </div>

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
