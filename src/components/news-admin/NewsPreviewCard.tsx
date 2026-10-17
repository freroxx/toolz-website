import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewsBody } from '@/components/news/NewsBody';
import type { NewsItem } from '@/lib/news-schema';

function priorityColor(p: string) {
  switch (p) {
    case 'critical': return 'bg-red-500/15 text-red-300 border-red-500/30';
    case 'feature': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'promo': return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
    default: return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  }
}

/** Phone-frame preview mimicking the Android M3 Expressive popup. */
export function NewsPreviewCard({ item }: { item: Partial<NewsItem> }) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-[28px] border border-white/10 bg-zinc-950 p-4 shadow-2xl">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />
      <Card className="rounded-[24px] border-white/10">
        <div className="grid gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`rounded-full border ${priorityColor(item.priority ?? 'info')}`}>{item.priority ?? 'info'}</Badge>
            {item.pinned ? <Badge variant="outline" className="rounded-full">Pinned</Badge> : null}
            <span className="ml-auto text-xs text-muted-foreground">{item.frequency ?? 'once'}</span>
            {item.dismissible !== false ? <span title="Dismiss" className="text-xs text-muted-foreground">✕</span> : null}
          </div>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="aspect-video w-full rounded-[20px] object-cover" loading="lazy" />
          ) : null}
          <div className="text-lg font-extrabold tracking-tight">{item.title || 'Title preview'}</div>
          <div className="text-sm text-muted-foreground">
            <NewsBody body={item.body || 'Body preview…'} compact />
          </div>
          {/* One filled primary button, like the app: the CTA when an Action URL
              is set, otherwise Got it. A custom label without a URL never shows. */}
          <div className="pt-1">
            {item.actionUrl ? (
              <Button className="w-full rounded-full font-bold">{item.actionLabel || 'Open'}</Button>
            ) : (
              <Button variant="secondary" className="w-full rounded-full font-bold">Got it</Button>
            )}
          </div>
          <Button variant="link" className="h-auto justify-start p-0 text-xs">View all news →</Button>
        </div>
      </Card>
    </div>
  );
}
