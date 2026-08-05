import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

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
  "https://i.ibb.co/bgWHNyJ/Screenshot-20260801-205820-Toolz.jpg",
  "https://i.ibb.co/BV2q8cQn/Screenshot-20260801-205902-Toolz.jpg",
  "https://i.ibb.co/C5Zk6tJB/Screenshot-20260801-205939-Toolz.jpg",
];

interface ScrollingColumnProps {
  items: string[];
  speed: number;
  reverse?: boolean;
  onSelect: (index: number) => void;
}

const ScrollingColumn = ({ items, speed, reverse = false, onSelect }: ScrollingColumnProps) => (
  <div className="flex flex-col gap-3 relative h-[800px] overflow-hidden">
    <motion.div
      animate={{ y: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      className="flex flex-col gap-3"
    >
      {[...items, ...items].map((src, i) => {
        const actualIndex = allScreenshots.indexOf(src);
        return (
          <button
            key={`${src}-${i}`}
            onClick={() => onSelect(actualIndex)}
            className="relative shrink-0 group overflow-hidden focus-visible:ring-2"
            style={{
              aspectRatio: "9/19",
              borderRadius: "20px",
              border: "1px solid hsl(var(--md-outline-variant) / 0.5)",
            }}
            aria-label="View screenshot"
          >
            <img
              src={src}
              alt="Toolz screenshot"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "hsl(var(--md-shadow) / 0.5)", backdropFilter: "blur(2px)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "hsl(var(--md-surface-container-highest) / 0.9)" }}
              >
                <ZoomIn size={18} style={{ color: "hsl(var(--md-on-surface))" }} />
              </div>
            </div>
          </button>
        );
      })}
    </motion.div>
  </div>
);

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const col1 = allScreenshots.slice(0, 9);
  const col2 = allScreenshots.slice(9, 18);
  const col3 = allScreenshots.slice(18, 28);
  const col4 = allScreenshots.slice(28);

  const next = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % allScreenshots.length : null));
  }, []);

  const prev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + allScreenshots.length) % allScreenshots.length : null));
  }, []);

  return (
    <section
      id="gallery"
      className="py-32 relative overflow-hidden"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="lg:w-2/5"
          >
            <div className="m3-chip inline-flex mb-6">Visual Tour</div>
            <h2
              className="m3-display-medium mb-6"
              style={{ color: "hsl(var(--md-on-surface))" }}
            >
              Every pixel,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, hsl(var(--md-secondary)), hsl(var(--md-primary)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                intentional.
              </span>
            </h2>
            <p
              className="m3-body-large"
              style={{ color: "hsl(var(--md-on-surface-variant))" }}
            >
              {allScreenshots.length}+ screens. Every single one built from scratch
              with Material 3 Expressive components. No templates, no recycled UIs.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-10">
              {[
                { value: `${allScreenshots.length}+`, label: "Screens" },
                { value: "8", label: "Categories" },
                { value: "M3", label: "Expressive" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div
                    className="m3-display-small"
                    style={{ color: "hsl(var(--md-primary))" }}
                  >
                    {value}
                  </div>
                  <div
                    className="m3-label-medium"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Scrolling columns */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
            className="lg:w-3/5 grid grid-cols-2 sm:grid-cols-4 gap-3 h-[800px] overflow-hidden mask-fade-vertical"
          >
            <ScrollingColumn items={col1} speed={38} onSelect={setSelectedIndex} />
            <ScrollingColumn items={col2} speed={48} reverse onSelect={setSelectedIndex} />
            <ScrollingColumn items={col3} speed={42} onSelect={setSelectedIndex} />
            <ScrollingColumn items={col4} speed={52} reverse onSelect={setSelectedIndex} />
          </motion.div>
        </div>
      </div>

      {/* M3 Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: "hsl(var(--md-scrim) / 0.9)", backdropFilter: "blur(20px)" }}
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close FAB - Improved visibility */}
            <button
              className="absolute top-8 right-8 w-16 h-16 rounded-[24px] flex items-center justify-center transition-all z-[120] shadow-2xl bg-white text-black hover:bg-primary hover:text-white"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
              aria-label="Close"
            >
              <X size={32} />
            </button>

            {/* Navigation Buttons - More prominent */}
            <button
              className="absolute left-12 w-20 h-20 rounded-full flex items-center justify-center transition-all z-[120] bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-primary/20 text-white hover:scale-110"
              onClick={prev}
              aria-label="Previous"
            >
              <ChevronLeft size={48} />
            </button>

            <button
              className="absolute right-12 w-20 h-20 rounded-full flex items-center justify-center transition-all z-[120] bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-primary/20 text-white hover:scale-110"
              onClick={next}
              aria-label="Next"
            >
              <ChevronRight size={48} />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 250, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-[110]"
              style={{
                maxHeight: "88vh",
                aspectRatio: "9/19",
                borderRadius: "32px",
                overflow: "hidden",
                border: "1.5px solid rgba(255,255,255,0.1)",
                boxShadow: "0 40px 100px -12px rgba(0,0,0,0.9)",
              }}
            >
              <img
                src={allScreenshots[selectedIndex]}
                alt="Toolz full screenshot"
                className="w-full h-full object-contain"
                style={{ background: "#000" }}
              />

              {/* Counter overlay */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                <div className="px-6 py-2 rounded-full bg-black/80 backdrop-blur-2xl text-white m3-label-large border border-white/20 shadow-2xl">
                   {selectedIndex + 1} <span className="opacity-30 mx-2">/</span> {allScreenshots.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
