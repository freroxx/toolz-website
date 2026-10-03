import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { newsDefaults, newsFrequencies, newsItemSchema, describeTargeting, versionEligible, type NewsItem } from '@/lib/news-schema';
import { describeWhen, getVisibilityVerdict } from '@/lib/newsVerdict';
import { useUpdateManifest } from '@/hooks/use-update-manifest';
import { NewsPreviewCard } from './NewsPreviewCard';
import { NewsBody } from '@/components/news/NewsBody';

type Form = typeof newsDefaults & { id?: string };
type TabId = 'content' | 'targeting' | 'behavior' | 'preview';

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

function atMidnightPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

/**
 * Downscale an image in-browser (max 1600px side, JPEG q0.85) and return a
 * data URL, keeping uploads small before they reach the imgbb proxy.
 */
function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const MAX = 1600;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');
        ctx.drawImage(img, 0, 0, w, h);
        const out = canvas.toDataURL('image/jpeg', 0.85);
        URL.revokeObjectURL(url);
        resolve(out);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e instanceof Error ? e : new Error('Image processing failed'));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image file'));
    };
    img.src = url;
  });
}

const PRIORITY_COLORS: Record<string, string> = {
  info: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  feature: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  fix: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  promo: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  critical: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const TEMPLATES: { name: string; title: string; body: string; priority: Form['priority']; frequency: Form['frequency'] }[] = [
  {
    name: 'Changelog',
    title: "What's new in ",
    body: '## Highlights\n\n- \n- \n\n[Full changelog](https://github.com/freroxx/toolz/releases)',
    priority: 'feature',
    frequency: 'once',
  },
  {
    name: 'Hotfix',
    title: 'Critical fix: ',
    body: 'Please update as soon as possible. **Important** fix inside.',
    priority: 'critical',
    frequency: 'once',
  },
  {
    name: 'Promo',
    title: '',
    body: '',
    priority: 'promo',
    frequency: 'weekly',
  },
  {
    name: 'Maintenance',
    title: 'Scheduled maintenance',
    body: '> Some features may be briefly unavailable.\n\nWe will keep this notice updated.',
    priority: 'info',
    frequency: 'daily',
  },
];

const FREQUENCY_PRESETS: { name: string; frequency: Form['frequency']; intervalHours: number | null; maxImpressions: number | null }[] = [
  { name: 'Once', frequency: 'once', intervalHours: null, maxImpressions: null },
  { name: 'Every launch', frequency: 'every_launch', intervalHours: null, maxImpressions: null },
  { name: 'Daily', frequency: 'daily', intervalHours: null, maxImpressions: null },
  { name: 'Weekly ×4', frequency: 'weekly', intervalHours: null, maxImpressions: 4 },
  { name: 'Custom', frequency: 'interval', intervalHours: 72, maxImpressions: null },
];

function tabForPath(path: (string | number)[]): TabId {
  const p = String(path[0] ?? '');
  if (['minAppVersion', 'maxAppVersion', 'onlyVersions', 'excludedVersions'].includes(p)) return 'targeting';
  if (['publishAt', 'expiresAt', 'frequency', 'intervalHours', 'maxImpressions'].includes(p)) return 'behavior';
  return 'content';
}

export function NewsEditorDialog({
  open,
  initial,
  saving,
  onClose,
  onSave,
  onUploadImage,
}: {
  open: boolean;
  initial: NewsItem | null;
  saving: boolean;
  onClose: () => void;
  onSave: (form: Form) => Promise<void>;
  onUploadImage: (imageBase64: string, name: string) => Promise<string>;
}) {
  const [form, setForm] = useState<Form>({ ...newsDefaults });
  const [err, setErr] = useState<string | null>(null);
  const [tabErrors, setTabErrors] = useState<Partial<Record<TabId, number>>>({});
  const [tab, setTab] = useState<TabId>('content');
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [simVersion, setSimVersion] = useState('');
  const [uploading, setUploading] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { versionName: latestVersion } = useUpdateManifest();

  useEffect(() => {
    if (open) {
      setErr(null);
      setTabErrors({});
      setDirty(false);
      setConfirmDiscard(false);
      setTab('content');
      setForm(initial ? { ...newsDefaults, ...initial } : { ...newsDefaults });
    }
  }, [open, initial]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setDirty(true);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const setPriority = (p: Form['priority']) => {
    setDirty(true);
    setForm((f) => ({ ...f, priority: p, requiresAction: p === 'critical' ? true : false }));
  };

  const verdict = useMemo(
    () => getVisibilityVerdict({ status: form.status, publishAt: form.publishAt ?? null, expiresAt: form.expiresAt ?? null }),
    [form.status, form.publishAt, form.expiresAt],
  );

  const simResult = useMemo(() => {
    const v = simVersion.trim();
    if (!v) return null;
    const ok = versionEligible(
      { minAppVersion: form.minAppVersion ?? null, maxAppVersion: form.maxAppVersion ?? null, onlyVersions: form.onlyVersions ?? [], excludedVersions: form.excludedVersions ?? [] },
      v,
    );
    return ok;
  }, [simVersion, form.minAppVersion, form.maxAppVersion, form.onlyVersions, form.excludedVersions]);

  const insertAtCursor = (before: string, after = '', linePrefix = '') => {
    const el = bodyRef.current;
    if (!el) {
      set('body', `${form.body}${before}text${after}`);
      return;
    }
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e) || 'text';
    let insert: string;
    if (linePrefix) {
      insert = selected.split('\n').map((l) => `${linePrefix}${l}`).join('\n');
    } else {
      insert = `${before}${selected}${after}`;
    }
    const next = `${value.slice(0, s)}${insert}${value.slice(e)}`;
    set('body', next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = s + insert.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const applyTemplate = (t: (typeof TEMPLATES)[number]) => {
    setDirty(true);
    setForm((f) => ({
      ...f,
      title: f.title.trim() ? f.title : t.title,
      body: f.body.trim() ? f.body : t.body,
      priority: t.priority,
      frequency: t.frequency,
      requiresAction: t.priority === 'critical',
    }));
  };

  const validate = (): boolean => {
    const parsed = newsItemSchema.safeParse({ ...form, onlyVersions: form.onlyVersions ?? [], excludedVersions: form.excludedVersions ?? [] });
    if (parsed.success) {
      setTabErrors({});
      setErr(null);
      return true;
    }
    const counts: Partial<Record<TabId, number>> = {};
    for (const issue of parsed.error.issues) {
      const t = tabForPath(issue.path);
      counts[t] = (counts[t] ?? 0) + 1;
    }
    setTabErrors(counts);
    setErr(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
    const first = parsed.error.issues[0];
    if (first) setTab(tabForPath(first.path));
    return false;
  };

  const saveWith = async (patch: Partial<Form>) => {
    setErr(null);
    const next = { ...form, ...patch };
    setForm(next);
    const parsed = newsItemSchema.safeParse({ ...next, onlyVersions: next.onlyVersions ?? [], excludedVersions: next.excludedVersions ?? [] });
    if (!parsed.success) {
      const counts: Partial<Record<TabId, number>> = {};
      for (const issue of parsed.error.issues) {
        const t = tabForPath(issue.path);
        counts[t] = (counts[t] ?? 0) + 1;
      }
      setTabErrors(counts);
      setErr(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
      const first = parsed.error.issues[0];
      if (first) setTab(tabForPath(first.path));
      return;
    }
    try {
      await onSave(next);
      setDirty(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const tryClose = () => {
    if (dirty && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  const statusCaption =
    form.status === 'published'
      ? 'Published → on /news within ~5 min (if time window is open)'
      : form.status === 'draft'
        ? 'Draft → invisible everywhere until published'
        : 'Archived → history only, no popup';

  const isNew = !initial || !initial.id;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) tryClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-[28px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{isNew ? 'New announcement' : 'Edit announcement'}</DialogTitle>
        </DialogHeader>

        {/* Status + priority header */}
        <div className="grid gap-3">
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Status</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['draft', 'published', 'archived'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => set('status', s)}
                  className={`h-10 rounded-full text-sm font-bold capitalize transition-all active:scale-95 ${form.status === s ? 'bg-primary text-primary-foreground' : 'border border-white/10 text-muted-foreground'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{statusCaption}</p>
          </div>
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Priority</Label>
            <div className="flex flex-wrap gap-2">
              {(['info', 'feature', 'fix', 'promo', 'critical'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold capitalize transition-all active:scale-95 ${form.priority === p ? PRIORITY_COLORS[p] : 'border-white/10 text-muted-foreground'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            {form.priority === 'critical' && (
              <p className="mt-1 text-xs text-red-300">Critical bypasses user toggles — use sparingly.</p>
            )}
          </div>
        </div>

        {err && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{err}</div>}

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
          <TabsList className="rounded-full">
            <TabsTrigger value="content" className="rounded-full">Content{tabErrors.content ? ` (${tabErrors.content})` : ''}</TabsTrigger>
            <TabsTrigger value="targeting" className="rounded-full">Targeting{tabErrors.targeting ? ` (${tabErrors.targeting})` : ''}</TabsTrigger>
            <TabsTrigger value="behavior" className="rounded-full">Behavior{tabErrors.behavior ? ` (${tabErrors.behavior})` : ''}</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-full">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="grid gap-4 pt-4">
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Template</Label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <Button key={t.name} variant="outline" size="sm" className="rounded-full" onClick={() => applyTemplate(t)}>
                    {t.name}
                  </Button>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Fills priority + frequency; title/body only when empty.</p>
            </div>
            <div className="grid gap-2">
              <Label>Title ({form.title.length}/120)</Label>
              <Input value={form.title} maxLength={120} onChange={(e) => set('title', e.target.value)} placeholder="What's new in 1.2" className="rounded-2xl" />
            </div>
            <div className="grid gap-2">
              <Label>Body ({form.body.length}/2000, markdown, no HTML)</Label>
              <div className="flex flex-wrap gap-1">
                {[
                  { l: 'B', fn: () => insertAtCursor('**', '**') },
                  { l: 'I', fn: () => insertAtCursor('*', '*') },
                  { l: '</>', fn: () => insertAtCursor('`', '`') },
                  { l: 'Link', fn: () => insertAtCursor('[', '](https://)') },
                  { l: '• List', fn: () => insertAtCursor('', '', '- ') },
                  { l: '1. List', fn: () => insertAtCursor('', '', '1. ') },
                  { l: 'Quote', fn: () => insertAtCursor('', '', '> ') },
                  { l: 'Code', fn: () => insertAtCursor('```\n', '\n```') },
                ].map((b) => (
                  <Button key={b.l} variant="ghost" size="sm" className="rounded-full px-3 font-mono" onClick={b.fn}>
                    {b.l}
                  </Button>
                ))}
              </div>
              <Textarea ref={bodyRef} value={form.body} maxLength={2000} rows={10} onChange={(e) => set('body', e.target.value)} placeholder="## Highlights&#10;&#10;- **Faster** downloads&#10;- [Changelog](https://…)" className="rounded-2xl font-mono text-sm" />
              <p className="text-xs text-muted-foreground">Renders on popup, history, /news and admin preview: headings, bold/italic/code, links, lists, quotes, code blocks, tables.</p>
            </div>
            <div className="grid gap-2">
              <Label>Image (upload to imgbb, or paste URL)</Label>
              <div className="flex gap-2">
                <Input value={form.imageUrl ?? ''} onChange={(e) => set('imageUrl', e.target.value || null)} placeholder="https://…" className="rounded-2xl" />
                <Button
                  variant="outline"
                  className="shrink-0 rounded-full"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    setErr(null);
                    setUploading(true);
                    try {
                      const dataUrl = await downscaleImage(file);
                      const url = await onUploadImage(dataUrl, file.name.replace(/\.[^.]+$/, '').slice(0, 80) || 'toolz-news');
                      set('imageUrl', url);
                    } catch (e2) {
                      setErr(e2 instanceof Error ? e2.message : 'Image upload failed');
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </div>
              {form.imageUrl && (
                <img src={form.imageUrl} alt="" loading="lazy" className="max-h-64 w-full rounded-2xl object-contain" />
              )}
              <p className="text-xs text-muted-foreground">Images are downscaled in-browser (max 1600px, JPEG) then hosted on imgbb.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Action label ({(form.actionLabel ?? '').length}/50)</Label>
                <Input value={form.actionLabel ?? ''} maxLength={50} onChange={(e) => set('actionLabel', e.target.value || null)} placeholder="Try it" className="rounded-2xl" />
              </div>
              <div className="grid gap-2">
                <Label>Action URL</Label>
                <Input value={form.actionUrl ?? ''} onChange={(e) => set('actionUrl', e.target.value || null)} placeholder="https://… or toolz://…" className="rounded-2xl" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="targeting" className="grid gap-4 pt-4">
            <Button variant="outline" className="w-fit rounded-full" onClick={() => { setDirty(true); setForm((f) => ({ ...f, minAppVersion: null, maxAppVersion: null, onlyVersions: [], excludedVersions: [] })); }}>
              Reset to everyone
            </Button>
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
              <div className="flex gap-2">
                <Input value={(form.onlyVersions ?? []).join(', ')} onChange={(e) => set('onlyVersions', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="1.1.6, 1.2.0" className="rounded-2xl" />
                <Button variant="outline" className="shrink-0 rounded-full" onClick={() => set('onlyVersions', latestVersion ? [latestVersion] : [])}>
                  Latest ({latestVersion})
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Excluded versions (comma separated)</Label>
              <Input value={(form.excludedVersions ?? []).join(', ')} onChange={(e) => set('excludedVersions', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="1.1.5-beta" className="rounded-2xl" />
            </div>
            <div className="rounded-2xl border border-white/10 p-4 text-sm">
              <div className="mb-2 font-bold">Who sees this</div>
              <p className="text-muted-foreground">
                {describeTargeting({ ...form, onlyVersions: form.onlyVersions ?? [], excludedVersions: form.excludedVersions ?? [] })}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Input value={simVersion} onChange={(e) => setSimVersion(e.target.value)} placeholder="Test version, e.g. 1.1.6" className="max-w-[200px] rounded-2xl" />
                {simResult !== null && (
                  <span className={`font-bold ${simResult ? 'text-emerald-300' : 'text-red-300'}`}>
                    {simResult ? '✓ sees it' : '✕ hidden'}
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="grid gap-4 pt-4">
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Recurrence preset</Label>
              <div className="flex flex-wrap gap-2">
                {FREQUENCY_PRESETS.map((p) => {
                  const active = form.frequency === p.frequency && (p.frequency !== 'interval' || form.intervalHours === p.intervalHours);
                  return (
                    <button
                      key={p.name}
                      onClick={() => { setDirty(true); setForm((f) => ({ ...f, frequency: p.frequency, intervalHours: p.intervalHours, maxImpressions: p.maxImpressions })); }}
                      className={`rounded-full border px-4 py-2 text-sm font-bold transition-all active:scale-95 ${active ? 'bg-primary text-primary-foreground' : 'border-white/10 text-muted-foreground'}`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Disappear after (auto-delete from devices)</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { l: 'Never', hours: null as number | null },
                  { l: '1 hour', hours: 1 },
                  { l: '24 hours', hours: 24 },
                  { l: '7 days', hours: 168 },
                  { l: '30 days', hours: 720 },
                ].map((b) => (
                  <button
                    key={b.l}
                    onClick={() => {
                      setDirty(true);
                      if (b.hours === null) {
                        setForm((f) => ({ ...f, disappearing: false, expiresAt: null }));
                      } else {
                        const parsed = form.publishAt ? Date.parse(form.publishAt) : NaN;
                        const base = Number.isFinite(parsed) ? parsed : Date.now();
                        setForm((f) => ({ ...f, disappearing: true, expiresAt: new Date(base + (b.hours as number) * 3_600_000).toISOString() }));
                      }
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition-all active:scale-95 ${(b.hours === null ? !form.disappearing : form.disappearing) ? 'bg-primary text-primary-foreground' : 'border-white/10 text-muted-foreground'}`}
                  >
                    {b.l}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {form.disappearing
                  ? `Vanishes from popups, notifications and history ${form.expiresAt ? describeWhen(form.expiresAt) : ''}.`
                  : 'Stays in history after expiring (unless "Keep in history" is off).'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm font-medium">
              {(['pinned', 'dismissible', 'showInHistory', 'notify'] as const).map((k) => (
                <label key={k} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                  <span>{k === 'notify' ? 'Post notification' : k === 'dismissible' ? 'Allow dismiss' : k === 'showInHistory' ? 'Keep in history' : 'Pin to top'}</span>
                  <Switch checked={!!form[k]} onCheckedChange={(v) => set(k, v as Form[typeof k])} />
                </label>
              ))}
              <div className="col-span-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-muted-foreground">
                Blocking dialog is automatic for critical priority (requiresAction).
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Publish at (empty = now)</Label>
                <Input type="datetime-local" value={toLocal(form.publishAt ?? null)} onChange={(e) => set('publishAt', fromLocal(e.target.value))} className="rounded-2xl" />
                <div className="flex flex-wrap gap-1">
                  {[
                    { l: 'Now', fn: () => set('publishAt', null) },
                    { l: '+1h', fn: () => set('publishAt', new Date(Date.now() + 3_600_000).toISOString()) },
                    { l: 'Tomorrow 9:00', fn: () => set('publishAt', atMidnightPlus(1)) },
                    { l: '+7d', fn: () => set('publishAt', atMidnightPlus(7)) },
                  ].map((b) => (
                    <Button key={b.l} variant="ghost" size="sm" className="rounded-full px-3" onClick={b.fn}>{b.l}</Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Expires at (empty = never)</Label>
                <Input type="datetime-local" value={toLocal(form.expiresAt ?? null)} onChange={(e) => set('expiresAt', fromLocal(e.target.value))} className="rounded-2xl" />
                <div className="flex flex-wrap gap-1">
                  {[
                    { l: 'Never', fn: () => { set('expiresAt', null); } },
                    { l: '+7d', fn: () => set('expiresAt', atMidnightPlus(7)) },
                    { l: '+30d', fn: () => set('expiresAt', atMidnightPlus(30)) },
                  ].map((b) => (
                    <Button key={b.l} variant="ghost" size="sm" className="rounded-full px-3" onClick={b.fn}>{b.l}</Button>
                  ))}
                </div>
              </div>
            </div>
            <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${verdict.live ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
              {verdict.live
                ? `● Live now — appears on /news within ~5 min${form.publishAt ? ` (since ${describeWhen(form.publishAt)})` : ''}`
                : `○ Not live: ${verdict.reason}`}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="grid gap-4 pt-4">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Popup (what the app shows)</Label>
            <NewsPreviewCard item={form} />
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Website article (what /news shows)</Label>
            <div className="rounded-[24px] border border-white/10 p-5">
              <div className="mb-2 text-lg font-extrabold">{form.title || 'Title preview'}</div>
              <NewsBody body={form.body || 'Body preview…'} />
            </div>
          </TabsContent>
        </Tabs>

        {confirmDiscard ? (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
            Discard unsaved changes?
            <span className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setConfirmDiscard(false)}>Keep editing</Button>
              <Button variant="destructive" size="sm" className="rounded-full" onClick={onClose}>Discard</Button>
            </span>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button variant="outline" className="rounded-full" onClick={tryClose}>Cancel</Button>
          {(!initial || !initial.id || initial.status !== 'published') && (
            <Button
              variant="secondary"
              className="rounded-full font-bold"
              disabled={saving}
              onClick={() => saveWith({ status: 'draft' })}
            >
              {saving ? 'Saving…' : 'Save draft'}
            </Button>
          )}
          {initial?.id && initial.status === 'published' && (
            <Button
              variant="secondary"
              className="rounded-full font-bold"
              disabled={saving}
              onClick={() => saveWith({ status: 'draft' })}
            >
              {saving ? 'Saving…' : 'Unpublish'}
            </Button>
          )}
          <Button
            className="rounded-full font-bold"
            disabled={saving}
            onClick={() => saveWith(isNew ? { status: 'published', publishAt: null } : {})}
          >
            {saving ? 'Saving…' : isNew ? 'Publish now' : 'Update'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
