import type { Metadata } from "next";
import { SiteShell } from "@/components/site/site-shell";
import { PageHeader } from "@/components/site/page-header";
import { PricingTable } from "@/components/billing/pricing-table";
import { getCurrentTier } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Pick the plan that fits how you learn. Upgrade, downgrade, or cancel anytime.",
};

export default async function PricingPage() {
  const currentTier = await getCurrentTier();

  return (
    <SiteShell>
      <PageHeader
        title="Plans & pricing"
        description="Pick the plan that fits how you learn. Upgrade, downgrade, or cancel anytime — billing is handled securely by Stripe."
      />
      <PricingTable currentTier={currentTier} />
    </SiteShell>
  );
}
