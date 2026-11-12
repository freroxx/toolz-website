import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { categories, totalTools } from "@/lib/tools-catalog";
import SectionHeader from "@/components/landing/SectionHeader";
import { ExpressiveFilterChip } from "@/components/expressive/ExpressiveFilterChip";
import { SHAPES } from "@/components/expressive/shapes";

const colorMap = {
  primary: {
    icon: "hsl(var(--md-primary-ink))",
    soft: "hsl(var(--md-primary) / 0.14)",
  },
  secondary: {
    icon: "hsl(var(--md-secondary))",
    soft: "hsl(var(--md-secondary) / 0.14)",
  },
  tertiary: {
    icon: "hsl(var(--md-tertiary))",
    soft: "hsl(var(--md-tertiary) / 0.14)",
  },
} as const;

const ToolCatalog = () => {
  const [activeId, setActiveId] = useState(categories[0].id);
  const [query, setQuery] = useState("");
  const activeIndex = Math.max(0, categories.findIndex((c) => c.id === activeId));
  const active = categories[activeIndex];
  const colors = colorMap[active.color];

  const step = (dir: 1 | -1) => {
    const next = (activeIndex + dir + categories.length) % categories.length;
    setActiveId(categories[next].id);
  };

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return categories.flatMap((c) =>
      c.tools
        .filter((t) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
        .map((t) => ({ group: c.name, icon: c.icon, color: c.color, tool: t }))
    );
  }, [q]);

  const handleChipRowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <section
      id="features"
      className="scroll-mt-20 py-20 md:py-28"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          chip="Tool catalog"
          title={`${totalTools} tools in ${categories.length} groups.`}
          description="Search everything, or browse by group. Every tool ships in the same APK."
        />

        {/* Search bar */}
        <div className="mb-6 flex items-center gap-3 rounded-full border border-outline-variant/50 bg-surface-container-high py-1 pl-5 pr-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
          <Search size={20} className="shrink-0 text-on-surface-variant" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder='Search tools, e.g. "timer", "qr", "vault"'
            aria-label="Search tools"
            className="min-w-0 flex-1 bg-transparent py-3 text-[15px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
          />
          {q && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {q ? (
          <div
            className="border p-5 md:p-8"
            style={{
              borderRadius: SHAPES.extraLarge,
              background: "hsl(var(--md-surface-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.5)",
            }}
            role="region"
            aria-label="Search results"
            aria-live="polite"
          >
            <p className="m3-label-large mb-4 text-on-surface-variant">
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query.trim()}&rdquo;
            </p>
            {results.length === 0 ? (
              <p className="m3-body-medium py-6 text-on-surface-variant">
                No matching tools. Try &ldquo;clock&rdquo;, &ldquo;qr&rdquo;, &ldquo;password&rdquo; or
                &ldquo;currency&rdquo;.
              </p>
            ) : (
              <ul className="grid gap-1 sm:grid-cols-2">
                {results.map(({ group, icon: Icon, color, tool }) => (
                  <li
                    key={`${group}-${tool.name}`}
                    className="flex items-center gap-3.5 rounded-[16px] p-3 transition-colors hover:bg-surface-container-high"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px]"
                      style={{ background: colorMap[color].soft }}
                    >
                      <Icon size={18} style={{ color: colorMap[color].icon }} />
                    </span>
                    <div className="min-w-0">
                      <div className="m3-title-small text-on-surface">{tool.name}</div>
                      <div className="m3-body-small text-on-surface-variant">in {group}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Group chips */}
            <div
              className="scrollbar-none flex gap-2 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Tool groups"
              onKeyDown={handleChipRowKeyDown}
            >
              {categories.map((c) => {
                const Icon = c.icon;
                return (
                  <ExpressiveFilterChip
                    key={c.id}
                    selected={c.id === activeId}
                    onClick={() => setActiveId(c.id)}
                  >
                    <Icon size={14} />
                    {c.name}
                    <span className="text-[11px] opacity-60">({c.tools.length})</span>
                  </ExpressiveFilterChip>
                );
              })}
            </div>

            {/* Detail panel */}
            <div
              className="overflow-hidden border"
              style={{
                borderRadius: SHAPES.extraLarge,
                background: "hsl(var(--md-surface-container))",
                borderColor: "hsl(var(--md-outline-variant) / 0.5)",
              }}
              role="tabpanel"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="p-6 md:p-9"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px]"
                      style={{ background: colors.soft }}
                    >
                      <active.icon className="h-5 w-5" style={{ color: colors.icon }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="m3-title-large text-on-surface">{active.name}</h3>
                      <p className="m3-body-medium mt-1 text-on-surface-variant">{active.intro}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => step(-1)}
                        aria-label="Previous group"
                        className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => step(1)}
                        aria-label="Next group"
                        className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
                    {active.tools.map((tool) => (
                      <li
                        key={tool.name}
                        className="border-t py-3.5"
                        style={{ borderColor: "hsl(var(--md-outline-variant) / 0.4)" }}
                      >
                        <div className="m3-title-small text-on-surface">{tool.name}</div>
                        <div className="m3-body-small mt-0.5 text-on-surface-variant">{tool.desc}</div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="m3-label-medium tabular-nums text-on-surface-variant">
                      Group {activeIndex + 1} of {categories.length}
                    </p>
                    <a
                      href="/spec"
                      className="m3-label-large inline-flex items-center gap-1 text-primary-ink hover:underline"
                    >
                      Check your device specs
                      <ChevronRight size={14} />
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        <p className="m3-body-small mt-6 text-on-surface-variant">
          Also included: homescreen widgets and Quick Settings tiles for flashlight, notes, steps, music and more.
        </p>
      </div>
    </section>
  );
};

export default ToolCatalog;
