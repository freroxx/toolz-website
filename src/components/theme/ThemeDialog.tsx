import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ExternalLink, Info, Palette, Sparkles, X } from "lucide-react";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";
import type { SiteSkin, SkinThemeMode } from "@/lib/skins";
import { PRESS_SPRING } from "@/lib/motion";

const modeLabel = (mode: SkinThemeMode) =>
  mode === "SYSTEM" ? "Auto" : mode === "LIGHT" ? "Light" : "Dark";

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
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={PRESS_SPRING}
      className="group relative flex items-center gap-3.5 rounded-[20px] border p-3 text-left transition-colors sm:p-3.5"
      style={
        active
          ? {
              background: "hsl(var(--md-secondary-container))",
              borderColor: "hsl(var(--md-secondary) / 0.6)",
              color: "hsl(var(--md-on-secondary-container))",
              boxShadow: "0 2px 8px hsl(var(--md-shadow) / 0.2)",
            }
          : {
              background: "hsl(var(--md-surface-container-low))",
              borderColor: "hsl(var(--md-outline-variant) / 0.5)",
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
        <SkinIcon skin={skin} size={30} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold leading-tight">{skin.name}</span>
          {isCommunity && (
            <span
              className="shrink-0 rounded-full px-1.5 py-0.2 text-[9px] font-bold tracking-wide uppercase"
              style={{
                background: "hsl(var(--md-tertiary-container))",
                color: "hsl(var(--md-on-tertiary-container))",
              }}
            >
              Community
            </span>
          )}
        </span>

        <span className="mt-1 flex items-center gap-2 text-[12px] leading-tight opacity-80">
          <span className="truncate">{skin.author || "Toolz"}</span>
          <span>·</span>
          <span className="shrink-0 font-medium">{modeLabel(skin.themeMode)}</span>
        </span>
      </span>

      {/* Palette preview swatches */}
      <div className="flex shrink-0 items-center gap-1.5 pl-1">
        <span
          className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-xs"
          style={{ background: primaryColor }}
          title={`Primary: ${primaryColor}`}
        />
        <span
          className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-xs"
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
  const { activeSkin, included, community, loading, degraded, selectSkin } = useSkin();
  const [view, setView] = useState<"skins" | "about">("skins");
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
            style={{ background: "hsl(var(--md-scrim) / 0.65)", backdropFilter: "blur(10px)" }}
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
            className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[28px] border shadow-2xl outline-none sm:max-h-[84vh] sm:max-w-2xl sm:rounded-[28px]"
            style={{
              background: "hsl(var(--md-surface-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.6)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
              <div className="min-w-0">
                <span
                  className="m3-label-small inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold tracking-wide uppercase"
                  style={{
                    background: "hsl(var(--md-secondary-container))",
                    color: "hsl(var(--md-on-secondary-container))",
                  }}
                >
                  <Palette size={12} />
                  {view === "about" ? "System Architecture" : "Material 3 Expressive"}
                </span>
                <h2
                  id="theme-dialog-title"
                  className="m3-headline-small mt-2 text-[24px] leading-tight sm:text-[28px]"
                  style={{ color: "hsl(var(--md-on-surface))" }}
                >
                  {view === "about" ? "How skins work" : "Themes & skins"}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setView(view === "about" ? "skins" : "about")}
                  aria-label={view === "about" ? "Back to skins" : "About the skin system"}
                  aria-pressed={view === "about"}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{
                    color: view === "about" ? "hsl(var(--md-on-primary-container))" : "hsl(var(--md-on-surface-variant))",
                    background: view === "about" ? "hsl(var(--md-primary-container))" : "transparent",
                  }}
                >
                  {view === "about" ? <ArrowLeft size={19} /> : <Info size={19} />}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{ color: "hsl(var(--md-on-surface-variant))" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="custom-scrollbar flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
              {view === "about" ? (
                <div className="space-y-4 pb-2 pt-2">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-[18px]"
                    style={{
                      background: "hsl(var(--md-primary-container))",
                      color: "hsl(var(--md-on-primary-container))",
                    }}
                  >
                    <Palette size={26} />
                  </div>
                  <p className="m3-body-medium" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                    A Toolz skin bundles an adaptive primary and secondary color pair, light or dark
                    preference, and launcher icon styling. On Android it dynamically re-renders the app
                    and launcher icon. On this website it dynamically recalculates Material 3 Expressive
                    tokens and repaints every page in real time.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Skins are shared directly from the Toolz Android app via /api/skins.",
                      "Selecting any skin applies the exact M3 palette immediately and caches it locally.",
                      "The dynamic launcher icon and browser tab favicon update instantaneously.",
                      "Strict zero telemetry: your chosen skin never leaves your browser.",
                    ].map((line) => (
                      <li key={line} className="flex gap-2.5">
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: "hsl(var(--md-primary))" }}
                        />
                        <span className="m3-body-small font-medium" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div
                    className="rounded-[20px] border p-4 mt-6"
                    style={{
                      background: "hsl(var(--md-surface-container-low))",
                      borderColor: "hsl(var(--md-outline-variant) / 0.5)",
                    }}
                  >
                    <p className="m3-title-small" style={{ color: "hsl(var(--md-on-surface))" }}>
                      Create and share custom skins
                    </p>
                    <p className="m3-body-small mt-1 text-on-surface-variant">
                      Design your own custom color and icon combo inside Toolz settings on Android, then
                      tap share to publish it for the community.
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
                <>
                  {/* Active skin summary card */}
                  <div
                    className="flex items-center gap-4 rounded-[22px] border p-4.5"
                    style={{
                      background: "hsl(var(--md-primary-container))",
                      borderColor: "transparent",
                      color: "hsl(var(--md-on-primary-container))",
                    }}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-black/10 shadow-inner">
                      <SkinIcon skin={activeSkin} size={42} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="m3-label-small uppercase tracking-wider font-bold opacity-80">
                          Active Skin
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/15 font-semibold">
                          {modeLabel(activeSkin.themeMode)}
                        </span>
                      </div>
                      <p className="m3-title-large truncate text-[20px] font-bold mt-0.5">{activeSkin.name}</p>
                      <p className="m3-body-small line-clamp-1 opacity-85 mt-0.5">
                        {activeSkin.description || `Crafted by ${activeSkin.author || "Toolz"}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-4 w-4 rounded-full border border-black/20 shadow-xs"
                          style={{ background: activeSkin.icon.bodyStart }}
                          title={`Primary: ${activeSkin.icon.bodyStart}`}
                        />
                        <span
                          className="h-4 w-4 rounded-full border border-black/20 shadow-xs"
                          style={{ background: activeSkin.icon.rim }}
                          title={`Rim: ${activeSkin.icon.rim}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Included section */}
                  <div className="mt-6 flex items-center justify-between">
                    <p className="m3-label-large font-bold tracking-tight" style={{ color: "hsl(var(--md-on-surface))" }}>
                      Built-in Collections
                    </p>
                    <span
                      className="m3-label-small rounded-full px-2 py-0.5 tabular-nums font-bold"
                      style={{
                        background: "hsl(var(--md-surface-container-high))",
                        color: "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      {included.length}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {included.map((skin) => (
                      <SkinTile
                        key={skin.id}
                        skin={skin}
                        active={skin.id === activeSkin.id}
                        onSelect={() => selectSkin(skin.id)}
                      />
                    ))}
                  </div>

                  {/* Community section */}
                  <div className="mt-7 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-secondary" />
                      <p className="m3-label-large font-bold tracking-tight" style={{ color: "hsl(var(--md-on-surface))" }}>
                        Community Themes
                      </p>
                    </div>
                    <span
                      className="m3-label-small rounded-full px-2 py-0.5 tabular-nums font-bold"
                      style={{
                        background: "hsl(var(--md-surface-container-high))",
                        color: "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      {loading ? "…" : community.length}
                    </span>
                  </div>

                  {community.length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {community.map((skin) => (
                        <SkinTile
                          key={skin.id}
                          skin={skin}
                          active={skin.id === activeSkin.id}
                          onSelect={() => selectSkin(skin.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="mt-3 rounded-[20px] border border-dashed p-5 text-center"
                      style={{
                        borderColor: "hsl(var(--md-outline-variant) / 0.6)",
                        background: "hsl(var(--md-surface-container-low) / 0.5)",
                      }}
                    >
                      <p className="m3-body-small" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                        {loading
                          ? "Loading community feed from app network…"
                          : degraded
                            ? "Community skins temporarily unavailable. Shipped presets are active."
                            : "No community submissions published yet. Publish one from the Toolz app to show up here!"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-3 border-t px-5 py-3.5 sm:px-6"
              style={{
                borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                background: "hsl(var(--md-surface-container-low))",
              }}
            >
              <p className="m3-label-small truncate font-medium" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                Auto-syncs with Toolz Android launcher
              </p>
              <button
                type="button"
                onClick={() => setView(view === "about" ? "skins" : "about")}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 m3-label-small font-semibold transition-transform active:scale-95"
                style={{
                  color: "hsl(var(--md-on-secondary-container))",
                  background: "hsl(var(--md-secondary-container))",
                }}
              >
                <Info size={14} />
                {view === "about" ? "View skins" : "How it works"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeDialog;
