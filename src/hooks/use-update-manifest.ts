import { useQuery } from "@tanstack/react-query";

const MANIFEST_URL =
  "https://raw.githubusercontent.com/freroxx/toolz/main/update_manifest.json";

export interface ManifestRelease {
  abi: string;
  downloadUrl: string;
}

export interface UpdateManifest {
  versionName: string;
  versionCode: number;
  changelog: string;
  releases: ManifestRelease[];
}

/**
 * Best-effort device ABI detection from the browser.
 * On most mobile Android browsers navigator.userAgent contains the ABI.
 * Falls back to arm64-v8a (most common modern Android).
 */
function detectAbi(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("x86_64") || ua.includes("amd64")) return "x86_64";
  if (ua.includes("x86") && !ua.includes("x86_64")) return "x86";
  if (
    ua.includes("armv7") ||
    ua.includes("armeabi-v7a") ||
    (ua.includes("arm") && !ua.includes("arm64"))
  )
    return "armeabi-v7a";
  // Default: arm64-v8a (>90% of modern Android devices)
  return "arm64-v8a";
}

async function fetchManifest(): Promise<UpdateManifest> {
  const res = await fetch(MANIFEST_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to fetch manifest: ${res.status}`);
  return res.json();
}

export function useUpdateManifest() {
  const { data, isLoading, isError } = useQuery<UpdateManifest>({
    queryKey: ["toolz-update-manifest"],
    queryFn: fetchManifest,
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 2,
  });

  const detectedAbi = detectAbi();

  const bestRelease = data?.releases.find((r) => r.abi === detectedAbi)
    ?? data?.releases.find((r) => r.abi === "arm64-v8a")
    ?? data?.releases?.[0];

  return {
    manifest: data,
    bestRelease,
    detectedAbi,
    versionName: data?.versionName ?? "1.1.0",
    changelog: data?.changelog ?? "",
    allReleases: data?.releases ?? [],
    isLoading,
    isError,
    releasesPageUrl: "https://github.com/freroxx/toolz/releases",
  };
}
