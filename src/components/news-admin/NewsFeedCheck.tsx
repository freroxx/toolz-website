import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface FeedHealthData {
  indexSize: number;
  payloadCount: number;
  liveCount: number;
  feedVersion: number;
  nextTransitionAt: string | null;
  orphanIds: string[];
  items: { id: string; title: string; status: string; liveOnPublicFeed: boolean; reason: string }[];
}

/**
 * Feed diagnostics: is /news actually serving anything, and if not, why.
 * Uses the authed ?action=feed-health endpoint (same rules as the public feed).
 */
export function NewsFeedCheck({
  onCheck,
  onRepair,
  autoRun = true,
}: {
  onCheck: () => Promise<FeedHealthData>;
  onRepair: () => Promise<{ removed: number }>;
  autoRun?: boolean;
}) {
  const [data, setData] = useState<FeedHealthData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [repaired, setRepaired] = useState<number | null>(null);

  const runCheck = async () => {
    setChecking(true);
    setErr(null);
    try {
      setData(await onCheck());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Feed check failed');
    } finally {
      setChecking(false);
    }
  };

  // Auto-run once on mount so deletes/edits are visible without manual clicks.
  useEffect(() => {
    if (autoRun) runCheck().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  return (
    <Card className="rounded-[24px]">
      <CardHeader className="flex flex-row flex-wrap items-center gap-3">
        <div>
          <CardTitle className="text-base font-extrabold">Feed check — will /news show anything?</CardTitle>
          <p className="text-xs text-muted-foreground">Same status + time rules as the public feed (version targeting is per-device).</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto rounded-full"
          disabled={checking}
          onClick={runCheck}
        >
          {checking ? 'Checking…' : data ? 'Re-check' : 'Run feed check'}
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => window.open('/api/news?all=1', '_blank')}>
          Public JSON
        </Button>
        {(data?.orphanIds.length ?? 0) > 0 && (
          <Button
            size="sm"
            variant="destructive"
            className="rounded-full"
            disabled={repairing}
            onClick={async () => {
              setRepairing(true);
              setErr(null);
              try {
                const r = await onRepair();
                setRepaired(r.removed);
                setData(await onCheck());
              } catch (e) {
                setErr(e instanceof Error ? e.message : 'Repair failed');
              } finally {
                setRepairing(false);
              }
            }}
          >
            {repairing ? 'Repairing…' : `Repair index (${data?.orphanIds.length})`}
          </Button>
        )}
      </CardHeader>
      {(err || data) && (
        <CardContent className="grid gap-2 text-sm">
          {err && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-300">{err}</div>}
          {repaired !== null && !err && (
            <p className="text-emerald-300">Removed {repaired} orphan index {repaired === 1 ? 'entry' : 'entries'}.</p>
          )}
          {data && (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full">index: {data.indexSize}</Badge>
                <Badge variant="outline" className="rounded-full">payloads: {data.payloadCount}</Badge>
                <Badge variant="outline" className="rounded-full" title="Feed generation — devices sync when this changes">gen: {data.feedVersion}</Badge>
                {data.nextTransitionAt && (
                  <Badge variant="outline" className="rounded-full" title={`Next scheduled change: ${data.nextTransitionAt}`}>
                    next: {data.nextTransitionAt.slice(0, 16).replace('T', ' ')}
                  </Badge>
                )}
                <Badge className={`rounded-full ${data.liveCount > 0 ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                  live on /news: {data.liveCount}
                </Badge>
                {data.orphanIds.length > 0 && (
                  <Badge variant="destructive" className="rounded-full">orphans: {data.orphanIds.length}</Badge>
                )}
              </div>
              {data.liveCount === 0 && (
                <p className="text-muted-foreground">
                  Nothing would render on /news right now. Publish an item with an open time window,
                  or check the per-item reasons below (draft / scheduled / expired / orphan).
                </p>
              )}
              {data.orphanIds.length > 0 && (
                <p className="font-mono text-xs text-muted-foreground">orphan index ids (no payload): {data.orphanIds.join(', ')}</p>
              )}
              <div className="grid gap-1">
                {data.items.map((it) => (
                  <div key={it.id} className="flex flex-wrap items-center gap-2 border-b border-white/5 py-1.5 last:border-0">
                    <span className="min-w-0 flex-1 truncate font-medium">{it.title}</span>
                    {it.liveOnPublicFeed ? (
                      <Badge className="rounded-full border-emerald-500/30 bg-emerald-500/15 text-emerald-300">LIVE</Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full" title={it.reason}>{it.reason}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
