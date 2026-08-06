import React, { useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, CheckCircle2, Users, Sparkles, GitCompare } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useUpdateManifest } from "@/hooks/use-update-manifest";
import { useGithubDownloads } from "@/hooks/use-github-downloads";
import { cn } from "@/lib/utils";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// M3 Expressive spring presets — matched to the Android side's ExpressiveAnimations.kt
// tuning (bouncy, slightly overshooting, never linear).
const SPRING_BOUNCY = { type: "spring", stiffness: 420, damping: 26, mass: 0.9 } as const;
const SPRING_STANDARD = { type: "spring", stiffness: 300, damping: 30 } as const;
const SPRING_SLOW = { type: "spring", stiffness: 220, damping: 24 } as const;

const DownloadCounter = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

// ---------------------------------------------------------------------------
// Changelog markdown — matches the actual format of Toolz's GitHub release
// bodies: `>` section headers wrapping a bold label, `**- Label :** a, b, c`
// pseudo-bullet lines with comma-separated sub-items, plain bold/italic
// paragraphs, and raw URLs. GitHub-flavored, not generic markdown — no
// `#`-headers or `[text](url)` links appear in practice, so those aren't
// force-fit; the parser matches what the source actually produces.
// ---------------------------------------------------------------------------

type InlineToken =
  | { type: "text"; content: string }
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "link"; content: string };

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // Bold and links are matched before italic; the italic branch requires
  // non-word boundaries on both sides so it never fires inside identifiers
  // like "Professional_Day8792".
  const pattern = /(\*\*(.+?)\*\*)|(\bhttps?:\/\/[^\s]+\b)|(?<![\w])_([^_\n]+?)_(?![\w])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      tokens.push({ type: "bold", content: match[2] });
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

const renderInline = (text: string, keyPrefix: string): React.ReactNode => {
  return tokenizeInline(text).map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (token.type) {
      case "bold":
        return (
          <strong key={key} className="font-extrabold text-on-surface">
            {token.content}
          </strong>
        );
      case "italic":
        return (
          <em key={key} className="italic text-on-surface-variant not-italic font-semibold opacity-80">
            {token.content}
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
    <div className="space-y-8">
      {blocks.map((block, bi) => (
        <motion.div
          key={bi}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_STANDARD, delay: bi * 0.06 }}
          className="space-y-4"
        >
          {block.label && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-tertiary-container rounded-full">
              <Sparkles size={13} className="text-on-tertiary-container" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-on-tertiary-container">
                {block.label}
              </span>
            </div>
          )}

          {block.items.length > 0 && (
            <div className="grid gap-3">
              {block.items.map((item, ii) => (
                <div
                  key={ii}
                  className="rounded-[28px] bg-surface-container p-5 border border-outline-variant/15"
                  style={{ borderRadius: "28px 12px 28px 12px" }}
                >
                  <div className="text-sm font-extrabold text-primary mb-2.5">
                    {item.label}
                  </div>
                  <ul className="space-y-2">
                    {item.parts.map((part, pi) => (
                      <li key={pi} className="flex gap-2.5 text-sm text-on-surface-variant leading-snug">
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
            <p key={li} className="text-sm text-on-surface leading-relaxed">
              {renderInline(line, `${bi}-free-${li}`)}
            </p>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------

const DownloadDialog = ({ open, onOpenChange }: DownloadDialogProps) => {
  const { manifest, isLoading } = useUpdateManifest();
  const { totalDownloads, isLoading: isDownloadsLoading } = useGithubDownloads();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent
            forceMount
            className="max-w-2xl bg-transparent border-none p-0 overflow-hidden flex flex-col shadow-none focus:outline-none bottom-0 sm:bottom-auto translate-y-0 sm:-translate-y-1/2 h-[92vh] sm:h-auto sm:max-h-[85vh]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={SPRING_BOUNCY}
              className="bg-surface-container-low flex flex-col h-full overflow-hidden shadow-2xl"
              style={{ borderRadius: "36px 36px 12px 12px" }}
            >
              {/* Mobile drag handle */}
              <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mt-4 mb-1 sm:hidden shrink-0" />

              {/* Header */}
              <div className="px-8 pt-10 pb-8 sm:px-12 sm:pt-12 text-center shrink-0 bg-primary-container/40">
                <motion.div
                  initial={{ scale: 0.4, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...SPRING_BOUNCY, delay: 0.05 }}
                  className="w-16 h-16 mx-auto bg-primary flex items-center justify-center text-on-primary mb-5 shadow-lg"
                  style={{ borderRadius: "24px 24px 8px 24px" }}
                >
                  <Download size={30} strokeWidth={2.4} />
                </motion.div>
                <h2 className="text-[26px] font-extrabold text-on-surface tracking-tight">
                  Update Toolz
                </h2>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING_STANDARD, delay: 0.12 }}
                  className="mt-3 inline-flex px-4 py-1.5 bg-primary rounded-full"
                >
                  <span className="text-xs font-extrabold text-on-primary tracking-wide">
                    v{manifest?.versionName || "1.1.0"}
                  </span>
                </motion.div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-6 sm:px-12 py-8 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-10">

                  {/* Stat + close row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div
                      className="flex-1 bg-secondary-container p-5 flex items-center gap-4"
                      style={{ borderRadius: "24px 24px 24px 8px" }}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-on-secondary-container/10 flex items-center justify-center text-on-secondary-container shrink-0">
                        <Users size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xl font-extrabold text-on-secondary-container leading-none">
                          {isDownloadsLoading ? (
                            <span className="opacity-50">···</span>
                          ) : (
                            <DownloadCounter value={totalDownloads || 0} />
                          )}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-on-secondary-container/70 font-bold mt-1.5">
                          Global Downloads
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      transition={SPRING_BOUNCY}
                      onClick={() => onOpenChange(false)}
                      className="bg-primary text-on-primary px-8 h-[64px] sm:h-auto font-extrabold text-sm flex items-center justify-center gap-2 touch-manipulation shrink-0"
                      style={{ borderRadius: "24px 24px 8px 24px" }}
                    >
                      Close
                      <CheckCircle2 size={18} />
                    </motion.button>
                  </div>

                  {/* APK downloads */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      <h3 className="text-base font-extrabold text-on-surface uppercase tracking-wider">
                        Download APK
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {manifest?.releases.map((release, i) => (
                        <motion.a
                          key={release.abi}
                          href={release.downloadUrl}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...SPRING_STANDARD, delay: 0.05 * i }}
                          whileTap={{ scale: 0.97 }}
                          className="group flex items-center gap-4 p-5 bg-surface-container border border-outline-variant/15 touch-manipulation"
                          style={{ borderRadius: "24px 24px 24px 8px" }}
                        >
                          <div className="w-11 h-11 rounded-2xl bg-primary/12 flex items-center justify-center text-primary group-active:bg-primary group-active:text-on-primary transition-colors shrink-0">
                            <Download size={20} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-base font-extrabold text-on-surface truncate">
                              {release.abi}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight opacity-60">
                              {release.abi === "arm64-v8a" ? "Most Devices" : "Legacy"}
                            </span>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </div>

                  {/* Changelog */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-6 bg-tertiary rounded-full" />
                      <h3 className="text-base font-extrabold text-on-surface uppercase tracking-wider">
                        What's New
                      </h3>
                    </div>

                    {isLoading ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-7 bg-surface-container-highest rounded-full w-1/3" />
                        <div className="h-32 bg-surface-container-highest rounded-[24px] w-full" />
                        <div className="h-32 bg-surface-container-highest rounded-[24px] w-full" />
                      </div>
                    ) : (
                      <ChangelogView raw={manifest?.changelog || ""} />
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 text-center shrink-0 border-t border-outline-variant/10">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-on-surface-variant/40 uppercase tracking-[0.25em]">
                  <GitCompare size={11} />
                  Toolz Open Source Ecosystem
                </div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default DownloadDialog;