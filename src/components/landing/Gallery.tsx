import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { APP_SCREENSHOTS as allScreenshots } from "@/lib/screenshots";
import { categories as toolCategories } from "@/lib/tools-catalog";
import SectionHeader from "@/components/landing/SectionHeader";

const toolCount = toolCategories.reduce((n, c) => n + c.tools.length, 0);

/**
 * M3 carousel: snap-scrolling cards with prev/next icon buttons and a
 * position counter. Replaces the four infinite auto-scroll columns —
 * same screenshots, no perpetual motion, no battery drain.
 */
const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [position, setPosition] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 12 : 240;
    track.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth;
      setPosition(max > 0 ? track.scrollLeft / max : 0);
    };
    onScroll();
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const next = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % allScreenshots.length : null));
  }, []);

  const prev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + allScreenshots.length) % allScreenshots.length : null));
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") setSelectedIndex((p) => (p !== null ? (p + 1) % allScreenshots.length : p));
      if (e.key === "ArrowLeft") setSelectedIndex((p) => (p !== null ? (p - 1 + allScreenshots.length) % allScreenshots.length : p));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex]);

  return (
    <section
      id="gallery"
      className="py-20 md:py-32 relative overflow-hidden scroll-mt-20"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          chip="Screens"
          title="See the app before you install it."
          description={`${allScreenshots.length} screenshots from the actual app — ${toolCount}+ tools across ${toolCategories.length} groups, all in one place.`}
        />

        {/* Stats */}
        <div className="flex justify-center gap-10 md:gap-14 mt-[-1rem] mb-10 md:mb-12">
          {[
            { value: `${allScreenshots.length}`, label: "Screens" },
            { value: `${toolCategories.length}`, label: "Groups" },
            { value: `${toolCount}+`, label: "Tools" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="m3-headline-large text-primary tabular-nums">{value}</div>
              <div className="m3-label-medium text-on-surface-variant mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel track — edge to edge, snap scrolling */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 md:px-8 pb-4 pt-1 mask-fade-horizontal"
          style={{ scrollbarWidth: "none" }}
          role="region"
          aria-label="App screenshots"
        >
          {allScreenshots.map((src, i) => (
            <button
              key={src}
              data-card
              onClick={() => setSelectedIndex(i)}
              className="relative shrink-0 snap-center overflow-hidden group focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
              style={{
                width: "min(240px, 62vw)",
                aspectRatio: "9/19",
                borderRadius: "20px",
                border: "1px solid hsl(var(--md-outline-variant) / 0.5)",
                background: "hsl(var(--md-surface-container-low))",
              }}
              aria-label={`Open screenshot ${i + 1} of ${allScreenshots.length}`}
            >
              <img
                src={src}
                alt={`Toolz screenshot ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* Carousel controls */}
        <div className="container mx-auto px-4 mt-4 flex items-center justify-between">
          <span className="m3-label-large text-on-surface-variant tabular-nums">
            {Math.min(allScreenshots.length, Math.round(position * (allScreenshots.length - 1)) + 1)}
            <span className="opacity-40"> / {allScreenshots.length}</span>
          </span>
          <div className="flex items-center gap-3">
            {/* Scroll progress */}
            <div
              className="w-32 sm:w-48 h-1 rounded-full overflow-hidden"
              style={{ background: "hsl(var(--md-surface-container-highest))" }}
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-150"
                style={{ width: `${Math.max(4, position * 100)}%` }}
              />
            </div>
            <button
              onClick={() => scrollByCards(-1)}
              aria-label="Previous screenshots"
              className="w-11 h-11 rounded-full border flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/50 active:scale-90 transition-all"
              style={{ borderColor: "hsl(var(--md-outline-variant) / 0.5)" }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              aria-label="Next screenshots"
              className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:brightness-110 active:scale-90 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: "hsl(var(--md-scrim) / 0.9)", backdropFilter: "blur(20px)" }}
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[24px] flex items-center justify-center transition-all z-[120] shadow-2xl bg-white text-black hover:bg-primary hover:text-white"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
              aria-label="Close"
            >
              <X size={24} className="sm:w-8 sm:h-8" />
            </button>

            <button
              className="absolute left-2 sm:left-12 w-12 h-12 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all z-[120] bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-primary/20 text-white hover:scale-110"
              onClick={prev}
              aria-label="Previous"
            >
              <ChevronLeft size={28} className="sm:w-12 sm:h-12" />
            </button>

            <button
              className="absolute right-2 sm:right-12 w-12 h-12 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all z-[120] bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-primary/20 text-white hover:scale-110"
              onClick={next}
              aria-label="Next"
            >
              <ChevronRight size={28} className="sm:w-12 sm:h-12" />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 250, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-[110]"
              style={{
                maxHeight: "88vh",
                aspectRatio: "9/19",
                borderRadius: "32px",
                overflow: "hidden",
                border: "1.5px solid rgba(255,255,255,0.1)",
                boxShadow: "0 40px 100px -12px rgba(0,0,0,0.9)",
              }}
            >
              <img
                src={allScreenshots[selectedIndex]}
                alt={`Toolz screenshot ${selectedIndex + 1} of ${allScreenshots.length}`}
                className="w-full h-full object-contain"
                style={{ background: "#000" }}
              />

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                <div className="px-6 py-2 rounded-full bg-black/80 backdrop-blur-2xl text-white m3-label-large border border-white/20 shadow-2xl tabular-nums">
                   {selectedIndex + 1} <span className="opacity-30 mx-2">/</span> {allScreenshots.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
