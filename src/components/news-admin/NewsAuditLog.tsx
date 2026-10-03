import { Card, CardContent } from '@/components/ui/card';

export function NewsAuditLog({ audit }: { audit: unknown[] }) {
  if (!audit.length) return <p className="text-sm text-muted-foreground">No admin activity yet.</p>;
  return (
    <Card className="rounded-[24px]">
      <CardContent className="grid gap-2 p-5 text-sm">
        {(audit as { ts?: string; action?: string; id?: string; ip?: string }[]).map((a, i) => (
          <div key={i} className="flex flex-wrap gap-2 border-b border-white/5 pb-2 last:border-0">
            <span className="font-mono text-xs text-muted-foreground">{a.ts}</span>
            <span className="font-bold">{a.action}</span>
            {a.id ? <span className="font-mono text-xs">{a.id}</span> : null}
            {a.ip ? <span className="ml-auto font-mono text-xs text-muted-foreground">ip:{a.ip}</span> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
