import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { NewsItem } from '@/lib/news-schema';
import { describeTargeting, versionEligible } from '@/lib/news-schema';
import { describeWhen, getVisibilityVerdict } from '@/lib/newsVerdict';

/**
 * Testing tools: dry-run "would version X see this?" without touching prod.
 * Local rules first (instant), server `simulate` on demand (authoritative).
 */
export function NewsTestLab({
  items,
  onSimulate,
}: {
  items: NewsItem[];
  onSimulate: (item: unknown, appVersion: string) => Promise<{ live?: boolean; verdict?: string; reasons?: string[] }>;
}) {
  const [itemId, setItemId] = useState('');
  const [version, setVersion] = useState('1.1.6');
  const [serverResult, setServerResult] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const item = useMemo(() => items.find((n) => n.id === itemId) ?? null, [items, itemId]);
  const local = useMemo(() => {
    if (!item) return null;
    const v = version.trim() || '0.0.0';
    const verdict = getVisibilityVerdict(item);
    const eligible = versionEligible(item, v);
    const timeline: { label: string; at: string }[] = [];
    if (item.publishAt && Date.parse(item.publishAt) > Date.now()) timeline.push({ label: 'goes live', at: item.publishAt });
    if (item.expiresAt) timeline.push({ label: item.disappearing ? 'auto-deleted' : 'expires', at: item.expiresAt });
    timeline.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    return { verdict, eligible, live: verdict.live && eligible, timeline };
  }, [item, version]);

  return (
    <Card className="rounded-[24px]">
      <CardHeader>
        <CardTitle className="text-base font-extrabold">Test lab — dry run, no writes</CardTitle>
        <p className="text-xs text-muted-foreground">Pick an item + app version. Local rules answer instantly; server check is authoritative.</p>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Item</Label>
            <select
              value={itemId}
              onChange={(e) => { setItemId(e.target.value); setServerResult(null); }}
              className="h-10 rounded-2xl border border-input bg-background px-3 text-sm"
            >
              <option value="">Select…</option>
              {items.map((n) => (
                <option key={n.id} value={n.id}>{n.title.slice(0, 60)} · {n.status}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>App version</Label>
            <Input value={version} onChange={(e) => { setVersion(e.target.value); setServerResult(null); }} placeholder="1.1.6" className="rounded-2xl" />
          </div>
        </div>
        {item && local && (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full">{describeTargeting(item)}</Badge>
              <Badge className={`rounded-full ${local.live ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                {local.live ? 'WOULD SEE' : 'HIDDEN'}
              </Badge>
              {!local.verdict.live && <Badge variant="outline" className="rounded-full">{local.verdict.reason}</Badge>}
              {!local.eligible && <Badge variant="outline" className="rounded-full">version-blocked</Badge>}
              {item.notify === false && <Badge variant="outline" className="rounded-full">silent (no notification)</Badge>}
              {item.priority === 'critical' && <Badge variant="outline" className="rounded-full">critical bypasses toggles</Badge>}
            </div>
            {local.timeline.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Timeline: {local.timeline.map((t) => `${t.label} ${describeWhen(t.at)}`).join(' → ')}
              </p>
            )}
            <div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={checking}
                onClick={async () => {
                  setChecking(true);
                  setServerResult(null);
                  try {
                    const r = await onSimulate(item, version.trim() || '0.0.0');
                    setServerResult(r.live ? `Server: LIVE (${r.verdict ?? 'live'})` : `Server: hidden — ${(r.reasons ?? []).join('; ') || r.verdict}`);
                  } catch (e) {
                    setServerResult(e instanceof Error ? e.message : 'Server check failed');
                  } finally {
                    setChecking(false);
                  }
                }}
              >
                {checking ? 'Checking…' : 'Confirm with server'}
              </Button>
              {serverResult && <p className="mt-2 text-xs text-muted-foreground">{serverResult}</p>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
