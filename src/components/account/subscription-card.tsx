import * as React from "react";
import Link from "next/link";
import { CalendarClock, CreditCard, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge, TierBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TIER_PLANS, type Tier } from "@/lib/entitlements";
import type { Enums } from "@/lib/supabase/types";
import { formatDate, cn } from "@/lib/utils";

type SubscriptionStatus = Enums<"subscription_status">;

export interface SubscriptionDetails {
  tier: Tier;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  seats: number;
}

export interface SubscriptionCardProps {
  subscription: SubscriptionDetails;
  /** Slot for the (client) ManageSubscriptionButton from billing. */
  manageAction?: React.ReactNode;
}

const STATUS_META: Record<
  SubscriptionStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" }
> = {
  trialing: { label: "Trialing", variant: "success" },
  active: { label: "Active", variant: "success" },
  past_due: { label: "Past due", variant: "warning" },
  canceled: { label: "Canceled", variant: "danger" },
  incomplete: { label: "Incomplete", variant: "warning" },
  incomplete_expired: { label: "Expired", variant: "danger" },
  unpaid: { label: "Unpaid", variant: "danger" },
  paused: { label: "Paused", variant: "warning" },
};

export function SubscriptionCard({
  subscription,
  manageAction,
}: SubscriptionCardProps) {
  const { tier, status, currentPeriodEnd, cancelAtPeriodEnd, seats } =
    subscription;
  const plan = TIER_PLANS[tier];
  const isPaid = tier !== "free";
  const statusMeta = status ? STATUS_META[status] : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Subscription</CardTitle>
            <CardDescription>{plan.tagline}</CardDescription>
          </div>
          <TierBadge tier={tier} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl font-semibold text-foreground">
            {plan.name}
          </span>
          {statusMeta ? (
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          ) : null}
          {cancelAtPeriodEnd ? (
            <Badge variant="warning">Cancels at period end</Badge>
          ) : null}
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          {isPaid ? (
            <div className="flex items-start gap-2.5">
              <CreditCard className="mt-0.5 size-4 shrink-0 text-muted" />
              <div>
                <dt className="text-xs text-muted-foreground">Plan price</dt>
                <dd className="text-sm text-foreground">
                  ${plan.priceMonthly} / month
                </dd>
              </div>
            </div>
          ) : null}

          {currentPeriodEnd ? (
            <div className="flex items-start gap-2.5">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted" />
              <div>
                <dt className="text-xs text-muted-foreground">
                  {cancelAtPeriodEnd ? "Access until" : "Renews on"}
                </dt>
                <dd className="text-sm text-foreground">
                  {formatDate(currentPeriodEnd)}
                </dd>
              </div>
            </div>
          ) : null}

          {tier === "premium" && seats > 1 ? (
            <div className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-muted" />
              <div>
                <dt className="text-xs text-muted-foreground">Team seats</dt>
                <dd className="text-sm text-foreground">{seats} seats</dd>
              </div>
            </div>
          ) : null}
        </dl>
      </CardContent>

      <CardFooter className={cn("gap-2", isPaid ? "justify-between" : "justify-end")}>
        {isPaid ? (
          manageAction ?? null
        ) : (
          <p className="text-sm text-muted">
            You&apos;re on the free plan.
          </p>
        )}
        {tier !== "premium" ? (
          <Button variant={isPaid ? "outline" : "primary"} asChild>
            <Link href="/pricing">
              {isPaid ? "Change plan" : "Upgrade"}
            </Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
