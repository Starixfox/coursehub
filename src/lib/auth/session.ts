import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables, Enums } from "@/lib/supabase/types";
import type { Tier } from "@/lib/entitlements";

export type Profile = Tables<"profiles">;
export type Role = Enums<"user_role">;

/** Current authenticated user (verified against the Auth server), or null. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Current user's profile row (role, name, avatar), or null. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
});

/** Current effective tier, resolved server-side via the `my_current_tier` RPC. */
export const getCurrentTier = cache(async (): Promise<Tier> => {
  const user = await getUser();
  if (!user) return "free";
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_current_tier");
  return (data as Tier | null) ?? "free";
});

/** Redirect to /login unless authenticated. Returns the user. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirect unless the user has one of `roles`. Returns the profile. */
export async function requireRole(roles: Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!roles.includes(profile.role)) redirect("/dashboard");
  return profile;
}

export function isEmailVerified(user: { email_confirmed_at?: string | null } | null) {
  return Boolean(user?.email_confirmed_at);
}
