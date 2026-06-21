import "server-only";
import { z } from "zod";

/**
 * Server-only environment. Importing this from a client component is a build
 * error (via `server-only`). Secrets here NEVER reach the browser bundle.
 *
 * Optional fields let the app boot in "demo/mock" mode without external keys;
 * the features that need them fail with a clear, actionable message instead of
 * leaking a stack trace.
 */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Stripe (test mode). Absent => billing runs in mock mode.
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_BASIC_MONTHLY: z.string().optional(),
  STRIPE_PRICE_BASIC_YEARLY: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_YEARLY: z.string().optional(),
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PREMIUM_YEARLY: z.string().optional(),

  // Cloudflare Stream. Absent => media runs in mock mode (sample HLS).
  MEDIA_PROVIDER: z.enum(["cloudflare", "mock"]).default("mock"),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_STREAM_API_TOKEN: z.string().optional(),
  CLOUDFLARE_STREAM_KEY_ID: z.string().optional(),
  CLOUDFLARE_STREAM_JWK: z.string().optional(),

  // Optional distributed rate limiter (falls back to in-memory).
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// Treat empty-string env vars (e.g. `SUPABASE_SERVICE_ROLE_KEY=`) as unset so
// optional fields validate and read as "not configured".
const rawEnv = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, v === "" ? undefined : v]),
);
const parsed = serverSchema.safeParse(rawEnv);
if (!parsed.success) {
  throw new Error(
    "Invalid server environment variables:\n" +
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
}

export const serverEnv = parsed.data;

export const isStripeConfigured = Boolean(
  serverEnv.STRIPE_SECRET_KEY && serverEnv.STRIPE_WEBHOOK_SECRET,
);
export const isServiceRoleConfigured = Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY);
export const isCloudflareConfigured =
  serverEnv.MEDIA_PROVIDER === "cloudflare" &&
  Boolean(serverEnv.CLOUDFLARE_ACCOUNT_ID && serverEnv.CLOUDFLARE_STREAM_API_TOKEN);
