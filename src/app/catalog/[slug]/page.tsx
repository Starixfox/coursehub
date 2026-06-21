import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BarChart2,
  Clock,
  PlayCircle,
  User,
  Lock,
  Check,
  ArrowRight,
} from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { CurriculumList } from "@/components/catalog/curriculum-list";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCourseWithCurriculum } from "@/lib/courses";
import { getCurrentTier } from "@/lib/auth/session";
import { hasTierAccess, tierLabel } from "@/lib/entitlements";
import { formatDuration } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getCourseWithCurriculum(slug);
  if (!course) return { title: "Course not found · CourseHub" };
  return {
    title: `${course.title} · CourseHub`,
    description: course.subtitle ?? course.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [course, currentTier] = await Promise.all([
    getCourseWithCurriculum(slug),
    getCurrentTier(),
  ]);

  if (!course) notFound();

  const hasAccess = hasTierAccess(currentTier, course.required_tier);

  return (
    <SiteShell>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="min-w-0">
          {/* Header */}
          <div className="border-b border-border pb-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              {course.category ? (
                <Link
                  href={`/catalog?category=${encodeURIComponent(course.category)}`}
                  className="rounded-full border border-border bg-surface/60 px-2.5 py-0.5 transition-colors hover:text-foreground"
                >
                  {course.category}
                </Link>
              ) : null}
              <TierBadge tier={course.required_tier} />
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {course.title}
            </h1>
            {course.subtitle ? (
              <p className="mt-2 max-w-2xl text-base text-muted sm:text-lg">
                {course.subtitle}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              {course.creator_name ? (
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-4" />
                  {course.creator_name}
                </span>
              ) : null}
              {course.level ? (
                <span className="inline-flex items-center gap-1.5 capitalize">
                  <BarChart2 className="size-4" />
                  {course.level}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <PlayCircle className="size-4" />
                {course.lessonCount} {course.lessonCount === 1 ? "lesson" : "lessons"}
              </span>
              {course.totalDurationSeconds > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {formatDuration(course.totalDurationSeconds)}
                </span>
              ) : null}
            </div>
          </div>

          {/* Description */}
          {course.description ? (
            <section className="py-6">
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                About this course
              </h2>
              <p className="whitespace-pre-line text-pretty text-muted">
                {course.description}
              </p>
            </section>
          ) : null}

          {/* Curriculum */}
          <section className="py-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Curriculum</h2>
            {course.modules.length > 0 ? (
              <CurriculumList
                course={course}
                currentTier={currentTier}
                hasAccess={hasAccess}
              />
            ) : (
              <p className="text-sm text-muted">
                The curriculum for this course is coming soon.
              </p>
            )}
          </section>
        </div>

        {/* Sticky CTA */}
        <aside className="lg:row-start-1 lg:row-end-2">
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardContent className="pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted">Required plan</span>
                  <TierBadge tier={course.required_tier} />
                </div>

                {hasAccess ? (
                  <>
                    <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-sm)] border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
                      <Check className="mt-0.5 size-4 shrink-0" />
                      <span>
                        Included in your{" "}
                        <span className="font-medium">{tierLabel(currentTier)}</span> plan.
                      </span>
                    </div>
                    <Button size="lg" className="w-full" asChild>
                      <Link href={`/learn/${course.slug}`}>
                        Start learning
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-sm)] border border-border bg-surface/50 px-3 py-2.5 text-sm text-muted">
                      <Lock className="mt-0.5 size-4 shrink-0" />
                      <span>
                        Subscribe to the{" "}
                        <span className="font-medium text-foreground">
                          {tierLabel(course.required_tier)}
                        </span>{" "}
                        plan (or higher) to unlock every lesson.
                      </span>
                    </div>
                    <Button size="lg" className="w-full" asChild>
                      <Link href="/pricing">
                        Subscribe to access
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </>
                )}

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Preview lessons are free to watch.
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
