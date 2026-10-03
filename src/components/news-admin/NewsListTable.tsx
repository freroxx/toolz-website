import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { describeTargeting, type NewsItem } from '@/lib/news-schema';
import { getVisibilityVerdict } from '@/lib/newsVerdict';

export function NewsListTable({
  items,
  onEdit,
  onClone,
  onAction,
}: {
  items: NewsItem[];
  onEdit: (item: NewsItem) => void;
  onClone: (item: NewsItem) => void;
  onAction: (action: string, id: string) => Promise<void>;
}) {
  if (items.length === 0) {
    return (
      <Card className="rounded-[28px]">
        <CardContent className="p-10 text-center text-muted-foreground">No news yet. Create the first announcement.</CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-3">
      {items.map((n) => {
        const verdict = getVisibilityVerdict(n);
        return (
        <Card key={n.id} className="rounded-[24px]">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={n.status === 'published' ? 'default' : 'secondary'} className="rounded-full">{n.status}</Badge>
                <Badge variant="outline" className="rounded-full">{n.priority}</Badge>
                {n.pinned ? <Badge variant="outline" className="rounded-full">Pinned</Badge> : null}
                {n.notify === false ? <Badge variant="outline" className="rounded-full">Silent</Badge> : null}
                {n.disappearing ? <Badge variant="outline" className="rounded-full">Disappearing</Badge> : null}
                {verdict.live ? (
                  <Badge className="rounded-full border-emerald-500/30 bg-emerald-500/15 text-emerald-300">LIVE on /news</Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full" title={verdict.reason}>
                    {verdict.reason.length > 40 ? `${verdict.reason.slice(0, 40)}…` : verdict.reason}
                  </Badge>
                )}
              </div>
              <div className="mt-2 truncate text-base font-bold">{n.title}</div>
              <div className="text-xs text-muted-foreground">
                {describeTargeting(n)} · {n.frequency}{n.frequency === 'interval' ? `/${n.intervalHours}h` : ''} · upd {n.updatedAt?.slice(0, 16).replace('T', ' ')}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => onEdit(n)}>Edit</Button>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onClone(n)}>Clone</Button>
              {n.status !== 'published' ? (
                <Button size="sm" className="rounded-full" onClick={() => onAction('publish', n.id)}>Publish</Button>
              ) : (
                <Button size="sm" variant="secondary" className="rounded-full" onClick={() => onAction('unpublish', n.id)}>Unpublish</Button>
              )}
              {n.status !== 'archived' ? (
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onAction('archive', n.id)}>Archive</Button>
              ) : null}
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full"
                onClick={async () => {
                  if (confirm(`Delete "${n.title}"?`)) await onAction('delete', n.id);
                }}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}
