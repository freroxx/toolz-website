import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, ArrowRight } from "lucide-react";
import { usePublicNews, formatNewsDate } from "@/hooks/usePublicNews";
import { stripMarkdown } from "@/lib/stripMarkdown";

/**
 * Home page news teaser: up to 3 latest real announcements + entry to /news.
 * Renders nothing when the feed is empty or unreachable (keeps home clean).
 */
const NewsSection = () => {
  const { items, loading } = usePublicNews();
  const preview = items.slice(0, 3);

  if (!loading && preview.length === 0) return null;

  return (
    <section
      id="news"
      className="py-24 relative overflow-hidden"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <div className="m3-chip inline-flex mb-6 gap-2">
                <Newspaper size={14} />
                Announcements
              </div>
              <h2
                className="m3-display-small"
                style={{ color: "hsl(var(--md-on-surface))" }}
              >
                Latest{" "}
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
              </h2>
              <p
                className="m3-body-large mt-4 max-w-xl"
                style={{ color: "hsl(var(--md-on-surface-variant))" }}
              >
                Changelog highlights and announcements from the Toolz team —
                the same feed your app shows.
              </p>
            </div>
            <Link to="/news" className="m3-btn-outlined h-11 px-5 text-sm gap-2">
              All news
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl p-6 min-h-[180px] animate-pulse"
                  style={{ background: "hsl(var(--md-surface-container-high))" }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {preview.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 26 }}
                >
                  <Link
                    to="/news"
                    className="block rounded-3xl p-6 h-full transition-transform hover:-translate-y-1 active:scale-[0.99]"
                    style={{
                      background: "hsl(var(--md-surface-container-high))",
                      border: "1px solid hsl(var(--md-outline-variant))",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
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
                        <span className="m3-label-small" style={{ color: "hsl(var(--md-primary))" }}>
                          Pinned
                        </span>
                      )}
                      <span
                        className="m3-label-small ml-auto"
                        style={{ color: "hsl(var(--md-on-surface-variant))" }}
                      >
                        {formatNewsDate(n.publishAt)}
                      </span>
                    </div>
                    {n.imageUrl && (
                      <img
                        src={n.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-full h-auto rounded-2xl mb-4"
                      />
                    )}
                    <div
                      className="m3-title-large font-bold mb-2 line-clamp-2"
                      style={{ color: "hsl(var(--md-on-surface))" }}
                    >
                      {n.title}
                    </div>
                    <div
                      className="m3-body-medium line-clamp-3"
                      style={{ color: "hsl(var(--md-on-surface-variant))" }}
                    >
                      {stripMarkdown(n.body)}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
