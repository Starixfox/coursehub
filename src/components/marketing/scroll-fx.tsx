"use client";

import { useEffect } from "react";

/**
 * The only two GSAP ScrollTriggers on the marketing page.
 *
 * Deliberately small. There is no scroll-driven 3D scene on this page any
 * more, and the restraint that governed this file when there was one still
 * applies: motion is chrome, not content. ScrollTrigger is used here and
 * nowhere else, for two non-pinning, fully reversible scrubs:
 *
 *   1. nav-progress   the gold hairline inside the nav pill
 *   2. approach-draw  the gold pipeline path in the Approach section
 *
 * Neither pins. Neither mutates the 3D scene graph. Both are killed by id on
 * unmount, and neither is created at all under prefers-reduced-motion, which
 * leaves the hairline at scaleX(0) and the path fully drawn.
 */

const NAV_ID = "mk-nav-progress";
const APPROACH_ID = "mk-approach-draw";

export function ScrollFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* Reduced motion: no scrub, but the pipeline must not stay hidden.
         Draw it fully and leave it. */
      const path = document.querySelector<SVGPathElement>("[data-approach-pipe]");
      if (path) path.style.strokeDashoffset = "0";
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const nav = document.querySelector<HTMLElement>(".mk-nav__progress");
        if (nav) {
          gsap.fromTo(
            nav,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                id: NAV_ID,
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.4,
              },
            },
          );
        }

        /* The pipeline draws itself as the section crosses the viewport.
           pathLength is normalised to 1 in the SVG so the dash maths does not
           depend on the rendered geometry. */
        const pipe = document.querySelector<SVGPathElement>("[data-approach-pipe]");
        const section = document.querySelector<HTMLElement>("#approach");
        if (pipe && section) {
          gsap.fromTo(
            pipe,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                id: APPROACH_ID,
                trigger: section,
                start: "top 75%",
                end: "bottom 65%",
                scrub: 0.6,
              },
            },
          );
        }

        cleanup = () => {
          ScrollTrigger.getById(NAV_ID)?.kill();
          ScrollTrigger.getById(APPROACH_ID)?.kill();
        };
      })
      .catch(() => {
        /* Both effects are decorative. If GSAP fails to load the page is
           unchanged: the hairline stays at scaleX(0) and the pipe stays at its
           CSS resting state. */
      });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  return null;
}
