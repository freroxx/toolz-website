import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGithubReleases } from "@/hooks/use-github-downloads";
import { fetchManifest } from "@/hooks/use-update-manifest";
import {
  ABI_HINT,
  detectAbi,
  mapAssetsToApks,
  pickLatestRelease,
  versionFromTag,
  type ApkAsset,
} from "@/lib/release";

export interface LatestReleaseState {
  /** e.g. "1.1.6" — from GitHub tag, manifest fallback, hardcoded last resort. */
  versionName: string;
  /** Changelog markdown from the GitHub release body (authoritative). */
  changelog: string;
  /** One APK per ABI, stable order, from the latest GitHub release. */
  apks: ApkAsset[];
  /** ABI of the visiting device (best effort). */
  detectedAbi: string;
  abiHint: (abi: string) => string;
  /** True while either source is still loading and we have nothing to show. */
  isLoading: boolean;
  /** True when GitHub failed AND manifest failed — show the releases link. */
  isError: boolean;
  /** True when APKs came from the manifest fallback instead of GitHub. */
  isFallback: boolean;
  publishedAt: string;
  htmlUrl: string;
  releasesPageUrl: string;
}

const RELEASES_URL = "https://github.com/freroxx/toolz/releases";

/**
 * The dialog's data source. GitHub latest release first (same query the
 * /downloads page renders, so the two can never disagree), manifest as
 * fallback for version + APK URLs when the API is rate-limited/offline.
 */
export function useLatestRelease(): LatestReleaseState {
  // Shared ["github-releases"] cache with /downloads — no duplicate fetch.
  const github = useGithubReleases();

  const manifest = useQuery({
    queryKey: ["toolz-update-manifest"],
    queryFn: fetchManifest,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    // Only needed when GitHub fails — don't fetch it otherwise.
    enabled: github.isError,
  });

  return useMemo(() => {
    const detectedAbi = detectAbi();
    const abiHint = (abi: string) =>
      ABI_HINT[abi as keyof typeof ABI_HINT] ?? "";
    const latest = pickLatestRelease(
      Array.isArray(github.data) ? github.data : []
    );
    const githubApks = latest ? mapAssetsToApks(latest.assets ?? []) : [];

    if (githubApks.length > 0 && latest) {
      return {
        versionName:
          versionFromTag(latest.tag_name) || manifest.data?.versionName || "1.1.0",
        changelog: latest.body ?? "",
        apks: githubApks,
        detectedAbi,
        abiHint,
        isLoading: false,
        isError: false,
        isFallback: false,
        publishedAt: latest.published_at ?? "",
        htmlUrl: latest.html_url ?? RELEASES_URL,
        releasesPageUrl: RELEASES_URL,
      };
    }

    const m = manifest.data;
    if (m && Array.isArray(m.releases) && m.releases.length > 0) {
      return {
        versionName:
          m.versionName || versionFromTag(latest?.tag_name) || "1.1.0",
        changelog: latest?.body ?? m.changelog ?? "",
        apks: m.releases
          .filter((r) => r?.abi && r?.downloadUrl)
          .map((r) => ({
            abi: r.abi as ApkAsset["abi"],
            label: r.abi,
            downloadUrl: r.downloadUrl,
            sizeBytes: 0,
            downloadCount: 0,
          })),
        detectedAbi,
        abiHint,
        isLoading: false,
        isError: false,
        isFallback: true,
        publishedAt: latest?.published_at ?? "",
        htmlUrl: latest?.html_url ?? RELEASES_URL,
        releasesPageUrl: RELEASES_URL,
      };
    }

    return {
      versionName: versionFromTag(latest?.tag_name) || "1.1.0",
      changelog: latest?.body ?? "",
      apks: [],
      detectedAbi,
      abiHint,
      isLoading: github.isLoading || (github.isError && manifest.isLoading),
      isError: github.isError && manifest.isError,
      isFallback: false,
      publishedAt: latest?.published_at ?? "",
      htmlUrl: latest?.html_url ?? RELEASES_URL,
      releasesPageUrl: RELEASES_URL,
    };
  }, [
    github.data,
    github.isLoading,
    github.isError,
    manifest.data,
    manifest.isLoading,
    manifest.isError,
  ]);
}
