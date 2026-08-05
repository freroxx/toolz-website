import { useQuery } from "@tanstack/react-query";

interface GithubRelease {
  assets: {
    download_count: number;
  }[];
}

async function fetchTotalDownloads(): Promise<number> {
  const res = await fetch("https://api.github.com/repos/freroxx/toolz/releases");
  if (!res.ok) return 0;
  const releases: GithubRelease[] = await res.json();

  return releases.reduce((acc, release) => {
    const releaseDownloads = release.assets.reduce((sum, asset) => sum + asset.download_count, 0);
    return acc + releaseDownloads;
  }, 0);
}

export function useGithubDownloads() {
  return useQuery({
    queryKey: ["github-total-downloads"],
    queryFn: fetchTotalDownloads,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes for "live" feel
  });
}
