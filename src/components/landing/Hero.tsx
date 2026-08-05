import { Download, Github, ChevronDown, Shield, Zap, Lock, Sparkles } from "lucide-react";
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
  "https://i.ibb.co/YB78db4d/Screenshot-20260801-204152-Toolz.jpg",
  "https://i.ibb.co/QFjpfKM3/Screenshot-20260801-204227-Toolz.jpg",
  "https://i.ibb.co/6c0JdSJb/Screenshot-20260801-204253-Toolz.jpg",
  "https://i.ibb.co/60Y3Kfyd/Screenshot-20260801-204349-Toolz.jpg",
  "https://i.ibb.co/gZpPwFYB/Screenshot-20260801-204451-Toolz.jpg",
  "https://i.ibb.co/LdJkX9W8/Screenshot-20260801-204508-Toolz.jpg",
  "https://i.ibb.co/NdV9Zvvx/Screenshot-20260801-204523-Toolz.jpg",
  "https://i.ibb.co/7xrctBk2/Screenshot-20260801-204546-Toolz.jpg",
  "https://i.ibb.co/3yVtRJK9/Screenshot-20260801-204556-Toolz.jpg",
  "https://i.ibb.co/kg8DK78X/Screenshot-20260801-204625-Toolz.jpg",
  "https://i.ibb.co/PZ5C7W3d/Screenshot-20260801-204720-Toolz.jpg",
  "https://i.ibb.co/pjjRVt11/Screenshot-20260801-204746-Toolz.jpg",
  "https://i.ibb.co/21KCCVnq/Screenshot-20260801-204951-Toolz.jpg",
  "https://i.ibb.co/YFwsHXGX/Screenshot-20260801-205032-Toolz.jpg",
  "https://i.ibb.co/Gf9G1HSD/Screenshot-20260801-205053-Toolz.jpg",
  "https://i.ibb.co/PG37z8B9/Screenshot-20260801-205157-Toolz.jpg",
  "https://i.ibb.co/rfHmrYzG/Screenshot-20260801-205233-Toolz.jpg",
  "https://i.ibb.co/hFcfWbcK/Screenshot-20260801-205252-Toolz.jpg",
  "https://i.ibb.co/vvJcqG6k/Screenshot-20260801-205311-Toolz.jpg",
  "https://i.ibb.co/mVc23hyP/Screenshot-20260801-205448-Toolz.jpg",
  "https://i.ibb.co/przVxJQw/Screenshot-20260801-205634-Toolz.jpg",
  "https://i.ibb.co/TBX23hW8/Screenshot-20260801-205655-Toolz.jpg",
  "https://i.ibb.co/6cS4Ps4k/Screenshot-20260801-205740-Toolz.jpg",
  "https://i.ibb.co/bg8WHNyJ/Screenshot-20260801-205820-Toolz.jpg",
  "https://i.ibb.co/BV2q8cQn/Screenshot-20260801-205902-Toolz.jpg",
  "https://i.ibb.co/C5Zk6tJB/Screenshot-20260801-205939-Toolz.jpg",
];

const pillBadges = [
  { icon: Shield, label: "Privacy as standard" },
  { icon: Sparkles, label: "Zero Slop" },
  { icon: Lock,   label: "100% Local" },
];

const Hero = ({ onDownloadClick }: { onDownloadClick: () => void }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { versionName, isLoading } = useUpdateManifest();

  // Parallax via scroll
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const phoneRotate = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.85]);

  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const blob1X = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const blob2X = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const springConfig = { stiffness: 100, damping: 25, mass: 1 };
  const springPhone = {
    y: useSpring(phoneY, springConfig),
    rotate: useSpring(phoneRotate, springConfig),
    scale: useSpring(phoneScale, springConfig),
  };

  const nextImg = useCallback(() => setImgIndex((p) => (p + 1) % allScreenshots.length), []);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(nextImg, 3200);
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
          style={{ y: blob1Y, x: blob1X }}
          className="absolute -top-40 -left-40 w-[800px] h-[800px] m3-blob opacity-[0.15]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-full h-full rounded-[inherit]"
            style={{ background: "radial-gradient(circle, hsl(var(--md-primary) / 0.4) 0%, transparent 70%)" }}
          />
        </motion.div>

        <motion.div
          style={{ y: blob2Y, x: blob2X }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] m3-blob-2 opacity-[0.12]"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-full h-full rounded-[inherit]"
            style={{ background: "radial-gradient(circle, hsl(var(--md-secondary) / 0.4) 0%, transparent 70%)" }}
          />
        </motion.div>

        {/* Floating background elements */}
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full border border-primary/20"
        />
        <motion.div
          animate={{ y: [0, 30, 0], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full border border-secondary/20"
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--md-outline)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--md-outline)) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* ── Left: Text ── */}
          <motion.div
            style={{ y: textY, opacity }}
            className="flex-1 text-center lg:text-left"
          >
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
              <div className="flex flex-col items-start bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                    style={{ background: "hsl(var(--md-primary))" }}
                  />
                  <span className="m3-label-large font-bold">v{versionName} Beta</span>
                </div>
                <span className="m3-label-small opacity-70">Android 12+</span>
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
              All your{" "}
              <span className="relative">
                 <span className="relative z-10 m3-gradient-text">tools.</span>
                 <motion.div
                   initial={{ scaleX: 0 }}
                   animate={{ scaleX: 1 }}
                   transition={{ delay: 0.8, duration: 0.8, ease: "circOut" }}
                   className="absolute bottom-2 left-0 right-0 h-4 bg-primary/10 -z-10 origin-left rounded-sm"
                 />
              </span>
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 25 }}
              className="m3-body-large mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed text-balance"
              style={{ color: "hsl(var(--md-on-surface-variant))" }}
            >
              Ditch the folder of single-purpose apps. Toolz is a modern utility suite that brings productivity, media, security, and system tools into one polished, expressive home.
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
                Explore Source
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
            initial={{ opacity: 0, x: 100, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 80, damping: 20, mass: 1.2 }}
            className="flex-shrink-0 relative group"
          >
            {/* Glow behind phone */}
            <div
              className="absolute inset-0 -m-32 rounded-full blur-[140px] opacity-40 pointer-events-none transition-all duration-1000 group-hover:opacity-60"
              style={{ background: "radial-gradient(circle, hsl(var(--md-primary) / 0.6), hsl(var(--md-secondary) / 0.4), transparent 70%)" }}
            />

            <div
              className="relative w-[300px] sm:w-[340px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onClick={nextImg}
              style={{ cursor: "pointer" }}
            >
              {/* Phone frame */}
              <div className="m3-phone-frame p-2.5">
                {/* Screen */}
                <div className="m3-phone-screen">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={allScreenshots[imgIndex]}
                      src={allScreenshots[imgIndex]}
                      alt={`Toolz app screenshot ${imgIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                      transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
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
                          className="px-8 py-4 rounded-3xl m3-title-medium shadow-2xl"
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
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-1.5 rounded-full z-30"
                  style={{ background: "hsl(var(--md-on-surface-variant) / 0.3)", backdropFilter: "blur(4px)" }}
                />
              </div>

              {/* Screenshot counter chip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <motion.div
                  layoutId="counter"
                  className="m3-chip text-xs bg-surface-container-high/90 backdrop-blur-xl border-outline-variant/30 py-2 px-4 shadow-xl"
                >
                  <span className="text-primary font-bold">{imgIndex + 1}</span>
                  <span className="opacity-30 mx-2">/</span>
                  <span className="opacity-70">{allScreenshots.length}</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ opacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="m3-label-medium uppercase tracking-[0.2em]" style={{ color: "hsl(var(--md-on-surface-variant) / 0.6)" }}>
            Explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: "hsl(var(--md-primary))" }}
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
