import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Sparkles } from "lucide-react";
import { SPRING_STANDARD } from "@/lib/motion";

// ---------------------------------------------------------------------------
// Changelog markdown — matches the actual format of Toolz's GitHub release
// bodies: `>` section headers wrapping a bold label, `**- Label :** a, b, c`
// pseudo-bullet lines with comma-separated sub-items, plain bold/italic
// paragraphs, and raw URLs. GitHub-flavored, not generic markdown — no
// `#`-headers or `[text](url)` links appear in practice, so those aren't
// force-fit; the parser matches what the source actually produces.
// ---------------------------------------------------------------------------

// Leaf tokens (never contain nested markup themselves).
type InlineToken =
  | { type: "text"; content: string }
  | { type: "italic"; content: string }
  | { type: "link"; content: string };

// A bold span's own content is re-scanned by the same tokenizer, since
// GitHub release bodies nest `_italic_` and raw URLs inside `**bold**`
// (e.g. "**thanks to _name_, _other_**"). Without this recursion the whole
// bold span was swallowed as one flat string and the inner underscores
// rendered as literal text instead of <em>. Bold itself can't nest inside
// bold in this source format, so it's the only branch carrying children.
type InlineNode = InlineToken | { type: "bold"; content: string; children: InlineToken[] };

function isLeafToken(node: InlineNode): node is InlineToken {
  return node.type !== "bold";
}

function tokenizeInline(text: string): InlineNode[] {
  const tokens: InlineNode[] = [];
  // Bold and links are matched before italic; the italic branch requires
  // non-word boundaries on both sides so it never fires inside identifiers
  // like "Professional_Day8792".
  // Italic content may itself contain underscores (e.g. "_Professional_Day8792_"),
  // so the body is `.+?` rather than `[^_]+?` — only the outer pair needs
  // non-word boundaries to avoid matching inside bare identifiers.
  const pattern = /(\*\*(.+?)\*\*)|(\bhttps?:\/\/[^\s]+\b)|(?<![\w])_(.+?)_(?![\w])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      // Bold content is re-tokenized; the result can't itself contain a
      // nested bold branch (regex already consumed the outer ** pair), so
      // the recursive call's output is safely narrowed to leaf tokens.
      tokens.push({ type: "bold", content: match[2], children: tokenizeInline(match[2]).filter(isLeafToken) });
    } else if (match[3] !== undefined) {
      tokens.push({ type: "link", content: match[3] });
    } else if (match[4] !== undefined) {
      tokens.push({ type: "italic", content: match[4] });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: "text", content: text.slice(lastIndex) });
  }
  return tokens;
}

const renderInline = (text: string, keyPrefix: string): React.ReactNode =>
  renderTokens(tokenizeInline(text), keyPrefix);

// Italic spans in this source only ever wrap a bare URL, never nested
// bold/italic markup, so this only needs to split out links rather than
// running the full tokenizer.
const renderUrlsOnly = (text: string, keyPrefix: string): React.ReactNode => {
  const parts = text.split(/(\bhttps?:\/\/[^\s]+\b)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={`${keyPrefix}-url-${i}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary transition-colors inline-flex items-center gap-1"
      >
        {part.replace(/^https?:\/\/(www\.)?/, "").split("/").slice(0, 2).join("/")}
        <ExternalLink size={11} className="opacity-70 shrink-0" />
      </a>
    ) : (
      <React.Fragment key={`${keyPrefix}-txt-${i}`}>{part}</React.Fragment>
    )
  );
};

const renderTokens = (tokens: InlineNode[], keyPrefix: string): React.ReactNode => {
  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (token.type) {
      case "bold":
        return (
          <strong key={key} className="font-extrabold text-on-surface">
            {renderTokens(token.children, key)}
          </strong>
        );
      case "italic":
        return (
          <em key={key} className="italic text-on-surface-variant not-italic font-semibold opacity-80">
            {renderUrlsOnly(token.content, key)}
          </em>
        );
      case "link":
        return (
          <a
            key={key}
            href={token.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold inline-flex items-center gap-1 underline decoration-primary/30 underline-offset-2 hover:decoration-primary transition-colors"
          >
            {token.content.replace(/^https?:\/\/(www\.)?/, "").split("/").slice(0, 2).join("/")}
            <ExternalLink size={12} className="opacity-70 shrink-0" />
          </a>
        );
      default:
        return <React.Fragment key={key}>{token.content}</React.Fragment>;
    }
  });
};

type ChangelogBlock =
  | { kind: "section"; label: string; items: { label: string; parts: string[] }[]; freeText: string[] };

function parseChangelog(raw: string): ChangelogBlock[] {
  if (!raw) return [];
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  const blocks: ChangelogBlock[] = [];
  let current: ChangelogBlock | null = null;

  const ensureCurrent = () => {
    if (!current) {
      current = { kind: "section", label: "", items: [], freeText: [] };
      blocks.push(current);
    }
    return current;
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Section header: `> **Label :**` or `> Label`
    if (trimmed.startsWith(">")) {
      let headerText = trimmed.replace(/^>\s*/, "").trim();
      headerText = headerText.replace(/^\*\*(.+?)\*\*$/, "$1").trim();
      headerText = headerText.replace(/:$/, "").trim();
      current = { kind: "section", label: headerText, items: [], freeText: [] };
      blocks.push(current);
      continue;
    }

    // Pseudo-bullet: `**- Label :** item one, item two, item three`
    const bulletMatch = trimmed.match(/^\*\*-\s*(.+?)\s*\*\*(.*)$/);
    if (bulletMatch) {
      const block = ensureCurrent();
      const label = bulletMatch[1].replace(/:$/, "").trim();
      const rest = bulletMatch[2].trim();
      // Split on ", " but keep parenthetical groups intact (don't split inside "(...)")
      const parts = splitTopLevel(rest, ",").map((p) => p.trim()).filter(Boolean);
      block.items.push({ label, parts });
      continue;
    }

    // Plain paragraph — bold/italic/links handled inline at render time
    ensureCurrent().freeText.push(trimmed);
  }

  return blocks.filter((b) => b.label || b.items.length || b.freeText.length);
}

// Splits on a delimiter but ignores delimiters inside parentheses, so
// "Karaoke, UI text clipping, ... (Music Player, Web search, AI assistant)"
// doesn't fragment the parenthetical into separate bullets.
function splitTopLevel(text: string, delim: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === delim && depth === 0) {
      parts.push(buf);
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf) parts.push(buf);
  return parts;
}

const ChangelogView = ({ raw }: { raw: string }) => {
  const blocks = useMemo(() => parseChangelog(raw), [raw]);

  if (blocks.length === 0) return null;

  return (
    <div className="space-y-5 sm:space-y-8">
      {blocks.map((block, bi) => (
        <motion.div
          key={bi}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_STANDARD, delay: bi * 0.06 }}
          className="space-y-3 sm:space-y-4"
        >
          {block.label && (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-tertiary-container rounded-full">
              <Sparkles size={11} className="text-on-tertiary-container sm:w-[13px] sm:h-[13px]" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-on-tertiary-container">
                {block.label}
              </span>
            </div>
          )}

          {block.items.length > 0 && (
            <div className="grid gap-2.5 sm:gap-3">
              {block.items.map((item, ii) => (
                <div
                  key={ii}
                  className="bg-surface-container p-4 sm:p-5 border border-outline-variant/15"
                  style={{ borderRadius: "22px 10px 22px 10px" }}
                >
                  <div className="text-xs sm:text-sm font-extrabold text-primary mb-2 sm:mb-2.5">
                    {item.label}
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {item.parts.map((part, pi) => (
                      <li key={pi} className="flex gap-2 sm:gap-2.5 text-[13px] sm:text-sm text-on-surface-variant leading-snug">
                        <span className="text-tertiary mt-1 shrink-0">
                          <span className="block w-1.5 h-1.5 rounded-full bg-tertiary" />
                        </span>
                        <span>{renderInline(part, `${bi}-${ii}-${pi}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {block.freeText.map((line, li) => (
            <p key={li} className="text-[13px] sm:text-sm text-on-surface leading-relaxed">
              {renderInline(line, `${bi}-free-${li}`)}
            </p>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export default ChangelogView;
