import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AuditEntry {
  ts?: string;
  action?: string;
  id?: string | null;
  ip?: string;
  title?: string | null;
}

const FILTERS = [
  { id: 'all', label: 'All', match: (_: string) => true },
  { id: 'content', label: 'Content', match: (a: string) => ['create', 'update', 'publish', 'unpublish', 'archive', 'delete'].includes(a) },
  { id: 'publishes', label: 'Publishes', match: (a: string) => a === 'publish' || a === 'create' },
  { id: 'deletes', label: 'Deletes', match: (a: string) => a === 'delete' },
  { id: 'access', label: 'Access', match: (a: string) => a === 'login' || a.startsWith('repair') },
] as const;

const ACTION_STYLE: Record<string, string> = {
  create: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  update: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  publish: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  unpublish: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  archive: 'border-white/20 bg-white/5 text-muted-foreground',
  delete: 'border-red-500/30 bg-red-500/10 text-red-300',
  login: 'border-white/20 bg-white/5 text-muted-foreground',
};

function relativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(t).toLocaleDateString();
}

function fullDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

export function NewsAuditLog({ audit }: { audit: unknown[] }) {
  const [filter, setFilter] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const entries = useMemo(
    () =>
      (audit as AuditEntry[]).filter((a) =>
        (FILTERS.find((f) => f.id === filter) ?? FILTERS[0]).match(String(a.action ?? '')),
      ),
    [audit, filter],
  );

  if (!audit.length) return <p className="text-sm text-muted-foreground">No admin activity yet.</p>;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all active:scale-95 ${filter === f.id ? 'bg-primary text-primary-foreground' : 'border-white/10 text-muted-foreground'}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted-foreground">
          {entries.length} of {(audit as unknown[]).length}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing matches this filter.</p>
      ) : (
        <Card className="rounded-[24px]">
          <CardContent className="grid gap-1 p-3">
            {entries.map((a, i) => {
              const key = `${a.ts ?? ''}-${i}`;
              const open = openId === key;
              const style = ACTION_STYLE[String(a.action ?? '')] ?? 'border-white/10 bg-white/5 text-muted-foreground';
              return (
                <div key={key}>
                  <button
                    onClick={() => setOpenId(open ? null : key)}
                    className="flex w-full flex-wrap items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
                  >
                    <Badge className={`rounded-full border ${style}`}>{a.action ?? '?'}</Badge>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {a.title || <span className="font-mono text-xs text-muted-foreground">{a.id ?? '—'}</span>}
                    </span>
                    <span className="text-xs text-muted-foreground" title={fullDate(a.ts)}>
                      {relativeTime(a.ts)}
                    </span>
                  </button>
                  {open && (
                    <div className="mx-3 mb-2 grid gap-1 rounded-2xl bg-black/20 p-3 font-mono text-xs text-muted-foreground">
                      {a.title && <div>title: {a.title}</div>}
                      {a.id && <div>id: {a.id}</div>}
                      {a.ip && <div>actor: {a.ip} (hashed)</div>}
                      {a.ts && <div>at: {fullDate(a.ts)}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
