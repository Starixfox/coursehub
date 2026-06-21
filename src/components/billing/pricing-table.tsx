"use client";

import * as React from "react";
import { Check, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TIER_PLANS, TIER_ORDER, type Tier } from "@/lib/entitlements";
import type { PaidTier, Interval } from "@/lib/stripe/config";
import { CheckoutButton } from "@/components/billing/checkout-button";

const PAID: PaidTier[] = ["basic", "pro", "premium"];

function isPaid(tier: Tier): tier is PaidTier {
  return (PAID as Tier[]).includes(tier);
}

interface PricingTableProps {
  /** The viewer's current effective tier, used to mark the active plan. */
  currentTier?: Tier;
}

export function PricingTable({ currentTier = "free" }: PricingTableProps) {
  const [interval, setInterval] = React.useState<Interval>("month");
  const yearly = interval === "year";

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Billing interval"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1"
        >
          <IntervalTab
            active={!yearly}
            onClick={() => setInterval("month")}
            label="Monthly"
          />
          <IntervalTab
            active={yearly}
            onClick={() => setInterval("year")}
            label="Yearly"
            hint="Save ~17%"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
        {TIER_ORDER.map((tier) => {
          const plan = TIER_PLANS[tier];
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          const isCurrent = tier === currentTier;
          const highlighted = Boolean(plan.highlighted);

          return (
            <Card
              key={tier}
              className={cn(
                "relative flex flex-col",
                highlighted && "border-primary/50 shadow-[0_8px_40px_-12px_rgba(124,108,246,0.45)]",
              )}
            >
              {highlighted ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="gap-1 px-3 py-1">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Most popular
                  </Badge>
                </div>
              ) : null}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent ? (
                    <Badge variant="success">Current</Badge>
                  ) : null}
                </div>
                <CardDescription>{plan.tagline}</CardDescription>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight text-foreground">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 ? (
                    <span className="text-sm text-muted">/{yearly ? "year" : "month"}</span>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      <span className="text-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto">
                {tier === "free" ? (
                  <Button
                    variant={isCurrent ? "outline" : "secondary"}
                    className="w-full"
                    disabled={isCurrent}
                    asChild={!isCurrent}
                  >
                    {isCurrent ? (
                      <span>Current plan</span>
                    ) : (
                      <a href="/register">Get started</a>
                    )}
                  </Button>
                ) : isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : isPaid(tier) ? (
                  <CheckoutButton
                    tier={tier}
                    interval={interval}
                    variant={highlighted ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {`Choose ${plan.name}`}
                  </CheckoutButton>
                ) : null}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function IntervalTab({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
        active
          ? "bg-primary text-primary-foreground shadow-[0_6px_24px_-8px_rgba(124,108,246,0.7)]"
          : "text-muted hover:text-foreground",
      )}
    >
      {label}
      {hint ? (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            active ? "bg-white/20 text-primary-foreground" : "bg-success/15 text-success",
          )}
        >
          {hint}
        </span>
      ) : null}
    </button>
  );
}
