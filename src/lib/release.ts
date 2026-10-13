/**
 * Single source of truth for Toolz release artifacts.
 *
 * The "Update Toolz" dialog previously read APK URLs + changelog from
 * `update_manifest.json`, which ships no changelog and can lag behind the
 * actual GitHub release. `/downloads` reads the GitHub Releases API
 * directly and was always correct. Everything download-related now shares
 * the helpers below so both surfaces agree.
 */

export type Abi = "arm64-v8a" | "armeabi-v7a" | "x86_64" | "x86";

export interface ApkAsset {
  abi: Abi;
  /** Human label, e.g. "arm64-v8a". */
  label: string;
  downloadUrl: string;
  sizeBytes: number;
  downloadCount: number;
}

const ABI_ORDER: Abi[] = ["arm64-v8a", "armeabi-v7a", "x86_64", "x86"];

/** Map a GitHub asset filename to its ABI. Returns null for non-APK assets. */
export function abiFromAssetName(name: string): Abi | null {
  const n = name.toLowerCase();
  if (!n.endsWith(".apk")) return null;
  if (n.includes("arm64")) return "arm64-v8a";
  if (n.includes("armeabi-v7a") || n.includes("armv7") || n.includes("v7a")) return "armeabi-v7a";
  // Check x86_64 before x86 — "x86_64" contains "x86".
  if (n.includes("x86_64")) return "x86_64";
  if (n.includes("x86")) return "x86";
  return null;
}

export interface RawAsset {
  name: string;
  browser_download_url: string;
  size?: number;
  download_count?: number;
}

/** Keep one entry per ABI (highest download count wins), sorted by ABI_ORDER. */
export function mapAssetsToApks(assets: RawAsset[]): ApkAsset[] {
  const byAbi = new Map<Abi, ApkAsset>();
  for (const a of assets ?? []) {
    const abi = abiFromAssetName(a.name);
    if (!abi || !a.browser_download_url) continue;
    const prev = byAbi.get(abi);
    const count = Number(a.download_count) || 0;
    if (!prev || count > prev.downloadCount) {
      byAbi.set(abi, {
        abi,
        label: abi,
        downloadUrl: a.browser_download_url,
        sizeBytes: Number(a.size) || 0,
        downloadCount: count,
      });
    }
  }
  return ABI_ORDER.filter((abi) => byAbi.has(abi)).map((abi) => byAbi.get(abi)!);
}

export interface RawRelease {
  tag_name?: string;
  name?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  published_at?: string;
  html_url?: string;
  assets?: RawAsset[];
}

/** Latest non-draft release. Prefers stable over prerelease when both exist. */
export function pickLatestRelease(releases: RawRelease[]): RawRelease | null {
  const live = (releases ?? []).filter((r) => r && !r.draft && r.tag_name);
  if (live.length === 0) return null;
  const stable = live.filter((r) => !r.prerelease);
  return (stable.length > 0 ? stable : live)[0] ?? null;
}

/** "v1.1.6" / "v1.1.6 (BETA)" -> "1.1.6". */
export function versionFromTag(tag: string | undefined | null): string {
  const m = (tag ?? "").match(/(\d+\.\d+(?:\.\d+)?)/);
  return m ? m[1] : "";
}

/**
 * Best-effort device ABI detection from the browser UA.
 * Falls back to arm64-v8a (>90% of modern Android devices).
 * SSR-safe: returns the default when `navigator` is unavailable.
 */
export function detectAbi(): Abi {
  try {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("x86_64") || ua.includes("amd64")) return "x86_64";
    if (ua.includes("x86")) return "x86";
    if (ua.includes("armv7") || ua.includes("armeabi-v7a")) return "armeabi-v7a";
    if (ua.includes("arm") && !ua.includes("arm64") && !ua.includes("aarch64")) return "armeabi-v7a";
  } catch {
    /* navigator unavailable — fall through to default */
  }
  return "arm64-v8a";
}

export function formatApkSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ABI_HINT: Record<Abi, string> = {
  "arm64-v8a": "Most devices",
  "armeabi-v7a": "Older 32-bit",
  x86_64: "Emulator",
  x86: "Emulator 32-bit",
};
