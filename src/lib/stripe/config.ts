import "server-only";

import { serverEnv } from "@/lib/env.server";
import type { Tier } from "@/lib/entitlements";

export type PaidTier = "basic" | "pro" | "premium";
export type Interval = "month" | "year";

/** Stripe Price id for a (tier, interval), from env. */
export function priceId(tier: PaidTier, interval: Interval): string | undefined {
  const map: Record<string, string | undefined> = {
    "basic:month": serverEnv.STRIPE_PRICE_BASIC_MONTHLY,
    "basic:year": serverEnv.STRIPE_PRICE_BASIC_YEARLY,
    "pro:month": serverEnv.STRIPE_PRICE_PRO_MONTHLY,
    "pro:year": serverEnv.STRIPE_PRICE_PRO_YEARLY,
    "premium:month": serverEnv.STRIPE_PRICE_PREMIUM_MONTHLY,
    "premium:year": serverEnv.STRIPE_PRICE_PREMIUM_YEARLY,
  };
  return map[`${tier}:${interval}`];
}

/** Reverse lookup used by the webhook to derive a tier from a Price id. */
export function tierForPrice(id: string): Tier | null {
  const entries: Array<[string | undefined, Tier]> = [
    [serverEnv.STRIPE_PRICE_BASIC_MONTHLY, "basic"],
    [serverEnv.STRIPE_PRICE_BASIC_YEARLY, "basic"],
    [serverEnv.STRIPE_PRICE_PRO_MONTHLY, "pro"],
    [serverEnv.STRIPE_PRICE_PRO_YEARLY, "pro"],
    [serverEnv.STRIPE_PRICE_PREMIUM_MONTHLY, "premium"],
    [serverEnv.STRIPE_PRICE_PREMIUM_YEARLY, "premium"],
  ];
  for (const [pid, tier] of entries) if (pid && pid === id) return tier;
  return null;
}

/** Map a Stripe subscription status string to our DB enum. */
export function mapStripeStatus(
  s: string,
): "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid" | "paused" {
  const allowed = [
    "trialing", "active", "past_due", "canceled", "incomplete",
    "incomplete_expired", "unpaid", "paused",
  ] as const;
  return (allowed as readonly string[]).includes(s)
    ? (s as (typeof allowed)[number])
    : "incomplete";
}
