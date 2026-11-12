import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { usePublicNews, formatNewsDate } from "@/hooks/usePublicNews";
import { stripMarkdown } from "@/lib/stripMarkdown";
import { newsPriorityChipStyle } from "@/lib/newsStyle";
import SectionHeader from "@/components/landing/SectionHeader";
import { PRESS_SPRING } from "@/lib/motion";
import { SHAPES } from "@/components/expressive/shapes";

const MotionLink = motion(Link);

function updatedAgo(at: number): string | null {
  if (!at) return null;
  const mins = Math.max(0, Math.floor((Date.now() - at) / 60000));
  if (mins < 1) return "updated just now";
  if (mins < 60) return `updated ${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `updated ${h}h ago`;
  return `updated ${Math.floor(h / 24)}d ago`;
}

const NewsSection = () => {
  const { items, loading, updatedAt } = usePublicNews();
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const preview = items.slice(0, 3);
  const stamp = updatedAgo(updatedAt);

  if (!loading && preview.length === 0) return null;

  return (
    <section
      id="news"
      className="scroll-mt-20 py-20 md:py-28"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <SectionHeader
            className="mb-0"
            chip="Announcements"
            title="Latest news."
            description={
              <>
                Changelog highlights from the Toolz team, the same feed the app shows.
                {stamp && <span className="m3-label-small ml-2">{stamp}</span>}
              </>
            }
          />
          <Link to="/news" className="m3-btn-outlined h-11 gap-2 px-5 text-sm">
            All news
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="min-h-[200px] animate-pulse"
                style={{
                  borderRadius: SHAPES.extraLarge,
                  background: "hsl(var(--md-surface-container-high))",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {preview.map((n) => (
              <MotionLink
                key={n.id}
                to={`/news#news-${n.id}`}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={PRESS_SPRING}
                className="block h-full p-6 transition-colors hover:bg-surface-container-high"
                style={{
                  borderRadius: SHAPES.extraLarge,
                  background: "hsl(var(--md-surface-container))",
                }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <span
                    className="m3-label-small rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider"
                    style={newsPriorityChipStyle(n.priority)}
                  >
                    {n.priority}
                  </span>
                  {n.pinned && (
                    <span
                      className="m3-label-small font-semibold"
                      style={{ color: "hsl(var(--md-primary-ink))" }}
                    >
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
                {n.imageUrl && !broken.has(n.id) && (
                  <img
                    src={n.imageUrl}
                    alt=""
                    loading="lazy"
                    onError={() => setBroken((prev) => new Set(prev).add(n.id))}
                    className="mb-4 h-auto w-full rounded-[16px]"
                  />
                )}
                <div
                  className="m3-title-medium mb-2 line-clamp-2 font-bold"
                  style={{ color: "hsl(var(--md-on-surface))" }}
                >
                  {n.title}
                </div>
                <div
                  className="m3-body-small line-clamp-3 leading-relaxed"
                  style={{ color: "hsl(var(--md-on-surface-variant))" }}
                >
                  {stripMarkdown(n.body)}
                </div>
              </MotionLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
