/**
 * Shared Toolz News presentation helpers for the public surfaces
 * (/news page + home teaser). Mirrors the Android app's NewsPriorityChip
 * mapping so both platforms speak the same color language.
 */
export type NewsPriority = "info" | "feature" | "fix" | "promo" | "critical";

/** Tinted pill colors per priority — matches the app: critical=error, feature=primary, fix=tertiary, promo=secondary, info=neutral. */
export function newsPriorityChipStyle(priority: string): {
  background: string;
  color: string;
} {
  switch (priority) {
    case "critical":
      return {
        background: "hsl(var(--md-error-container))",
        color: "hsl(var(--md-on-error-container))",
      };
    case "feature":
      return {
        background: "hsl(var(--md-primary-container))",
        color: "hsl(var(--md-on-primary-container))",
      };
    case "fix":
      return {
        background: "hsl(var(--md-tertiary-container))",
        color: "hsl(var(--md-on-tertiary-container))",
      };
    case "promo":
      return {
        background: "hsl(var(--md-secondary-container))",
        color: "hsl(var(--md-on-secondary-container))",
      };
    default:
      return {
        background: "hsl(var(--md-surface-container-highest))",
        color: "hsl(var(--md-on-surface-variant))",
      };
  }
}

/**
 * Link scheme allowlist for markdown body hrefs: http(s), mailto and
 * scheme-less relative targets are clickable; anything else (javascript:,
 * data:, toolz:// — in-app deep links that a browser can't honor) renders
 * as inert text so the web never becomes a broken or dangerous launcher.
 */
export function isSafeWebHref(url: string): boolean {
  if (/^(https?:|mailto:)/i.test(url)) return true;
  return !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
}
