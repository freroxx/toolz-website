import { ArrowRight, Download, ChevronLeft, ChevronRight, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLatestRelease } from "@/hooks/use-latest-release";
import { FEATURED_SCREENSHOTS } from "@/lib/screenshots";
import { PRESS_SPRING } from "@/lib/motion";
import { StaggeredEntrance } from "@/components/expressive/StaggeredEntrance";

const SCREENSHOT_TITLES = [
  "Tasks & Focus",
  "App Launcher",
  "Focus Flow Analytics",
  "Calendar & AI Scheduler",
  "Precision Stopwatch",
  "World Clock & Timezones",
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
    <section
      className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      {/* Soft atmospheric background halo */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[640px] rounded-full blur-[120px] opacity-25"
        style={{
          background: "radial-gradient(circle, hsl(var(--md-primary)) 0%, hsl(var(--md-secondary)) 50%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* ── Left Column: Editorial Content ── */}
          <div className="flex flex-col items-start">
            {/* Version & OS chip */}
            <StaggeredEntrance index={0}>
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
                  Toolz v{versionName} · Android 12+ · GPL-3.0
                </span>
              </div>
            </StaggeredEntrance>

            {/* Display Headline */}
            <StaggeredEntrance index={1} className="mt-6">
              <h1
                className="font-black tracking-tight text-on-surface"
                style={{
                  fontSize: "clamp(2.8rem, 6.5vw, 4.8rem)",
                  lineHeight: 1.04,
                }}
              >
                Your device,{" "}
                <span
                  className="font-extrabold"
                  style={{ color: "hsl(var(--md-primary))" }}
                >
                  fully orchestrated.
                </span>
              </h1>
            </StaggeredEntrance>

            {/* Body */}
            <StaggeredEntrance index={2} className="mt-6">
              <p className="m3-body-large max-w-xl text-on-surface-variant leading-relaxed">
                Over 50 utilities unified into a single lightweight APK: unit converters,
                encrypted SQLCipher password vaults, device sensor dashboards, social media downloaders,
                and on-device OCR. No login, no cloud dependencies, no ads.
              </p>
            </StaggeredEntrance>

            {/* CTA row */}
            <StaggeredEntrance index={3} className="mt-8">
              <div className="flex flex-wrap items-center gap-3.5">
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

                <motion.div
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -2 }}
                  transition={PRESS_SPRING}
                >
                  <Link
                    to="/#features"
                    className="m3-btn-tonal gap-2 px-6 py-4 text-base font-semibold"
                  >
                    Explore tools
                    <ArrowRight size={18} />
                  </Link>
                </motion.div>

                <motion.a
                  href="https://github.com/freroxx/toolz"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -2 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-outlined gap-2 px-5 py-4 text-base font-semibold"
                  aria-label="View Toolz source on GitHub"
                >
                  <Github size={18} />
                  Source
                </motion.a>
              </div>
            </StaggeredEntrance>
          </div>

          {/* ── Right Column: Precision Android Hardware Stage ── */}
          <StaggeredEntrance
            index={4}
            className="relative mx-auto flex w-full max-w-[340px] flex-col items-center justify-center lg:mx-0 lg:max-w-none"
          >
            <div className="relative w-full max-w-[300px]">
              {/* Outer Phone Frame — authentic symmetrical hardware chassis */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{
                  duration: 7,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                className="relative"
              >
                {/* Hardware side buttons */}
                <div
                  className="absolute -left-[4px] top-24 h-12 w-[3px] rounded-l-sm bg-neutral-700/80"
                  aria-hidden="true"
                />
                <div
                  className="absolute -right-[4px] top-20 h-9 w-[3px] rounded-r-sm bg-neutral-700/80"
                  aria-hidden="true"
                />

                {/* Device Chassis */}
                <div
                  className="relative mx-auto overflow-hidden rounded-[44px] border-[3.5px] border-[#222228] p-2.5 shadow-2xl transition-all"
                  style={{
                    background: "#0c0c0e",
                    boxShadow:
                      "0 32px 80px -16px rgba(0, 0, 0, 0.8), 0 16px 36px -10px rgba(0, 0, 0, 0.6), 0 0 40px -10px hsl(var(--md-primary) / 0.25)",
                  }}
                >
                  {/* Top Bezel: Speaker & Front Camera */}
                  <div className="flex flex-col items-center pt-0.5 pb-2">
                    <div className="h-1 w-11 rounded-full bg-white/20 mb-1.5" />
                    <div className="flex h-3 w-3 items-center justify-center rounded-full bg-black ring-1 ring-white/20">
                      <div className="h-1 w-1 rounded-full bg-blue-900/60" />
                    </div>
                  </div>

                  {/* Inner Screen */}
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-[34px] bg-black"
                    style={{ aspectRatio: "9/19.5" }}
                    onClick={nextImg}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        nextImg();
                      }
                      if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        prevImg();
                      }
                    }}
                    aria-label="Next screenshot"
                  >
                    {/* Diagonal glass reflection highlight */}
                    <div
                      className="pointer-events-none absolute inset-0 z-20"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 35%, transparent 60%)",
                      }}
                    />

                    <AnimatePresence mode="wait">
                      <motion.img
                        key={FEATURED_SCREENSHOTS[imgIndex]}
                        src={FEATURED_SCREENSHOTS[imgIndex]}
                        alt={`Toolz ${SCREENSHOT_TITLES[imgIndex] ?? `screenshot ${imgIndex + 1}`}`}
                        className="absolute inset-0 h-full w-full object-cover"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                      />
                    </AnimatePresence>

                    {/* Bottom gesture line */}
                    <div
                      className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-24 rounded-full bg-white/30 z-20"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Expressive Carousel Controller capsule */}
              <div
                className="mt-4 flex items-center justify-between gap-2 rounded-full border px-3 py-1.5 shadow-sm"
                style={{
                  background: "hsl(var(--md-surface-container))",
                  borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                }}
              >
                <motion.button
                  type="button"
                  onClick={prevImg}
                  whileTap={{ scale: 0.88 }}
                  transition={PRESS_SPRING}
                  className="grid h-8 w-8 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft size={17} />
                </motion.button>

                {/* Dynamic Screen Title & Interactive indicator dots */}
                <div className="flex flex-col items-center">
                  <span className="text-[12px] font-semibold text-on-surface truncate max-w-[150px]">
                    {SCREENSHOT_TITLES[imgIndex] ?? `Screen ${imgIndex + 1}`}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5" aria-hidden="true">
                    {FEATURED_SCREENSHOTS.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImgIndex(i)}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: i === imgIndex ? 18 : 5,
                          background:
                            i === imgIndex
                              ? "hsl(var(--md-primary))"
                              : "hsl(var(--md-outline-variant) / 0.6)",
                        }}
                        aria-label={`Go to screenshot ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={nextImg}
                  whileTap={{ scale: 0.88 }}
                  transition={PRESS_SPRING}
                  className="grid h-8 w-8 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Next screenshot"
                >
                  <ChevronRight size={17} />
                </motion.button>
              </div>
            </div>
          </StaggeredEntrance>
        </div>
      </div>
    </section>
  );
};

export default Hero;
