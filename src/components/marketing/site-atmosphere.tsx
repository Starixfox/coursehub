"use client";

import { useEffect, useState, type ComponentType } from "react";

type ShaderModule = {
  Shader: ComponentType<{ style?: React.CSSProperties; children?: React.ReactNode }>;
  Swirl: ComponentType<Record<string, unknown>>;
  ChromaFlow: ComponentType<Record<string, unknown>>;
  FlutedGlass: ComponentType<Record<string, unknown>>;
  FilmGrain: ComponentType<Record<string, unknown>>;
};

/**
 * The site-wide backdrop: the same four-layer house recipe as every concept
 * site (Swirl + ChromaFlow + FlutedGlass + FilmGrain from the `shaders`
 * package, structural values unchanged), re-tinted from paper/ultramarine to
 * the dark gold-on-glass system on 2026-08-27. Per the house rule only the
 * tints change per brand; detail 1.7, momentum 13, radius 3.5 and FilmGrain
 * 0.05 stay exactly as documented. FilmGrain is the layer that makes the
 * effect read through translucent overlays. Do not drop it.
 *
 * Mounts client-side only, respects prefers-reduced-motion; the CSS gradient
 * atmosphere in marketing.css stays as the no-JS / reduced-motion fallback.
 */
export function SiteAtmosphere() {
  const [mod, setMod] = useState<ShaderModule | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    import("shaders/react")
      .then((m) => {
        if (!cancelled) setMod(m as unknown as ShaderModule);
      })
      .catch(() => {
        /* decorative; the CSS gradient fallback stays */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mod) return null;
  const { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } = mod;

  return (
    <div className="mk-atmos__shader" aria-hidden="true">
      <Shader style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <Swirl colorA="#0b1018" colorB="#132419" detail={1.7} />
        <ChromaFlow
          baseColor="#0a0d14"
          downColor="#c9a66b"
          leftColor="#c9a66b"
          rightColor="#c9a66b"
          upColor="#c9a66b"
          momentum={13}
          radius={3.5}
        />
        <FlutedGlass
          aberration={0.61}
          angle={31}
          frequency={8}
          highlight={0.12}
          highlightSoftness={0}
          lightAngle={-90}
          refraction={4}
          shape="rounded"
          softness={1}
          speed={0.15}
        />
        <FilmGrain strength={0.05} />
      </Shader>
    </div>
  );
}
