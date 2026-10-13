import { Download, Github, Shield, Lock, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useLatestRelease } from "@/hooks/use-latest-release";
import { FEATURED_SCREENSHOTS } from "@/lib/screenshots";

const pillBadges = [
  { icon: LayoutGrid, label: "50+ tools, one APK" },
  { icon: Shield, label: "On-device first" },
  { icon: Lock, label: "Encrypted vaults" },
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
    const t = setInterval(nextImg, 3200);
    return () => clearInterval(t);
  }, [paused, nextImg]);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-20"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      {/* Single tonal backdrop: one expressive container shape, static. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-48 right-[-10%] w-[640px] h-[640px] opacity-[0.12]"
          style={{
            background: "hsl(var(--md-primary-container))",
            borderRadius: "38% 62% 55% 45% / 48% 42% 58% 52%",
          }}
        />
        <div
          className="absolute bottom-[-20%] left-[-8%] w-[520px] h-[520px] opacity-[0.1]"
          style={{
            background: "hsl(var(--md-secondary-container))",
            borderRadius: "62% 38% 42% 58% / 55% 58% 42% 45%",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* ── Left: Text ── */}
          <div className="flex-1 text-center lg:text-left">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
              className="inline-flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-12 rounded-[22%] overflow-hidden shadow-2xl shadow-primary/20 border border-primary/20 bg-surface-container-highest flex items-center justify-center p-0">
                <img
                  src="/logo.png"
                  alt="Toolz"
                  className="w-full h-full object-cover scale-[1.6]"
                />
              </div>
            </motion.div>

            {/* Display heading */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 22 }}
              className="m3-display-large mb-8"
              style={{ color: "hsl(var(--md-on-surface))" }}
            >
              One home.
              <br />
              All your <span className="m3-gradient-text">tools.</span>
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 25 }}
              className="m3-body-large mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed text-balance"
              style={{ color: "hsl(var(--md-on-surface-variant))" }}
            >
              Ditch the folder of single-purpose apps. Toolz is a free, open-source
              utility suite for Android 12 and up — timers, media, vaults and
              sensors in one place, with no account and no ads.
            </motion.p>

            {/* Badge pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150, damping: 25 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-12"
            >
              {pillBadges.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="m3-chip gap-2 bg-surface-container-high border-outline-variant/30"
                >
                  <Icon size={14} className="text-secondary" />
                  <span className="font-medium">{label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 150, damping: 25 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={onDownloadClick}
                className="m3-btn-filled py-5 px-10 text-lg gap-3 shadow-2xl shadow-primary/20 active:scale-95 transition-transform"
              >
                <Download size={24} />
                Get Toolz
                <div className="flex flex-col items-start leading-none border-l border-on-primary/20 pl-3 ml-1">
                   <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Latest</span>
                   <span className="text-xs">v{versionName}</span>
                </div>
              </button>

              <a
                href="https://github.com/freroxx/toolz"
                target="_blank"
                rel="noopener noreferrer"
                className="m3-btn-outlined py-5 px-10 text-lg gap-3 active:scale-95 transition-transform"
              >
                <Github size={24} />
                Source
              </a>
            </motion.div>
          </div>

          {/* ── Right: Phone mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 80, damping: 20, mass: 1.2 }}
            className="flex-shrink-0 relative group mt-8 lg:mt-0"
          >
            <div
              className="relative w-[260px] sm:w-[340px] mx-auto"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onClick={nextImg}
              style={{ cursor: "pointer" }}
            >
              {/* Phone frame */}
              <div className="m3-phone-frame p-2.5 shadow-2xl">
                {/* Screen */}
                <div className="m3-phone-screen">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={FEATURED_SCREENSHOTS[imgIndex]}
                      src={FEATURED_SCREENSHOTS[imgIndex]}
                      alt={`Toolz app screenshot ${imgIndex + 1} of ${FEATURED_SCREENSHOTS.length}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </AnimatePresence>

                  {/* Tap hint overlay */}
                  <AnimatePresence>
                    {paused && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-40"
                        style={{ background: "hsl(var(--md-shadow) / 0.4)", backdropFilter: "blur(6px)" }}
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-6 py-3 rounded-2xl m3-title-small shadow-2xl"
                          style={{
                            background: "hsl(var(--md-surface-container-highest))",
                            color: "hsl(var(--md-on-surface))",
                            border: "1px solid hsl(var(--md-outline-variant) / 0.5)"
                          }}
                        >
                          Tap to flip
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Home bar */}
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 rounded-full z-30"
                  style={{ background: "hsl(var(--md-on-surface-variant) / 0.3)", backdropFilter: "blur(4px)" }}
                />
              </div>

              {/* Screenshot position dots */}
              <div className="flex justify-center gap-1.5 mt-4" aria-hidden="true">
                {FEATURED_SCREENSHOTS.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === imgIndex ? 20 : 6,
                      background: i === imgIndex
                        ? "hsl(var(--md-primary))"
                        : "hsl(var(--md-outline-variant))",
                    }}
                  />
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
