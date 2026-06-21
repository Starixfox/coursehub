import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Reset password · CourseHub" };

export default function ResetPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted">
          Enter your email and we'll send you a link to set a new password.
        </p>
      </div>

      <AuthForm mode="reset" />

      <p className="text-center text-sm text-muted">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
