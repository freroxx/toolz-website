import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, ArrowLeft, Megaphone, ExternalLink } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import DownloadDialog from "@/components/landing/DownloadDialog";
import { usePublicNews, formatNewsDate } from "@/hooks/usePublicNews";

const filters = ["all", "critical", "feature", "fix", "promo", "info"] as const;

/** Simple markdown-lite renderer (bold, italic, links, lists). */
function renderBody(body: string, actionUrl: string | null) {
  const lines = body.split("\n");
  return (
    <div className="grid gap-2">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return null;
        if (t.startsWith("- ") || t.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2">
              <span style={{ color: "hsl(var(--md-primary))" }}>•</span>
              <span><Inline text={t.slice(2)} actionUrl={actionUrl} /></span>
            </div>
          );
        }
        return (
          <p key={i}>
            <Inline text={t} actionUrl={actionUrl} />
          </p>
        );
      })}
    </div>
  );
}

function Inline({ text, actionUrl }: { text: string; actionUrl: string | null }) {
  // [label](url) and bare https:// links, **bold**, *italic*
  const parts: React.ReactNode[] = [];
  const re = /(\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s)]+)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
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
        <a key={`l${k++}`} href={m[3]} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "hsl(var(--md-primary))" }}>
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
      parts.push(<strong key={`b${k++}`}>{m[5]}</strong>);
    } else if (m[6]) {
      parts.push(<em key={`i${k++}`}>{m[6]}</em>);
    }
  }
  pushText(text.slice(last));
  void actionUrl;
  return <>{parts}</>;
}

const News = () => {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const { items, loading } = usePublicNews();

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((n) => n.priority === filter)),
    [items, filter],
  );

  return (
    <div className="min-h-screen bg-surface font-sans" style={{ background: "hsl(var(--md-surface))" }}>
      <Navbar onDownloadClick={() => setDownloadOpen(true)} />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-5xl">
        <Link
          to="/#news"
          className="m3-label-large inline-flex items-center gap-2 mb-8 hover:underline"
          style={{ color: "hsl(var(--md-on-surface-variant))" }}
        >
          <ArrowLeft size={16} />
          Back home
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>
          <div className="m3-chip inline-flex mb-6 gap-2">
            <Newspaper size={14} />
            Announcements
          </div>
          <h1 className="m3-display-small mb-4" style={{ color: "hsl(var(--md-on-surface))" }}>
            Toolz{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--md-secondary)), hsl(var(--md-primary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              news.
            </span>
          </h1>
          <p className="m3-body-large max-w-2xl mb-10" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
            Every announcement from the team — changelogs, fixes and notices.
            The same feed your app shows, readable right here.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full m3-label-large capitalize transition-all active:scale-95"
              style={{
                background: filter === f
                  ? "hsl(var(--md-secondary-container))"
                  : "hsl(var(--md-surface-container-high))",
                color: filter === f
                  ? "hsl(var(--md-on-secondary-container))"
                  : "hsl(var(--md-on-surface-variant))",
                border: "1px solid hsl(var(--md-outline-variant))",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-3xl p-8 min-h-[160px] animate-pulse" style={{ background: "hsl(var(--md-surface-container-high))" }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl p-12 text-center" style={{ background: "hsl(var(--md-surface-container-high))" }}>
            <Megaphone size={28} className="mx-auto mb-4" style={{ color: "hsl(var(--md-primary))" }} />
            <div className="m3-title-large font-bold mb-2" style={{ color: "hsl(var(--md-on-surface))" }}>
              {items.length === 0 ? "No announcements yet" : "Nothing in this category"}
            </div>
            <p className="m3-body-large" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
              {items.length === 0 ? "Check back soon — news will appear here first." : "Try another filter."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {visible.map((n, i) => (
              <motion.article
                key={n.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(i * 0.05, 0.3), type: "spring", stiffness: 220, damping: 26 }}
                className="rounded-3xl p-6 sm:p-8"
                style={{
                  background: "hsl(var(--md-surface-container-high))",
                  border: "1px solid hsl(var(--md-outline-variant))",
                }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className="m3-label-small px-3 py-1 rounded-full font-bold uppercase tracking-wider"
                    style={{
                      background: n.priority === "critical"
                        ? "hsl(var(--md-error-container))"
                        : "hsl(var(--md-secondary-container))",
                      color: n.priority === "critical"
                        ? "hsl(var(--md-on-error-container))"
                        : "hsl(var(--md-on-secondary-container))",
                    }}
                  >
                    {n.priority}
                  </span>
                  {n.pinned && (
                    <span className="m3-label-small font-bold" style={{ color: "hsl(var(--md-primary))" }}>
                      Pinned
                    </span>
                  )}
                  <span className="m3-label-small ml-auto" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                    {formatNewsDate(n.publishAt)}
                  </span>
                </div>
                <h2 className="m3-headline-small font-bold mb-3" style={{ color: "hsl(var(--md-on-surface))" }}>
                  {n.title}
                </h2>
                {n.imageUrl && (
                  <img src={n.imageUrl} alt="" loading="lazy" className="w-full max-h-80 object-cover rounded-2xl mb-4" />
                )}
                <div className="m3-body-large" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                  {renderBody(n.body, n.actionUrl)}
                </div>
                {n.actionUrl && (
                  <a
                    href={n.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="m3-btn-filled h-11 px-5 text-sm gap-2 mt-6 inline-flex"
                  >
                    {n.actionLabel || "Open"}
                    <ExternalLink size={14} />
                  </a>
                )}
              </motion.article>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <DownloadDialog open={downloadOpen} onOpenChange={setDownloadOpen} />
    </div>
  );
};

export default News;
