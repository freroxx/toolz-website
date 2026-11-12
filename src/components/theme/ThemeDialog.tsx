import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Info,
  Laptop,
  Moon,
  Palette,
  RotateCcw,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";
import {
  SITE_DEFAULT_SKIN_ID,
  type SiteSkin,
  type ThemeModeChoice,
} from "@/lib/skins";
import { INDICATOR_SPRING, PRESS_SPRING } from "@/lib/motion";

const modeChoices: { id: ThemeModeChoice; label: string; icon: typeof Sun }[] = [
  { id: "SYSTEM", label: "Auto", icon: Laptop },
  { id: "LIGHT", label: "Light", icon: Sun },
  { id: "DARK", label: "Dark", icon: Moon },
];

const SkinTile = ({
  skin,
  active,
  onSelect,
}: {
  skin: SiteSkin;
  active: boolean;
  onSelect: () => void;
}) => {
  const isCommunity = skin.source === "community";
  const primaryColor = skin.icon.bodyStart;
  const secondaryColor = skin.icon.rim;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      transition={PRESS_SPRING}
      className="group relative flex items-center gap-3.5 rounded-[18px] border p-3.5 text-left transition-colors"
      style={
        active
          ? {
              background: "hsl(var(--md-secondary-container))",
              borderColor: "hsl(var(--md-secondary) / 0.6)",
              color: "hsl(var(--md-on-secondary-container))",
              boxShadow: "0 2px 12px hsl(var(--md-shadow) / 0.2)",
            }
          : {
              background: "hsl(var(--md-surface-container-low))",
              borderColor: "hsl(var(--md-outline-variant) / 0.4)",
              color: "hsl(var(--md-on-surface))",
            }
      }
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] shadow-sm transition-transform duration-300 group-hover:scale-105"
        style={{
          background: active
            ? "hsl(var(--md-on-secondary-container) / 0.14)"
            : "hsl(var(--md-surface-container-high))",
        }}
      >
        <SkinIcon skin={skin} size={28} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold leading-tight text-on-surface">
            {skin.name}
          </span>
          {isCommunity && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase"
              style={{
                background: "hsl(var(--md-tertiary-container))",
                color: "hsl(var(--md-on-tertiary-container))",
              }}
            >
              Community
            </span>
          )}
        </span>

        <span className="mt-1 flex items-center gap-2 text-[12px] leading-tight text-on-surface-variant">
          <span className="truncate">{skin.author || "Toolz"}</span>
          <span>·</span>
          <span className="shrink-0 font-medium">
            {skin.themeMode === "SYSTEM" ? "Adaptive" : skin.themeMode === "LIGHT" ? "Light base" : "Dark base"}
          </span>
        </span>
      </span>

      {/* Palette preview swatches */}
      <div className="flex shrink-0 items-center gap-1.5 pl-1">
        <span
          className="h-4 w-4 rounded-full border border-black/20 shadow-xs"
          style={{ background: primaryColor }}
          title={`Primary: ${primaryColor}`}
        />
        <span
          className="h-4 w-4 rounded-full border border-black/20 shadow-xs"
          style={{ background: secondaryColor }}
          title={`Secondary: ${secondaryColor}`}
        />
      </div>

      {active && (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-sm"
          style={{ background: "hsl(var(--md-primary))", color: "hsl(var(--md-on-primary))" }}
        >
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </motion.button>
  );
};

const ThemeDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const {
    activeSkin,
    included,
    community,
    modePreference,
    resolvedMode,
    setModePreference,
    loading,
    degraded,
    selectSkin,
  } = useSkin();
  const [view, setView] = useState<"skins" | "about">("skins");
  const [activeTab, setActiveTab] = useState<"all" | "included" | "community">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setView("skins");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => panelRef.current?.focus(), 40);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  const displayedSkins = activeTab === "included"
    ? included
    : activeTab === "community"
    ? community
    : [...included, ...community];

  const resetToDefault = () => {
    selectSkin(SITE_DEFAULT_SKIN_ID);
    setModePreference("SYSTEM");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close theme picker"
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 cursor-default"
            style={{ background: "hsl(var(--md-scrim) / 0.65)", backdropFilter: "blur(12px)" }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-dialog-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={PRESS_SPRING}
            className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[32px] border shadow-2xl outline-none sm:max-h-[85vh] sm:max-w-2xl sm:rounded-[32px]"
            style={{
              background: "hsl(var(--md-surface-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4 sm:px-7 sm:py-5" style={{ borderColor: "hsl(var(--md-outline-variant) / 0.3)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                  style={{
                    background: "hsl(var(--md-primary-container))",
                    color: "hsl(var(--md-on-primary-container))",
                  }}
                >
                  <Palette size={20} />
                </div>
                <div>
                  <h2
                    id="theme-dialog-title"
                    className="m3-title-medium font-bold text-on-surface"
                  >
                    {view === "about" ? "Theme Architecture" : "Themes & Appearance"}
                  </h2>
                  <p className="m3-label-small text-on-surface-variant">
                    {view === "about" ? "Material 3 token calculations" : "Live real-time palette customizer"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setView(view === "about" ? "skins" : "about")}
                  aria-label={view === "about" ? "Back to skins" : "About the skin system"}
                  aria-pressed={view === "about"}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{
                    color: view === "about" ? "hsl(var(--md-on-primary-container))" : "hsl(var(--md-on-surface-variant))",
                    background: view === "about" ? "hsl(var(--md-primary-container))" : "transparent",
                  }}
                >
                  {view === "about" ? <ArrowLeft size={18} /> : <Info size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-transform active:scale-90"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              {view === "about" ? (
                <div className="space-y-4 pb-2">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-[16px]"
                    style={{
                      background: "hsl(var(--md-primary-container))",
                      color: "hsl(var(--md-on-primary-container))",
                    }}
                  >
                    <Palette size={24} />
                  </div>
                  <p className="m3-body-medium text-on-surface-variant leading-relaxed">
                    A Toolz skin bundles an adaptive primary and secondary color pair, light or dark
                    preference, and launcher icon styling. On Android it dynamically re-renders the app
                    and launcher icon. On this website it dynamically recalculates Material 3 Expressive
                    tokens and repaints every page in real time.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Skins are shared directly from the Toolz Android app via /api/skins.",
                      "Selecting any skin applies the exact M3 palette immediately and caches it locally.",
                      "Universal mode compatibility: any skin can be viewed in Light, Dark, or System mode.",
                      "Strict zero telemetry: your chosen skin and mode never leave your browser.",
                    ].map((line) => (
                      <li key={line} className="flex gap-2.5">
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: "hsl(var(--md-primary))" }}
                        />
                        <span className="m3-body-small font-medium text-on-surface-variant">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div
                    className="rounded-[20px] border p-4.5 mt-6"
                    style={{
                      background: "hsl(var(--md-surface-container-low))",
                      borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                    }}
                  >
                    <p className="m3-title-small font-bold text-on-surface">
                      Create and share custom skins
                    </p>
                    <p className="m3-body-small mt-1 text-on-surface-variant leading-relaxed">
                      Design your own custom color and icon combo inside Toolz settings on Android, then
                      tap share to publish it for the community feed.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href="/api/skins"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="m3-btn-tonal h-9 px-4 text-[13px] gap-1.5"
                      >
                        JSON API Feed
                        <ExternalLink size={13} />
                      </a>
                      <a
                        href="https://github.com/freroxx/toolz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="m3-btn-outlined h-9 px-4 text-[13px] gap-1.5"
                      >
                        GitHub Repo
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Mode Selector Segmented Capsule */}
                  <div>
                    <label className="m3-label-medium font-bold block mb-2.5 text-on-surface">
                      Color Scheme Appearance
                    </label>
                    <div
                      className="grid grid-cols-3 gap-1 p-1 rounded-full border"
                      style={{
                        background: "hsl(var(--md-surface-container-low))",
                        borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                      }}
                    >
                      {modeChoices.map(({ id, label, icon: Icon }) => {
                        const isSelected = modePreference === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setModePreference(id)}
                            className="relative flex items-center justify-center gap-2 py-2 px-3 rounded-full text-[13px] font-semibold transition-colors"
                            style={{
                              color: isSelected
                                ? "hsl(var(--md-on-secondary-container))"
                                : "hsl(var(--md-on-surface-variant))",
                            }}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="mode-segmented-pill"
                                className="absolute inset-0 rounded-full"
                                style={{ background: "hsl(var(--md-secondary-container))" }}
                                transition={INDICATOR_SPRING}
                              />
                            )}
                            <Icon size={15} className="relative z-10" />
                            <span className="relative z-10">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active skin summary card */}
                  <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[22px] border p-4.5"
                    style={{
                      background: "hsl(var(--md-primary-container))",
                      borderColor: "transparent",
                      color: "hsl(var(--md-on-primary-container))",
                    }}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[16px] bg-black/10 shadow-inner">
                        <SkinIcon skin={activeSkin} size={36} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="m3-label-small uppercase tracking-wider font-bold opacity-80">
                            Active Palette
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/15 font-semibold">
                            {resolvedMode}
                          </span>
                        </div>
                        <p className="m3-title-medium truncate font-bold mt-0.5">{activeSkin.name}</p>
                        <p className="m3-body-small line-clamp-1 opacity-85">
                          {activeSkin.description || `Crafted by ${activeSkin.author || "Toolz"}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/10"
                        title="Material 3 tokens calculated dynamically"
                      >
                        <Sparkles size={12} />
                        M3 Expressive
                      </span>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "hsl(var(--md-outline-variant) / 0.3)" }}>
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: "all", label: "All Skins" },
                        { id: "included", label: `Shipped (${included.length})` },
                        { id: "community", label: `Community (${loading ? "…" : community.length})` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id as typeof activeTab)}
                          className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                          style={{
                            background: activeTab === tab.id ? "hsl(var(--md-secondary-container))" : "transparent",
                            color: activeTab === tab.id ? "hsl(var(--md-on-secondary-container))" : "hsl(var(--md-on-surface-variant))",
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <span className="m3-label-small text-on-surface-variant font-medium">
                      {displayedSkins.length} available
                    </span>
                  </div>

                  {/* Skins Grid */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {displayedSkins.map((skin) => (
                      <SkinTile
                        key={skin.id}
                        skin={skin}
                        active={skin.id === activeSkin.id}
                        onSelect={() => selectSkin(skin.id)}
                      />
                    ))}
                  </div>

                  {displayedSkins.length === 0 && (
                    <div
                      className="rounded-[20px] border border-dashed p-6 text-center"
                      style={{
                        borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                        background: "hsl(var(--md-surface-container-low) / 0.4)",
                      }}
                    >
                      <p className="m3-body-small text-on-surface-variant">
                        {loading
                          ? "Loading community themes from network…"
                          : degraded
                          ? "Community skins temporarily unavailable. Built-in themes active."
                          : "No skins found in this category."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-3 border-t px-5 py-3.5 sm:px-7"
              style={{
                borderColor: "hsl(var(--md-outline-variant) / 0.3)",
                background: "hsl(var(--md-surface-container-low))",
              }}
            >
              <button
                type="button"
                onClick={resetToDefault}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-on-surface-variant hover:text-primary-ink transition-colors"
              >
                <RotateCcw size={13} />
                Reset to default
              </button>

              <button
                type="button"
                onClick={() => setView(view === "about" ? "skins" : "about")}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-transform active:scale-95"
                style={{
                  color: "hsl(var(--md-on-secondary-container))",
                  background: "hsl(var(--md-secondary-container))",
                }}
              >
                <Info size={14} />
                {view === "about" ? "Return to themes" : "How it works"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeDialog;
