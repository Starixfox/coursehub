"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fade-and-rise reveal on scroll. Wraps a block; adds .is-in when ~15%
 * visible. Falls back to visible immediately if IntersectionObserver is
 * unavailable and respects prefers-reduced-motion via CSS.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`rv ${className}`}
      style={{ "--rv-d": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
