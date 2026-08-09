"use client";

import { useEffect, useState, type ComponentType } from "react";

type ShaderModule = {
  Shader: ComponentType<{ style?: React.CSSProperties; children?: React.ReactNode }>;
  Swirl: ComponentType<Record<string, unknown>>;
  ChromaFlow: ComponentType<Record<string, unknown>>;
  FlutedGlass: ComponentType<Record<string, unknown>>;
};

/**
 * Animated shader island behind the hero (same recipe as the other concept
 * sites: Swirl + ChromaFlow + FlutedGlass from the `shaders` package), in the
 * site's paper/ultramarine palette. Mounts client-side only; respects
 * prefers-reduced-motion. The CSS radial glows on .mk-hero remain as the
 * no-JS / reduced-motion fallback.
 */
export function HeroShader() {
  const [mod, setMod] = useState<ShaderModule | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    import("shaders/react")
      .then((m) => {
        if (!cancelled) setMod(m as unknown as ShaderModule);
      })
      .catch(() => {
        /* shader is decorative; the CSS fallback stays */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mod) return null;
  const { Shader, Swirl, ChromaFlow, FlutedGlass } = mod;

  return (
    <Shader style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <Swirl colorA="#f6f4ee" colorB="#e9e2cf" detail={1.7} />
      <ChromaFlow
        baseColor="#f6f4ee"
        downColor="#2b44e7"
        leftColor="#2b44e7"
        rightColor="#2b44e7"
        upColor="#2b44e7"
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
    </Shader>
  );
}
