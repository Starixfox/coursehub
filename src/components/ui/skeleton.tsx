import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shimmer loading placeholder. The keyframe is injected locally so the
 * component is self-contained and does not depend on globals.css.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-sm)] bg-surface",
          "after:absolute after:inset-0 after:-translate-x-full",
          "after:bg-gradient-to-r after:from-transparent after:via-card-hover after:to-transparent",
          "after:content-[''] after:[animation:ch-shimmer_1.6s_infinite]",
          className,
        )}
        {...props}
      />
    </>
  );
}

const shimmerKeyframes = `@keyframes ch-shimmer { 100% { transform: translateX(100%); } }`;
