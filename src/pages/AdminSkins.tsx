import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSkinsAdmin } from '@/hooks/useSkinsAdmin';
import { SkinsLoginCard } from '@/components/skins-admin/SkinsLoginCard';
import { paletteFor } from '@/lib/icon-palette';
import type { SkinItem } from '@/lib/skin-schema';

function argbToCss(n: number | null | undefined): string {
  if (n == null) return 'transparent';
  const a = (n >>> 24) & 0xff;
  const r = (n >>> 16) & 0xff;
  const g = (n >>> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r},${g},${b},${(a / 255).toFixed(2)})`;
}

function argbToHex(n: number | null | undefined): string {
  if (n == null) return '—';
  return `#${(n & 0xffffff).toString(16).toUpperCase().padStart(6, '0')}`;
}

/** Mirrors skinFingerprint() in api/skins.ts — identical looks share a key. */
function skinFingerprint(s: SkinItem): string {
  const shape = String(s.iconShape || 'HEXAGON').toUpperCase();
  const canon = shape === 'HEXAGON' ? 'OCTAGON' : shape === 'PILL' ? 'CIRCLE' : shape;
  return [
    String(s.themeMode || 'SYSTEM').toUpperCase(),
    String(!!s.dynamicColor),
    String(s.primary ?? -1),
    String(s.secondary ?? -1),
    String(s.gradient !== false),
    String(s.iconPresetId || ''),
    String(s.iconAdaptTheme !== false),
    String(s.iconFollowDynamic !== false),
    canon,
    String(s.iconGradient !== false),
    String(s.iconBg ?? -1),
    String(s.iconFg ?? -1),
    String(s.iconStroke ?? -1),
  ].join('|');
}

function Chip({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'green' | 'amber' | 'blue' }) {
  const tones: Record<string, string> = {
    default: 'bg-white/10 text-muted-foreground',
    green: 'bg-emerald-500/15 text-emerald-300',
    amber: 'bg-amber-500/15 text-amber-200',
    blue: 'bg-sky-500/15 text-sky-300',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: color }} />
      <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
    </span>
  );
}

/** Mini mark preview drawn from the shipped preset palette + skin overrides. */
function SkinIconPreview({ skin }: { skin: SkinItem }) {
  const p = paletteFor(skin.iconPresetId);
  const gid = `g-${skin.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const circle = String(skin.iconShape || '').toUpperCase() === 'CIRCLE';
  const bg = skin.iconBg != null ? argbToCss(skin.iconBg) : p.bodyStart;
  const disc = skin.iconFg != null ? argbToCss(skin.iconFg) : p.disc;
  const rim = skin.iconStroke != null ? argbToCss(skin.iconStroke) : p.rim;
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor={skin.iconGradient !== false ? p.bodyEnd : bg} />
        </linearGradient>
      </defs>
      {circle ? (
        <>
          <circle cx="24" cy="24" r="22" fill={rim} />
          <circle cx="24" cy="24" r="17" fill={`url(#${gid})`} />
        </>
      ) : (
        <>
          <polygon points="24,2 38,6 44,12 46,24 44,36 38,42 24,46 10,42 4,36 2,24 4,12 10,6" fill={rim} />
          <polygon points="24,7 35,10 40,15 41,24 40,33 35,38 24,41 13,38 8,33 7,24 8,15 13,10" fill={`url(#${gid})`} />
        </>
      )}
      <ellipse cx="24" cy="24" rx="11" ry="11" fill={disc} opacity="0.95" />
    </svg>
  );
}

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="w-20 shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-xs">{children}</span>
    </div>
  );
}

export default function AdminSkins() {
  const skins = useSkinsAdmin();
  const [tab, setTab] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [q, setQ] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    skins.restore().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skins.authed) skins.refresh().catch((e) => setErr(e instanceof Error ? e.message : 'Load failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skins.authed]);

  const duplicates = useMemo(() => {
    const byFp = new Map<string, string[]>();
    for (const s of skins.items) {
      const fp = skinFingerprint(s);
      byFp.set(fp, [...(byFp.get(fp) ?? []), s.id]);
    }
    const dup = new Set<string>();
    for (const ids of byFp.values()) if (ids.length > 1) ids.forEach((id) => dup.add(id));
    return dup;
  }, [skins.items]);

  const filtered = useMemo(() => {
    return skins.items.filter((s) => {
      if (tab !== 'all' && s.status !== tab) return false;
      if (q && !`${s.name} ${s.author || ''} ${s.id}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [skins.items, tab, q]);

  if (skins.restoring) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  if (!skins.authed) {
    return (
      <SkinsLoginCard
        onLogin={async (password: string) => {
          // Own SKINS_ADMIN_PASSWORD session (set it on Vercel), then load skins.
          await skins.login(password);
          await skins.refresh();
        }}
        loading={skins.loading}
      />
    );
  }

  const setStatus = async (action: 'publish' | 'unpublish' | 'archive' | 'delete', id: string) => {
    setErr(null);
    try {
      await skins.mutate(action === 'unpublish' ? 'unpublish' : action, action === 'delete' ? { id } : { ids: [id] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Action failed');
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Toolz Skins Admin</h1>
          <p className="text-sm text-muted-foreground">
            {skins.items.filter((i) => i.status === 'published').length} published · {skins.items.filter((i) => i.status === 'draft').length} drafts · community submits land here as drafts
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => window.open('/api/skins', '_blank')}>Public JSON</Button>
          <Button variant="outline" className="rounded-full" onClick={() => window.open('/admin/news', '_self')}>News admin</Button>
          <Button variant="ghost" className="rounded-full" onClick={() => skins.refresh().catch((e) => setErr(e instanceof Error ? e.message : 'Refresh failed'))}>Refresh</Button>
        </div>
      </div>

      {err && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{err}</div>}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'published', 'draft', 'archived'] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} className="rounded-full capitalize" onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/author…" className="max-w-xs rounded-full" />
        <span className="text-xs text-muted-foreground">{filtered.length}/{skins.items.length}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((s: SkinItem) => (
          <div key={s.id} className="rounded-3xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <SkinIconPreview skin={s} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{s.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  by {s.author || 'community'} · {s.iconPresetId} · {new Date(s.updatedAt || s.createdAt || '').toLocaleDateString()}
                </div>
              </div>
              <span className="flex flex-col items-end gap-1">
                <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${s.status === 'published' ? 'bg-emerald-500/15 text-emerald-300' : s.status === 'draft' ? 'bg-amber-500/15 text-amber-200' : 'bg-white/10 text-muted-foreground'}`}>
                  {s.status}
                </span>
                {duplicates.has(s.id) && <Chip tone="amber">duplicate look</Chip>}
              </span>
            </div>

            <div className="mt-3 divide-y divide-white/5 rounded-2xl bg-black/20 px-3 py-1">
              <ConfigRow label="Theme">
                <Chip tone="blue">{s.themeMode.toLowerCase()}</Chip>
                <Chip>{s.dynamicColor ? 'dynamic colors' : 'custom colors'}</Chip>
                <Chip>{s.gradient !== false ? 'gradient bg' : 'flat bg'}</Chip>
              </ConfigRow>
              <ConfigRow label="Colors">
                {s.dynamicColor ? (
                  <span className="text-muted-foreground">follows wallpaper</span>
                ) : (
                  <>
                    <Swatch color={argbToCss(s.primary)} label={argbToHex(s.primary)} />
                    <Swatch color={argbToCss(s.secondary)} label={argbToHex(s.secondary)} />
                  </>
                )}
              </ConfigRow>
              <ConfigRow label="Icon">
                <Chip>{s.iconPresetId}</Chip>
                <Chip>{String(s.iconShape || 'HEXAGON').toLowerCase()}</Chip>
                {s.iconAdaptTheme !== false && <Chip tone="green">adapt</Chip>}
                {s.iconFollowDynamic !== false && <Chip tone="green">follow-dynamic</Chip>}
                {s.iconGradient !== false && <Chip tone="green">gradient</Chip>}
                {s.iconBg != null && <Swatch color={argbToCss(s.iconBg)} label={`bg ${argbToHex(s.iconBg)}`} />}
                {s.iconFg != null && <Swatch color={argbToCss(s.iconFg)} label={`fg ${argbToHex(s.iconFg)}`} />}
                {s.iconStroke != null && <Swatch color={argbToCss(s.iconStroke)} label={`rim ${argbToHex(s.iconStroke)}`} />}
              </ConfigRow>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="ml-auto flex gap-2">
                {s.status !== 'published' && (
                  <Button size="sm" className="rounded-full" onClick={() => setStatus('publish', s.id)}>Approve</Button>
                )}
                {s.status === 'published' && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus('unpublish', s.id)}>Unpublish</Button>
                )}
                {s.status !== 'archived' && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setStatus('archive', s.id)}>Archive</Button>
                )}
                <Button size="sm" variant="destructive" className="rounded-full" onClick={() => { if (confirm(`Delete ${s.name}?`)) setStatus('delete', s.id); }}>Delete</Button>
              </span>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] font-bold text-muted-foreground">Raw JSON</summary>
              <pre className="mt-1 max-h-32 overflow-auto rounded-2xl bg-black/30 p-3 text-[11px] text-muted-foreground">{JSON.stringify(s, null, 2)}</pre>
            </details>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-white/15 p-10 text-center text-sm text-muted-foreground">
          No skins here yet. Community submits from the app appear as drafts. The app always ships 6 legacy presets offline.
        </div>
      )}
    </div>
  );
}
