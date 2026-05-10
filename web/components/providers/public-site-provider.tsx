"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ResolvedPublicSiteSettings } from "@/types/public-site";

const PublicSiteContext = createContext<ResolvedPublicSiteSettings | null>(null);

export function PublicSiteProvider({
  value,
  children,
}: {
  value: ResolvedPublicSiteSettings;
  children: ReactNode;
}) {
  return <PublicSiteContext.Provider value={value}>{children}</PublicSiteContext.Provider>;
}

export function usePublicSiteSettings(): ResolvedPublicSiteSettings {
  const v = useContext(PublicSiteContext);
  if (!v) {
    throw new Error("usePublicSiteSettings must be used within PublicSiteProvider");
  }
  return v;
}
