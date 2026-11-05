import { describe, expect, it } from 'vitest';
import { normaliseSkin } from '@/lib/skins';

const base = {
  id: 'test-skin',
  name: 'Test Skin',
  themeMode: 'DARK',
  primary: 0xffff8a3d,
  secondary: 0xffc81e5b,
  iconPresetId: 'custom',
  iconShape: 'CIRCLE',
};

describe('normaliseSkin icon palette', () => {
  it('derives an icon from the skin colours when the preset is unknown', () => {
    const skin = normaliseSkin({ ...base, iconPresetId: 'a-preset-added-later' }, 'community');
    expect(skin).not.toBeNull();
    expect(skin?.icon.bodyStart).toBe('#ff8a3d');
    expect(skin?.icon.rim).toBe('#c81e5b');
    expect(skin?.shape).toBe('CIRCLE');
  });

  it('keeps custom overrides while deriving the missing stops', () => {
    const skin = normaliseSkin(
      { ...base, iconPresetId: 'custom', iconBg: 0xff123456, iconFg: 0xffffffff },
      'community'
    );
    expect(skin?.icon.bodyStart).toBe('#123456');
    expect(skin?.icon.bodyEnd).toBe('#c81e5b');
    expect(skin?.icon.disc).toBe('#ffffff');
    expect(skin?.icon.rim).toBe('#c81e5b');
  });

  it('still resolves a shipped preset by name', () => {
    const skin = normaliseSkin({ ...base, iconPresetId: 'lagoon' }, 'community');
    expect(skin?.icon).toEqual({
      rim: '#4CB3AE',
      bodyStart: '#00393F',
      bodyEnd: '#002925',
      disc: '#74DFD5',
    });
  });
});
