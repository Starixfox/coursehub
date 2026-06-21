import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/security/audit";
import { isStripeConfigured } from "@/lib/env.server";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const ip = clientIp(req);
  const limited = rateLimit(`stripe:portal:${user.id}:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  // Mock mode — no Stripe keys.
  if (!isStripeConfigured) {
    return NextResponse.json({
      mock: true,
      message: "Add Stripe keys to manage billing",
    });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerId = data?.stripe_customer_id ?? null;
  if (!customerId) {
    return NextResponse.json(
      { error: "No billing account found. Subscribe to a plan first." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const site = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${site}/account`,
  });

  await logAudit({
    actorId: user.id,
    action: "subscription.portal_opened",
    targetType: "stripe_customer",
    targetId: customerId,
    ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ url: session.url });
}
