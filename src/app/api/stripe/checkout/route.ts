import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema } from "@/lib/validation/schemas";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/security/audit";
import { isStripeConfigured } from "@/lib/env.server";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { priceId } from "@/lib/stripe/config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // In an API context we resolve the user directly and return 401 (rather than
  // requireUser's redirect, which is meant for page navigations).
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const ip = clientIp(req);
  const limited = rateLimit(`stripe:checkout:${user.id}:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a moment." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { tier, interval } = parsed.data;

  // Mock mode — no Stripe keys. Tell the client to show a friendly note.
  if (!isStripeConfigured) {
    return NextResponse.json({
      mock: true,
      message: "Add Stripe keys to enable checkout",
    });
  }

  const price = priceId(tier, interval);
  if (!price) {
    return NextResponse.json(
      { error: `No Stripe price configured for ${tier} (${interval}).` },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const admin = createAdminClient();

  // Reuse the user's existing Stripe customer if we have one, else create and
  // store it (via the service-role client — the user cannot write this).
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;

    await admin
      .from("subscriptions")
      .upsert(
        { user_id: user.id, stripe_customer_id: customerId },
        { onConflict: "user_id" },
      );
  }

  const site = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${site}/dashboard?checkout=success`,
    cancel_url: `${site}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
    metadata: { user_id: user.id, tier },
    subscription_data: { metadata: { user_id: user.id, tier } },
  });

  await logAudit({
    actorId: user.id,
    action: "subscription.checkout_started",
    targetType: "stripe_customer",
    targetId: customerId,
    metadata: { tier, interval },
    ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: session.url });
}
