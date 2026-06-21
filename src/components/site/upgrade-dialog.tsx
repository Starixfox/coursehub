"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { TIER_PLANS, tierLabel, type Tier } from "@/lib/entitlements";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export interface UpgradeDialogProps {
  requiredTier: Tier;
  children: React.ReactNode;
}

export function UpgradeDialog({ requiredTier, children }: UpgradeDialogProps) {
  const plan = TIER_PLANS[requiredTier];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-primary/15 text-accent">
              <Sparkles className="size-4" />
            </span>
            <TierBadge tier={requiredTier} />
          </div>
          <DialogTitle>Upgrade to {tierLabel(requiredTier)}</DialogTitle>
          <DialogDescription>{plan.tagline}. This content requires a higher plan.</DialogDescription>
        </DialogHeader>

        <div className="rounded-[var(--radius)] border border-border bg-surface/60 p-4">
          <div className="mb-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-foreground">
              {formatPrice(plan.priceMonthly)}
            </span>
            {plan.priceMonthly > 0 ? (
              <span className="text-sm text-muted">/ month</span>
            ) : null}
          </div>
          <ul className="space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Maybe later</Button>
          </DialogClose>
          <Button asChild>
            <Link href="/pricing">View plans</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
