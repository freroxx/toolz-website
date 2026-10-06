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
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [shown, setShown] = useState(10);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const { items, loading, unavailable, refreshing, refresh } = usePublicNews();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = (filter === "all" ? items : items.filter((n) => n.priority === filter)).filter(
      (n) => !q || `${n.title} ${n.body}`.toLowerCase().includes(q),
    );
    const sorted = [...base].sort((a, b) => {
      const ta = Date.parse(a.publishAt ?? "") || 0;
      const tb = Date.parse(b.publishAt ?? "") || 0;
      if ((b.pinned ? 1 : 0) !== (a.pinned ? 1 : 0)) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return sorted;
  }, [items, filter, query, sort]);

  const paged = useMemo(() => visible.slice(0, shown), [visible, shown]);

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
    setActiveHash(hash);
    const el = document.getElementById(hash);
    if (el) {
      const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      return () => clearTimeout(t);
    }
  }, [loading, items]);

  // Per-anchor OG so shares show the right card when crawlers execute JS.
  useEffect(() => {
    if (!activeHash) return;
    const n = items.find((x) => `news-${x.id}` === activeHash);
    if (!n) return;
    document.title = `${n.title} — Toolz news`;
    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (sel.includes("property")) el.setAttribute("property", sel.match(/property="([^"]+)"/)?.[1] ?? "");
        else el.setAttribute("name", sel.match(/name="([^"]+)"/)?.[1] ?? "");
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content", n.body.slice(0, 160));
    setMeta('meta[property="og:title"]', "content", n.title);
    setMeta('meta[property="og:description"]', "content", n.body.slice(0, 200));
  }, [activeHash, items]);

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

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShown(10); }}
            placeholder="Search announcements…"
            aria-label="Search announcements"
            className="h-10 min-w-[200px] flex-1 rounded-full border px-4 text-sm"
            style={{ background: "hsl(var(--md-surface-container-high))", borderColor: "hsl(var(--md-outline-variant))" }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            aria-label="Sort announcements"
            className="h-10 rounded-full border px-3 text-sm"
            style={{ background: "hsl(var(--md-surface-container-high))", borderColor: "hsl(var(--md-outline-variant))" }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setShown(10); }}
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
            <button onClick={() => refresh()} disabled={refreshing} className="m3-btn-filled h-11 px-5 text-sm gap-2">
              {refreshing ? "Retrying…" : "Retry"}
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
            <p className="m3-label-large" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
              Showing {paged.length} of {visible.length}{query.trim() ? ` for “${query.trim()}”` : ""}
            </p>
            {paged.map((n, i) => (
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
                  border: activeHash === `news-${n.id}`
                    ? "2px solid hsl(var(--md-primary))"
                    : "1px solid hsl(var(--md-outline-variant))",
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
                {n.imageUrl && !brokenImages.has(n.id) && (
                  <img
                    src={n.imageUrl}
                    alt={n.title}
                    loading="lazy"
                    onError={() => setBrokenImages((prev) => new Set(prev).add(n.id))}
                    className="w-full h-auto rounded-2xl mb-4"
                  />
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
            {paged.length < visible.length && (
              <button onClick={() => setShown((s) => s + 10)} className="m3-btn-outlined h-11 px-5 text-sm mx-auto">
                Show more ({visible.length - paged.length} left)
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
      <DownloadDialog open={downloadOpen} onOpenChange={setDownloadOpen} />
    </div>
  );
};

export default News;
