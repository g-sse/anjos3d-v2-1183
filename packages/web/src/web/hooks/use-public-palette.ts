import { useCallback, useEffect, useState } from "react";

export type PublicPalette = "logo" | "original";

const storageKey = "anjos3d.public.palette";

function initialPalette(): PublicPalette {
  if (typeof window === "undefined") return "logo";
  const param = new URLSearchParams(window.location.search).get("paleta");
  if (param === "original" || param === "logo") return param;
  try {
    return window.localStorage.getItem(storageKey) === "original" ? "original" : "logo";
  } catch {
    return "logo";
  }
}

/** Visitor choice between the logo palette (default) and the previous sage palette, remembered in this browser. */
export function usePublicPalette() {
  const [palette, setPalette] = useState<PublicPalette>(initialPalette);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey) setPalette(event.newValue === "original" ? "original" : "logo");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const toggle = useCallback(() => {
    setPalette(current => {
      const next: PublicPalette = current === "logo" ? "original" : "logo";
      try { window.localStorage.setItem(storageKey, next); } catch { /* storage unavailable: choice lasts this visit */ }
      return next;
    });
  }, []);
  return { palette, toggle };
}
