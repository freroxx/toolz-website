import { ArrowRight, Download, Github, ShieldCheck, Smartphone, WifiOff, Sparkles, ChevronLeft, ChevronRight, Lock, LayoutGrid, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useLatestRelease } from "@/hooks/use-latest-release";
import { FEATURED_SCREENSHOTS } from "@/lib/screenshots";
import { categories, totalTools } from "@/lib/tools-catalog";
import { PRESS_SPRING } from "@/lib/motion";

const stats = [
  { value: `${totalTools}`, label: "Built-in tools" },
  { value: `${categories.length}`, label: "Tool categories" },
  { value: "0", label: "Accounts or logins" },
  { value: "GPL-3.0", label: "Free & open source" },
];

const highlights = [
  { icon: WifiOff, label: "100% Offline Core" },
  { icon: Lock, label: "SQLCipher Encrypted" },
  { icon: LayoutGrid, label: "QS Tiles & Widgets" },
  { icon: ShieldCheck, label: "Zero Telemetry" },
];

const Hero = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { versionName } = useLatestRelease();

  const nextImg = useCallback(
    () => setImgIndex((p) => (p + 1) % FEATURED_SCREENSHOTS.length),
    []
  );

  const prevImg = useCallback(
    () => setImgIndex((p) => (p - 1 + FEATURED_SCREENSHOTS.length) % FEATURED_SCREENSHOTS.length),
    []
  );

  useEffect(() => {
    if (paused) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const t = setInterval(nextImg, 4200);
    return () => clearInterval(t);
  }, [paused, nextImg]);

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* ── Left Column: Editorial Content ── */}
          <div className="flex flex-col items-start">
            {/* Version & OS chip */}
            <div
              className="m3-chip inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-xs"
              style={{
                background: "hsl(var(--md-secondary-container))",
                borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                color: "hsl(var(--md-on-secondary-container))",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "hsl(var(--md-secondary))" }}
              />
              <span className="m3-label-medium font-semibold tracking-wide">
                Toolz v{versionName} · Android 12+
              </span>
            </div>

            {/* Display Headline */}
            <h1
              className="m3-display-large mt-6 tracking-tight text-on-surface"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.05 }}
            >
              Every essential tool.
              <br />
              <span
                className="font-extrabold"
                style={{ color: "hsl(var(--md-primary))" }}
              >
                Zero bloat. Zero trackers.
              </span>
            </h1>

            {/* Body */}
            <p className="m3-body-large mt-6 max-w-xl text-on-surface-variant leading-relaxed">
              Over {totalTools} utilities unified into a single lightweight APK: unit converters,
              encrypted SQLCipher password vaults, device sensor dashboards, social media downloaders,
              and on-device OCR. No login, no cloud dependencies, no ads.
            </p>

            {/* Tactile Actions with M3 Expressive Spring Bounces */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <motion.button
                onClick={onDownloadClick}
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -2 }}
                transition={PRESS_SPRING}
                className="m3-btn-filled gap-3 px-8 py-4 text-base font-semibold shadow-md"
              >
                <Download size={20} />
                Download v{versionName}
              </motion.button>

              <motion.a
                href="#features"
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -2 }}
                transition={PRESS_SPRING}
                className="m3-btn-tonal gap-2 px-6 py-4 text-base font-semibold"
              >
                Explore tools
                <ArrowRight size={18} />
              </motion.a>

              <motion.a
                href="https://github.com/freroxx/toolz"
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -2 }}
                transition={PRESS_SPRING}
                aria-label="Toolz source on GitHub"
                className="m3-btn-outlined gap-2 px-5 py-4 text-base font-semibold"
              >
                <Github size={18} />
                Source
              </motion.a>
            </div>

            {/* Architectural Highlights Row */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {highlights.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium border"
                  style={{
                    background: "hsl(var(--md-surface-container-high))",
                    borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                    color: "hsl(var(--md-on-surface-variant))",
                  }}
                >
                  <Icon size={14} style={{ color: "hsl(var(--md-primary-ink))" }} />
                  {label}
                </div>
              ))}
            </div>

            {/* M3 Stats Grid */}
            <div className="mt-10 grid w-full max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-[16px] border p-3.5 text-center transition-colors"
                  style={{
                    background: "hsl(var(--md-surface-container-low))",
                    borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                  }}
                >
                  <div className="m3-headline-small tabular-nums font-bold text-on-surface">
                    {value}
                  </div>
                  <div className="m3-label-small mt-0.5 text-on-surface-variant font-medium">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column: Interactive Phone Stage ── */}
          <div className="relative mx-auto flex w-full max-w-[380px] flex-col items-center justify-center lg:mx-0 lg:max-w-none">
            <div className="relative w-full max-w-[300px]">
              {/* Phone Frame */}
              <div
                className="relative mx-auto overflow-hidden rounded-[36px] border p-2.5 shadow-2xl"
                style={{
                  background: "#0a0a0c",
                  borderColor: "hsl(var(--md-outline-variant) / 0.6)",
                  boxShadow: "0 24px 64px -12px rgba(0, 0, 0, 0.7), 0 12px 24px -8px rgba(0, 0, 0, 0.5)",
                }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                {/* Speaker slit & Android camera punch hole */}
                <div className="flex flex-col items-center pt-1 pb-2">
                  <div className="h-1 w-10 rounded-full bg-white/20 mb-2" />
                  <div className="h-3 w-3 rounded-full bg-black ring-1 ring-white/15" />
                </div>

                <div
                  className="relative cursor-pointer overflow-hidden rounded-[26px] bg-black"
                  style={{ aspectRatio: "9/19" }}
                  onClick={nextImg}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      nextImg();
                    }
                  }}
                  aria-label="Next screenshot"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={FEATURED_SCREENSHOTS[imgIndex]}
                      src={FEATURED_SCREENSHOTS[imgIndex]}
                      alt={`Toolz screenshot ${imgIndex + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.28 }}
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation Arrows & Indicators */}
              <div className="mt-4 flex items-center justify-between px-2">
                <motion.button
                  type="button"
                  onClick={prevImg}
                  whileTap={{ scale: 0.9 }}
                  transition={PRESS_SPRING}
                  className="grid h-9 w-9 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft size={18} />
                </motion.button>

                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {FEATURED_SCREENSHOTS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImgIndex(i)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === imgIndex ? 22 : 6,
                        background:
                          i === imgIndex
                            ? "hsl(var(--md-primary))"
                            : "hsl(var(--md-outline-variant) / 0.6)",
                      }}
                      aria-label={`Go to screenshot ${i + 1}`}
                    />
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={nextImg}
                  whileTap={{ scale: 0.9 }}
                  transition={PRESS_SPRING}
                  className="grid h-9 w-9 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  aria-label="Next screenshot"
                >
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
