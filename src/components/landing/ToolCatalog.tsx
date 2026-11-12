import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, X } from "lucide-react";
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      step(1);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
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
        <div className="mb-8 flex items-center gap-3 rounded-full border border-outline-variant/50 bg-surface-container-high py-1 pl-5 pr-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
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
            className="p-6 md:p-9"
            style={{
              borderRadius: SHAPES.extraLarge,
              background: "hsl(var(--md-surface-container))",
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
          <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
            {/* Mobile: horizontal chips */}
            <div
              className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
              role="tablist"
              aria-label="Tool groups"
              onKeyDown={handleKeyDown}
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

            {/* Desktop: vertical group list */}
            <div
              className="hidden flex-col gap-1 lg:flex"
              role="tablist"
              aria-orientation="vertical"
              aria-label="Tool groups"
              onKeyDown={handleKeyDown}
            >
              {categories.map((c) => {
                const Icon = c.icon;
                const selected = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveId(c.id)}
                    className="m3-label-large flex items-center gap-3 rounded-full px-5 py-3 text-left font-semibold transition-colors"
                    style={{
                      background: selected ? "hsl(var(--md-secondary-container))" : "transparent",
                      color: selected
                        ? "hsl(var(--md-on-secondary-container))"
                        : "hsl(var(--md-on-surface-variant))",
                    }}
                  >
                    <Icon size={18} />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="tabular-nums opacity-70">{c.tools.length}</span>
                  </button>
                );
              })}
            </div>

            {/* Detail panel */}
            <div
              className="min-h-[360px] overflow-hidden"
              style={{
                borderRadius: SHAPES.extraLarge,
                background: "hsl(var(--md-surface-container))",
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
                      <h3 className="m3-title-large font-bold text-on-surface">{active.name}</h3>
                      <p className="m3-body-medium mt-1 text-on-surface-variant">{active.intro}</p>
                    </div>
                  </div>

                  <ul className="mt-7 grid gap-x-10 sm:grid-cols-2">
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

                  <a
                    href="/spec"
                    className="m3-label-large mt-6 inline-flex items-center gap-1 font-semibold text-primary-ink hover:underline"
                  >
                    Check your device specs
                    <ChevronRight size={14} />
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        <p className="m3-body-small mt-8 text-on-surface-variant">
          Also included: homescreen widgets and Quick Settings tiles for flashlight, notes, steps, music and more.
        </p>
      </div>
    </section>
  );
};

export default ToolCatalog;
