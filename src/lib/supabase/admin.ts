import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "./types";

/**
 * Service-role client — BYPASSES Row-Level Security. Never import this into a
 * client component (the `server-only` guard makes that a build error). Use it
 * only in route handlers / server actions for trusted operations the user
 * cannot perform themselves: Stripe webhook sync, admin tooling, signed media.
 *
 * Throws a clear, actionable error (not a stack trace) if the key is missing so
 * the app can boot in demo mode without service-role features.
 */
export function createAdminClient() {
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Copy it from Supabase Dashboard " +
        "> Project Settings > API into .env.local to enable service-role " +
        "features (Stripe webhook sync, admin user management).",
    );
  }
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
