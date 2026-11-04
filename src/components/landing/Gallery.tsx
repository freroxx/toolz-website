import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { APP_SCREENSHOTS as allScreenshots } from "@/lib/screenshots";
import { categories as toolCategories, totalTools } from "@/lib/tools-catalog";
import SectionHeader from "@/components/landing/SectionHeader";

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
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % allScreenshots.length : null
    );
  }, []);

  const prev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) =>
      prev !== null
        ? (prev - 1 + allScreenshots.length) % allScreenshots.length
        : null
    );
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight")
        setSelectedIndex((p) =>
          p !== null ? (p + 1) % allScreenshots.length : p
        );
      if (e.key === "ArrowLeft")
        setSelectedIndex((p) =>
          p !== null ? (p - 1 + allScreenshots.length) % allScreenshots.length : p
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex]);

  return (
    <section id="gallery" className="scroll-mt-20 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <SectionHeader
            className="mb-6 max-w-2xl md:mb-8"
            chip="Screens"
            title="See it before you install it."
            description={`${allScreenshots.length} screenshots from the real app — ${totalTools} tools across ${toolCategories.length} groups.`}
          />
          <div className="mb-6 flex items-center gap-2 md:mb-8">
            {[
              { value: `${allScreenshots.length}`, label: "screens" },
              { value: `${toolCategories.length}`, label: "groups" },
              { value: `${totalTools}`, label: "tools" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex items-baseline gap-1.5 rounded-full px-3.5 py-2"
                style={{ background: "hsl(var(--md-surface-container))" }}
              >
                <span className="m3-title-small tabular-nums text-on-surface">
                  {value}
                </span>
                <span className="m3-label-small text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
        className="container mx-auto px-4"
      >
        <div
          ref={trackRef}
          className="mask-fade-horizontal -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 pt-1"
          style={{ scrollbarWidth: "none" }}
          role="region"
          aria-label="App screenshots"
        >
          {allScreenshots.map((src, i) => (
            <button
              key={src}
              data-card
              onClick={() => setSelectedIndex(i)}
              className="group relative shrink-0 snap-center overflow-hidden rounded-[24px] focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
              style={{
                width: "min(220px, 60vw)",
                aspectRatio: "9/19",
                background: "hsl(var(--md-surface-container-high))",
                border: "1px solid hsl(var(--md-outline-variant) / 0.5)",
              }}
              aria-label={`Open screenshot ${i + 1} of ${allScreenshots.length}`}
            >
              <img
                src={src}
                alt={`Toolz screenshot ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="m3-label-large tabular-nums text-on-surface-variant">
            {Math.min(
              allScreenshots.length,
              Math.round(position * (allScreenshots.length - 1)) + 1
            )}
            <span className="opacity-90"> / {allScreenshots.length}</span>
          </span>
          <div className="flex items-center gap-3">
            <div
              className="h-1 w-32 overflow-hidden rounded-full sm:w-48"
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
              className="grid h-11 w-11 place-items-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-primary-ink active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              aria-label="Next screenshots"
              className="grid h-11 w-11 place-items-center rounded-full bg-primary text-on-primary transition-all hover:brightness-110 active:scale-90"
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-5"
            style={{
              background: "hsl(var(--md-scrim) / 0.92)",
              backdropFilter: "blur(16px)",
            }}
            onClick={() => setSelectedIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Screenshot viewer"
          >
            <button
              className="absolute right-4 top-4 z-[120] grid h-12 w-12 place-items-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95 sm:right-8 sm:top-8"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              aria-label="Close"
            >
              <X size={22} />
            </button>

            <button
              className="absolute left-2 z-[120] grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 active:scale-90 sm:left-10 sm:h-16 sm:w-16"
              onClick={prev}
              aria-label="Previous"
            >
              <ChevronLeft size={26} />
            </button>

            <button
              className="absolute right-2 z-[120] grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 active:scale-90 sm:right-10 sm:h-16 sm:w-16"
              onClick={next}
              aria-label="Next"
            >
              <ChevronRight size={26} />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 250, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-[110] overflow-hidden rounded-[32px]"
              style={{
                maxHeight: "88vh",
                aspectRatio: "9/19",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 40px 100px -12px rgba(0,0,0,0.9)",
              }}
            >
              <img
                src={allScreenshots[selectedIndex]}
                alt={`Toolz screenshot ${selectedIndex + 1} of ${allScreenshots.length}`}
                className="h-full w-full object-contain"
                style={{ background: "#000" }}
              />

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="m3-label-large rounded-full border border-white/20 bg-black/80 px-5 py-2 text-white tabular-nums backdrop-blur-2xl">
                  {selectedIndex + 1} <span className="mx-2 opacity-30">/</span>{" "}
                  {allScreenshots.length}
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
