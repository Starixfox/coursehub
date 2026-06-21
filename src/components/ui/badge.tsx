import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/entitlements";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-muted",
        primary: "border-primary/30 bg-primary/15 text-accent",
        success: "border-success/30 bg-success/15 text-success",
        warning: "border-warning/30 bg-warning/15 text-warning",
        danger: "border-danger/30 bg-danger/15 text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

const TIER_VARIANT: Record<Tier, BadgeProps["variant"]> = {
  free: "default",
  basic: "primary",
  pro: "primary",
  premium: "warning",
};

export function TierBadge({ tier }: { tier: Tier }) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  return <Badge variant={TIER_VARIANT[tier]}>{label}</Badge>;
}
