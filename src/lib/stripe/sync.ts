import "server-only";

import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/security/audit";
import { tierForPrice, mapStripeStatus } from "@/lib/stripe/config";
import type { Tier } from "@/lib/entitlements";
import type { Enums, TablesInsert } from "@/lib/supabase/types";

type SubStatus = Enums<"subscription_status">;
type BillingInterval = Enums<"billing_interval">;

/** A Stripe Checkout Session or Subscription — the two shapes the webhook hands us. */
type SyncSource = Stripe.Subscription | Stripe.Checkout.Session;

function isSession(src: SyncSource): src is Stripe.Checkout.Session {
  return src.object === "checkout.session";
}

function resolveId(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

/** Pull the metadata we stamped at checkout (user_id, tier) off either shape. */
function readMetadata(src: SyncSource): { userId: string | null; tier: Tier | null } {
  const meta = src.metadata ?? {};
  const userId = (meta.user_id as string | undefined) ?? null;
  const rawTier = (meta.tier as string | undefined) ?? null;
  const tier =
    rawTier === "basic" || rawTier === "pro" || rawTier === "premium" || rawTier === "free"
      ? (rawTier as Tier)
      : null;
  return { userId, tier };
}

/** Derive the first Price id on a subscription, used to map back to a tier/interval. */
function firstPrice(sub: Stripe.Subscription): Stripe.Price | null {
  return sub.items?.data?.[0]?.price ?? null;
}

/** Stripe v22 moved current_period_end onto the item; fall back across both shapes. */
function periodEndIso(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined;
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  const epoch = item?.current_period_end ?? top;
  return typeof epoch === "number" ? new Date(epoch * 1000).toISOString() : null;
}

function intervalFromPrice(price: Stripe.Price | null): BillingInterval | null {
  const i = price?.recurring?.interval;
  if (i === "month") return "month";
  if (i === "year") return "year";
  return null;
}

/**
 * Reconcile our `subscriptions` row from Stripe. Source of truth flows
 * one-way: Stripe -> DB. Called only by the webhook (service role); never trusts
 * the client. Resolves the owning user from checkout metadata or by matching
 * the stored stripe_customer_id, derives tier/status/period, and upserts.
 */
export async function syncSubscriptionFromStripe(src: SyncSource): Promise<void> {
  const admin = createAdminClient();

  const customerId = resolveId(src.customer);
  const { userId: metaUserId, tier: metaTier } = readMetadata(src);

  // Resolve the owning user: prefer explicit metadata, else match by customer id.
  let userId = metaUserId;
  if (!userId && customerId) {
    const { data } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = data?.user_id ?? null;
  }

  if (!userId) {
    // Nothing we can safely attribute this to — log and bail rather than guess.
    await logAudit({
      action: "subscription.sync_skipped",
      targetType: "stripe",
      targetId: src.id,
      metadata: { reason: "unresolved_user", customer_id: customerId },
    });
    return;
  }

  // A bare checkout.session.completed with no embedded subscription: persist
  // what we know (customer link + intended tier) so later sub events match it.
  if (isSession(src)) {
    const subId = resolveId(src.subscription);
    const row: TablesInsert<"subscriptions"> = {
      user_id: userId,
      tier: (metaTier && metaTier !== "free" ? metaTier : "free") as Tier,
      status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subId,
    };
    await admin.from("subscriptions").upsert(row, { onConflict: "user_id" });
    await logAudit({
      actorId: userId,
      action: "subscription.synced",
      targetType: "subscription",
      targetId: subId ?? src.id,
      metadata: { source: "checkout.session", tier: row.tier },
    });
    return;
  }

  // Full subscription object.
  const sub = src;
  const price = firstPrice(sub);
  const priceTier = price?.id ? tierForPrice(price.id) : null;
  const tier: Tier = priceTier ?? metaTier ?? "free";
  const status: SubStatus = mapStripeStatus(sub.status);

  const row: TablesInsert<"subscriptions"> = {
    user_id: userId,
    tier,
    status,
    billing_interval: intervalFromPrice(price),
    current_period_end: periodEndIso(sub),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
  };

  await admin.from("subscriptions").upsert(row, { onConflict: "user_id" });

  await logAudit({
    actorId: userId,
    action: "subscription.synced",
    targetType: "subscription",
    targetId: sub.id,
    metadata: { tier, status, cancel_at_period_end: row.cancel_at_period_end },
  });
}
