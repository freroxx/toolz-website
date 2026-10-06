import { describe, expect, it } from 'vitest';
import { buildBulkOps, duplicateTitles, exportFilename, filterAdminItems, sortAdminItems } from '@/lib/newsAdminTools';
import type { NewsItem } from '@/lib/news-schema';

const mk = (over: Partial<NewsItem>): NewsItem => ({
  id: 'a1b2c3d4e5f6',
  schemaVersion: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  title: 'T',
  body: 'B',
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
  delaySeconds: 0,
  frequency: 'once',
  intervalHours: null,
  maxImpressions: null,
  dismissible: true,
  showInHistory: true,
  requiresAction: false,
  notify: true,
  disappearing: false,
  ...over,
});

describe('buildBulkOps', () => {
  it('dedupes, trims and caps at 50', () => {
    const ids = [' a ', 'a', '', ...Array.from({ length: 60 }, (_, i) => `id${i}`)];
    const ops = buildBulkOps(ids, 'publish');
    expect(ops.length).toBe(50);
    expect(ops[0]).toEqual({ action: 'publish', id: 'a' });
    expect(new Set(ops.map((o) => o.id)).size).toBe(ops.length);
  });
});

describe('filterAdminItems', () => {
  const items = [
    mk({ id: '1', title: 'Hello world', status: 'published', priority: 'info' }),
    mk({ id: '2', title: 'Outage', status: 'draft', priority: 'critical' }),
    mk({ id: '3', title: 'Old', status: 'published', priority: 'fix', expiresAt: '2020-01-01T00:00:00.000Z' }),
  ];
  it('filters by tab and query', () => {
    expect(filterAdminItems(items, 'drafts', '').map((n) => n.id)).toEqual(['2']);
    expect(filterAdminItems(items, 'critical', '').map((n) => n.id)).toEqual(['2']);
    expect(filterAdminItems(items, 'expired', '').map((n) => n.id)).toEqual(['3']);
    expect(filterAdminItems(items, 'all', 'hello').map((n) => n.id)).toEqual(['1']);
  });
});

describe('sortAdminItems', () => {
  it('sorts by title and updated', () => {
    const items = [mk({ id: '1', title: 'B', updatedAt: '2026-01-01T00:00:00.000Z' }), mk({ id: '2', title: 'A', updatedAt: '2026-02-01T00:00:00.000Z' })];
    expect(sortAdminItems(items, 'title').map((n) => n.id)).toEqual(['2', '1']);
    expect(sortAdminItems(items, 'updated').map((n) => n.id)).toEqual(['2', '1']);
  });
});

describe('exportFilename', () => {
  it('produces a sortable backup name', () => {
    expect(exportFilename(new Date('2026-10-06T03:04:00Z'))).toBe('toolz-news-backup-20261006-0304.json');
  });
});

describe('duplicateTitles', () => {
  it('finds case-insensitive duplicates', () => {
    const items = [mk({ id: '1', title: 'Hello' }), mk({ id: '2', title: 'hello ' }), mk({ id: '3', title: 'Other' })];
    expect(duplicateTitles(items)).toEqual(['hello']);
  });
});
