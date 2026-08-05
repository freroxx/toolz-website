import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Layers, Cpu, Shield, Sparkles, Clock, Music, Gauge } from "lucide-react";

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

const modules = [
  {
    id: "productivity",
    icon: Clock,
    name: "Productivity",
    tag: "Time",
    desc: "Countdown engines, stopwatches, and Pomodoro focus cycles designed for accuracy.",
    images: allScreenshots.slice(0, 7),
    color: "primary",
  },
  {
    id: "media",
    icon: Music,
    name: "Media & PDF",
    tag: "Studio",
    desc: "Local audio hub, studio-quality recording, and FFmpeg-powered media transformation.",
    images: allScreenshots.slice(7, 14),
    color: "secondary",
  },
  {
    id: "security",
    icon: Shield,
    name: "Security",
    tag: "Hardened",
    desc: "SQLCipher-encrypted password vault and biometric-protected notification archives.",
    images: allScreenshots.slice(14, 21),
    color: "tertiary",
  },
  {
    id: "system",
    icon: Gauge,
    name: "System",
    tag: "Sensors",
    desc: "GPS-based tracking, magnetic compass, and deep hardware diagnostics suite.",
    images: allScreenshots.slice(21),
    color: "primary",
  },
];

const colorMap = {
  primary: {
    active: "hsl(var(--md-primary-container))",
    activeText: "hsl(var(--md-on-primary-container))",
    icon: "hsl(var(--md-primary))",
    tag: "hsl(var(--md-primary) / 0.15)",
    tagText: "hsl(var(--md-primary))",
    indicator: "hsl(var(--md-primary))",
  },
  secondary: {
    active: "hsl(var(--md-secondary-container))",
    activeText: "hsl(var(--md-on-secondary-container))",
    icon: "hsl(var(--md-secondary))",
    tag: "hsl(var(--md-secondary) / 0.15)",
    tagText: "hsl(var(--md-secondary))",
    indicator: "hsl(var(--md-secondary))",
  },
  tertiary: {
    active: "hsl(var(--md-tertiary-container))",
    activeText: "hsl(var(--md-on-tertiary-container))",
    icon: "hsl(var(--md-tertiary))",
    tag: "hsl(var(--md-tertiary) / 0.15)",
    tagText: "hsl(var(--md-tertiary))",
    indicator: "hsl(var(--md-tertiary))",
  },
};

const Showcase = () => {
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [imageIndex, setImageIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const nextImage = useCallback(() => {
    setImageIndex((p) => (p + 1) % activeModule.images.length);
  }, [activeModule.images.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(nextImage, 2800);
    return () => clearInterval(t);
  }, [paused, nextImage]);

  useEffect(() => { setImageIndex(0); }, [activeModule]);

  const activeColors = colorMap[activeModule.color as keyof typeof colorMap];

  return (
    <section
      id="showcase"
      className="py-32 relative overflow-hidden"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      {/* Background blobs with shared motion */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeModule.id + "-blob"}
          layoutId="showcase-glow"
          className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full opacity-20 pointer-events-none blur-[120px]"
          style={{ background: activeColors.indicator }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
      </AnimatePresence>
      <motion.div
         animate={{
           scale: [1, 1.1, 1],
           x: [0, 20, 0],
           y: [0, -30, 0]
         }}
         transition={{ duration: 10, repeat: Infinity }}
         className="absolute top-1/2 left-0 w-96 h-96 rounded-full opacity-[0.05] pointer-events-none blur-[100px]"
         style={{ background: activeColors.indicator }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="text-center mb-16"
        >
          <div className="m3-chip inline-flex mb-6 bg-secondary/10 border-secondary/20 text-secondary">
             App Modules
          </div>
          <h2
            className="m3-display-medium font-bold"
            style={{ color: "hsl(var(--md-on-surface))" }}
          >
            Experience pure{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${activeColors.indicator}, hsl(var(--md-secondary)))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                transition: "all 0.8s ease",
              }}
            >
              precision.
            </span>
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Module selector – M3 Navigation Rail style */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
            className="lg:w-2/5 flex flex-row lg:flex-col gap-3 w-full overflow-x-auto pb-2 lg:pb-0"
          >
            {modules.map((m) => {
              const isActive = activeModule.id === m.id;
              const colors = colorMap[m.color as keyof typeof colorMap];
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m)}
                  className="flex-shrink-0 lg:flex-shrink text-left p-5 rounded-2xl transition-all duration-300 relative overflow-hidden group w-72 lg:w-auto"
                >
                  {/* Background pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 z-0"
                        style={{ background: colors.active }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110"
                      style={{
                        background: isActive ? colors.indicator + "22" : "hsl(var(--md-surface-container-high))",
                        boxShadow: isActive ? `0 8px 16px ${colors.indicator}22` : 'none'
                      }}
                    >
                      <Icon
                        size={24}
                        style={{ color: isActive ? colors.indicator : "hsl(var(--md-on-surface-variant))" }}
                      />
                    </div>
                    <div>
                      <div
                        className="m3-label-small mb-0.5 tracking-wider uppercase font-bold"
                        style={{ color: isActive ? colors.activeText : "hsl(var(--md-on-surface-variant))" }}
                      >
                        {m.tag}
                      </div>
                      <div
                        className="m3-title-medium font-bold"
                        style={{ color: isActive ? colors.activeText : "hsl(var(--md-on-surface))" }}
                      >
                        {m.name}
                      </div>
                      <p
                        className="m3-body-small mt-1 hidden lg:block leading-relaxed"
                        style={{ color: isActive ? colors.activeText + "cc" : "hsl(var(--md-on-surface-variant))" }}
                      >
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
            className="lg:w-3/5 flex justify-center relative"
          >
            {/* Glow */}
            <div
              className="absolute inset-0 -m-12 rounded-full blur-[120px] opacity-30 pointer-events-none transition-all duration-700"
              style={{ background: activeColors.indicator }}
            />

            <div
              className="relative w-[280px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onClick={nextImage}
              style={{ cursor: "pointer" }}
            >
              <div className="m3-phone-frame p-2.5">
                <div className="m3-phone-screen">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${activeModule.id}-${imageIndex}`}
                      src={activeModule.images[imageIndex]}
                      alt={`${activeModule.name} screenshot`}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -40, filter: "blur(5px)" }}
                      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                    />
                  </AnimatePresence>

                  {/* Progress dots */}
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5 z-40">
                    {activeModule.images.slice(0, 8).map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setImageIndex(i); }}
                        className="transition-all duration-500 rounded-full"
                        style={{
                          width: i === imageIndex % activeModule.images.length ? "24px" : "6px",
                          height: "6px",
                          background: i === imageIndex % activeModule.images.length
                            ? activeColors.indicator
                            : "hsl(var(--md-on-surface) / 0.2)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Home bar */}
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-1.5 rounded-full z-30"
                  style={{ background: "hsl(var(--md-on-surface-variant) / 0.3)" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
