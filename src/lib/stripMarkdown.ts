/**
 * Plain-text fallback for markdown bodies (home teaser cards, notifications).
 * Strips code fences, headings, quotes, list markers, tables, links, images
 * and inline styles, collapsing whitespace.
 */
export function stripMarkdown(raw: string): string {
  let text = String(raw || '');
  // Fenced code blocks -> inner code as plain text
  text = text.replace(/```[\w+-]*\n?([\s\S]*?)```/g, '$1');
  // Images ![alt](url) -> alt, links [label](url) -> label
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const isSeparatorRow = (l: string) =>
    l.includes('|') &&
    l
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .every((c) => /^:?-{3,}:?$/.test(c));
  // Headings, quotes, list markers, hr, table pipes. Separator rows are
  // detected on the raw line (before pipes are stripped).
  text = text
    .split('\n')
    .filter((line) => !isSeparatorRow(line.trim()))
    .map((line) => {
      let l = line.trim();
      l = l.replace(/^#{1,6}\s+/, '');
      l = l.replace(/^>\s?/, '');
      l = l.replace(/^([-*+]|\d+[.)])\s+/, '');
      l = l.replace(/^\|/, '').replace(/\|$/, '');
      l = l.replace(/\|/g, ' ').trim();
      return l;
    })
    .filter((l) => l.length > 0 && !/^[-*_]{3,}$/.test(l))
    .join('\n');
  // Inline styles: **bold**, *italic*, __, _, `code`, ~~strike~~
  text = text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1$2')
    .replace(/(^|[\s(])_([^_\n]+)_/g, '$1$2')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\|/g, ' ');
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
