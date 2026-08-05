import { useQuery } from "@tanstack/react-query";

export interface GithubAsset {
  name: string;
  download_count: number;
  size: number;
  browser_download_url: string;
}

export interface GithubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  assets: GithubAsset[];
  html_url: string;
}

async function fetchReleases(): Promise<GithubRelease[]> {
  const res = await fetch("https://api.github.com/repos/freroxx/toolz/releases");
  if (!res.ok) throw new Error("Failed to fetch releases");
  return res.json();
}

export function useGithubReleases() {
  return useQuery({
    queryKey: ["github-releases"],
    queryFn: fetchReleases,
    staleTime: 1000 * 60 * 10,
  });
}

export function useGithubDownloads() {
  const { data: releases, isLoading, refetch, isFetching } = useGithubReleases();

  const totalDownloads = releases?.reduce((acc, release) => {
    const releaseDownloads = release.assets?.reduce((sum, asset) => sum + (asset.download_count || 0), 0) || 0;
    return acc + releaseDownloads;
  }, 0) ?? 0;

  return {
    totalDownloads,
    isLoading,
    isFetching,
    refetch,
    releases,
    data: totalDownloads // for backward compatibility with existing components
  };
}
