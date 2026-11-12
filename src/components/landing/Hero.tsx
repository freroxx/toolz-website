import { ArrowRight, Download, ChevronLeft, ChevronRight, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLatestRelease } from "@/hooks/use-latest-release";
import { FEATURED_SCREENSHOTS } from "@/lib/screenshots";
import { totalTools } from "@/lib/tools-catalog";
import { PRESS_SPRING } from "@/lib/motion";
import { StaggeredEntrance } from "@/components/expressive/StaggeredEntrance";
import { SHAPES } from "@/components/expressive/shapes";

const SCREENSHOT_TITLES = [
  "Tasks & Focus",
  "App Launcher",
  "Focus Flow Analytics",
  "Calendar & AI Scheduler",
  "Precision Stopwatch",
  "World Clock & Timezones",
];

const FACTS = ["Free", "Open source", "No ads", "No account"];

const Hero = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { versionName } = useLatestRelease();
  const count = FEATURED_SCREENSHOTS.length;

  const nextImg = useCallback(() => setImgIndex((p) => (p + 1) % count), [count]);
  const prevImg = useCallback(() => setImgIndex((p) => (p - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(nextImg, 5000);
    return () => clearInterval(t);
  }, [paused, nextImg]);

  const title = SCREENSHOT_TITLES[imgIndex] ?? `Screen ${imgIndex + 1}`;

  return (
    <section
      className="pt-28 pb-16 md:pt-36 md:pb-24"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          {/* Copy */}
          <div className="flex flex-col items-start">
            <StaggeredEntrance index={0}>
              <p
                className="m3-label-large font-semibold uppercase tracking-[0.14em]"
                style={{ color: "hsl(var(--md-primary-ink))" }}
              >
                Toolz v{versionName} · Android 12+
              </p>
            </StaggeredEntrance>

            <StaggeredEntrance index={1} className="mt-5">
              <h1
                className="text-balance font-extrabold tracking-tight text-on-surface"
                style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", lineHeight: 1.05 }}
              >
                {totalTools} tools.
                <br />
                <span style={{ color: "hsl(var(--md-primary))" }}>One lightweight app.</span>
              </h1>
            </StaggeredEntrance>

            <StaggeredEntrance index={2} className="mt-6">
              <p className="m3-body-large max-w-xl text-pretty text-on-surface-variant">
                Converters, an encrypted vault, device sensors, on-device OCR and more,
                in a single open-source APK. Everything works offline.
              </p>
            </StaggeredEntrance>

            <StaggeredEntrance index={3} className="mt-9">
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={onDownloadClick}
                  whileTap={{ scale: 0.96 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-filled gap-2.5 px-7 py-4 text-base font-semibold"
                >
                  <Download size={19} />
                  Download v{versionName}
                </motion.button>

                <motion.div whileTap={{ scale: 0.96 }} transition={PRESS_SPRING}>
                  <Link
                    to="/#features"
                    className="m3-btn-tonal gap-2 px-6 py-4 text-base font-semibold"
                  >
                    Explore tools
                    <ArrowRight size={17} />
                  </Link>
                </motion.div>

                <motion.a
                  href="https://github.com/freroxx/toolz"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.96 }}
                  transition={PRESS_SPRING}
                  className="m3-btn-outlined gap-2 px-5 py-4 text-base font-semibold"
                  aria-label="View Toolz source on GitHub"
                >
                  <Github size={18} />
                  Source
                </motion.a>
              </div>
            </StaggeredEntrance>

            <StaggeredEntrance index={4} className="mt-8">
              <ul className="m3-label-large flex flex-wrap items-center gap-x-3 gap-y-1 text-on-surface-variant">
                {FACTS.map((f, i) => (
                  <li key={f} className="flex items-center gap-3">
                    {i > 0 && (
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: "hsl(var(--md-outline))" }}
                        aria-hidden="true"
                      />
                    )}
                    {f}
                  </li>
                ))}
              </ul>
            </StaggeredEntrance>
          </div>

          {/* Product stage */}
          <StaggeredEntrance index={5} className="mx-auto w-full max-w-[420px]">
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              <div
                className="px-8 pb-0 pt-10 sm:px-12"
                style={{
                  borderRadius: SHAPES.extraLarge,
                  background: "hsl(var(--md-surface-container))",
                }}
              >
                {/* Phone */}
                <div
                  className="relative mx-auto w-full max-w-[250px] overflow-hidden border-[6px] border-b-0 bg-black"
                  style={{
                    aspectRatio: "9/16",
                    borderColor: "#1b1b1f",
                    borderRadius: "32px 32px 0 0",
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={FEATURED_SCREENSHOTS[imgIndex]}
                      src={FEATURED_SCREENSHOTS[imgIndex]}
                      alt={`Toolz ${title}`}
                      className="absolute inset-0 h-full w-full object-cover object-top"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={prevImg}
                  aria-label="Previous screenshot"
                  className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex min-w-0 flex-col items-center gap-2">
                  <span className="m3-label-large truncate font-semibold text-on-surface">
                    {title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {FEATURED_SCREENSHOTS.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImgIndex(i)}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: i === imgIndex ? 20 : 6,
                          background:
                            i === imgIndex
                              ? "hsl(var(--md-primary))"
                              : "hsl(var(--md-outline-variant))",
                        }}
                        aria-label={`Show screenshot ${i + 1}`}
                        aria-current={i === imgIndex}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextImg}
                  aria-label="Next screenshot"
                  className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </StaggeredEntrance>
        </div>
      </div>
    </section>
  );
};

export default Hero;
