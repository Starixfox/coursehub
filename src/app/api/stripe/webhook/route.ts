import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/security/audit";
import { isStripeConfigured, serverEnv } from "@/lib/env.server";
import { getStripe } from "@/lib/stripe/client";
import { syncSubscriptionFromStripe } from "@/lib/stripe/sync";

// Webhook signature verification needs the Node runtime + the raw request body.
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isStripeConfigured) {
    // Nothing to verify against — billing is in mock mode.
    return NextResponse.json({ received: true, mock: true });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const stripe = getStripe();
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      serverEnv.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency: record the event id before processing. If the insert conflicts,
  // we've already handled this event — acknowledge and skip.
  const { error: insertError } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type, payload: event as never });

  if (insertError) {
    // Unique-violation (already processed) — treat as success so Stripe stops retrying.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Prefer the full subscription so we capture price/period/status.
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscriptionFromStripe(sub);
        } else {
          await syncSubscriptionFromStripe(session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(sub);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Stripe v22 moved the subscription ref under
        // invoice.parent.subscription_details.subscription; fall back to the
        // legacy top-level field for older API versions.
        const nested = invoice.parent?.subscription_details?.subscription;
        const legacy = (invoice as unknown as { subscription?: string | { id: string } })
          .subscription;
        const subRef = nested ?? legacy ?? null;
        const subId =
          typeof subRef === "string" ? subRef : subRef?.id ?? null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscriptionFromStripe(sub);
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe doesn't retry them.
        break;
    }
  } catch (err) {
    // Processing failed after we recorded the event id. Remove the record so
    // Stripe's retry can reprocess it, and surface a 500.
    await admin.from("stripe_events").delete().eq("id", event.id);
    await logAudit({
      action: "subscription.webhook_error",
      targetType: "stripe_event",
      targetId: event.id,
      metadata: {
        type: event.type,
        error: err instanceof Error ? err.message : String(err),
      },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
