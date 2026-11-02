import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ExternalLink, Info, Palette, X } from "lucide-react";
import { useSkin } from "@/components/theme/skin-context";
import SkinIcon from "@/components/theme/SkinIcon";
import type { SiteSkin, SkinThemeMode } from "@/lib/skins";

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
}) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={active}
    className="group relative flex items-center gap-3 rounded-[18px] border p-2.5 pr-3 text-left transition-all active:scale-[0.98] sm:p-3"
    style={
      active
        ? {
            background: "hsl(var(--md-secondary-container))",
            borderColor: "transparent",
            color: "hsl(var(--md-on-secondary-container))",
          }
        : {
            background: "hsl(var(--md-surface-container-low))",
            borderColor: "hsl(var(--md-outline-variant) / 0.4)",
            color: "hsl(var(--md-on-surface))",
          }
    }
  >
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]"
      style={{
        background: active
          ? "hsl(var(--md-on-secondary-container) / 0.12)"
          : "hsl(var(--md-surface-container-high))",
      }}
    >
      <SkinIcon skin={skin} size={30} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[13px] font-semibold leading-tight">{skin.name}</span>
      <span
        className="mt-0.5 block truncate text-[11px] leading-tight"
        style={{ opacity: 0.7 }}
      >
        {skin.author || "Community"} · {modeLabel(skin.themeMode)}
      </span>
    </span>
    {active && (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ background: "hsl(var(--md-primary))", color: "hsl(var(--md-on-primary))" }}
      >
        <Check size={13} strokeWidth={3} />
      </span>
    )}
  </button>
);

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
            style={{ background: "hsl(var(--md-scrim) / 0.62)", backdropFilter: "blur(8px)" }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-dialog-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[28px] border shadow-2xl outline-none sm:max-h-[84vh] sm:max-w-2xl sm:rounded-[28px]"
            style={{
              background: "hsl(var(--md-surface-container))",
              borderColor: "hsl(var(--md-outline-variant) / 0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
              <div className="min-w-0">
                <p
                  className="m3-label-medium font-semibold uppercase tracking-[0.16em]"
                  style={{ color: "hsl(var(--md-primary))" }}
                >
                  {view === "about" ? "About skins" : "Appearance"}
                </p>
                <h2
                  id="theme-dialog-title"
                  className="m3-headline-small mt-1 text-[24px] leading-tight sm:text-[28px]"
                  style={{ color: "hsl(var(--md-on-surface))" }}
                >
                  {view === "about" ? "How themes work" : "Pick a skin"}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setView(view === "about" ? "skins" : "about")}
                  aria-label={view === "about" ? "Back to skins" : "About the skin system"}
                  aria-pressed={view === "about"}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ color: "hsl(var(--md-on-surface-variant))" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="custom-scrollbar flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
              {view === "about" ? (
                <div className="space-y-4 pb-2">
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
                    A Toolz skin is three things bundled together: a primary and secondary colour
                    pair, a light or dark preference, and an app icon. On Android it repaints the
                    app and the launcher tile. On this site it repaints the page you are on.
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      "Skins are published by the app — the same public feed at /api/skins powers this picker.",
                      "Selecting a skin applies its palette immediately and remembers it on this device.",
                      "Auto follows your system light/dark setting; Light and Dark pin the mode.",
                      "The site never uploads your choice. Nothing leaves the browser.",
                    ].map((line) => (
                      <li key={line} className="flex gap-2.5">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: "hsl(var(--md-primary))" }}
                        />
                        <span className="m3-body-small" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div
                    className="rounded-[18px] border p-4"
                    style={{
                      background: "hsl(var(--md-surface-container-low))",
                      borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                    }}
                  >
                    <p className="m3-label-large" style={{ color: "hsl(var(--md-on-surface))" }}>
                      Something missing?
                    </p>
                    <p className="m3-body-small mt-1" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                      Community submissions are reviewed before they appear. Create a look in the
                      app's skin settings and share it to add it here.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href="/api/skins"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="m3-btn-tonal h-9 px-4 text-[13px]"
                      >
                        View the feed
                        <ExternalLink size={14} />
                      </a>
                      <a
                        href="https://github.com/freroxx/toolz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="m3-btn-outlined h-9 px-4 text-[13px]"
                      >
                        Get the app
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Active skin summary */}
                  <div
                    className="flex items-center gap-4 rounded-[22px] border p-4"
                    style={{
                      background: "hsl(var(--md-primary-container))",
                      borderColor: "transparent",
                      color: "hsl(var(--md-on-primary-container))",
                    }}
                  >
                    <SkinIcon skin={activeSkin} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="m3-label-small uppercase tracking-[0.14em]" style={{ opacity: 0.7 }}>
                        Active skin
                      </p>
                      <p className="m3-title-large truncate text-[18px]">{activeSkin.name}</p>
                      <p className="m3-body-small line-clamp-2" style={{ opacity: 0.78 }}>
                        {activeSkin.description || `${modeLabel(activeSkin.themeMode)} · ${activeSkin.author || "Community"}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="m3-label-medium font-semibold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                      Included
                    </p>
                    <span className="m3-label-small tabular-nums" style={{ color: "hsl(var(--md-on-surface-variant) / 0.7)" }}>
                      {included.length}
                    </span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {included.map((skin) => (
                      <SkinTile
                        key={skin.id}
                        skin={skin}
                        active={skin.id === activeSkin.id}
                        onSelect={() => selectSkin(skin.id)}
                      />
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="m3-label-medium font-semibold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                      Community
                    </p>
                    <span className="m3-label-small tabular-nums" style={{ color: "hsl(var(--md-on-surface-variant) / 0.7)" }}>
                      {loading ? "…" : community.length}
                    </span>
                  </div>
                  {community.length > 0 ? (
                    <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                    <p
                      className="mt-2.5 rounded-[18px] border border-dashed p-4 m3-body-small"
                      style={{
                        borderColor: "hsl(var(--md-outline-variant) / 0.6)",
                        color: "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      {loading
                        ? "Loading published skins…"
                        : degraded
                          ? "The skin feed is unavailable right now. Taking a guess: check back in a minute."
                          : "No community skins yet. Publish one from the app and it will show up here."}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-3 border-t px-5 py-3 sm:px-6"
              style={{
                borderColor: "hsl(var(--md-outline-variant) / 0.4)",
                background: "hsl(var(--md-surface-container-low) / 0.6)",
              }}
            >
              <p className="m3-label-small truncate" style={{ color: "hsl(var(--md-on-surface-variant))" }}>
                Synced from the Toolz app
              </p>
              <button
                type="button"
                onClick={() => setView("about")}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 m3-label-small"
                style={{
                  color: "hsl(var(--md-primary))",
                  background: "hsl(var(--md-primary) / 0.1)",
                }}
              >
                <Info size={14} />
                How it works
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeDialog;
