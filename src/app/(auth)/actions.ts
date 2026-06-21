"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import {
  loginSchema,
  registerSchema,
  resetRequestSchema,
  updatePasswordSchema,
} from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/security/audit";

/**
 * Shared shape returned by every auth action. The client form renders
 * `error` as a banner and `fieldErrors` inline. Actions that succeed by
 * redirecting never return — a returned object always means "stay & show".
 */
export interface AuthActionState {
  error?: string;
  /** Non-error confirmation (e.g. "check your inbox"). */
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/** Best-effort caller IP from proxy headers (we are in a Server Action). */
async function callerIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

async function callerUserAgent(): Promise<string> {
  const h = await headers();
  return h.get("user-agent") ?? "unknown";
}

/** Only allow same-origin relative redirects to avoid open-redirect abuse. */
function safeNext(next: unknown): string {
  if (typeof next !== "string") return "/dashboard";
  // Must be a path on our own site: starts with a single "/", not "//" or a scheme.
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

function firstField(
  flattened: Record<string, string[] | undefined>,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flattened)) {
    if (v && v.length) out[k] = v;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Sign in (email + password)
// ---------------------------------------------------------------------------

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const next = safeNext(formData.get("next"));
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: firstField(parsed.error.flatten().fieldErrors) };
  }
  const { email, password } = parsed.data;

  const ip = await callerIp();
  // Rate-limit by IP and by email so neither a single host nor a single
  // account can be brute-forced.
  const byIp = rateLimit(`signin:ip:${ip}`, { limit: 10, windowMs: 60_000 });
  const byEmail = rateLimit(`signin:email:${email.toLowerCase()}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!byIp.success || !byEmail.success) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    await logAudit({
      action: "auth.login.failed",
      targetType: "auth",
      metadata: { email },
      ip,
      userAgent: await callerUserAgent(),
    });
    // Never leak whether the email exists or which half was wrong.
    return { error: "Invalid email or password." };
  }

  await logAudit({
    actorId: data.user?.id,
    action: "auth.login",
    targetType: "auth",
    targetId: data.user?.id,
    ip,
    userAgent: await callerUserAgent(),
  });

  redirect(next);
}

// ---------------------------------------------------------------------------
// Sign up (email + password + name)
// ---------------------------------------------------------------------------

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const next = safeNext(formData.get("next"));
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return { fieldErrors: firstField(parsed.error.flatten().fieldErrors) };
  }
  const { email, password, fullName } = parsed.data;

  const ip = await callerIp();
  const byIp = rateLimit(`signup:ip:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!byIp.success) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    await logAudit({
      action: "auth.signup.failed",
      targetType: "auth",
      metadata: { email, reason: error.message },
      ip,
      userAgent: await callerUserAgent(),
    });
    // Do not reveal whether the email is already registered. Show a generic,
    // friendly message; the user can fall back to password reset.
    if (
      error.message.toLowerCase().includes("already") ||
      error.status === 422
    ) {
      return {
        message:
          "Check your inbox to confirm your email. If you already have an account, sign in instead.",
      };
    }
    return { error: "We couldn't create your account. Please try again." };
  }

  await logAudit({
    actorId: data.user?.id,
    action: "auth.signup",
    targetType: "auth",
    targetId: data.user?.id,
    metadata: { email },
    ip,
    userAgent: await callerUserAgent(),
  });

  redirect("/verify-email");
}

// ---------------------------------------------------------------------------
// Magic link (passwordless OTP)
// ---------------------------------------------------------------------------

export async function signInWithMagicLink(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const next = safeNext(formData.get("next"));
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: firstField(parsed.error.flatten().fieldErrors) };
  }
  const { email } = parsed.data;

  const ip = await callerIp();
  const byIp = rateLimit(`magic:ip:${ip}`, { limit: 5, windowMs: 60_000 });
  const byEmail = rateLimit(`magic:email:${email.toLowerCase()}`, {
    limit: 3,
    windowMs: 60_000,
  });
  if (!byIp.success || !byEmail.success) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const supabase = await createClient();
  await supabase.auth.signInWithOtp({
    email,
    options: {
      // Do not auto-create accounts via magic link; sign-up is explicit.
      shouldCreateUser: false,
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  // Always succeed silently — never reveal whether the email exists.
  return {
    message: "If that email is registered, a sign-in link is on its way.",
  };
}

// ---------------------------------------------------------------------------
// Password reset request
// ---------------------------------------------------------------------------

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: firstField(parsed.error.flatten().fieldErrors) };
  }
  const { email } = parsed.data;

  const ip = await callerIp();
  const byIp = rateLimit(`reset:ip:${ip}`, { limit: 5, windowMs: 60_000 });
  const byEmail = rateLimit(`reset:email:${email.toLowerCase()}`, {
    limit: 3,
    windowMs: 60_000,
  });
  if (!byIp.success || !byEmail.success) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent("/reset/update")}`,
  });

  await logAudit({
    action: "auth.password_reset.requested",
    targetType: "auth",
    metadata: { email },
    ip,
    userAgent: await callerUserAgent(),
  });

  // Always the same response, whether or not the email exists.
  return {
    message:
      "If that email is registered, you'll receive a reset link shortly.",
  };
}

// ---------------------------------------------------------------------------
// Update password (after clicking the reset link → session established)
// ---------------------------------------------------------------------------

export async function updatePassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: firstField(parsed.error.flatten().fieldErrors) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // The reset link is missing/expired; no recovery session in place.
    return {
      error: "Your reset link is invalid or has expired. Request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: "We couldn't update your password. Please try again." };
  }

  await logAudit({
    actorId: user.id,
    action: "auth.password_reset.completed",
    targetType: "auth",
    targetId: user.id,
    ip: await callerIp(),
    userAgent: await callerUserAgent(),
  });

  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Resend verification email
// ---------------------------------------------------------------------------

export async function resendVerification(): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "You're not signed in. Please log in again." };
  }
  if (user.email_confirmed_at) {
    return { message: "Your email is already verified." };
  }

  const ip = await callerIp();
  const byEmail = rateLimit(`resend:email:${user.email.toLowerCase()}`, {
    limit: 3,
    windowMs: 60_000,
  });
  if (!byEmail.success) {
    return {
      error: "You've requested this a few times. Please wait a minute.",
    };
  }

  await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  return { message: "Verification email sent. Check your inbox." };
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  if (user) {
    await logAudit({
      actorId: user.id,
      action: "auth.logout",
      targetType: "auth",
      targetId: user.id,
      ip: await callerIp(),
      userAgent: await callerUserAgent(),
    });
  }
  redirect("/login");
}
