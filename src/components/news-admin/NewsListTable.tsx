import { useEffect, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { describeTargeting, type NewsItem } from '@/lib/news-schema';
import { getVisibilityVerdict } from '@/lib/newsVerdict';

/**
 * Copies the stable public anchor (same URL the app's share button hands out).
 * Lives inside the row's overflow menu; keeps the menu open so "Link copied ✓"
 * is actually visible before it closes.
 */
function CopyLinkMenuItem({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <DropdownMenuItem
      className="gap-2"
      onSelect={async (event) => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/news#news-${id}`);
          setCopied(true);
        } catch {
          // Clipboard unavailable (permissions) — no banner worth raising here.
        }
        event.preventDefault();
      }}
    >
      {copied ? 'Link copied ✓' : 'Copy public link'}
    </DropdownMenuItem>
  );
}

/**
 * Initial-load skeleton: the real fetch is in flight, so nothing may claim the
 * list is empty. Three rows with the same silhouette as real cards.
 */
function LoadingRows() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading announcements">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="rounded-[24px]">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
              <Skeleton className="h-5 w-2/3 max-w-md" />
              <Skeleton className="h-4 w-1/2 max-w-sm" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function NewsListTable({
  items,
  selected,
  onToggleSelect,
  onEdit,
  onClone,
  onAction,
  loading = false,
  emptyTitle = 'No announcements here',
  emptyHint,
  onCreate,
}: {
  items: NewsItem[];
  selected?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onEdit: (item: NewsItem) => void;
  onClone: (item: NewsItem) => void;
  onAction: (action: string, id: string) => Promise<void>;
  /** True while the first fetch after login is in flight (list still empty). */
  loading?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
  onCreate?: () => void;
}) {
  if (loading && items.length === 0) return <LoadingRows />;

  if (items.length === 0) {
    return (
      <Card className="rounded-[28px]">
        <CardContent className="grid place-items-center gap-2 p-10 text-center">
          <p className="font-bold">{emptyTitle}</p>
          {emptyHint ? <p className="text-sm text-muted-foreground">{emptyHint}</p> : null}
          {onCreate ? (
            <Button className="mt-2 rounded-full font-bold" onClick={onCreate}>
              + New announcement
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((n) => {
        const verdict = getVisibilityVerdict(n);
        const checked = selected?.has(n.id) ?? false;
        return (
          <Card
            key={n.id}
            className={`rounded-[24px] transition-colors ${checked ? 'border-primary/40 ring-1 ring-inset ring-primary/50' : ''}`}
          >
            <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
              {onToggleSelect && (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleSelect(n.id)}
                  aria-label={`Select ${n.title}`}
                  className="h-5 w-5 shrink-0 accent-current"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={n.status === 'published' ? 'default' : 'secondary'} className="rounded-full">{n.status}</Badge>
                  <Badge variant="outline" className="rounded-full capitalize">{n.priority}</Badge>
                  {n.pinned ? <Badge variant="outline" className="rounded-full">Pinned</Badge> : null}
                  {n.notify === false ? <Badge variant="outline" className="rounded-full">Silent</Badge> : null}
                  {n.disappearing ? <Badge variant="outline" className="rounded-full">Disappearing</Badge> : null}
                  {n.actionUrl ? (
                    <Badge variant="outline" className="max-w-[180px] truncate rounded-full" title={`Action: ${n.actionUrl}`}>
                      ↗ {n.actionLabel || 'Action'}
                    </Badge>
                  ) : null}
                  {verdict.live ? (
                    <Badge className="rounded-full border-emerald-500/30 bg-emerald-500/15 text-emerald-300">LIVE on /news</Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full" title={verdict.reason}>
                      {verdict.reason.length > 40 ? `${verdict.reason.slice(0, 40)}…` : verdict.reason}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 truncate text-base font-bold" title={n.title}>{n.title}</div>
                <div className="text-xs text-muted-foreground" title={`Updated ${n.updatedAt ? new Date(n.updatedAt).toLocaleString() : '—'} local · publish ${n.publishAt ? new Date(n.publishAt).toLocaleString() : 'now'} · expiry ${n.expiresAt ? new Date(n.expiresAt).toLocaleString() : 'never'}`}>
                  {describeTargeting(n)} · {n.frequency}{n.frequency === 'interval' ? `/${n.intervalHours}h` : ''} · upd {n.updatedAt?.slice(0, 16).replace('T', ' ')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => onEdit(n)}>Edit</Button>
                {n.status !== 'published' ? (
                  <Button size="sm" className="rounded-full" onClick={() => onAction('publish', n.id)}>Publish</Button>
                ) : (
                  <Button size="sm" variant="secondary" className="rounded-full" onClick={() => onAction('unpublish', n.id)}>Unpublish</Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-full px-0"
                      aria-label={`More actions for ${n.title}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl">
                    <CopyLinkMenuItem id={n.id} />
                    <DropdownMenuItem className="gap-2" onClick={() => onClone(n)}>Clone</DropdownMenuItem>
                    {n.status !== 'archived' ? (
                      <DropdownMenuItem className="gap-2" onClick={() => onAction('archive', n.id)}>Archive</DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 text-red-300 focus:bg-red-500/10 focus:text-red-200"
                      onClick={async () => {
                        if (confirm(`Delete "${n.title}"?`)) await onAction('delete', n.id);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
