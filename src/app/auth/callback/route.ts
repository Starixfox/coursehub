import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Same-origin relative redirect only — prevents open-redirect abuse. */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

/**
 * OAuth / magic-link / email-confirmation callback. Exchanges the `?code`
 * for a session cookie, then redirects to `?next` (or /dashboard).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const authError = url.searchParams.get("error_description");

  // Supabase appends error_description when a link is expired/invalid.
  if (authError) {
    const redirectUrl = new URL("/login", url.origin);
    redirectUrl.searchParams.set("error", "link_invalid");
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // No code, or the exchange failed.
  const redirectUrl = new URL("/login", url.origin);
  redirectUrl.searchParams.set("error", "auth_failed");
  return NextResponse.redirect(redirectUrl);
}
