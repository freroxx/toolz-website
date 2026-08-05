import { Download, Github, ChevronDown, Shield, Zap, Lock } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUpdateManifest } from "@/hooks/use-update-manifest";

const allScreenshots = [
  "https://i.ibb.co/JPmYCs5/Screenshot-20260801-202638-Toolz.jpg",
  "https://i.ibb.co/8LyXD7gL/Screenshot-20260801-202824-Toolz.jpg",
  "https://i.ibb.co/x8dPC604/Screenshot-20260801-202836-Toolz.jpg",
  "https://i.ibb.co/B5ddDr3B/Screenshot-20260801-202943-Toolz.jpg",
  "https://i.ibb.co/HvXvq7b/Screenshot-20260801-203047-Toolz.jpg",
  "https://i.ibb.co/bgZhLpFC/Screenshot-20260801-203255-Toolz.jpg",
  "https://i.ibb.co/KxBCH1N0/Screenshot-20260801-203650-Toolz.jpg",
  "https://i.ibb.co/fY4P78H0/Screenshot-20260801-203726-Toolz.jpg",
  "https://i.ibb.co/1f6nwgh2/Screenshot-20260801-203837-Toolz.jpg",
  "https://i.ibb.co/VcXgd7Ln/Screenshot-20260801-203956-Toolz.jpg",
  "https://i.ibb.co/TBWstnFX/Screenshot-20260801-204050-Toolz.jpg",
  "https://i.ibb.co/fdJTKt21/Screenshot-20260801-204136-Toolz.jpg",
];

const pillBadges = [
  { icon: Shield, label: "Privacy First" },
  { icon: Zap,    label: "Zero Trackers" },
  { icon: Lock,   label: "100% Local" },
];

const Hero = () => {
  const [imgIndex, setImgIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { versionName, bestRelease, releasesPageUrl, isLoading } = useUpdateManifest();
  const downloadUrl = bestRelease?.downloadUrl ?? releasesPageUrl;

  // Parallax via scroll
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const phoneRotate = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const springPhone = {
    y: useSpring(phoneY, { stiffness: 80, damping: 20 }),
    rotate: useSpring(phoneRotate, { stiffness: 80, damping: 20 }),
    scale: useSpring(phoneScale, { stiffness: 80, damping: 20 }),
  };

  const nextImg = useCallback(() => setImgIndex((p) => (p + 1) % allScreenshots.length), []);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(nextImg, 2800);
    return () => clearInterval(t);
  }, [paused, nextImg]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-20"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      {/* ── Decorative blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          style={{ y: blob1Y }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] m3-blob opacity-25"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-full h-full rounded-[inherit]"
            style={{ background: "radial-gradient(circle, hsl(var(--md-primary) / 0.35) 0%, hsl(var(--md-primary) / 0) 70%)" }}
          />
        </motion.div>
        <motion.div
          style={{ y: blob2Y }}
          className="absolute -bottom-20 -right-40 w-[600px] h-[600px] m3-blob-2 opacity-20"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-full h-full rounded-[inherit]"
            style={{ background: "radial-gradient(circle, hsl(var(--md-secondary) / 0.35) 0%, hsl(var(--md-secondary) / 0) 70%)" }}
          />
        </motion.div>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--md-outline)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--md-outline)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* ── Left: Text ── */}
          <motion.div
            style={{ y: textY, opacity }}
            className="flex-1 text-center lg:text-left"
          >
            {/* Version chip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <div className="m3-chip gap-2">
                <span
                  className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: "hsl(var(--md-primary))" }}
                />
                {isLoading ? "Loading..." : `v${versionName} BETA · Android 12+`}
              </div>
            </motion.div>

            {/* Display heading */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, type: "spring", stiffness: 200, damping: 25 }}
              className="m3-display-large mb-6"
              style={{ color: "hsl(var(--md-on-surface))" }}
            >
              The Android
              <br />
              toolkit you{" "}
              <span
                className="m3-gradient-text"
                style={{ display: "inline-block" }}
              >
                actually
              </span>
              <br />
              deserve.
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, type: "spring", stiffness: 200, damping: 25 }}
              className="m3-body-large mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ color: "hsl(var(--md-on-surface-variant))" }}
            >
              High-precision utility suite for Android.{" "}
              <strong style={{ color: "hsl(var(--md-primary))", fontWeight: 600 }}>100% Free</strong>,{" "}
              Zero Bloat, and Zero AI Slop.
            </motion.p>

            {/* Badge pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, type: "spring", stiffness: 200, damping: 25 }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start mb-10"
            >
              {pillBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="m3-chip gap-2">
                  <Icon size={14} style={{ color: "hsl(var(--md-secondary))" }} />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, type: "spring", stiffness: 200, damping: 25 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <a
                href={downloadUrl}
                className="m3-btn-filled py-4 px-8 text-base gap-3"
                aria-label={`Download Toolz v${versionName} BETA`}
              >
                <Download size={20} />
                Download v{versionName}
                <span
                  className="m3-label-small px-2 py-0.5 rounded-full"
                  style={{
                    background: "hsl(var(--md-on-primary) / 0.15)",
                    color: "hsl(var(--md-on-primary))",
                  }}
                >
                  BETA
                </span>
              </a>
              <a
                href="https://github.com/freroxx/toolz"
                target="_blank"
                rel="noopener noreferrer"
                className="m3-btn-outlined py-4 px-8 text-base gap-3"
              >
                <Github size={20} />
                View Source
              </a>
            </motion.div>
          </motion.div>

          {/* ── Right: Phone mockup ── */}
          <motion.div
            style={{
              y: springPhone.y,
              rotate: springPhone.rotate,
              scale: springPhone.scale,
            }}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 22 }}
            className="flex-shrink-0 relative"
          >
            {/* Glow behind phone */}
            <div
              className="absolute inset-0 -m-16 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(var(--md-primary) / 0.5), hsl(var(--md-secondary) / 0.3), transparent 70%)" }}
            />

            <div
              className="relative w-[280px] sm:w-[320px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onClick={nextImg}
              style={{ cursor: "pointer" }}
            >
              {/* Phone frame */}
              <div className="m3-phone-frame p-3">
                {/* Notch */}
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full z-20"
                  style={{ background: "hsl(var(--md-surface-container-highest))" }}
                />

                {/* Screen */}
                <div
                  className="relative overflow-hidden bg-black"
                  style={{ borderRadius: "38px", aspectRatio: "9/19.5" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={allScreenshots[imgIndex]}
                      src={allScreenshots[imgIndex]}
                      alt={`Toolz app screenshot ${imgIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
                    />
                  </AnimatePresence>

                  {/* Tap hint overlay */}
                  <AnimatePresence>
                    {paused && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "hsl(var(--md-shadow) / 0.3)", backdropFilter: "blur(2px)" }}
                      >
                        <div
                          className="px-5 py-2.5 rounded-full m3-label-large"
                          style={{
                            background: "hsl(var(--md-surface-container-highest) / 0.95)",
                            color: "hsl(var(--md-on-surface))",
                          }}
                        >
                          Tap to advance
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Home bar */}
                <div
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full"
                  style={{ background: "hsl(var(--md-on-surface-variant) / 0.4)" }}
                />
              </div>

              {/* Screenshot counter chip */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="m3-chip text-xs">
                  {imgIndex + 1} / {allScreenshots.length}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ opacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="m3-label-small" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
            Explore
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: "hsl(var(--md-primary))" }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
