import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { exportFilename } from '@/lib/newsAdminTools';

type HistoryEntry = { ts?: unknown; action?: unknown; id?: unknown; title?: unknown };

/**
 * Status: feed-health snapshot + persistent change history + backup tools.
 * History comes from the audit trail (no new storage); export is a full dump.
 */
export function NewsStatusDashboard({
  onHistory,
  onExport,
  onImport,
}: {
  onHistory: () => Promise<unknown[]>;
  onExport: () => Promise<{ items?: unknown[]; count?: number; v?: number; exportedAt?: string }>;
  onImport: (items: unknown[]) => Promise<{ written?: number; errors?: string[] }>;
}) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const h = await onHistory();
      setHistory((h as HistoryEntry[]).slice(0, 50));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'History failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = async () => {
    setErr(null);
    setNote(null);
    try {
      const data = await onExport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setNote(`Exported ${data.count ?? 0} items (feed v${data.v ?? '?'}).`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Export failed');
    }
  };

  const upload = async (file: File) => {
    setErr(null);
    setNote(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { items?: unknown[] };
      const arr = Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? (parsed as unknown[]) : null;
      if (!arr) throw new Error('Backup must be {items:[…]} from Export.');
      if (!confirm(`Import ${arr.length} item(s)? Existing ids are overwritten.`)) return;
      const r = await onImport(arr);
      setNote(`Imported ${r.written ?? 0}${r.errors?.length ? `; ${r.errors.length} rejected: ${r.errors.slice(0, 3).join(' | ')}` : ''}.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Import failed');
    }
  };

  return (
    <Card className="rounded-[24px]">
      <CardHeader className="flex flex-row flex-wrap items-center gap-3">
        <div>
          <CardTitle className="text-base font-extrabold">Status + backups</CardTitle>
          <p className="text-xs text-muted-foreground">Last 50 feed changes (from audit trail) + full JSON backup.</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-full" disabled={loading} onClick={load}>
            {loading ? 'Loading…' : history.length ? 'Refresh history' : 'Load history'}
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" onClick={download}>Export backup</Button>
          <label className="inline-flex h-8 cursor-pointer items-center rounded-full border border-white/10 px-3 text-xs font-bold">
            Import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) upload(f).catch(() => {});
              }}
            />
          </label>
        </div>
      </CardHeader>
      {(err || note || history.length > 0) && (
        <CardContent className="grid gap-2 text-sm">
          {err && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-300">{err}</div>}
          {note && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-300">{note}</div>}
          {history.map((h, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 border-b border-white/5 py-1.5 text-xs last:border-0">
              <Badge variant="outline" className="rounded-full">{String(h.action ?? '?')}</Badge>
              <span className="min-w-0 flex-1 truncate font-medium">{String(h.title ?? h.id ?? '')}</span>
              <span className="font-mono text-muted-foreground">{String(h.ts ?? '').slice(0, 16).replace('T', ' ')}</span>
            </div>
          ))}
          {history.length === 0 && !loading && <p className="text-xs text-muted-foreground">No feed changes yet — publish something and it appears here.</p>}
        </CardContent>
      )}
    </Card>
  );
}
