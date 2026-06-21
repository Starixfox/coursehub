"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface OAuthButtonsProps {
  /** Same-origin path to return to after the OAuth round-trip. */
  next?: string;
  className?: string;
}

/** Google's "G" mark (inline so we don't depend on an asset pipeline). */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-4", className)}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.57.38-2.29V6.62H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l3.99-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

export function OAuthButtons({ next = "/dashboard", className }: OAuthButtonsProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthError) {
      setLoading(false);
      setError(
        "Google sign-in isn't available right now. Try email instead.",
      );
    }
    // On success the browser is redirected to Google; nothing more to do here.
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={handleGoogle}
        disabled={loading}
      >
        <GoogleIcon />
        {loading ? "Redirecting…" : "Continue with Google"}
      </Button>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3 shrink-0" aria-hidden="true" />
          <span title="Add Google as an OAuth provider in your Supabase project's Auth settings.">
            Requires Google to be configured in Supabase Auth.
          </span>
        </p>
      )}
    </div>
  );
}
