import { useEffect, useState } from "react";
import { builtInSkins, normaliseSkin, type SiteSkin } from "@/lib/skins";

interface SkinFeed {
  skins?: unknown;
  degraded?: boolean;
  count?: number;
}

interface FeedState {
  community: SiteSkin[];
  degraded: boolean;
  loading: boolean;
}

let cache: FeedState | null = null;
let inFlight: Promise<FeedState> | null = null;

async function fetchSkins(): Promise<FeedState> {
  const res = await fetch("/api/skins", { cache: "no-store" });
  const data = (await res.json().catch(() => null)) as SkinFeed | null;
  if (!res.ok || !data || !Array.isArray(data.skins)) {
    throw new Error("skins feed unavailable");
  }
  const community = data.skins
    .map((item) => normaliseSkin(item as Record<string, unknown>, "community"))
    .filter((skin): skin is SiteSkin => skin !== null);
  return { community, degraded: data.degraded === true, loading: false };
}

function load(): Promise<FeedState> {
  if (cache) return Promise.resolve(cache);
  if (!inFlight) {
    inFlight = fetchSkins()
      .then((state) => {
        cache = state;
        return state;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/**
 * Published skins from the app's public feed. Fail-open: if `/api/skins` is
 * unreachable or degraded, the picker still shows the looks the app ships.
 */
export function useSkins() {
  const [state, setState] = useState<FeedState>(() =>
    cache ?? { community: [], degraded: false, loading: true }
  );

  useEffect(() => {
    let cancelled = false;
    load()
      .then((next) => {
        if (!cancelled) setState(next);
      })
      .catch(() => {
        if (!cancelled) setState({ community: [], degraded: true, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const seen = new Set(builtInSkins.map((skin) => skin.id));
  const community = state.community.filter((skin) => !seen.has(skin.id));

  return {
    skins: [...builtInSkins, ...community],
    community,
    included: builtInSkins.filter((skin) => skin.source === "included"),
    loading: state.loading,
    degraded: state.degraded,
  };
}
