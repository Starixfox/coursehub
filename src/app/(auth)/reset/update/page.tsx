import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Set a new password · CourseHub" };

/**
 * Reached after the user clicks the reset link → /auth/callback exchanges the
 * code → a recovery session is in place. The update action verifies that
 * session before changing the password.
 */
export default function ResetUpdatePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Choose a new password
        </h1>
        <p className="text-sm text-muted">
          Pick something strong you haven't used here before.
        </p>
      </div>

      <AuthForm mode="update" />
    </div>
  );
}
