"use client";

import { useEffect, useRef } from "react";
import type { MarketingCopy } from "./copy";
import "./who-for.css";

/**
 * "Who it's for": the shortest section on the page and the only one that is a
 * single horizontal band. One sentence on a gold hairline, then a five-across
 * lattice of audience types. No section head, no eyebrow, no lede.
 *
 * Flat by construction. Zero glass, no shadow, no card gaps: the grid paints
 * its own dividers so two neighbouring cells share one hairline instead of
 * stacking two. This is the one place on the page where nothing is elevated,
 * which is what makes the glass everywhere else mean something.
 *
 * Owns its outermost element. The page calls this component bare, so the
 * <section>, the #who anchor and the horizontal padding all live here.
 */
export function WhoFor({ copy }: { copy: MarketingCopy["whoFor"] }) {
  const leadRef = useRef<HTMLParagraphElement | null>(null);

  // The only motion in the section: the lead sentence wipes open from the left
  // on first intersection. The grid gets nothing. The clipped state is armed
  // from JS rather than from CSS, so without scripting, and before hydration,
  // the sentence is simply there. If the band is already on screen at mount
  // (a deep link to #who, a reload mid-page) the wipe is skipped instead of
  // flashed. Reduced motion is handled in who-for.css.
  useEffect(() => {
    const el = leadRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.add("is-armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.4, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="mk-band" id="who">
      <p className="mk-band__lead" ref={leadRef}>
        {copy.h2}
      </p>
      <ul className="mk-band__grid">
        {copy.audiences.map((audience, i) => (
          <li key={audience.name}>
            <span className="mk-band__n" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mk-band__name">{audience.name}</h3>
            <p className="mk-band__note">{audience.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
