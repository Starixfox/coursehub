import type { CSSProperties } from "react";
import "./cta-orbit.css";

/**
 * The final CTA orbit: three concentric rings sunk 384px below the section's
 * bottom edge, behind the copy, so only their top arcs ever enter the frame.
 * This is what gives the last section depth without a hero image, a video or
 * the usual gradient blob.
 *
 * Geometry, because the numbers only work as a set. The container is exactly
 * as tall as the outer ring (752px) and its bottom sits at -24rem, so the
 * shared centre of all three rings lands 8px below the section (752/2 - 384).
 * The outer ring therefore crests 368px above the bottom edge, and the
 * top-to-bottom mask is fully transparent exactly where that crest is and
 * fully opaque 142px above the bottom edge. Every ring is bottom-anchored, so
 * the result is identical whether the section renders at its 26rem minimum or
 * taller: at 1440x900 and at 390x844 alike, only the top arc is in frame.
 *
 * Each ring carries integration chips. The chip is placed by a zero-size slot
 * that does `rotate(a) translateX(r/2 - 20px)` off the ring centre, and stays
 * upright while its ring turns because it cancels both rotations itself: a
 * static `rotate: -a` (the slot's placement angle) plus an animation of the
 * same keyframes, duration and inverse direction as its ring (the ring's live
 * angle). Sum of the chain is a constant 360deg, i.e. visually zero, at every
 * frame. See cta-orbit.css for why that is three separate CSS properties.
 *
 * Motion budget: this is one of only three things on the page allowed to move
 * without user input (D.5), so it animates `transform` and nothing else. It is
 * absolutely positioned and therefore cannot dirty the section's layout, and
 * it never animates a property that would.
 *
 * The page renders this as the first child of `.mk-cta-section`, which owns
 * the `position: relative` and the `overflow: hidden` that clips the rings at
 * the section's bottom edge.
 */

type OrbitRing = {
  /** Ring diameter in px: 752 outer, 544 middle, 336 inner. */
  size: number;
  /** Chips carried by this ring. 7 + 4 + 2 = 13 across the assembly. */
  slots: number;
  /** Seconds for one full revolution. */
  duration: number;
  /** Spin direction. Adjacent rings are always opposites. */
  spin: "normal" | "reverse";
};

const RINGS: readonly OrbitRing[] = [
  { size: 752, slots: 7, duration: 34, spin: "normal" },
  { size: 544, slots: 4, duration: 26, spin: "reverse" },
  { size: 336, slots: 2, duration: 20, spin: "normal" },
];

/** 13. Fixed, whatever the copy hands us. */
const SLOT_TOTAL = RINGS.reduce((n, ring) => n + ring.slots, 0);

/** Where each ring's chips start inside the flat 13-slot label list. */
const RING_OFFSET = RINGS.map((_, i) =>
  RINGS.slice(0, i).reduce((n, ring) => n + ring.slots, 0),
);

type CtaOrbitProps = {
  /**
   * Integration names. The assembly always wants exactly 13, so a shorter
   * list cycles and a longer one is truncated. An empty list renders the
   * rings bare rather than throwing.
   */
  items: string[];
  /**
   * Accepted for symmetry with `copy.integrations` and deliberately unused.
   * The assembly is `aria-hidden` by contract, so nothing inside it reaches
   * assistive tech; exposing the names anywhere else would announce a systems
   * inventory that has no visible heading and no visible counterpart, which is
   * worse than the silence. If these names ever need to be read out, they
   * belong in real section copy, not in decoration.
   */
  aria: string;
};

export function CtaOrbit({ items }: CtaOrbitProps) {
  // Cycle or truncate to exactly SLOT_TOTAL, in one pass, before any ring is
  // built. `items.length` guards the modulo against an empty array.
  const labels = items.length
    ? Array.from({ length: SLOT_TOTAL }, (_, i) => items[i % items.length])
    : [];

  return (
    <div className="mk-cta__orbit" aria-hidden="true">
      {RINGS.map((ring, r) => (
        <div
          key={ring.size}
          className="mk-cta__ring"
          style={
            {
              "--r": `${ring.size}px`,
              "--duration": `${ring.duration}s`,
              "--spin": ring.spin,
              "--spin-counter": ring.spin === "normal" ? "reverse" : "normal",
            } as CSSProperties
          }
        >
          {labels
            .slice(RING_OFFSET[r], RING_OFFSET[r] + ring.slots)
            .map((label, i) => {
              // Four decimals, not whole degrees: 360/7 rounded to 51deg would
              // leave the seventh chip 3deg short of the first.
              const angle = ((i * 360) / ring.slots).toFixed(4);
              return (
                <span
                  key={`${ring.size}-${angle}`}
                  className="mk-cta__slot"
                  style={{ "--a": `${angle}deg` } as CSSProperties}
                >
                  <span className="mk-cta__chip">{label}</span>
                </span>
              );
            })}
        </div>
      ))}
    </div>
  );
}
