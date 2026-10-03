import { describe, expect, it } from 'vitest';
import { stripMarkdown } from '@/lib/stripMarkdown';

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
