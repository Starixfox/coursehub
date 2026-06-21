import { redirect } from "next/navigation";
import { MailCheck, LogOut } from "lucide-react";
import { getUser } from "@/lib/auth/session";
import { signOut } from "@/app/(auth)/actions";
import { SiteShell } from "@/components/site/site-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";

export const metadata = { title: "Verify your email · CourseHub" };

export default async function VerifyEmailPage() {
  const user = await getUser();

  // Not signed in → there's nothing to verify here.
  if (!user) redirect("/login");
  // Already verified → straight to the app.
  if (user.email_confirmed_at) redirect("/dashboard");

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg py-6">
        <Card>
          <CardHeader className="items-center text-center">
            <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/15 text-accent">
              <MailCheck className="size-6" aria-hidden="true" />
            </span>
            <CardTitle>Check your inbox</CardTitle>
            <p className="text-sm text-muted">
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{user.email}</span>.
              Click it to activate your account and unlock your courses.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Didn't get it? Check your spam folder, or resend the email below.
              Links expire after a short while for your security.
            </p>

            <ResendVerificationButton />

            <div className="border-t border-border pt-4">
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteShell>
  );
}
