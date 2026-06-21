import "server-only";

import Stripe from "stripe";
import { serverEnv } from "@/lib/env.server";

let cached: Stripe | null = null;

/** Lazily-constructed Stripe client. Throws a clear error in mock mode. */
export function getStripe(): Stripe {
  if (!serverEnv.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — billing runs in mock mode. Add your " +
        "Stripe test keys to .env.local to enable Checkout and webhooks.",
    );
  }
  if (!cached) {
    cached = new Stripe(serverEnv.STRIPE_SECRET_KEY, { typescript: true });
  }
  return cached;
}
