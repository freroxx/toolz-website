import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { APP_SCREENSHOTS as allScreenshots } from "@/lib/screenshots";
import { categories as toolCategories, totalTools } from "@/lib/tools-catalog";
import SectionHeader from "@/components/landing/SectionHeader";
import { PRESS_SPRING } from "@/lib/motion";

const SCREEN_TITLES = [
  "Tasks & To-Do",
  "App Launcher & Search",
  "Focus Flow Analytics",
  "Calendar & AI Scheduler",
  "Precision Stopwatch",
  "World Clock & Timezones",
  "Music Player",
  "Unit Converter",
  "SQLCipher Vault",
  "Notes & Markdown",
  "Device Sensors",
  "Color Picker",
  "Screen Flashlight",
  "QR & Barcode Scanner",
  "Compass & Level",
  "Sound Meter (dB)",
  "Scientific Calculator",
  "Audio Recorder",
  "On-Device OCR",
  "File Hash & Checksum",
  "Random Generator",
  "Battery Health",
  "Network Ping & Speed",
  "Hardware Specs",
  "Currency Exchange",
  "Base & Hex Converter",
  "Morse Code & Signal",
  "NFC Tools",
  "Tally Counter",
  "Screen Ruler",
  "Camera Magnifier",
  "Media Downloader",
  "PDF Tools",
  "Clipboard Manager",
  "Quick Settings Tiles",
  "Homescreen Widgets",
  "Skins & Themes",
  "Privacy & Core Settings",
];

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [position, setPosition] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = allScreenshots.length;

  const scrollByCards = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 20 : 240;
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

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((p) => (p !== null ? (p + 1) % total : null));
  }, [total]);

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((p) => (p !== null ? (p - 1 + total) % total : null));
  }, [total]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") setSelectedIndex((p) => (p !== null ? (p + 1) % total : p));
      if (e.key === "ArrowLeft") setSelectedIndex((p) => (p !== null ? (p - 1 + total) % total : p));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, total]);

  const currentIndex = Math.min(total, Math.round(position * (total - 1)) + 1);

  const navButton = (label: string, onClick: () => void, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
      style={{ borderColor: "hsl(var(--md-outline-variant))" }}
    >
      {icon}
    </button>
  );

  return (
    <section
      id="gallery"
      className="scroll-mt-20 py-20 md:py-28"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          chip="Visual tour"
          title="See it before you install it."
          description={`${total} screenshots from the real app, covering ${totalTools} tools across ${toolCategories.length} groups.`}
        />

        {/* Carousel */}
        <div
          ref={trackRef}
          className="mask-fade-horizontal -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2"
          style={{ scrollbarWidth: "none" }}
          role="region"
          aria-label="App screenshots carousel"
        >
          {allScreenshots.map((src, i) => {
            const title = SCREEN_TITLES[i] ?? `Screen ${i + 1}`;
            return (
              <motion.button
                key={src}
                data-card
                type="button"
                onClick={() => setSelectedIndex(i)}
                whileTap={{ scale: 0.97 }}
                transition={PRESS_SPRING}
                className="group shrink-0 snap-center text-left focus-visible:outline-none"
                style={{ width: "min(200px, 58vw)" }}
                aria-label={`Open ${title} screenshot (${i + 1} of ${total})`}
              >
                <span
                  className="block overflow-hidden rounded-[32px] border-[5px] bg-black transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2"
                  style={{
                    aspectRatio: "9/19.5",
                    borderColor: "#1b1b1f",
                  }}
                >
                  <img
                    src={src}
                    alt={`Toolz ${title}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
                <span className="m3-label-large mt-3 block truncate px-1 font-semibold text-on-surface">
                  {title}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center gap-5">
          <span className="m3-label-large tabular-nums text-on-surface-variant">
            <span className="font-bold text-on-surface">{String(currentIndex).padStart(2, "0")}</span>
            {" / "}
            {String(total).padStart(2, "0")}
          </span>

          <div
            className="h-1 max-w-xs flex-1 overflow-hidden rounded-full"
            style={{ background: "hsl(var(--md-surface-container-highest))" }}
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full"
              style={{
                background: "hsl(var(--md-primary))",
                width: `${Math.max(4, position * 100)}%`,
                transition: "width 150ms linear",
              }}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {navButton("Previous screenshots", () => scrollByCards(-1), <ChevronLeft size={20} />)}
            {navButton("Next screenshots", () => scrollByCards(1), <ChevronRight size={20} />)}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            style={{ background: "hsl(var(--md-scrim) / 0.85)" }}
            onClick={() => setSelectedIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Screenshot viewer"
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-[130] grid h-11 w-11 place-items-center rounded-full sm:right-8 sm:top-8"
              style={{
                background: "hsl(var(--md-surface-container-high))",
                color: "hsl(var(--md-on-surface))",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              aria-label="Close viewer"
            >
              <X size={20} />
            </button>

            <button
              type="button"
              className="absolute left-2 z-[130] grid h-12 w-12 place-items-center rounded-full sm:left-8"
              style={{
                background: "hsl(var(--md-surface-container-high))",
                color: "hsl(var(--md-on-surface))",
              }}
              onClick={prev}
              aria-label="Previous screenshot"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              className="absolute right-2 z-[130] grid h-12 w-12 place-items-center rounded-full sm:right-8"
              style={{
                background: "hsl(var(--md-surface-container-high))",
                color: "hsl(var(--md-on-surface))",
              }}
              onClick={next}
              aria-label="Next screenshot"
            >
              <ChevronRight size={24} />
            </button>

            <motion.figure
              key={selectedIndex}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-[110] flex max-h-[90vh] flex-col items-center gap-4"
            >
              <img
                src={allScreenshots[selectedIndex]}
                alt={SCREEN_TITLES[selectedIndex] ?? `Toolz screenshot ${selectedIndex + 1}`}
                className="min-h-0 rounded-[32px] border-[3px] bg-black object-contain"
                style={{
                  maxHeight: "78vh",
                  aspectRatio: "9/19.5",
                  borderColor: "hsl(var(--md-outline-variant) / 0.6)",
                }}
              />
              <figcaption className="m3-label-large text-white/90">
                <span className="font-bold text-white">
                  {SCREEN_TITLES[selectedIndex] ?? `Screen ${selectedIndex + 1}`}
                </span>
                <span className="ml-3 tabular-nums text-white/70">
                  {selectedIndex + 1} / {total}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
