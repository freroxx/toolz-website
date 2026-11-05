import { ArrowRight, Download, Github, ShieldCheck, Smartphone, WifiOff, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useLatestRelease } from "@/hooks/use-latest-release";
import { FEATURED_SCREENSHOTS } from "@/lib/screenshots";
import { categories, totalTools } from "@/lib/tools-catalog";
import { PRESS_SPRING } from "@/lib/motion";

const stats = [
  { value: `${totalTools}`, label: "Built-in tools" },
  { value: `${categories.length}`, label: "Categories" },
  { value: "0", label: "Accounts needed" },
  { value: "GPLv3", label: "Free & open" },
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
    const t = setInterval(nextImg, 3800);
    return () => clearInterval(t);
  }, [paused, nextImg]);

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* M3 Expressive Ambient Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
          style={{
            background: "radial-gradient(circle, hsl(var(--md-primary)) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 -right-24 h-[360px] w-[360px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: "radial-gradient(circle, hsl(var(--md-secondary)) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* ── Left Column: Editorial Content ── */}
          <div className="flex flex-col items-start">
            {/* Version & OS chip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="m3-chip inline-flex items-center gap-2 rounded-full border-none px-3.5 py-1.5 shadow-xs"
              style={{
                background: "hsl(var(--md-secondary-container))",
                color: "hsl(var(--md-on-secondary-container))",
              }}
            >
              <span
                className="relative flex h-2 w-2"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "hsl(var(--md-secondary))" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "hsl(var(--md-secondary))" }} />
              </span>
              <span className="m3-label-medium font-semibold tracking-wide">
                v{versionName} · Android 12+
              </span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, type: "spring", stiffness: 220, damping: 26 }}
              className="m3-display-large mt-6 tracking-tight text-on-surface"
              style={{ fontSize: "clamp(2.75rem, 6.5vw, 5rem)", lineHeight: 1.02 }}
            >
              Every essential tool.
              <br />
              <span
                className="font-extrabold"
                style={{ color: "hsl(var(--md-primary))" }}
              >
                Zero bloat.
              </span>
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.4 }}
              className="m3-body-large mt-6 max-w-xl text-on-surface-variant leading-relaxed"
            >
              Over {totalTools} utilities in a single open-source APK: converters, encrypted password
              vaults, system monitors, social downloads, and sensors. No login, no telemetry, no tracking.
            </motion.p>

            {/* Tactile Actions with M3 Expressive Spring Bounces */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <motion.button
                onClick={onDownloadClick}
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -2 }}
                transition={PRESS_SPRING}
                className="m3-btn-filled gap-3 px-8 py-4 text-base shadow-md"
              >
                <Download size={20} />
                Download v{versionName}
              </motion.button>

              <motion.a
                href="#features"
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -2 }}
                transition={PRESS_SPRING}
                className="m3-btn-tonal gap-2 px-6 py-4 text-base"
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
                className="m3-btn-outlined gap-2 px-5 py-4 text-base"
              >
                <Github size={18} />
                Source
              </motion.a>
            </motion.div>

            {/* M3 Stats Strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4 }}
              className="mt-10 grid w-full max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4"
            >
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-[18px] border p-3.5 text-center transition-colors hover:border-outline"
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
            </motion.div>
          </div>

          {/* ── Right Column: Interactive Phone Stage ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.14, type: "spring", stiffness: 180, damping: 24 }}
            className="relative mx-auto flex w-full max-w-[400px] flex-col items-center justify-center lg:mx-0 lg:max-w-none"
          >
            {/* Phone container with subtle M3 elevation */}
            <div className="relative w-full max-w-[300px]">
              {/* Phone Frame */}
              <div
                className="m3-phone-frame relative mx-auto overflow-hidden p-2.5 shadow-2xl"
                style={{
                  borderRadius: "38px",
                  borderColor: "hsl(var(--md-outline-variant) / 0.6)",
                  background: "#08080a",
                }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                {/* Dynamic Island / Camera hole */}
                <div className="absolute top-4 left-1/2 z-30 h-4 w-20 -translate-x-1/2 rounded-full bg-black/80" />

                <div
                  className="m3-phone-screen relative cursor-pointer overflow-hidden"
                  style={{ borderRadius: "28px" }}
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
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation Arrows & Indicators */}
              <div className="mt-4 flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={prevImg}
                  className="grid h-9 w-9 place-items-center rounded-full text-on-surface-variant transition-transform hover:bg-surface-container-high active:scale-90"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft size={18} />
                </button>

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

                <button
                  type="button"
                  onClick={nextImg}
                  className="grid h-9 w-9 place-items-center rounded-full text-on-surface-variant transition-transform hover:bg-surface-container-high active:scale-90"
                  aria-label="Next screenshot"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Floating Feature Badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="absolute -left-10 top-16 hidden sm:flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 shadow-lg backdrop-blur-md"
                style={{
                  background: "hsl(var(--md-surface-container) / 0.92)",
                  borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                  color: "hsl(var(--md-on-surface))",
                }}
              >
                <WifiOff size={16} className="text-secondary" />
                <span className="m3-label-small font-semibold">Offline core</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="absolute -right-10 bottom-24 hidden sm:flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 shadow-lg backdrop-blur-md"
                style={{
                  background: "hsl(var(--md-surface-container) / 0.92)",
                  borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                  color: "hsl(var(--md-on-surface))",
                }}
              >
                <ShieldCheck size={16} className="text-primary-ink" />
                <span className="m3-label-small font-semibold">SQLCipher Vaults</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
