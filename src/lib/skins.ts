/**
 * Site skins — the same look bundles the Toolz Android app ships.
 *
 * A skin carries a primary + secondary colour, a light/dark preference and an
 * app-icon preset (see `IconCatalog` in the app repo). `/api/skins` publishes
 * them as ARGB longs, so this module normalises the wire format and turns a
 * skin into the CSS custom properties the site already uses (`--md-*`).
 *
 * Nothing here talks to the network; `useSkins` owns that.
 */

import type { SkinItem } from "@/lib/skin-schema";

export type SkinThemeMode = "SYSTEM" | "LIGHT" | "DARK";
export type ResolvedMode = "LIGHT" | "DARK";
export type IconShape = "OCTAGON" | "CIRCLE";
export type SkinSource = "site" | "included" | "community";

export interface SkinIconPalette {
  rim: string;
  bodyStart: string;
  bodyEnd: string | null;
  disc: string;
}

export interface SiteSkin {
  id: string;
  name: string;
  author: string | null;
  description: string | null;
  themeMode: SkinThemeMode;
  primary: string | null;
  secondary: string | null;
  gradient: boolean;
  iconPresetId: string;
  iconGradient: boolean;
  shape: IconShape;
  icon: SkinIconPalette;
  featured: boolean;
  source: SkinSource;
}

export const SITE_DEFAULT_SKIN_ID = "site-default";
export const STORAGE_KEY = "toolz-site-skin";
export const MODE_STORAGE_KEY = "toolz-site-skin-mode";
export const THEME_COLOR_STORAGE_KEY = "toolz-site-skin-theme-color";

const DEFAULT_PRIMARY = "#8B55C9";
const DEFAULT_SECONDARY = "#C9A5EE";

/* ───────────────────────── Icon presets ─────────────────────────
 * Straight from IconCatalog.BUILT_IN (app/src/main/.../data/skin/AppSkin.kt).
 * Values are the flat reference colours; runtime overrides (iconBg/iconFg/
 * iconStroke) are applied in `normaliseSkin`.
 */
const ICON_PRESETS: Record<string, SkinIconPalette> = {
  "grape-haze": { rim: "#DFBCFF", bodyStart: "#8534CE", bodyEnd: "#D5B9EE", disc: "#FFFFFF" },
  "grape-deep": { rim: "#9D8AAE", bodyStart: "#370068", bodyEnd: "#130024", disc: "#BEBEBE" },
  lagoon: { rim: "#4CB3AE", bodyStart: "#00393F", bodyEnd: "#002925", disc: "#74DFD5" },
  "mono-grey": { rim: "#BEBEBE", bodyStart: "#444444", bodyEnd: "#232323", disc: "#FFFFFF" },
  midnight: { rim: "#4A4A4A", bodyStart: "#000000", bodyEnd: "#3A3A42", disc: "#FFFFFF" },
  "legacy-citrus": { rim: "#FFDCC6", bodyStart: "#CC5A17", bodyEnd: "#7A3408", disc: "#FFFFFF" },
  "legacy-ocean": { rim: "#B7F1EA", bodyStart: "#0C7E78", bodyEnd: "#06403D", disc: "#FFFFFF" },
  "legacy-night": { rim: "#FFB785", bodyStart: "#100D0B", bodyEnd: "#3A2415", disc: "#FFB785" },
  "paper-light": { rim: "#CC5A17", bodyStart: "#FCF9F6", bodyEnd: "#E3D2BE", disc: "#CC5A17" },
  "paper-dark": { rim: "#FBF8FF", bodyStart: "#1B1B1F", bodyEnd: "#000000", disc: "#FBF8FF" },
  "citrus-pop": { rim: "#FFDCC6", bodyStart: "#FF6D00", bodyEnd: "#CC5A17", disc: "#FFFFFF" },
  "ocean-pop": { rim: "#00201D", bodyStart: "#00BFA5", bodyEnd: "#0C7E78", disc: "#00201D" },
  royal: { rim: "#D8E7FF", bodyStart: "#2968C8", bodyEnd: "#001B3F", disc: "#FFFFFF" },
  rose: { rim: "#FFD9E2", bodyStart: "#C81E5B", bodyEnd: "#7A0F36", disc: "#FFFFFF" },
  mint: { rim: "#B7F1EA", bodyStart: "#0F5132", bodyEnd: "#07271A", disc: "#B7F1EA" },
  sand: { rim: "#5C4A32", bodyStart: "#E8DCC8", bodyEnd: "#C2AF8E", disc: "#5C4A32" },
  slate: { rim: "#9AA3B2", bodyStart: "#2B2F36", bodyEnd: "#121419", disc: "#EDF0F4" },
  snow: { rim: "#1B1B1F", bodyStart: "#FFFFFF", bodyEnd: "#D7DCE4", disc: "#1B1B1F" },
  carbon: { rim: "#3A3A42", bodyStart: "#101014", bodyEnd: "#33333E", disc: "#EDEDF2" },
  cobalt: { rim: "#7F9CFF", bodyStart: "#1A2340", bodyEnd: "#0B1030", disc: "#FFFFFF" },
  sunset: { rim: "#7A1E3C", bodyStart: "#FF8A3D", bodyEnd: "#C81E5B", disc: "#FFFFFF" },
  forest: { rim: "#95D5B2", bodyStart: "#1B4332", bodyEnd: "#0A1F16", disc: "#D8F3DC" },
  lavender: { rim: "#7B2FBE", bodyStart: "#E6DEF7", bodyEnd: "#BFA8E6", disc: "#7B2FBE" },
  peach: { rim: "#CC5A17", bodyStart: "#FFDCC6", bodyEnd: "#F0A878", disc: "#CC5A17" },
  crimson: { rim: "#FFD9DE", bodyStart: "#B42346", bodyEnd: "#5F1023", disc: "#FFFFFF" },
  ember: { rim: "#FFE3C2", bodyStart: "#E8590C", bodyEnd: "#7A2E0E", disc: "#FFFFFF" },
  arctic: { rim: "#0B3B4F", bodyStart: "#E8F4F8", bodyEnd: "#A9CBD9", disc: "#0B3B4F" },
  dusk: { rim: "#A78BFA", bodyStart: "#2E1A5E", bodyEnd: "#100826", disc: "#EDE9FE" },
  moss: { rim: "#A8D5BA", bodyStart: "#1E4D3B", bodyEnd: "#0A241C", disc: "#C7F0D8" },
  amber: { rim: "#7A4A00", bodyStart: "#FFB703", bodyEnd: "#FB8500", disc: "#402E00" },
  bubblegum: { rim: "#FFE3EE", bodyStart: "#F06292", bodyEnd: "#AD1457", disc: "#FFFFFF" },
  tangerine: { rim: "#5D3A00", bodyStart: "#FFA726", bodyEnd: "#FB8C00", disc: "#402600" },
  lime: { rim: "#2E4400", bodyStart: "#9BC53D", bodyEnd: "#4C6A00", disc: "#FFFFFF" },
  "teal-pop": { rim: "#00332E", bodyStart: "#2DD4BF", bodyEnd: "#0F766E", disc: "#00332E" },
  sky: { rim: "#0C4A6E", bodyStart: "#E0F2FE", bodyEnd: "#7DD3FC", disc: "#0C4A6E" },
  "indigo-pop": { rim: "#E0E7FF", bodyStart: "#6366F1", bodyEnd: "#3730A3", disc: "#FFFFFF" },
  "violet-haze": { rim: "#4C1D95", bodyStart: "#F3E8FF", bodyEnd: "#C4B5FD", disc: "#4C1D95" },
  mocha: { rim: "#D7CCC8", bodyStart: "#4E342E", bodyEnd: "#211512", disc: "#EFDCD2" },
  olive: { rim: "#A8BD6E", bodyStart: "#556B2F", bodyEnd: "#2A3500", disc: "#F1F5D6" },
  "rose-gold": { rim: "#7A4A2E", bodyStart: "#F7D8C4", bodyEnd: "#E8A87C", disc: "#7A4A2E" },
  storm: { rim: "#616161", bodyStart: "#757575", bodyEnd: "#212121", disc: "#FFFFFF" },
  "crimson-deep": { rim: "#FF8A80", bodyStart: "#7F1D1D", bodyEnd: "#2A0808", disc: "#FFD9DE" },
  "system-auto": { rim: "#DFBCFF", bodyStart: "#8534CE", bodyEnd: "#D5B9EE", disc: "#FFFFFF" },
  "dynamic-glow": { rim: "#D8E2FF", bodyStart: "#2962FF", bodyEnd: "#1B3FA8", disc: "#FFFFFF" },
};

const FALLBACK_ICON = ICON_PRESETS["grape-haze"];

/* ───────────────────────── Colour maths ───────────────────────── */

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb {
  let raw = hex.trim().replace("#", "");
  if (raw.length === 3) raw = raw.split("").map((c) => c + c).join("");
  const n = parseInt(raw.slice(0, 6), 16);
  if (!Number.isFinite(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function triplet(h: number, s: number, l: number): string {
  return `${Math.round(((h % 360) + 360) % 360)} ${Math.round(clamp(s, 0, 100))}% ${Math.round(clamp(l, 0, 100))}%`;
}

export function hexToHslTriplet(hex: string): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  return triplet(hsl.h, hsl.s, hsl.l);
}

/** ARGB long (Android) or a CSS hex string → `#rrggbb`. */
export function toHex(value: unknown): string | null {
  if (typeof value === "string") {
    const s = value.trim();
    if (/^#[0-9a-f]{3}$/i.test(s) || /^#[0-9a-f]{6}$/i.test(s)) return s;
    if (/^[0-9a-f]{6,8}$/i.test(s)) value = parseInt(s.slice(-6), 16);
    else if (/^\d+$/.test(s)) value = Number(s);
    else return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const n = Math.floor(value) >>> 0;
  return `#${(n & 0xffffff).toString(16).padStart(6, "0")}`;
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Readable on-colour for text/icons drawn over `hex`. */
export function readableOn(hex: string): string {
  return luminance(hex) > 0.55 ? "#160B24" : "#FFFFFF";
}

/* ───────────────────────── Normalisation ───────────────────────── */

interface RawSkin {
  id?: unknown;
  name?: unknown;
  author?: unknown;
  description?: unknown;
  themeMode?: unknown;
  primary?: unknown;
  secondary?: unknown;
  gradient?: unknown;
  iconPresetId?: unknown;
  iconGradient?: unknown;
  iconShape?: unknown;
  iconBg?: unknown;
  iconFg?: unknown;
  iconStroke?: unknown;
  featured?: unknown;
}

function asThemeMode(value: unknown): SkinThemeMode {
  const v = String(value ?? "SYSTEM").toUpperCase();
  return v === "LIGHT" || v === "DARK" ? v : "SYSTEM";
}

function asShape(value: unknown): IconShape {
  const v = String(value ?? "OCTAGON").toUpperCase();
  return v === "CIRCLE" || v === "PILL" ? "CIRCLE" : "OCTAGON";
}

/**
 * Icon palette for skins that don't ship one of the named presets (custom
 * uploads, or a preset added to the app after this site shipped). Without
 * this every unknown skin fell back to Grape Haze, so the navbar icon looked
 * identical no matter what the user picked.
 */
function deriveIcon(primary: string | null, secondary: string | null): SkinIconPalette {
  const body = primary ?? DEFAULT_PRIMARY;
  const accent = secondary ?? DEFAULT_SECONDARY;
  return {
    rim: accent,
    bodyStart: body,
    bodyEnd: accent,
    disc: readableOn(body),
  };
}

function iconFor(raw: RawSkin): SkinIconPalette {
  const preset = ICON_PRESETS[String(raw.iconPresetId ?? "")];
  const base = preset ?? deriveIcon(toHex(raw.primary), toHex(raw.secondary));
  return {
    rim: toHex(raw.iconStroke) ?? base.rim,
    bodyStart: toHex(raw.iconBg) ?? base.bodyStart,
    bodyEnd: base.bodyEnd,
    disc: toHex(raw.iconFg) ?? base.disc,
  };
}

export function normaliseSkin(raw: RawSkin | SkinItem | null | undefined, source: SkinSource): SiteSkin | null {
  if (!raw) return null;
  const id = String(raw.id ?? "").trim();
  const name = String(raw.name ?? "").trim();
  if (!id || name.length < 3) return null;
  const primary = toHex(raw.primary);
  const secondary = toHex(raw.secondary);
  return {
    id: id.slice(0, 64),
    name: name.slice(0, 32),
    author: raw.author ? String(raw.author).slice(0, 32) : null,
    description: raw.description ? String(raw.description).slice(0, 200) : null,
    themeMode: asThemeMode(raw.themeMode),
    primary,
    secondary,
    gradient: raw.gradient !== false,
    iconPresetId: String(raw.iconPresetId ?? "grape-haze"),
    iconGradient: raw.iconGradient !== false,
    shape: asShape(raw.iconShape),
    icon: iconFor(raw),
    featured: raw.featured === true,
    source,
  };
}

/* ───────────────────────── Built-in skins ─────────────────────────
 * The site default (logo palette, no overrides) plus the six looks the app
 * always ships, mirroring `LegacySkins.ALL`. They are shown when the public
 * feed is empty or unreachable, and appear above community submissions.
 */
export const builtInSkins: SiteSkin[] = [
  {
    id: SITE_DEFAULT_SKIN_ID,
    name: "Toolz Default",
    author: "Toolz",
    description: "The site palette sampled from the logo — violet, lavender and near-black plum.",
    themeMode: "DARK",
    primary: null,
    secondary: null,
    gradient: true,
    iconPresetId: "grape-haze",
    iconGradient: true,
    shape: "OCTAGON",
    icon: { ...FALLBACK_ICON },
    featured: true,
    source: "site",
  },
  {
    id: "legacy-grape",
    name: "Grape Haze",
    author: "Toolz",
    description: "Signature purple, light or dark.",
    themeMode: "SYSTEM",
    primary: "#7B2FBE",
    secondary: "#B07FE8",
    gradient: true,
    iconPresetId: "grape-haze",
    iconGradient: true,
    shape: "OCTAGON",
    icon: { ...FALLBACK_ICON },
    featured: false,
    source: "included",
  },
  {
    id: "legacy-midnight",
    name: "Midnight Mono",
    author: "Toolz",
    description: "Pure black icon, system theme.",
    themeMode: "SYSTEM",
    primary: "#F5F5F5",
    secondary: "#BDBDBD",
    gradient: false,
    iconPresetId: "midnight",
    iconGradient: false,
    shape: "OCTAGON",
    icon: { ...ICON_PRESETS.midnight },
    featured: false,
    source: "included",
  },
  {
    id: "legacy-lagoon",
    name: "Lagoon Deep",
    author: "Toolz",
    description: "Teal dark theme lovers.",
    themeMode: "DARK",
    primary: "#0C7E78",
    secondary: "#5FBFB4",
    gradient: true,
    iconPresetId: "lagoon",
    iconGradient: true,
    shape: "OCTAGON",
    icon: { ...ICON_PRESETS.lagoon },
    featured: false,
    source: "included",
  },
  {
    id: "legacy-paper",
    name: "Paper",
    author: "Toolz",
    description: "Clean light appearance.",
    themeMode: "LIGHT",
    primary: "#CC5A17",
    secondary: "#0C7E78",
    gradient: true,
    iconPresetId: "paper-light",
    iconGradient: true,
    shape: "OCTAGON",
    icon: { ...ICON_PRESETS["paper-light"] },
    featured: false,
    source: "included",
  },
  {
    id: "legacy-carbon",
    name: "Carbon",
    author: "Toolz",
    description: "AMOLED dark, no gradient.",
    themeMode: "DARK",
    primary: "#EDEDF2",
    secondary: "#9AA3B2",
    gradient: false,
    iconPresetId: "carbon",
    iconGradient: false,
    shape: "OCTAGON",
    icon: { ...ICON_PRESETS.carbon },
    featured: false,
    source: "included",
  },
  {
    id: "legacy-sunset",
    name: "Sunset Pop",
    author: "Toolz",
    description: "Warm orange into pink, with the sunset icon.",
    themeMode: "DARK",
    primary: "#FF8A3D",
    secondary: "#C81E5B",
    gradient: true,
    iconPresetId: "sunset",
    iconGradient: true,
    shape: "OCTAGON",
    icon: { ...ICON_PRESETS.sunset },
    featured: false,
    source: "included",
  },
];

export const DEFAULT_SKIN = builtInSkins[0];

/* ───────────────────────── Theme tokens ───────────────────────── */

/**
 * Build a full M3 token set (same names as `index.css`) from a skin.
 * Values are bare HSL triplets — the stylesheet wraps them in `hsl()`.
 */
export function buildThemeVars(skin: SiteSkin, mode: ResolvedMode): Record<string, string> {
  const dark = mode === "DARK";
  const p = rgbToHsl(hexToRgb(skin.primary ?? DEFAULT_PRIMARY));
  const s = rgbToHsl(hexToRgb(skin.secondary ?? DEFAULT_SECONDARY));

  const pSat = p.s;
  const sSat = s.s;
  const tHue = (s.h + 28) % 360;
  const tSat = clamp(sSat, 18, 68);

  // Keep the source colour when it can carry a button in this mode; otherwise
  // pull it toward M3's tone-40 (light) / tone-80 (dark) range.
  const main = (c: Hsl, minDark = 52, maxLight = 55): string => {
    if (dark) return c.l >= minDark ? triplet(c.h, c.s, c.l) : triplet(c.h, c.s, minDark + 6);
    return c.l <= maxLight ? triplet(c.h, c.s, c.l) : triplet(c.h, c.s, 42);
  };

  const primary = main(p);
  const primaryHex = `hsl(${primary})`;
  // Text-safe variant: light tint on dark surfaces, deeper tone on light ones.
  const primaryInk = dark
    ? triplet(p.h, clamp(pSat, 20, 72), Math.max(80, Math.min(p.l, 92)))
    : triplet(p.h, p.s, Math.min(p.l, 24));
  const secondary = main(s, 50, 52);
  const secondaryHex = `hsl(${secondary})`;
  const tertiary = dark ? triplet(tHue, tSat, 80) : triplet(tHue, tSat, 40);

  const onPrimary = hexToHslTriplet(readableOn(primaryHex));
  const onSecondary = hexToHslTriplet(readableOn(secondaryHex));
  const onTertiary = hexToHslTriplet(readableOn(`hsl(${tertiary})`));

  const primaryContainer = dark
    ? triplet(p.h, clamp(pSat * 0.55, 8, 46), 24)
    : triplet(p.h, clamp(pSat * 0.55, 8, 62), 89);
  const onPrimaryContainer = dark
    ? triplet(p.h, clamp(pSat * 0.8, 16, 82), 92)
    : triplet(p.h, clamp(pSat * 0.8, 16, 82), 17);

  const secondaryContainer = dark
    ? triplet(s.h, clamp(sSat * 0.55, 6, 44), 26)
    : triplet(s.h, clamp(sSat * 0.55, 6, 58), 90);
  const onSecondaryContainer = dark
    ? triplet(s.h, clamp(sSat * 0.75, 12, 76), 92)
    : triplet(s.h, clamp(sSat * 0.75, 12, 76), 16);

  const tertiaryContainer = dark
    ? triplet(tHue, clamp(tSat * 0.55, 8, 44), 28)
    : triplet(tHue, clamp(tSat * 0.55, 8, 58), 91);
  const onTertiaryContainer = dark
    ? triplet(tHue, clamp(tSat * 0.75, 12, 76), 93)
    : triplet(tHue, clamp(tSat * 0.75, 12, 76), 16);

  const surfaceHue = p.h;
  const surfaceSat = clamp(pSat * 0.45, 3, 34);

  const surface = dark
    ? triplet(surfaceHue, surfaceSat * 0.75, 7)
    : triplet(surfaceHue, surfaceSat * 0.18, 98);
  const surfaceDim = dark
    ? triplet(surfaceHue, surfaceSat * 0.8, 4)
    : triplet(surfaceHue, surfaceSat * 0.3, 88);
  const surfaceBright = dark
    ? triplet(surfaceHue, surfaceSat * 0.6, 22)
    : triplet(surfaceHue, surfaceSat * 0.18, 98);
  const containerLowest = dark
    ? triplet(surfaceHue, surfaceSat * 0.8, 4)
    : triplet(surfaceHue, surfaceSat * 0.12, 100);
  const containerLow = dark
    ? triplet(surfaceHue, surfaceSat * 0.7, 10)
    : triplet(surfaceHue, surfaceSat * 0.3, 96);
  const container = dark
    ? triplet(surfaceHue, surfaceSat * 0.6, 12)
    : triplet(surfaceHue, surfaceSat * 0.34, 94);
  const containerHigh = dark
    ? triplet(surfaceHue, surfaceSat * 0.5, 17)
    : triplet(surfaceHue, surfaceSat * 0.4, 92);
  const containerHighest = dark
    ? triplet(surfaceHue, surfaceSat * 0.45, 20)
    : triplet(surfaceHue, surfaceSat * 0.44, 90);

  const onSurface = dark ? triplet(surfaceHue, 24, 94) : triplet(surfaceHue, 26, 12);
  const onSurfaceVariant = dark ? triplet(surfaceHue, 14, 77) : triplet(surfaceHue, 13, 32);
  const outline = dark ? triplet(surfaceHue, 10, 55) : triplet(surfaceHue, 9, 49);
  const outlineVariant = dark ? triplet(surfaceHue, 16, 26) : triplet(surfaceHue, 24, 84);

  const error = dark ? "0 69% 67%" : "3 71% 41%";
  const onError = dark ? "0 100% 15%" : "0 0% 100%";
  const errorContainer = dark ? "0 75% 30%" : "4 71% 92%";

  return {
    "--md-primary": primary,
    "--md-primary-ink": primaryInk,
    "--md-on-primary": onPrimary,
    "--md-primary-container": primaryContainer,
    "--md-on-primary-container": onPrimaryContainer,
    "--md-secondary": secondary,
    "--md-on-secondary": onSecondary,
    "--md-secondary-container": secondaryContainer,
    "--md-on-secondary-container": onSecondaryContainer,
    "--md-tertiary": tertiary,
    "--md-on-tertiary": onTertiary,
    "--md-tertiary-container": tertiaryContainer,
    "--md-on-tertiary-container": onTertiaryContainer,
    "--md-surface": surface,
    "--md-surface-dim": surfaceDim,
    "--md-surface-bright": surfaceBright,
    "--md-surface-container-lowest": containerLowest,
    "--md-surface-container-low": containerLow,
    "--md-surface-container": container,
    "--md-surface-container-high": containerHigh,
    "--md-surface-container-highest": containerHighest,
    "--md-on-surface": onSurface,
    "--md-on-surface-variant": onSurfaceVariant,
    "--md-outline": outline,
    "--md-outline-variant": outlineVariant,
    "--md-error": error,
    "--md-on-error": onError,
    "--md-error-container": errorContainer,
    "--md-inverse-surface": dark ? onSurface : containerHigh,
    "--md-inverse-on-surface": dark ? container : surface,
    "--md-inverse-primary": dark ? primaryContainer : primary,
    "--background": surface,
    "--foreground": onSurface,
    "--primary": primary,
    "--primary-foreground": onPrimary,
    "--secondary": secondary,
    "--secondary-foreground": onSecondary,
    "--muted": containerHigh,
    "--muted-foreground": onSurfaceVariant,
    "--accent": containerHigh,
    "--accent-foreground": onSurface,
    "--border": outlineVariant,
    "--input": outlineVariant,
    "--ring": primary,
    "--card": containerLow,
    "--card-foreground": onSurface,
    "--popover": container,
    "--popover-foreground": onSurface,
    "--destructive": error,
    "--destructive-foreground": onError,
  };
}

export function resolveMode(skinMode: SkinThemeMode, systemDark: boolean): ResolvedMode {
  if (skinMode === "LIGHT") return "LIGHT";
  if (skinMode === "DARK") return "DARK";
  return systemDark ? "DARK" : "LIGHT";
}

const appliedKeys = new Set<string>();

/**
 * Paint a skin on `<html>`. The site default clears inline overrides so the
 * hand-tuned logo palette in `index.css` wins.
 */
export function applySkinTheme(skin: SiteSkin, mode: ResolvedMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = mode.toLowerCase();
  root.style.colorScheme = mode.toLowerCase();

  if (skin.id === SITE_DEFAULT_SKIN_ID) {
    appliedKeys.forEach((key) => root.style.removeProperty(key));
    appliedKeys.clear();
  } else {
    const vars = buildThemeVars(skin, mode);
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
      appliedKeys.add(key);
    });
  }

  const themeColor = skin.id === SITE_DEFAULT_SKIN_ID
    ? mode === "DARK" ? "#120922" : "#FAF6FE"
    : `hsl(${buildThemeVars(skin, mode)["--md-surface"]})`;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", themeColor));
  try {
    window.localStorage.setItem(THEME_COLOR_STORAGE_KEY, themeColor);
  } catch {
    /* private mode — no need to remember the chrome colour */
  }
}

export function readStoredSkinId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeSkinId(id: string, mode: SkinThemeMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    /* private mode — selection still works for this session */
  }
}
