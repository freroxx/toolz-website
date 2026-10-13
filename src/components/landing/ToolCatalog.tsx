import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories, totalTools } from "@/lib/tools-catalog";


const colorMap = {
  primary: {
    selected: "hsl(var(--md-primary-container))",
    selectedText: "hsl(var(--md-on-primary-container))",
    icon: "hsl(var(--md-primary))",
    soft: "hsl(var(--md-primary) / 0.12)",
  },
  secondary: {
    selected: "hsl(var(--md-secondary-container))",
    selectedText: "hsl(var(--md-on-secondary-container))",
    icon: "hsl(var(--md-secondary))",
    soft: "hsl(var(--md-secondary) / 0.12)",
  },
  tertiary: {
    selected: "hsl(var(--md-tertiary-container))",
    selectedText: "hsl(var(--md-on-tertiary-container))",
    icon: "hsl(var(--md-tertiary))",
    soft: "hsl(var(--md-tertiary) / 0.12)",
  },
} as const;

const ToolCatalog = () => {
  const [activeId, setActiveId] = useState(categories[0].id);
  const activeIndex = Math.max(0, categories.findIndex((c) => c.id === activeId));
  const active = categories[activeIndex];
  const colors = colorMap[active.color];

  const step = (dir: 1 | -1) => {
    const next = (activeIndex + dir + categories.length) % categories.length;
    setActiveId(categories[next].id);
  };

  return (
    <section
      id="features"
      className="py-20 md:py-32 relative overflow-hidden scroll-mt-20"
      style={{ background: "hsl(var(--md-surface))" }}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, hsl(var(--md-primary) / 0.4) 0%, transparent 70%)",
        }}
      />
      {/* Soft glow following the active group */}
      <motion.div
        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06] pointer-events-none blur-[120px]"
        animate={{ backgroundColor: colors.icon }}
        transition={{ duration: 0.6 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="m3-chip inline-flex mb-5 md:mb-6">Toolz Catalog</div>
          <h2
            className="m3-display-medium text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6"
            style={{ color: "hsl(var(--md-on-surface))" }}
          >
            {totalTools}+ tools in {categories.length} groups.
          </h2>
          <p
            className="m3-body-large max-w-xl mx-auto px-2 text-[15px] md:text-lg"
            style={{ color: "hsl(var(--md-on-surface-variant))" }}
          >
            One APK for Android 12 and up. Select a group to see each tool and what it does.
          </p>
        </motion.div>

        {/* Group selector */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 180, damping: 26 }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4 mb-4 md:mb-6"
          role="tablist"
          aria-label="Tool groups"
        >
          {categories.map((c) => {
            const isActive = c.id === activeId;
            const Icon = c.icon;
            const cColors = colorMap[c.color];
            return (
              <motion.button
                key={c.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(c.id)}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-[18px] md:rounded-[24px] border p-3.5 md:p-5 text-left overflow-hidden",
                  !isActive && "hover:border-primary/40"
                )}
                style={
                  isActive
                    ? {
                        background: cColors.selected,
                        borderColor: "transparent",
                        boxShadow: "0 12px 32px -12px rgba(0,0,0,0.5)",
                      }
                    : {
                        background: "hsl(var(--md-surface-container-high))",
                        borderColor: "hsl(var(--md-outline-variant) / 0.35)",
                      }
                }
              >
                <span
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? `${cColors.icon}26` : "hsl(var(--md-surface-container-highest))",
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      color: isActive ? cColors.selectedText : "hsl(var(--md-on-surface-variant))",
                    }}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block text-[13px] md:text-[15px] font-bold leading-tight truncate"
                    style={{
                      color: isActive ? cColors.selectedText : "hsl(var(--md-on-surface))",
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    className="block text-[11px] md:text-xs tabular-nums mt-0.5"
                    style={{
                      color: isActive
                        ? `${cColors.selectedText}b3`
                        : "hsl(var(--md-on-surface-variant) / 0.75)",
                    }}
                  >
                    {c.tools.length} tool{c.tools.length === 1 ? "" : "s"}
                  </span>
                </span>
                <span
                  className={cn(
                    "w-6 h-6 rounded-full items-center justify-center shrink-0 hidden sm:flex"
                  )}
                  style={{
                    background: isActive ? `${cColors.selectedText}26` : "transparent",
                    color: isActive ? cColors.selectedText : "hsl(var(--md-on-surface-variant) / 0.4)",
                  }}
                >
                  <Check size={14} strokeWidth={3} className={isActive ? "block" : "hidden"} />
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Detail panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          className="max-w-3xl mx-auto rounded-[24px] md:rounded-[32px] border p-5 md:p-8"
          style={{
            background: "hsl(var(--md-surface-container-low))",
            borderColor: "hsl(var(--md-outline-variant) / 0.4)",
          }}
          role="tabpanel"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {/* Panel header */}
              <div className="flex items-center gap-3 md:gap-4 mb-2">
                <div
                  className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 p-3"
                  style={{ background: colors.soft }}
                >
                  <active.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: colors.icon }} />
                </div>
                <div className="min-w-0">
                  <h3
                    className="m3-title-large text-lg md:text-2xl leading-tight"
                    style={{ color: "hsl(var(--md-on-surface))" }}
                  >
                    {active.name}
                  </h3>
                  <p
                    className="text-[12.5px] md:text-sm truncate sm:whitespace-normal"
                    style={{ color: "hsl(var(--md-on-surface-variant))" }}
                  >
                    {active.intro}
                  </p>
                </div>
                <div className="ml-auto flex gap-1.5 shrink-0">
                  <button
                    onClick={() => step(-1)}
                    aria-label="Previous group"
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full border flex items-center justify-center active:scale-90 transition-transform"
                    style={{
                      borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                      color: "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => step(1)}
                    aria-label="Next group"
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full border flex items-center justify-center active:scale-90 transition-transform"
                    style={{
                      borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                      color: "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Tools */}
              <ul>
                {active.tools.map((tool, i) => (
                  <li
                    key={tool.name}
                    className="flex items-baseline gap-3 md:gap-4 py-3 md:py-3.5 border-b last:border-b-0"
                    style={{ borderColor: "hsl(var(--md-outline-variant) / 0.25)" }}
                  >
                    <span
                      className="text-[11px] md:text-xs font-bold tabular-nums shrink-0 w-6"
                      style={{ color: colors.icon }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div
                        className="text-[14px] md:text-[15px] font-bold leading-snug"
                        style={{ color: "hsl(var(--md-on-surface))" }}
                      >
                        {tool.name}
                      </div>
                      <div
                        className="text-[12.5px] md:text-sm leading-relaxed"
                        style={{ color: "hsl(var(--md-on-surface-variant))" }}
                      >
                        {tool.desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <p
                className="mt-3 text-[11.5px] md:text-xs tabular-nums"
                style={{ color: "hsl(var(--md-on-surface-variant) / 0.6)" }}
              >
                Group {activeIndex + 1} of {categories.length} · {active.tools.length} tool
                {active.tools.length === 1 ? "" : "s"}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <p
          className="text-center mt-6 md:mt-8 text-[13px] md:text-sm px-4"
          style={{ color: "hsl(var(--md-on-surface-variant) / 0.7)" }}
        >
          Plus homescreen widgets and Quick Settings tiles for flashlight, notes, steps, music and more.
        </p>
      </div>
    </section>
  );
};

export default ToolCatalog;
