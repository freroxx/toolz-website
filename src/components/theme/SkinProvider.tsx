import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSkins } from "@/hooks/useSkins";
import { SkinContext, type SkinContextValue } from "@/components/theme/skin-context";
import {
  DEFAULT_SKIN,
  SITE_DEFAULT_SKIN_ID,
  applySkinTheme,
  readStoredSkinId,
  resolveMode,
  storeSkinId,
} from "@/lib/skins";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const SkinProvider = ({ children }: { children: ReactNode }) => {
  const { skins, included, community, loading, degraded } = useSkins();
  const [activeId, setActiveIdState] = useState<string>(() => readStoredSkinId() ?? SITE_DEFAULT_SKIN_ID);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const activeSkin = useMemo(
    () => skins.find((skin) => skin.id === activeId) ?? DEFAULT_SKIN,
    [skins, activeId]
  );

  const resolvedMode = useMemo(
    () => resolveMode(activeSkin.themeMode, systemDark),
    [activeSkin.themeMode, systemDark]
  );

  const selectSkin = useCallback((id: string) => {
    const next = skins.find((skin) => skin.id === id);
    if (!next) return;
    setActiveIdState(next.id);
    storeSkinId(next.id, next.themeMode);
  }, [skins]);

  // If a stored community skin was unpublished, fall back to the site default.
  useEffect(() => {
    if (loading) return;
    if (!skins.some((skin) => skin.id === activeId)) {
      setActiveIdState(SITE_DEFAULT_SKIN_ID);
      storeSkinId(SITE_DEFAULT_SKIN_ID, "DARK");
    }
  }, [loading, skins, activeId]);

  useEffect(() => {
    applySkinTheme(activeSkin, resolvedMode);
    document
      .querySelectorAll('meta[name="color-scheme"]')
      .forEach((meta) => meta.setAttribute("content", resolvedMode.toLowerCase()));
  }, [activeSkin, resolvedMode]);

  const value = useMemo<SkinContextValue>(
    () => ({
      skins,
      included,
      community,
      activeSkin,
      activeId: activeSkin.id,
      resolvedMode,
      loading,
      degraded,
      selectSkin,
    }),
    [skins, included, community, activeSkin, resolvedMode, loading, degraded, selectSkin]
  );

  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
};
