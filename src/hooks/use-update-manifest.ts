import { useQuery } from "@tanstack/react-query";
import { detectAbi } from "@/lib/release";

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

export async function fetchManifest(): Promise<UpdateManifest> {
  const url = `https://raw.githubusercontent.com/freroxx/toolz/master/update_manifest.json?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-cache" });
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

  const bestRelease =
    data?.releases.find((r) => r.abi === detectedAbi) ??
    data?.releases.find((r) => r.abi === "arm64-v8a") ??
    data?.releases?.[0];

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
