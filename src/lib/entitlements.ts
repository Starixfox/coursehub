import type { Enums } from "@/lib/supabase/types";

/** Subscription tiers, lowest to highest. Mirrors `private.tier_rank` in SQL. */
export type Tier = Enums<"subscription_tier">;
export const TIER_ORDER: readonly Tier[] = ["free", "basic", "pro", "premium"] as const;

export function tierRank(t: Tier): number {
  return TIER_ORDER.indexOf(t);
}

/** Client/server-shared mirror of the DB `has_tier_access`. The DB remains the
 *  source of truth (RLS) — this is only for UI gating and labels. */
export function hasTierAccess(current: Tier, required: Tier): boolean {
  return tierRank(current) >= tierRank(required);
}

export interface TierPlan {
  tier: Tier;
  name: string;
  tagline: string;
  /** Display price in USD; the real charge comes from the Stripe Price. */
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  highlighted?: boolean;
  /** Maximum video quality marketed for this tier. */
  maxQuality: "480p" | "720p" | "1080p" | "4K";
}

export const TIER_PLANS: Record<Tier, TierPlan> = {
  free: {
    tier: "free",
    name: "Free",
    tagline: "Preview the platform",
    priceMonthly: 0,
    priceYearly: 0,
    maxQuality: "480p",
    features: [
      "Browse the full catalog",
      "Watch preview lessons",
      "Track your progress",
    ],
  },
  basic: {
    tier: "basic",
    name: "Basic",
    tagline: "A focused learning path",
    priceMonthly: 12,
    priceYearly: 120,
    maxQuality: "720p",
    features: [
      "Everything in Free",
      "Full access to Basic-tier courses",
      "Standard 720p video",
      "Progress tracking & resume",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    tagline: "The whole catalog",
    priceMonthly: 29,
    priceYearly: 290,
    highlighted: true,
    maxQuality: "1080p",
    features: [
      "Everything in Basic",
      "Full catalog (Basic + Pro courses)",
      "1080p video",
      "Downloadable resources",
    ],
  },
  premium: {
    tier: "premium",
    name: "Premium",
    tagline: "For teams & power learners",
    priceMonthly: 59,
    priceYearly: 590,
    maxQuality: "4K",
    features: [
      "Everything in Pro",
      "Early access to new courses",
      "Completion certificates",
      "Up to 5 team seats",
      "4K video",
    ],
  },
};

export const PAID_TIERS: Tier[] = ["basic", "pro", "premium"];

export function tierLabel(t: Tier): string {
  return TIER_PLANS[t].name;
}
