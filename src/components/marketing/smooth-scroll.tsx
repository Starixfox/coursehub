"use client";

import { useEffect } from "react";
import "lenis/dist/lenis.css";

/**
 * Lenis smooth scroll for the marketing page. The scroll story reads native
 * scroll position each frame, so Lenis (which keeps the native scrollbar and
 * only smooths the wheel) composes with it directly. Destroyed on unmount;
 * never started under prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: { destroy: () => void } | null = null;
    let cancelled = false;

    import("lenis")
      .then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({ autoRaf: true, lerp: 0.115 });
      })
      .catch(() => {
        /* native scroll is a fine fallback */
      });

    return () => {
      cancelled = true;
      if (lenis) lenis.destroy();
    };
  }, []);

  return null;
}
