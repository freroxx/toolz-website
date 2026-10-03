import { describe, expect, it } from 'vitest';
import { describeWhen, getVisibilityVerdict } from '@/lib/newsVerdict';

const base = { status: 'published', publishAt: null, expiresAt: null } as const;

describe('getVisibilityVerdict', () => {
  it('marks published, unbounded items live', () => {
    expect(getVisibilityVerdict({ ...base })).toEqual({ live: true, reason: 'live' });
  });

  it('marks drafts and archived items not live', () => {
    expect(getVisibilityVerdict({ ...base, status: 'draft' }).live).toBe(false);
    expect(getVisibilityVerdict({ ...base, status: 'archived' }).live).toBe(false);
  });

  it('marks future publishAt as scheduled and past expiresAt as expired', () => {
    const now = Date.parse('2026-10-03T12:00:00Z');
    const s = getVisibilityVerdict({ ...base, publishAt: '2026-10-04T12:00:00Z' }, now);
    expect(s.live).toBe(false);
    expect(s.reason).toContain('scheduled');
    const e = getVisibilityVerdict({ ...base, expiresAt: '2026-10-02T12:00:00Z' }, now);
    expect(e.live).toBe(false);
    expect(e.reason).toContain('expired');
  });

  it('marks currently-open windows live', () => {
    const now = Date.parse('2026-10-03T12:00:00Z');
    expect(
      getVisibilityVerdict(
        { ...base, publishAt: '2026-10-01T00:00:00Z', expiresAt: '2026-11-01T00:00:00Z' },
        now,
      ).live,
    ).toBe(true);
  });
});

describe('describeWhen', () => {
  it('describes relative times', () => {
    const now = Date.parse('2026-10-03T12:00:00Z');
    expect(describeWhen(null, now)).toBe('now');
    expect(describeWhen('2026-10-03T15:00:00Z', now)).toBe('in 3h');
    expect(describeWhen('2026-10-01T12:00:00Z', now)).toBe('2d ago');
  });
});
