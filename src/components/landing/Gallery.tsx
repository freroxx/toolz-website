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

  const scrollByCards = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 240;
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
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % allScreenshots.length : null
    );
  }, []);

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const currentIndex = Math.min(
    allScreenshots.length,
    Math.round(position * (allScreenshots.length - 1)) + 1
  );

  return (
    <section
      id="gallery"
      className="scroll-mt-20 py-16 md:py-24"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4">
        {/* Header Row */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <SectionHeader
            className="mb-6 max-w-2xl md:mb-8"
            chip="Visual Tour"
            title="See it before you install it."
            description={`${allScreenshots.length} screenshots captured from the real app — ${totalTools} tools across ${toolCategories.length} categories.`}
          />

          <div className="mb-6 flex flex-wrap items-center gap-2 md:mb-8">
            {[
              { value: `${allScreenshots.length}`, label: "Screens" },
              { value: `${toolCategories.length}`, label: "Groups" },
              { value: `${totalTools}`, label: "Tools" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex items-baseline gap-1.5 rounded-full border px-4 py-2 shadow-2xs"
                style={{
                  background: "hsl(var(--md-surface-container))",
                  borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                }}
              >
                <span className="m3-title-small tabular-nums font-bold text-on-surface">
                  {value}
                </span>
                <span className="m3-label-small font-medium text-on-surface-variant">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div className="container mx-auto px-4">
        <div
          ref={trackRef}
          className="mask-fade-horizontal -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1"
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
                onClick={() => setSelectedIndex(i)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={PRESS_SPRING}
                className="group relative shrink-0 snap-center overflow-hidden rounded-[30px] border shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                style={{
                  width: "min(220px, 62vw)",
                  aspectRatio: "9/19.5",
                  background: "#0c0c0e",
                  borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                  boxShadow: "0 10px 28px -8px rgba(0, 0, 0, 0.4)",
                }}
                aria-label={`Open ${title} screenshot (${i + 1} of ${allScreenshots.length})`}
              >
                {/* Mini speaker and camera notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                  <div className="h-0.5 w-8 rounded-full bg-white/20 mb-1" />
                  <div className="h-2 w-2 rounded-full bg-black ring-1 ring-white/15" />
                </div>

                <img
                  src={src}
                  alt={`Toolz ${title}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* Subtle glass glare */}
                <div
                  className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
                  }}
                />

                {/* Bottom title badge */}
                <div className="absolute inset-x-2 bottom-2 z-20 pointer-events-none">
                  <div
                    className="flex items-center justify-between rounded-full px-3 py-1.5 backdrop-blur-md shadow-xs border"
                    style={{
                      background: "hsl(var(--md-surface-container-highest) / 0.9)",
                      borderColor: "hsl(var(--md-outline-variant) / 0.3)",
                    }}
                  >
                    <span className="truncate text-[11px] font-semibold text-on-surface">
                      {title}
                    </span>
                    <span className="text-[10px] tabular-nums text-on-surface-variant font-medium ml-1">
                      #{i + 1}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Balanced, Symmetrical M3 Controls */}
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-full border px-5 py-2.5 shadow-2xs"
          style={{
            background: "hsl(var(--md-surface-container))",
            borderColor: "hsl(var(--md-outline-variant) / 0.4)",
          }}
        >
          {/* Left: Monospace Counter */}
          <div className="flex items-center gap-2">
            <span className="m3-label-large tabular-nums font-bold text-on-surface">
              {String(currentIndex).padStart(2, "0")}
            </span>
            <span className="text-on-surface-variant opacity-60 font-normal">/</span>
            <span className="m3-label-medium tabular-nums text-on-surface-variant">
              {String(allScreenshots.length).padStart(2, "0")}
            </span>
            <span className="hidden sm:inline m3-label-small text-on-surface-variant ml-1 font-medium">
              screens
            </span>
          </div>

          {/* Center: Smooth Progress Pill */}
          <div
            className="flex-1 max-w-xs h-2 overflow-hidden rounded-full mx-2"
            style={{ background: "hsl(var(--md-surface-container-highest))" }}
            aria-hidden="true"
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "hsl(var(--md-primary))",
                width: `${Math.max(3, position * 100)}%`,
              }}
              transition={{ duration: 0.15 }}
            />
          </div>

          {/* Right: Symmetrical Nav Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              transition={PRESS_SPRING}
              onClick={() => scrollByCards(-1)}
              aria-label="Previous screenshots"
              className="grid h-10 w-10 place-items-center rounded-full border text-on-surface-variant hover:text-on-surface transition-colors"
              style={{
                background: "hsl(var(--md-surface-container-high))",
                borderColor: "hsl(var(--md-outline-variant) / 0.4)",
              }}
            >
              <ChevronLeft size={19} />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              transition={PRESS_SPRING}
              onClick={() => scrollByCards(1)}
              aria-label="Next screenshots"
              className="grid h-10 w-10 place-items-center rounded-full border text-on-surface-variant hover:text-on-surface transition-colors"
              style={{
                background: "hsl(var(--md-surface-container-high))",
                borderColor: "hsl(var(--md-outline-variant) / 0.4)",
              }}
            >
              <ChevronRight size={19} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            style={{
              background: "hsl(var(--md-scrim) / 0.88)",
              backdropFilter: "blur(16px)",
            }}
            onClick={() => setSelectedIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Screenshot lightbox viewer"
          >
            {/* Top Close Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-4 z-[130] grid h-11 w-11 place-items-center rounded-full border shadow-md transition-transform sm:right-8 sm:top-8"
              style={{
                background: "hsl(var(--md-surface-container-high))",
                borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                color: "hsl(var(--md-on-surface))",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              aria-label="Close lightbox"
            >
              <X size={20} />
            </motion.button>

            {/* Left Nav Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute left-2 z-[130] grid h-12 w-12 place-items-center rounded-full border shadow-lg sm:left-8 sm:h-14 sm:w-14"
              style={{
                background: "hsl(var(--md-surface-container-high))",
                borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                color: "hsl(var(--md-on-surface))",
              }}
              onClick={prev}
              aria-label="Previous screenshot"
            >
              <ChevronLeft size={24} />
            </motion.button>

            {/* Right Nav Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute right-2 z-[130] grid h-12 w-12 place-items-center rounded-full border shadow-lg sm:right-8 sm:h-14 sm:w-14"
              style={{
                background: "hsl(var(--md-surface-container-high))",
                borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                color: "hsl(var(--md-on-surface))",
              }}
              onClick={next}
              aria-label="Next screenshot"
            >
              <ChevronRight size={24} />
            </motion.button>

            {/* Lightbox Device Mockup */}
            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-[110] overflow-hidden rounded-[36px] border-[3px] shadow-2xl"
              style={{
                maxHeight: "86vh",
                aspectRatio: "9/19.5",
                background: "#0c0c0e",
                borderColor: "hsl(var(--md-outline-variant) / 0.6)",
                boxShadow:
                  "0 32px 100px -16px rgba(0, 0, 0, 0.9), 0 0 50px -10px hsl(var(--md-primary) / 0.3)",
              }}
            >
              <img
                src={allScreenshots[selectedIndex]}
                alt={SCREEN_TITLES[selectedIndex] ?? `Toolz screenshot ${selectedIndex + 1}`}
                className="h-full w-full object-contain"
                style={{ background: "#000" }}
              />

              {/* Title & Index Pill */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div
                  className="flex items-center gap-2.5 rounded-full border px-4 py-2 text-white shadow-lg backdrop-blur-xl"
                  style={{
                    background: "rgba(12, 12, 16, 0.85)",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <span className="text-[13px] font-bold text-white">
                    {SCREEN_TITLES[selectedIndex] ?? `Screen ${selectedIndex + 1}`}
                  </span>
                  <span className="h-3 w-px bg-white/25" />
                  <span className="text-[12px] tabular-nums text-white/80">
                    {selectedIndex + 1} / {allScreenshots.length}
                  </span>
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
