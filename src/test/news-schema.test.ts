import { describe, expect, it } from 'vitest';
import { compareVersions, newsItemSchema, versionEligible } from '@/lib/news-schema';

describe('news-schema', () => {
  it('accepts a minimal valid item', () => {
    const r = newsItemSchema.safeParse({
      title: 'Hello',
      body: 'World',
      priority: 'info',
      status: 'draft',
    });
    expect(r.success).toBe(true);
  });

  it('rejects short title and bad semver', () => {
    const r = newsItemSchema.safeParse({ title: 'Hi', body: 'x', priority: 'info', status: 'draft', minAppVersion: 'abc' });
    expect(r.success).toBe(false);
  });

  it('compares versions', () => {
    expect(compareVersions('1.1.6', '1.1.0')).toBeGreaterThan(0);
    expect(compareVersions('1.1', '1.1.0')).toBe(0);
    expect(compareVersions('1.2.0-beta', '1.2.0')).toBe(0);
  });

  it('applies only/excluded precedence', () => {
    expect(versionEligible({ onlyVersions: ['1.1.6'], excludedVersions: [] }, '1.1.6')).toBe(true);
    expect(versionEligible({ onlyVersions: ['1.1.6'], excludedVersions: [] }, '1.2.0')).toBe(false);
    expect(versionEligible({ onlyVersions: [], excludedVersions: ['1.1.6'] }, '1.1.6')).toBe(false);
    expect(versionEligible({ minAppVersion: '1.1.0', maxAppVersion: '1.9.9', onlyVersions: [], excludedVersions: [] }, '1.0.0')).toBe(false);
  });
});
