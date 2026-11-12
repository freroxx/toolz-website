import { ArrowRight, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLatestRelease } from "@/hooks/use-latest-release";
import { FEATURED_SCREENSHOTS } from "@/lib/screenshots";
import { PRESS_SPRING } from "@/lib/motion";
import { StaggeredEntrance } from "@/components/expressive/StaggeredEntrance";
import { SHAPES } from "@/components/expressive/shapes";

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
      <div className="container mx-auto px-4">
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
                  Toolz v{versionName} · Android 12+
                </span>
              </div>
            </StaggeredEntrance>

            {/* Display Headline */}
            <StaggeredEntrance index={1} className="mt-6">
              <h1
                className="font-black tracking-tight text-on-surface"
                style={{
                  fontSize: "clamp(2.8rem, 7vw, 5rem)",
                  lineHeight: 1.03,
                }}
              >
                Your device,{" "}
                <span style={{ color: "hsl(var(--md-primary))" }}>
                  fully orchestrated.
                </span>
              </h1>
            </StaggeredEntrance>

            {/* Body */}
            <StaggeredEntrance index={2} className="mt-6">
              <p className="m3-body-large max-w-xl text-on-surface-variant leading-relaxed">
                Every essential tool in one lightweight APK — unit converters,
                encrypted vaults, sensor dashboards, media downloaders, and
                on-device OCR. No login. No cloud. No trackers.
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
              </div>
            </StaggeredEntrance>
          </div>

          {/* ── Right Column: Interactive Phone Stage ── */}
          <StaggeredEntrance index={4} className="relative mx-auto flex w-full max-w-[380px] flex-col items-center justify-center lg:mx-0 lg:max-w-none">
            {/* Ambient background decor */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--md-primary) / 0.08), transparent)",
              }}
              aria-hidden="true"
            />

            <div className="relative w-full max-w-[300px]">
              {/* Phone Frame — pebble shape, infinite float */}
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
              >
                <div
                  className="relative mx-auto overflow-hidden border p-2.5 shadow-2xl"
                  style={{
                    borderRadius: SHAPES.pebble,
                    background: "#0a0a0c",
                    borderColor: "hsl(var(--md-outline-variant) / 0.6)",
                    boxShadow:
                      "0 24px 64px -12px rgba(0, 0, 0, 0.7), 0 12px 24px -8px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {/* Speaker slit & camera punch hole */}
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
              </motion.div>

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
          </StaggeredEntrance>
        </div>
      </div>
    </section>
  );
};

export default Hero;
