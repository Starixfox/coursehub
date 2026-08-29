"use client";

import { useEffect, useRef, useState } from "react";
import type { MarketingCopy } from "./copy";
import "./approach-section.css";

/**
 * Approach: the tallest section on the page (around 1520px) and the only one
 * with a sticky rail.
 *
 * It is a 2:3 asymmetric split. The left rail holds the heading, a five-item
 * numbered index and the gold pipeline drawing, and it stays pinned at 96px
 * while the five body blocks scroll past it. That makes it the only two-column
 * reading layout and the only sticky element below the fold, which is the whole
 * reason it exists: after the tabbed workflows above it, the page needs one
 * section that reads like a document rather than like a component.
 *
 * Completely flat. No glass, no cards, no plates. The body blocks are held
 * apart by a single dashed hairline and nothing else, and they have no
 * entrance animation whatsoever. The old version faded each of them up on a
 * 40ms cascade; that cascade was the most template-looking motion on the page.
 * The blocks are the payload, so they are simply there.
 *
 * The rail's active marker is driven by an IntersectionObserver on the body
 * blocks, never by scroll position maths, and the pipeline draw is owned by
 * scroll-fx.tsx, which finds the path by its data-approach-pipe attribute.
 *
 * Owns its outermost element. The page calls this component bare, so the
 * <section>, the #approach anchor and the horizontal padding all live here.
 */
export function ApproachSection({ copy }: { copy: MarketingCopy["approach"] }) {
  const blockRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // Rail active state. A rootMargin of "-96px 0px -70% 0px" narrows the
  // observer root to a reading band that starts exactly where the sticky rail
  // starts and ends at 30% of the viewport. Blocks are at least 260px tall and
  // the band is a few hundred pixels, so more than one block can sit in it
  // during a handover; the rule is "the highest block still in the band wins",
  // which resolves symmetrically whether you scroll down into a block or back
  // up into it. Nothing here reads scrollY.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const blocks = blockRefs.current.filter(
      (el): el is HTMLElement => el !== null,
    );
    if (blocks.length === 0) return;

    const inBand = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = blocks.indexOf(entry.target as HTMLElement);
          if (i === -1) continue;
          if (entry.isIntersecting) inBand.add(i);
          else inBand.delete(i);
        }
        // Between two blocks nothing is in the band. Hold the last answer
        // rather than flicking the marker off.
        if (inBand.size === 0) return;
        setActive(Math.min(...inBand));
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    for (const block of blocks) io.observe(block);
    return () => io.disconnect();
  }, []);

  return (
    <section className="mk-approach" id="approach">
      <div className="mk-approach__grid">
        <div className="mk-approach__rail">
          <h2 className="mk-h2">{copy.h2}</h2>
          <p className="mk-approach__lede">{copy.lede}</p>

          <ol className="mk-approach__nav">
            {copy.steps.map((step, i) => (
              <li
                key={step.num}
                aria-current={i === active ? "step" : undefined}
              >
                <span>{step.num}</span>
                {step.name}
              </li>
            ))}
          </ol>

          {/* One continuous serpentine, normalised to pathLength 1 so the dash
              maths in scroll-fx.tsx is independent of the rendered geometry.
              The resting state (dasharray 1, dashoffset 1) lives in the CSS;
              scroll-fx scrubs the offset to 0 as the section crosses the
              viewport, and sets it to 0 outright under reduced motion. */}
          <svg
            className="mk-approach__pipe"
            viewBox="0 0 240 140"
            aria-hidden="true"
            focusable="false"
          >
            <path
              data-approach-pipe
              pathLength={1}
              d="M10 16 H206 A14 14 0 0 1 220 30 V56 A14 14 0 0 1 206 70 H34 A14 14 0 0 0 20 84 V110 A14 14 0 0 0 34 124 H230"
            />
          </svg>
        </div>

        <div className="mk-approach__body">
          {copy.steps.map((step, i) => (
            <article
              key={step.num}
              className="mk-approach__block"
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
            >
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <ul className="mk-approach__out">
                {step.outputs.map((output) => (
                  <li key={output}>
                    <span className="mk-approach__chip" aria-hidden="true" />
                    <span>{output}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
