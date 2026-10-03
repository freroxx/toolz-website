import { z } from 'zod';

export const newsPriorities = ['info', 'feature', 'fix', 'promo', 'critical'] as const;
export const newsStatuses = ['draft', 'published', 'archived'] as const;
export const newsFrequencies = ['once', 'every_launch', 'daily', 'weekly', 'interval'] as const;

const semver = z.string().regex(/^\d+(\.\d+){0,2}(-[A-Za-z0-9.+-]+)?$/, 'must be semver like 1.2.0');
const isoDate = z.string().refine((s) => !s || !Number.isNaN(Date.parse(s)), 'must be a valid date');

export const newsItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(120),
  body: z.string().min(1).max(2000),
  imageUrl: z.string().max(500).nullable().optional(),
  actionLabel: z.string().max(30).nullable().optional(),
  actionUrl: z.string().max(500).nullable().optional(),
  priority: z.enum(newsPriorities),
  status: z.enum(newsStatuses),
  pinned: z.boolean().default(false),
  publishAt: isoDate.nullable().optional(),
  expiresAt: isoDate.nullable().optional(),
  minAppVersion: semver.nullable().optional(),
  maxAppVersion: semver.nullable().optional(),
  onlyVersions: z.array(z.string().max(32)).max(30).default([]),
  excludedVersions: z.array(z.string().max(32)).max(30).default([]),
  delaySeconds: z.number().int().min(0).max(3600).default(5),
  frequency: z.enum(newsFrequencies).default('once'),
  intervalHours: z.number().int().min(1).max(720).nullable().optional(),
  maxImpressions: z.number().int().min(1).max(100).nullable().optional(),
  dismissible: z.boolean().default(true),
  showInHistory: z.boolean().default(true),
  requiresAction: z.boolean().default(false),
  notify: z.boolean().default(true),
});

export type NewsItemForm = z.infer<typeof newsItemSchema>;

export interface NewsItem extends NewsItemForm {
  id: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export const newsDefaults: NewsItemForm = {
  title: '',
  body: '',
  imageUrl: null,
  actionLabel: null,
  actionUrl: null,
  priority: 'info',
  status: 'draft',
  pinned: false,
  publishAt: null,
  expiresAt: null,
  minAppVersion: null,
  maxAppVersion: null,
  onlyVersions: [],
  excludedVersions: [],
  delaySeconds: 5,
  frequency: 'once',
  intervalHours: null,
  maxImpressions: null,
  dismissible: true,
  showInHistory: true,
  requiresAction: false,
  notify: true,
};

function parts(v: string): number[] {
  return String(v).split('-')[0].split('.').map((p) => {
    const n = parseInt(p, 10);
    return Number.isFinite(n) ? n : 0;
  });
}

export function compareVersions(a: string, b: string): number {
  const pa = parts(a);
  const pb = parts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length, 3); i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) return x - y;
  }
  return 0;
}

export function versionEligible(item: Pick<NewsItemForm, 'minAppVersion' | 'maxAppVersion' | 'onlyVersions' | 'excludedVersions'>, appVersion: string): boolean {
  const av = appVersion.trim();
  if (item.minAppVersion && compareVersions(av, item.minAppVersion) < 0) return false;
  if (item.maxAppVersion && compareVersions(av, item.maxAppVersion) > 0) return false;
  if (item.onlyVersions && item.onlyVersions.length > 0 && !item.onlyVersions.includes(av)) return false;
  if (item.excludedVersions && item.excludedVersions.includes(av)) return false;
  return true;
}

export function describeTargeting(item: NewsItemForm): string {
  if (item.onlyVersions?.length) return `only ${item.onlyVersions.join(', ')}`;
  const bits: string[] = [];
  if (item.minAppVersion) bits.push(`≥${item.minAppVersion}`);
  if (item.maxAppVersion) bits.push(`≤${item.maxAppVersion}`);
  if (item.excludedVersions?.length) bits.push(`≠${item.excludedVersions.join(',≠')}`);
  return bits.length ? bits.join(' ') : 'all versions';
}
