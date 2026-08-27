"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ChainKind, ChainNode, MarketingCopy } from "./copy";
import "./flow-compare.css";

type Variant = "before" | "after";

/**
 * Before / after chain comparison.
 *
 * The whole point of the visual is the shape of the two chains, not the words:
 * in the "before" chain the human node comes back between every single step and
 * hangs off the rail, in the "after" chain it appears once, at the end. The
 * after chain carries a packet that runs the rail left to right once it scrolls
 * into view, so the eye reads direction and continuity.
 *
 * Renders inner content only. marketing-page.tsx owns the section, the
 * container and the section head.
 */

/** Small role glyph. Decorative: the label next to it carries the meaning. */
function NodeGlyph({ kind, variant }: { kind: ChainKind; variant: Variant }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 14 14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (kind === "trigger") {
    return (
      <svg {...common}>
        <path d="M1 7h4.2" />
        <circle cx="9.3" cy="7" r="2.9" />
      </svg>
    );
  }

  if (kind === "human") {
    // Before: the work stops and waits for a person. After: a person signs off.
    return variant === "before" ? (
      <svg {...common}>
        <path d="M5 2.6v8.8M9 2.6v8.8" />
      </svg>
    ) : (
      <svg {...common}>
        <path d="M2.4 7.4l2.9 2.9L11.6 4" />
      </svg>
    );
  }

  if (kind === "agent") {
    return (
      <svg {...common}>
        <path d="M7 1.4l5.6 5.6L7 12.6 1.4 7z" />
        <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (kind === "system") {
    return (
      <svg {...common}>
        <rect x="1.9" y="2.6" width="10.2" height="8.8" rx="1.5" />
        <path d="M1.9 5.6h10.2" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M1.6 7h8.4M7.4 4.2L10.2 7l-2.8 2.8" />
    </svg>
  );
}

function Chain({
  nodes,
  variant,
  live,
  labelId,
}: {
  nodes: ChainNode[];
  variant: Variant;
  live: boolean;
  labelId: string;
}) {
  const last = Math.max(nodes.length - 1, 1);
  const runSeconds = 2.6;

  return (
    <div
      className={[
        "mk-cmp__chainwrap",
        `mk-cmp__chainwrap--${variant}`,
        live ? "is-live" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="mk-cmp__rail" aria-hidden="true">
        {variant === "after" ? <span className="mk-cmp__packet" /> : null}
      </span>

      <ol
        className={`mk-cmp__chain mk-cmp__chain--${variant}`}
        aria-labelledby={labelId}
      >
        {nodes.map((node, i) => (
          <li
            key={`${variant}-${i}-${node.label}`}
            className={`mk-cmp__node mk-cmp__node--${node.kind}`}
            style={
              {
                "--mk-cmp-d": `${((i / last) * runSeconds).toFixed(2)}s`,
              } as CSSProperties
            }
          >
            <span className="mk-cmp__glyph">
              <NodeGlyph kind={node.kind} variant={variant} />
            </span>
            <span className="mk-cmp__label">{node.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function FlowCompare({ copy }: { copy: MarketingCopy["beforeAfter"] }) {
  const afterRef = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = afterRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setLive(true);
      return;
    }
    // Kept observing rather than disconnected on first hit, so the loop stops
    // again once the panel leaves the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setLive(entry.isIntersecting);
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="mk-cmp">
      <div className="mk-cmp__panel mk-cmp__panel--before">
        <span className="mk-cmp__tag" id="mk-cmp-tag-before">
          {copy.beforeTag}
        </span>
        <Chain
          nodes={copy.beforeChain}
          variant="before"
          live={false}
          labelId="mk-cmp-tag-before"
        />
        <p className="mk-cmp__footnote">{copy.beforeFootnote}</p>
      </div>

      <div className="mk-cmp__panel mk-cmp__panel--after" ref={afterRef}>
        <span className="mk-cmp__tag mk-cmp__tag--after" id="mk-cmp-tag-after">
          {copy.afterTag}
        </span>
        <Chain
          nodes={copy.afterChain}
          variant="after"
          live={live}
          labelId="mk-cmp-tag-after"
        />
        <p className="mk-cmp__footnote mk-cmp__footnote--after">
          {copy.afterFootnote}
        </p>
      </div>

      <p className="mk-cmp__closing">{copy.closingLine}</p>
    </div>
  );
}
