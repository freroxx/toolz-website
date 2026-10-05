import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, ArrowLeft, Megaphone, ExternalLink, Link2, Check } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import DownloadDialog from "@/components/landing/DownloadDialog";
import { NewsBody } from "@/components/news/NewsBody";
import { usePublicNews, formatNewsDate } from "@/hooks/usePublicNews";

const filters = ["all", "critical", "feature", "fix", "promo", "info"] as const;

const News = () => {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { items, loading, unavailable } = usePublicNews();

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((n) => n.priority === filter)),
    [items, filter],
  );

  // SEO: honest title + description (no per-item route; anchors carry the id).
  useEffect(() => {
    document.title = "Toolz news — announcements & changelog";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Every Toolz announcement — changelogs, fixes and notices. Same feed the app shows.");
  }, []);

  // Deep-link: /news#news-<id> scrolls + highlights (matches the app's Read on website).
  useEffect(() => {
    if (loading || items.length === 0) return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.startsWith("news-")) return;
    const el = document.getElementById(hash);
    if (el) {
      const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      return () => clearTimeout(t);
    }
  }, [loading, items]);

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/news#news-${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1600);
  };

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
          <a
            href="/api/news-rss"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full m3-label-large transition-all active:scale-95 hover:underline"
            style={{
              background: "hsl(var(--md-surface-container-high))",
              color: "hsl(var(--md-on-surface-variant))",
              border: "1px solid hsl(var(--md-outline-variant))",
            }}
            title="Subscribe via RSS"
          >
            RSS
          </a>
        </div>

        {loading ? (
          <div className="grid gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-3xl p-8 min-h-[160px] animate-pulse" style={{ background: "hsl(var(--md-surface-container-high))" }} />
            ))}
          </div>
        ) : unavailable ? (
          <div className="rounded-3xl p-12 text-center" style={{ background: "hsl(var(--md-surface-container-high))" }}>
            <Megaphone size={28} className="mx-auto mb-4" style={{ color: "hsl(var(--md-primary))" }} />
            <div className="m3-title-large font-bold mb-2" style={{ color: "hsl(var(--md-on-surface))" }}>
              News feed unavailable
            </div>
            <p className="m3-body-large mb-6" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
              We couldn't reach the announcements feed. Check your connection and try again.
            </p>
            <button onClick={() => window.location.reload()} className="m3-btn-filled h-11 px-5 text-sm gap-2">
              Retry
            </button>
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
                id={`news-${n.id}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(i * 0.05, 0.3), type: "spring", stiffness: 220, damping: 26 }}
                className="rounded-3xl p-6 sm:p-8 scroll-mt-28"
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
                  <img src={n.imageUrl} alt="" loading="lazy" className="w-full h-auto rounded-2xl mb-4" />
                )}
                <div className="m3-body-large" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                  <NewsBody body={n.body} />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {n.actionUrl ? (
                    n.actionUrl.startsWith("toolz://") ? (
                      <span
                        className="m3-label-large inline-flex h-11 items-center px-5 text-sm"
                        style={{ color: "hsl(var(--md-on-surface-variant))" }}
                        title="This button opens inside the Toolz app"
                      >
                        {n.actionLabel || "Open"} · in-app only
                      </span>
                    ) : (
                      <a
                        href={n.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="m3-btn-filled h-11 px-5 text-sm gap-2 inline-flex"
                      >
                        {n.actionLabel || "Open"}
                        <ExternalLink size={14} />
                      </a>
                    )
                  ) : null}
                  <button
                    onClick={() => copyLink(n.id)}
                    className="m3-label-large inline-flex h-11 items-center gap-2 px-4 text-sm hover:underline"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                    title="Copy link to this announcement"
                  >
                    {copiedId === n.id ? <Check size={14} /> : <Link2 size={14} />}
                    {copiedId === n.id ? "Copied" : "Copy link"}
                  </button>
                </div>
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
