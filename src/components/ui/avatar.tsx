import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name?: string | null;
  src?: string | null;
  size?: number;
}

function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 36, className, style, ...props }: AvatarProps) {
  const dimension = { width: size, height: size, ...style };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
        "bg-gradient-to-br from-primary/30 to-accent/20 text-accent ring-1 ring-border-strong",
        "font-medium",
        className,
      )}
      style={dimension}
      aria-label={name ?? undefined}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ?? "Avatar"}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.4) }}>{initials(name)}</span>
      )}
    </span>
  );
}
