import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ProfileForm } from "@/components/account/profile-form";
import {
  SubscriptionCard,
  type SubscriptionDetails,
} from "@/components/account/subscription-card";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { MfaSetup } from "@/components/auth/mfa-setup";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getProfile, isEmailVerified } from "@/lib/auth/session";
import type { Tier } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

async function getSubscription(): Promise<SubscriptionDetails> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "tier, status, current_period_end, cancel_at_period_end, seats",
    )
    .maybeSingle();

  if (!data) {
    return {
      tier: "free",
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      seats: 1,
    };
  }

  return {
    tier: data.tier as Tier,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    seats: data.seats ?? 1,
  };
}

export default async function AccountPage() {
  const user = await requireUser();
  const [profile, subscription] = await Promise.all([
    getProfile(),
    getSubscription(),
  ]);

  const emailVerified = isEmailVerified(user);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Account"
        description="Manage your profile, subscription and security settings."
      />

      {!emailVerified ? (
        <Alert variant="warning">
          Your email isn&apos;t verified yet. Some features stay locked until
          you confirm your address from the link we sent you.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This is how you appear across CourseHub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialFullName={profile?.full_name ?? ""}
              initialAvatarUrl={profile?.avatar_url ?? ""}
              email={profile?.email ?? user.email ?? null}
            />
          </CardContent>
        </Card>

        <SubscriptionCard
          subscription={subscription}
          manageAction={<ManageSubscriptionButton />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-accent" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Add a second factor to protect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MfaSetup />
        </CardContent>
      </Card>
    </div>
  );
}
