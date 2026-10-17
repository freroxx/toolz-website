import { describe, expect, it } from 'vitest';
import { stripMarkdown } from '@/lib/stripMarkdown';
import { isSafeWebHref, newsPriorityChipStyle } from '@/lib/newsStyle';
import { render } from '@testing-library/react';
import { NewsBody } from '@/components/news/NewsBody';

describe('stripMarkdown', () => {
  it('strips headings, bold, links and lists', () => {
    expect(stripMarkdown('## Hello **world**')).toBe('Hello world');
    expect(stripMarkdown('[label](https://x.y) and https://x.y')).toBe('label and https://x.y');
    expect(stripMarkdown('- a\n- b')).toBe('a\nb');
  });

  it('strips code fences, quotes and tables', () => {
    expect(stripMarkdown('```\ncode here\n```')).toBe('code here');
    expect(stripMarkdown('> quoted')).toBe('quoted');
    expect(stripMarkdown('| a | b |\n| --- | --- |\n| 1 | 2 |')).toBe('a b\n1 2');
  });

  it('handles empty input', () => {
    expect(stripMarkdown('')).toBe('');
    expect(stripMarkdown('   \n---\n  ')).toBe('');
  });
});

describe('isSafeWebHref', () => {
  it('allows http(s), mailto and relative targets', () => {
    expect(isSafeWebHref('https://toolz.app')).toBe(true);
    expect(isSafeWebHref('http://localhost:5173/x')).toBe(true);
    expect(isSafeWebHref('mailto:support@toolz.app')).toBe(true);
    expect(isSafeWebHref('/downloads')).toBe(true);
  });

  it('rejects javascript:, data: and other schemes (XSS hardening)', () => {
    expect(isSafeWebHref('javascript:alert(1)')).toBe(false);
    expect(isSafeWebHref('data:text/html,<script>')).toBe(false);
    expect(isSafeWebHref('vbscript:msgbox')).toBe(false);
  });
});

describe('newsPriorityChipStyle', () => {
  it('maps each priority to distinct container colors', () => {
    const styles = ['critical', 'feature', 'fix', 'promo', 'info'].map(newsPriorityChipStyle);
    // critical uses error container — the one color that must never be shared
    expect(styles[0].background).toContain('error-container');
    // all priorities map to some explicit colors
    for (const s of styles) {
      expect(s.background).toMatch(/^hsl\(var\(--md-/);
      expect(s.color).toMatch(/^hsl\(var\(--md-/);
    }
  });

  it('falls back to the neutral info style for unknown priorities', () => {
    expect(newsPriorityChipStyle('mystery')).toEqual(newsPriorityChipStyle('info'));
  });
});

describe('NewsBody link hardening', () => {
  it('renders https links as anchors', () => {
    const { container } = render(<NewsBody body="See [docs](https://toolz.app/docs)" />);
    const a = container.querySelector('a');
    expect(a?.getAttribute('href')).toBe('https://toolz.app/docs');
  });

  it('renders toolz:// deep links as inert text (browser cannot open them)', () => {
    const { container } = render(<NewsBody body="Tap [go deeper](toolz://tool/cleaner)" />);
    expect(container.querySelector('a')).toBeNull();
    const inert = container.querySelector('span[title]');
    expect(inert?.getAttribute('title')).toBe('Opens inside the Toolz app');
  });

  it('never emits a javascript: href from markdown', () => {
    const { container } = render(<NewsBody body="[click](javascript:alert(1))" />);
    const a = container.querySelector('a');
    expect(a).toBeNull();
  });
});
