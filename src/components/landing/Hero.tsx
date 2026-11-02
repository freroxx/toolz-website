import { ArrowRight, Download, Github, ShieldCheck, Smartphone, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useLatestRelease } from "@/hooks/use-latest-release";
import { FEATURED_SCREENSHOTS } from "@/lib/screenshots";
import { categories, totalTools } from "@/lib/tools-catalog";

const stats = [
  { value: `${totalTools}`, label: "tools" },
  { value: `${categories.length}`, label: "groups" },
  { value: "0", label: "accounts" },
  { value: "GPLv3", label: "licensed" },
];

const Hero = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { versionName } = useLatestRelease();

  const nextImg = useCallback(
    () => setImgIndex((p) => (p + 1) % FEATURED_SCREENSHOTS.length),
    []
  );

  useEffect(() => {
    if (paused) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const t = setInterval(nextImg, 3600);
    return () => clearInterval(t);
  }, [paused, nextImg]);

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
          {/* ── Copy ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="m3-chip inline-flex items-center gap-2 border-transparent"
              style={{
                background: "hsl(var(--md-secondary-container))",
                color: "hsl(var(--md-on-secondary-container))",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "hsl(var(--md-secondary))" }}
              />
              v{versionName} · Android 12+
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, type: "spring", stiffness: 170, damping: 24 }}
              className="m3-display-large mt-6 text-on-surface"
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", lineHeight: 0.98 }}
            >
              {totalTools} tools.
              <br />
              <span className="text-primary">Zero clutter.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.45 }}
              className="m3-body-large mt-6 max-w-xl text-on-surface-variant"
            >
              Timers, converters, vaults, sensors, downloads and more — one
              open-source Android app. No account, no ads, no telemetry.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.45 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <button
                onClick={onDownloadClick}
                className="m3-btn-filled gap-3 px-8 py-4 text-base"
              >
                <Download size={20} />
                Download v{versionName}
              </button>
              <a href="#features" className="m3-btn-tonal gap-2 px-7 py-4 text-base">
                Browse the catalog
                <ArrowRight size={18} />
              </a>
              <a
                href="https://github.com/freroxx/toolz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Toolz source on GitHub"
                className="m3-btn-outlined hidden gap-2 px-6 py-4 text-base sm:inline-flex"
              >
                <Github size={19} />
                Source
              </a>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              className="mt-10 grid max-w-xl grid-cols-4 divide-x rounded-[24px] py-4"
              style={{
                background: "hsl(var(--md-surface-container))",
                borderColor: "hsl(var(--md-outline-variant) / 0.4)",
              }}
            >
              {stats.map(({ value, label }) => (
                <div key={label} className="px-2 text-center sm:px-4">
                  <dt className="m3-headline-small tabular-nums text-on-surface">
                    {value}
                  </dt>
                  <dd className="m3-label-small mt-0.5 text-on-surface-variant">
                    {label}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* ── Product stage ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 110, damping: 20 }}
            className="relative mx-auto w-full max-w-[460px] lg:mx-0"
          >
            <div
              className="relative overflow-hidden rounded-[40px] p-5 sm:p-7"
              style={{ background: "hsl(var(--md-primary-container))" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-[14px]"
                    style={{ background: "hsl(var(--md-primary) / 0.16)" }}
                  >
                    <Smartphone
                      size={19}
                      style={{ color: "hsl(var(--md-on-primary-container))" }}
                    />
                  </span>
                  <div>
                    <p
                      className="m3-title-small leading-tight"
                      style={{ color: "hsl(var(--md-on-primary-container))" }}
                    >
                      Toolz for Android
                    </p>
                    <p
                      className="m3-label-small opacity-70"
                      style={{ color: "hsl(var(--md-on-primary-container))" }}
                    >
                      One APK · updates in-app
                    </p>
                  </div>
                </div>
                <span
                  className="m3-label-small rounded-full px-3 py-1"
                  style={{
                    background: "hsl(var(--md-primary) / 0.18)",
                    color: "hsl(var(--md-on-primary-container))",
                  }}
                >
                  FREE
                </span>
              </div>

              <div
                className="mt-6 cursor-pointer select-none"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onClick={nextImg}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    nextImg();
                  }
                }}
                aria-label="Show the next app screenshot"
              >
                <div className="m3-phone-frame mx-auto w-full max-w-[248px] p-2">
                  <div className="m3-phone-screen">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={FEATURED_SCREENSHOTS[imgIndex]}
                        src={FEATURED_SCREENSHOTS[imgIndex]}
                        alt={`Toolz app screenshot ${imgIndex + 1} of ${FEATURED_SCREENSHOTS.length}`}
                        className="absolute inset-0 h-full w-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                      />
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
                  {FEATURED_SCREENSHOTS.map((_, i) => (
                    <span
                      key={i}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === imgIndex ? 18 : 6,
                        background:
                          i === imgIndex
                            ? "hsl(var(--md-on-primary-container))"
                            : "hsl(var(--md-on-primary-container) / 0.28)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {[
                  { icon: WifiOff, label: "On-device core" },
                  { icon: ShieldCheck, label: "Encrypted vaults" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
                    style={{ background: "hsl(var(--md-primary) / 0.14)" }}
                  >
                    <Icon
                      size={16}
                      style={{ color: "hsl(var(--md-on-primary-container))" }}
                    />
                    <span
                      className="m3-label-medium"
                      style={{ color: "hsl(var(--md-on-primary-container))" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
