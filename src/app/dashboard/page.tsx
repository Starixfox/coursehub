import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { CourseCard } from "@/components/catalog/course-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getCurrentTier } from "@/lib/auth/session";
import { listPublishedCourses, type Course } from "@/lib/courses";
import { TIER_PLANS } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

interface EnrollmentCard {
  course: Course;
  percent: number;
  lastAccessedAt: string;
}

async function getEnrollments(): Promise<EnrollmentCard[]> {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, last_accessed_at, courses(*)")
    .order("last_accessed_at", { ascending: false });

  if (!enrollments || enrollments.length === 0) return [];

  const results = await Promise.all(
    enrollments.map(async (row) => {
      const course = row.courses as unknown as Course | null;
      if (!course) return null;

      const { data: progress } = await supabase.rpc("my_course_progress", {
        p_course_id: course.id,
      });
      const percent = progress?.[0]?.percent ?? 0;

      return {
        course,
        percent,
        lastAccessedAt: row.last_accessed_at,
      } satisfies EnrollmentCard;
    }),
  );

  return results.filter((r): r is EnrollmentCard => r !== null);
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [tier, enrollments] = await Promise.all([
    getCurrentTier(),
    getEnrollments(),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.course.id));
  const catalog = await listPublishedCourses();
  const recommendations = catalog
    .filter((c) => !enrolledIds.has(c.id))
    .slice(0, 3);

  const greetingName =
    user.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-12">
      <PageHeader
        title={`Welcome back, ${greetingName}`}
        description="Pick up where you left off, or explore something new."
        actions={
          <div className="flex items-center gap-3">
            <TierBadge tier={tier} />
            {tier !== "premium" ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/pricing">
                  <Sparkles className="size-3.5" />
                  Upgrade
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {tier === "free" ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                You&apos;re on the Free plan.
              </p>
              <p className="text-sm text-muted">
                Upgrade to {TIER_PLANS.pro.name} for full access to the catalog
                and 1080p video.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/pricing">
                View plans
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-accent" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Continue learning
          </h2>
        </div>

        {enrollments.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map(({ course, percent }) => (
              <CourseCard
                key={course.id}
                course={course}
                progressPercent={percent}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-accent">
                <Compass className="size-6" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  You haven&apos;t started a course yet.
                </p>
                <p className="text-sm text-muted">
                  Browse the catalog and enroll to see your progress here.
                </p>
              </div>
              <Button asChild>
                <Link href="/catalog">Explore the catalog</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {recommendations.length > 0 ? (
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Compass className="size-5 text-accent" />
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Recommended for you
              </h2>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-primary-hover"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
