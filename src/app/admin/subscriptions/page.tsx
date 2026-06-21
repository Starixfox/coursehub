import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { Tier } from "@/lib/entitlements";
import { PageHeader } from "@/components/site/page-header";
import { Badge, TierBadge } from "@/components/ui/badge";
import {
  DataTable,
  DataTableRow,
  DataTableCell,
} from "@/components/admin/data-table";

export const dynamic = "force-dynamic";

function statusVariant(status: string) {
  switch (status) {
    case "active":
    case "trialing":
      return "success" as const;
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "warning" as const;
    case "canceled":
    case "incomplete_expired":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

export default async function AdminSubscriptionsPage() {
  await requireRole(["admin"]);
  const db = createAdminClient();

  const { data: subs } = await db
    .from("subscriptions")
    .select(
      "id, user_id, tier, status, current_period_end, cancel_at_period_end, billing_interval",
    )
    .order("created_at", { ascending: false });

  const rows = subs ?? [];
  const userIds = [...new Set(rows.map((s) => s.user_id))];
  const emailById = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await db
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    for (const p of profiles ?? []) emailById.set(p.id, p.email);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader
        title="Subscriptions"
        description="Billing state across all accounts."
      />
      <div className="mt-6">
        <DataTable
          columns={[
            { key: "user", label: "User" },
            { key: "tier", label: "Tier" },
            { key: "status", label: "Status" },
            { key: "period", label: "Period end" },
            { key: "renewal", label: "Renewal" },
          ]}
          empty="No subscriptions yet."
        >
          {rows.map((s) => (
            <DataTableRow key={s.id}>
              <DataTableCell className="font-medium text-foreground">
                {emailById.get(s.user_id) ?? "—"}
              </DataTableCell>
              <DataTableCell>
                <TierBadge tier={s.tier as Tier} />
              </DataTableCell>
              <DataTableCell>
                <Badge variant={statusVariant(s.status)} className="capitalize">
                  {s.status.replace(/_/g, " ")}
                </Badge>
              </DataTableCell>
              <DataTableCell className="text-muted">
                {formatDate(s.current_period_end)}
              </DataTableCell>
              <DataTableCell>
                {s.cancel_at_period_end ? (
                  <Badge variant="warning">Cancels at period end</Badge>
                ) : (
                  <span className="text-sm text-muted">
                    Renews
                    {s.billing_interval ? ` ${s.billing_interval}ly` : ""}
                  </span>
                )}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
