import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { newsDefaults, newsFrequencies, newsItemSchema, newsPriorities, newsStatuses, type NewsItem } from '@/lib/news-schema';
import { NewsPreviewCard } from './NewsPreviewCard';

type Form = typeof newsDefaults & { id?: string };

function toLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fromLocal(s: string): string | null {
  if (!s.trim()) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function NewsEditorDialog({
  open,
  initial,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: NewsItem | null;
  saving: boolean;
  onClose: () => void;
  onSave: (form: Form) => Promise<void>;
}) {
  const [form, setForm] = useState<Form>({ ...newsDefaults });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setErr(null);
      setForm(initial ? { ...newsDefaults, ...initial } : { ...newsDefaults });
    }
  }, [open, initial]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto rounded-[28px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{initial ? 'Edit announcement' : 'New announcement'}</DialogTitle>
        </DialogHeader>
        {err && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{err}</div>}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={form.title} maxLength={120} onChange={(e) => set('title', e.target.value)} placeholder="What's new in 1.2" className="rounded-2xl" />
            </div>
            <div className="grid gap-2">
              <Label>Body (markdown-lite, no HTML)</Label>
              <Textarea value={form.body} maxLength={2000} rows={6} onChange={(e) => set('body', e.target.value)} placeholder="Bold, lists and links supported" className="rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <select value={form.priority} onChange={(e) => set('priority', e.target.value as Form['priority'])} className="h-10 rounded-2xl border border-input bg-background px-3 text-sm">
                  {newsPriorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => set('status', e.target.value as Form['status'])} className="h-10 rounded-2xl border border-input bg-background px-3 text-sm">
                  {newsStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Image URL (https, optional)</Label>
              <Input value={form.imageUrl ?? ''} onChange={(e) => set('imageUrl', e.target.value || null)} placeholder="https://…" className="rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Action label</Label>
                <Input value={form.actionLabel ?? ''} maxLength={30} onChange={(e) => set('actionLabel', e.target.value || null)} placeholder="Try it" className="rounded-2xl" />
              </div>
              <div className="grid gap-2">
                <Label>Action URL</Label>
                <Input value={form.actionUrl ?? ''} onChange={(e) => set('actionUrl', e.target.value || null)} placeholder="https://… or toolz://…" className="rounded-2xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Min version (optional)</Label>
                <Input value={form.minAppVersion ?? ''} onChange={(e) => set('minAppVersion', e.target.value || null)} placeholder="1.1.0" className="rounded-2xl" />
              </div>
              <div className="grid gap-2">
                <Label>Max version (optional)</Label>
                <Input value={form.maxAppVersion ?? ''} onChange={(e) => set('maxAppVersion', e.target.value || null)} placeholder="1.9.9" className="rounded-2xl" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Only versions (comma separated, empty = all)</Label>
              <Input value={(form.onlyVersions ?? []).join(', ')} onChange={(e) => set('onlyVersions', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="1.1.6, 1.2.0" className="rounded-2xl" />
            </div>
            <div className="grid gap-2">
              <Label>Excluded versions (comma separated)</Label>
              <Input value={(form.excludedVersions ?? []).join(', ')} onChange={(e) => set('excludedVersions', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="1.1.5-beta" className="rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Publish at (empty = now)</Label>
                <Input type="datetime-local" value={toLocal(form.publishAt ?? null)} onChange={(e) => set('publishAt', fromLocal(e.target.value))} className="rounded-2xl" />
              </div>
              <div className="grid gap-2">
                <Label>Expires at (empty = never)</Label>
                <Input type="datetime-local" value={toLocal(form.expiresAt ?? null)} onChange={(e) => set('expiresAt', fromLocal(e.target.value))} className="rounded-2xl" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Delay (s)</Label>
                <Input type="number" min={0} max={3600} value={form.delaySeconds} onChange={(e) => set('delaySeconds', Number(e.target.value))} className="rounded-2xl" />
              </div>
              <div className="grid gap-2">
                <Label>Frequency</Label>
                <select value={form.frequency} onChange={(e) => set('frequency', e.target.value as Form['frequency'])} className="h-10 rounded-2xl border border-input bg-background px-3 text-sm">
                  {newsFrequencies.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Every N hours</Label>
                <Input type="number" min={1} max={720} value={form.intervalHours ?? ''} onChange={(e) => set('intervalHours', e.target.value ? Number(e.target.value) : null)} className="rounded-2xl" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Max impressions per device (empty = unlimited)</Label>
              <Input type="number" min={1} max={100} value={form.maxImpressions ?? ''} onChange={(e) => set('maxImpressions', e.target.value ? Number(e.target.value) : null)} className="rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm font-medium">
              {(['pinned', 'dismissible', 'showInHistory', 'notify'] as const).map((k) => (
                <label key={k} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                  {k}
                  <Switch checked={!!form[k]} onCheckedChange={(v) => set(k, v as Form[typeof k])} />
                </label>
              ))}
              <label className="col-span-2 flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                requiresAction (critical only, blocks ✕)
                <Switch checked={!!form.requiresAction} onCheckedChange={(v) => set('requiresAction', v)} />
              </label>
            </div>
          </div>
          <div className="grid content-start gap-3">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Live popup preview</Label>
            <NewsPreviewCard item={form} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button
            className="rounded-full font-bold"
            disabled={saving}
            onClick={async () => {
              setErr(null);
              const parsed = newsItemSchema.safeParse({ ...form, onlyVersions: form.onlyVersions ?? [], excludedVersions: form.excludedVersions ?? [] });
              if (!parsed.success) {
                setErr(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
                return;
              }
              try {
                await onSave(form);
              } catch (e) {
                setErr(e instanceof Error ? e.message : 'Save failed');
              }
            }}
          >
            {saving ? 'Saving…' : 'Save announcement'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
