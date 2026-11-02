import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories, totalTools } from "@/lib/tools-catalog";
import SectionHeader from "@/components/landing/SectionHeader";

const colorMap = {
  primary: {
    selected: "hsl(var(--md-primary-container))",
    selectedText: "hsl(var(--md-on-primary-container))",
    icon: "hsl(var(--md-primary))",
    soft: "hsl(var(--md-primary) / 0.14)",
  },
  secondary: {
    selected: "hsl(var(--md-secondary-container))",
    selectedText: "hsl(var(--md-on-secondary-container))",
    icon: "hsl(var(--md-secondary))",
    soft: "hsl(var(--md-secondary) / 0.14)",
  },
  tertiary: {
    selected: "hsl(var(--md-tertiary-container))",
    selectedText: "hsl(var(--md-on-tertiary-container))",
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
        .filter(
          (t) =>
            t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
        )
        .map((t) => ({ group: c.name, icon: c.icon, color: c.color, tool: t }))
    );
  }, [q]);

  return (
    <section
      id="features"
      className="relative scroll-mt-20 py-16 md:py-24"
      style={{ background: "hsl(var(--md-surface-container-low))" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <SectionHeader
            className="mb-6 max-w-2xl md:mb-8"
            chip="Tool catalog"
            title={`${totalTools} tools in ${categories.length} groups.`}
            description="Search across everything, or open a group to see what is inside. Every tool ships in the same APK."
          />
          <div className="mb-6 flex items-center gap-2 md:mb-8">
            <span className="m3-label-medium text-on-surface-variant">
              Android 12+
            </span>
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: "hsl(var(--md-outline))" }}
            />
            <span className="m3-label-medium text-on-surface-variant">
              No account
            </span>
          </div>
        </div>

        {/* M3 search bar */}
        <div
          className="mb-5 flex items-center gap-3 rounded-full border border-outline-variant/50 bg-surface-container-high py-1.5 pl-5 pr-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
        >
          <Search size={20} className="shrink-0 text-on-surface-variant" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Search tools — try “timer”, “qr”, “vault”…"
            aria-label="Search tools"
            className="min-w-0 flex-1 bg-transparent py-3 text-[15px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
          {q && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container-highest active:scale-90"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {q ? (
          <motion.div
            key="search-results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="rounded-[28px] p-5 md:rounded-[36px] md:p-8"
            style={{ background: "hsl(var(--md-surface-container))" }}
            role="region"
            aria-label="Search results"
          >
            <p className="m3-label-medium mb-2 uppercase tracking-[0.14em] text-on-surface-variant">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query.trim()}”
            </p>
            {results.length === 0 ? (
              <p className="m3-body-medium py-4 text-on-surface-variant">
                Nothing matches. Try a shorter word like “clock”, “pdf” or “coin”.
              </p>
            ) : (
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {results.map(({ group, icon: Icon, color, tool }) => (
                  <li
                    key={`${group}-${tool.name}`}
                    className="flex items-center gap-3 border-b py-3 last:border-b-0"
                    style={{ borderColor: "hsl(var(--md-outline-variant) / 0.3)" }}
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px]"
                      style={{ background: colorMap[color].soft }}
                    >
                      <Icon size={17} style={{ color: colorMap[color].icon }} />
                    </span>
                    <div className="min-w-0">
                      <div className="m3-title-small text-on-surface">{tool.name}</div>
                      <div className="m3-body-small text-on-surface-variant">
                        in {group}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-6">
            {/* Group selector */}
            <div
              className="grid grid-cols-2 gap-2.5"
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
                    className={cn(
                      "relative flex min-h-[76px] items-center gap-2.5 overflow-hidden rounded-[20px] p-3 text-left transition-colors",
                      !isActive && "hover:brightness-110"
                    )}
                    style={
                      isActive
                        ? { background: cColors.selected }
                        : { background: "hsl(var(--md-surface-container))" }
                    }
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px]"
                      style={{
                        background: isActive
                          ? "hsl(var(--md-on-surface) / 0.12)"
                          : "hsl(var(--md-surface-container-high))",
                      }}
                    >
                      <Icon
                        size={17}
                        style={{
                          color: isActive
                            ? cColors.selectedText
                            : "hsl(var(--md-on-surface-variant))",
                        }}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="m3-label-large block leading-tight"
                        style={{
                          color: isActive
                            ? cColors.selectedText
                            : "hsl(var(--md-on-surface))",
                        }}
                      >
                        {c.name}
                      </span>
                      <span
                        className="m3-label-small mt-0.5 block tabular-nums"
                        style={{
                          color: isActive
                            ? `${cColors.selectedText}b3`
                            : "hsl(var(--md-on-surface-variant))",
                        }}
                      >
                        {c.tools.length} tool{c.tools.length === 1 ? "" : "s"}
                      </span>
                    </span>
                    {isActive && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="shrink-0"
                        style={{ color: cColors.selectedText }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Detail panel */}
            <div
              className="overflow-hidden rounded-[28px] md:rounded-[36px]"
              style={{ background: "hsl(var(--md-surface-container))" }}
              role="tabpanel"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 md:p-7"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px]"
                      style={{ background: colors.soft }}
                    >
                      <active.icon
                        className="h-5 w-5"
                        style={{ color: colors.icon }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="m3-title-large text-on-surface">{active.name}</h3>
                      <p className="m3-body-small mt-1 text-on-surface-variant">
                        {active.intro}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => step(-1)}
                        aria-label="Previous group"
                        className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-transform hover:bg-surface-container-high active:scale-90"
                      >
                        <ChevronLeft size={19} />
                      </button>
                      <button
                        onClick={() => step(1)}
                        aria-label="Next group"
                        className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-transform hover:bg-surface-container-high active:scale-90"
                      >
                        <ChevronRight size={19} />
                      </button>
                    </div>
                  </div>

                  <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
                    {active.tools.map((tool, i) => (
                      <li
                        key={tool.name}
                        className="flex items-baseline gap-3 border-b py-3"
                        style={{
                          borderColor: "hsl(var(--md-outline-variant) / 0.3)",
                        }}
                      >
                        <span
                          className="m3-label-small w-5 shrink-0 tabular-nums"
                          style={{ color: colors.icon }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="m3-title-small text-on-surface">
                            {tool.name}
                          </div>
                          <div className="m3-body-small text-on-surface-variant">
                            {tool.desc}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="m3-label-small tabular-nums text-on-surface-variant/70">
                      Group {activeIndex + 1} of {categories.length} ·{" "}
                      {active.tools.length} tool
                      {active.tools.length === 1 ? "" : "s"}
                    </p>
                    <a
                      href="/spec"
                      className="m3-label-large inline-flex items-center gap-1 text-primary hover:underline"
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

        <p className="m3-label-medium mt-6 text-on-surface-variant">
          Plus homescreen widgets and Quick Settings tiles for flashlight, notes,
          steps, music and more.
        </p>
      </div>
    </section>
  );
};

export default ToolCatalog;
