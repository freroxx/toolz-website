import { describe, expect, it } from 'vitest';
import { skinFingerprint } from '../../api/skins';

const base = {
  themeMode: 'SYSTEM',
  dynamicColor: true,
  primary: null,
  secondary: null,
  gradient: true,
  iconPresetId: 'grape-haze',
  iconAdaptTheme: true,
  iconFollowDynamic: true,
  iconShape: 'OCTAGON',
  iconGradient: true,
  iconBg: null,
  iconFg: null,
  iconStroke: null,
};

describe('skinFingerprint', () => {
  it('null and undefined normalize identically (409 guard must fire)', () => {
    const candidate = { ...base, primary: null, secondary: null };
    const stored = { ...base, primary: undefined, secondary: undefined };
    expect(skinFingerprint(candidate)).toBe(skinFingerprint(stored));
  });

  it('ignores identity fields, detects config changes', () => {
    const a = { ...base, id: '1', name: 'One', author: 'x' };
    const b = { ...base, id: '2', name: 'Two', author: 'y' };
    expect(skinFingerprint(a)).toBe(skinFingerprint(b));
    expect(skinFingerprint({ ...b, iconPresetId: 'midnight' })).not.toBe(skinFingerprint(a));
    expect(skinFingerprint({ ...b, themeMode: 'light' })).not.toBe(skinFingerprint(a));
    expect(skinFingerprint({ ...b, iconGradient: false })).not.toBe(skinFingerprint(a));
    expect(skinFingerprint({ ...b, iconBg: 0xff112233 })).not.toBe(skinFingerprint(a));
  });

  it('canonicalizes legacy shapes', () => {
    expect(skinFingerprint({ ...base, iconShape: 'HEXAGON' })).toBe(skinFingerprint({ ...base, iconShape: 'OCTAGON' }));
    expect(skinFingerprint({ ...base, iconShape: 'PILL' })).toBe(skinFingerprint({ ...base, iconShape: 'CIRCLE' }));
  });
});
