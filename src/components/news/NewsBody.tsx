/**
 * Shared advanced markdown renderer for Toolz News surfaces
 * (/news page, admin live preview). Supports: headings, bold, italic,
 * inline code, links, bullet + ordered lists, blockquotes, fenced code
 * blocks and horizontal rules. No raw HTML is ever injected.
 */

function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s)]+)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  const pushText = (s: string) => {
    if (s) parts.push(<span key={`t${k++}`}>{s}</span>);
  };
  while ((m = re.exec(text)) !== null) {
    pushText(text.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[2] && m[3]) {
      parts.push(
        <a key={`l${k++}`} href={m[3]} target="_blank" rel="noopener noreferrer" className="underline break-all" style={{ color: "hsl(var(--md-primary))" }}>
          {m[2]}
        </a>,
      );
    } else if (m[4]) {
      parts.push(
        <a key={`l${k++}`} href={m[4]} target="_blank" rel="noopener noreferrer" className="underline break-all" style={{ color: "hsl(var(--md-primary))" }}>
          {m[4]}
        </a>,
      );
    } else if (m[5]) {
      parts.push(
        <code key={`c${k++}`} className="px-1.5 py-0.5 rounded-md text-[0.9em]" style={{ background: "hsl(var(--md-surface-container-highest))" }}>
          {m[5]}
        </code>,
      );
    } else if (m[6]) {
      parts.push(<strong key={`b${k++}`}>{m[6]}</strong>);
    } else if (m[7]) {
      parts.push(<em key={`i${k++}`}>{m[7]}</em>);
    }
  }
  pushText(text.slice(last));
  return <>{parts}</>;
}

export function NewsBody({ body, compact = false }: { body: string; compact?: boolean }) {
  const lines = body.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    // Fenced code block
    if (t.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre key={`b${k++}`} className="rounded-2xl p-4 overflow-x-auto text-sm" style={{ background: "hsl(var(--md-surface-container-highest))" }}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    // Horizontal rule
    if (/^[-*_]{3,}$/.test(t)) {
      blocks.push(<hr key={`b${k++}`} className="my-2" style={{ borderColor: "hsl(var(--md-outline-variant))" }} />);
      i++;
      continue;
    }
    // Headings
    const h = /^(#{1,3})\s+(.*)/.exec(t);
    if (h) {
      const level = h[1].length;
      const cls = level === 1 ? "m3-headline-small font-bold" : level === 2 ? "m3-title-large font-bold" : "m3-title-medium font-bold";
      blocks.push(<div key={`b${k++}`} className={cls}><Inline text={h[2]} /></div>);
      i++;
      continue;
    }
    // Blockquote
    if (t.startsWith(">")) {
      blocks.push(
        <blockquote key={`b${k++}`} className="pl-4 py-1 rounded-r-xl" style={{ borderLeft: "3px solid hsl(var(--md-primary))", background: "hsl(var(--md-surface-container))" }}>
          <Inline text={t.replace(/^>\s?/, "")} />
        </blockquote>,
      );
      i++;
      continue;
    }
    // Bullet list (consecutive)
    if (/^[-*+]\s+/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`b${k++}`} className="grid gap-1.5 pl-1">
          {items.map((it, j) => (
            <li key={j} className="flex gap-2">
              <span style={{ color: "hsl(var(--md-primary))" }}>•</span>
              <span><Inline text={it} /></span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }
    // Ordered list (consecutive)
    if (/^\d+[.)]\s+/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`b${k++}`} className="grid gap-1.5 pl-1" style={{ listStyle: "none" }}>
          {items.map((it, j) => (
            <li key={j} className="flex gap-2">
              <span className="font-bold" style={{ color: "hsl(var(--md-primary))" }}>{j + 1}.</span>
              <span><Inline text={it} /></span>
            </li>
          ))}
        </ol>,
      );
      continue;
    }
    if (!t) {
      i++;
      continue;
    }
    blocks.push(
      <p key={`b${k++}`}>
        <Inline text={t} />
      </p>,
    );
    i++;
  }

  return <div className={`grid ${compact ? "gap-2" : "gap-3"}`}>{blocks}</div>;
}
