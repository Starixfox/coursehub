"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";
import { profileUpdateSchema } from "@/lib/validation/schemas";

export interface ProfileUpdateInput {
  fullName: string;
  avatarUrl?: string;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Update the current user's profile (name + avatar). RLS restricts the write
 * to the caller's own row. Validated with `profileUpdateSchema`.
 */
export async function updateProfile(
  input: ProfileUpdateInput,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { fullName, avatarUrl } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      avatar_url: avatarUrl ? avatarUrl : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/account");
  return { ok: true };
}
