import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert } from "@/components/ui/alert";

export const metadata = { title: "Log in · CourseHub" };

const ERROR_COPY: Record<string, string> = {
  link_invalid: "That sign-in link is invalid or has expired. Please try again.",
  auth_failed: "We couldn't complete sign-in. Please try again.",
};

function safeNext(next: string | undefined): string | undefined {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return undefined;
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);
  const errorMessage = error ? ERROR_COPY[error] : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted">Sign in to continue learning.</p>
      </div>

      {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}

      <OAuthButtons next={next ?? "/dashboard"} />

      <div className="relative py-1 text-center">
        <span className="relative z-10 bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
          or with email
        </span>
        <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
      </div>

      <AuthForm mode="login" next={next} />

      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-accent hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
