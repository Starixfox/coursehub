import {
  Users,
  CreditCard,
  DollarSign,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { TIER_PLANS, type Tier } from "@/lib/entitlements";
import { PageHeader } from "@/components/site/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TierBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["active", "trialing"] as const;

function formatMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export default async function AdminOverviewPage() {
  await requireRole(["admin"]);
  const db = createAdminClient();

  const [
    activeSubsRes,
    totalUsersRes,
    publishedCoursesRes,
    enrollmentsRes,
    coursesRes,
  ] = await Promise.all([
    // Active subscriptions: tier + interval feed both the count and MRR.
    db
      .from("subscriptions")
      .select("tier, billing_interval", { count: "exact" })
      .in("status", [...ACTIVE_STATUSES]),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    db.from("enrollments").select("course_id"),
    db.from("courses").select("id, title, slug, required_tier, status"),
  ]);

  const activeSubs = activeSubsRes.data ?? [];
  const activeSubsCount = activeSubsRes.count ?? activeSubs.length;
  const totalUsers = totalUsersRes.count ?? 0;
  const publishedCourses = publishedCoursesRes.count ?? 0;

  // Estimated MRR: monthly-equivalent of each active sub's tier price.
  const estimatedMrr = activeSubs.reduce((sum, s) => {
    const plan = TIER_PLANS[s.tier as Tier];
    if (!plan) return sum;
    const monthly =
      s.billing_interval === "year" ? plan.priceYearly / 12 : plan.priceMonthly;
    return sum + monthly;
  }, 0);

  // Popular courses by enrollment count.
  const enrollCounts = new Map<string, number>();
  for (const row of enrollmentsRes.data ?? []) {
    enrollCounts.set(row.course_id, (enrollCounts.get(row.course_id) ?? 0) + 1);
  }
  const courses = coursesRes.data ?? [];
  const popular = courses
    .map((c) => ({ ...c, enrollments: enrollCounts.get(c.id) ?? 0 }))
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader
        title="Admin overview"
        description="Platform health at a glance — subscriptions, revenue, and reach."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active subscriptions"
          value={formatCount(activeSubsCount)}
          icon={CreditCard}
          hint="Active + trialing"
        />
        <StatCard
          label="Estimated MRR"
          value={formatMoney(estimatedMrr)}
          icon={DollarSign}
          hint="Monthly-equivalent of active plans"
        />
        <StatCard
          label="Total users"
          value={formatCount(totalUsers)}
          icon={Users}
        />
        <StatCard
          label="Published courses"
          value={formatCount(publishedCourses)}
          icon={BookOpen}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-accent" />
            Popular courses
          </CardTitle>
          <CardDescription>Top courses by enrollment.</CardDescription>
        </CardHeader>
        <CardContent>
          {popular.length === 0 ? (
            <p className="text-sm text-muted">No enrollments yet.</p>
          ) : (
            <ol className="divide-y divide-border">
              {popular.map((c, i) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-5 shrink-0 text-sm tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {c.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <TierBadge tier={c.required_tier as Tier} />
                        {c.status !== "published" ? (
                          <span className="text-xs capitalize text-muted-foreground">
                            {c.status}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-muted">
                    {formatCount(c.enrollments)}{" "}
                    {c.enrollments === 1 ? "learner" : "learners"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
