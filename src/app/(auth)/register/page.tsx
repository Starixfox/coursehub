import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata = { title: "Create account · CourseHub" };

function safeNext(next: string | undefined): string | undefined {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return undefined;
  return next;
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeNext(rawNext);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted">
          Start with a free plan — upgrade any time.
        </p>
      </div>

      <OAuthButtons next={next ?? "/dashboard"} />

      <div className="relative py-1 text-center">
        <span className="relative z-10 bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
          or with email
        </span>
        <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
      </div>

      <AuthForm mode="register" next={next} />

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
