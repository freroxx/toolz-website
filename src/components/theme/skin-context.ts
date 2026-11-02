import { createContext, useContext } from "react";
import type { ResolvedMode, SiteSkin } from "@/lib/skins";

export interface SkinContextValue {
  skins: SiteSkin[];
  included: SiteSkin[];
  community: SiteSkin[];
  activeSkin: SiteSkin;
  activeId: string;
  resolvedMode: ResolvedMode;
  loading: boolean;
  degraded: boolean;
  selectSkin: (id: string) => void;
}

export const SkinContext = createContext<SkinContextValue | null>(null);

export function useSkin(): SkinContextValue {
  const context = useContext(SkinContext);
  if (!context) throw new Error("useSkin must be used inside <SkinProvider>");
  return context;
}
