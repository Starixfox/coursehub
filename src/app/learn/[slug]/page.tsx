import * as React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getCurrentTier } from "@/lib/auth/session";
import { getCourseWithCurriculum, type Lesson } from "@/lib/courses";
import { hasTierAccess, type Tier } from "@/lib/entitlements";
import { VideoPlayer } from "@/components/media/video-player";
import { LessonSidebar, type SidebarLesson } from "@/components/learn/lesson-sidebar";
import { LessonContent } from "@/components/learn/lesson-content";
import { MarkCompleteButton } from "@/components/learn/mark-complete-button";
import { CourseProgress } from "@/components/learn/course-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, TierBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "@/components/site/upgrade-dialog";
import { ensureEnrollment } from "@/app/learn/actions";
import { formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** A lesson's effective required tier: its own override, else the course's. */
function lessonRequiredTier(lesson: Lesson, courseTier: Tier): Tier {
  return (lesson.required_tier as Tier | null) ?? courseTier;
}

function isLessonAccessible(
  lesson: Lesson,
  courseTier: Tier,
  userTier: Tier,
): boolean {
  if (lesson.is_preview) return true;
  return hasTierAccess(userTier, lessonRequiredTier(lesson, courseTier));
}

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  await requireUser();
  const { slug } = await params;
  const { lesson: requestedLessonId } = await searchParams;

  const course = await getCourseWithCurriculum(slug);
  if (!course) notFound();

  const tier = await getCurrentTier();
  const courseTier = course.required_tier as Tier;

  // Flatten lessons in curriculum order.
  const orderedLessons: Lesson[] = course.modules.flatMap((m) => m.lessons);

  // No access at all (no full-tier access AND no preview lesson) → catalog.
  const hasFullAccess = hasTierAccess(tier, courseTier);
  const hasPreview = orderedLessons.some((l) => l.is_preview);
  if (!hasFullAccess && !hasPreview) {
    redirect(`/catalog/${slug}`);
  }

  // Record the visit (idempotent enrollment + refresh last_accessed).
  await ensureEnrollment(course.id);

  // Per-lesson access map.
  const accessById = new Map<string, boolean>();
  for (const l of orderedLessons) {
    accessById.set(l.id, isLessonAccessible(l, courseTier, tier));
  }

  // Resolve the active lesson: requested (if accessible) else first accessible.
  const firstAccessible = orderedLessons.find((l) => accessById.get(l.id));
  const requested = requestedLessonId
    ? orderedLessons.find((l) => l.id === requestedLessonId)
    : undefined;
  const activeLesson =
    requested && accessById.get(requested.id) ? requested : firstAccessible;

  if (!activeLesson) {
    // Should be unreachable given the access check above.
    redirect(`/catalog/${slug}`);
  }

  const supabase = await createClient();

  // Progress rows for completion state (RLS scopes to the user).
  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, last_position_seconds")
    .eq("course_id", course.id);

  const progressById = new Map(
    (progressRows ?? []).map((p) => [p.lesson_id, p]),
  );

  // Lesson content for the active lesson — RLS only returns it if accessible.
  const { data: content } = await supabase
    .from("lesson_content")
    .select("content_html, cf_stream_uid")
    .eq("lesson_id", activeLesson.id)
    .maybeSingle();

  const completedCount = orderedLessons.filter(
    (l) => progressById.get(l.id)?.completed,
  ).length;

  // Sidebar state map.
  const states: Record<string, SidebarLesson> = {};
  for (const l of orderedLessons) {
    states[l.id] = {
      id: l.id,
      accessible: accessById.get(l.id) ?? false,
      completed: Boolean(progressById.get(l.id)?.completed),
    };
  }

  // Prev / next within the same access set.
  const activeIndex = orderedLessons.findIndex((l) => l.id === activeLesson.id);
  const prevLesson = orderedLessons[activeIndex - 1] ?? null;
  const nextLesson = orderedLessons[activeIndex + 1] ?? null;

  const activeProgress = progressById.get(activeLesson.id);
  const activeCompleted = Boolean(activeProgress?.completed);
  const activeAccessible = accessById.get(activeLesson.id) ?? false;
  const activeReqTier = lessonRequiredTier(activeLesson, courseTier);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Link
            href={`/catalog/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Course overview
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {course.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={courseTier} />
            <Badge variant="default">
              {course.lessonCount} lessons ·{" "}
              {formatDuration(course.totalDurationSeconds)}
            </Badge>
            {!hasFullAccess ? (
              <Badge variant="warning">Preview access</Badge>
            ) : null}
          </div>
        </div>
        <div className="w-full sm:w-64">
          <CourseProgress
            completed={completedCount}
            total={course.lessonCount}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="max-h-[70vh] overflow-y-auto p-4">
              <LessonSidebar
                slug={slug}
                course={course}
                states={states}
                activeLessonId={activeLesson.id}
              />
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 space-y-6">
          {activeLesson.has_video ? (
            <VideoPlayer
              lessonId={activeLesson.id}
              locked={!activeAccessible}
            />
          ) : null}

          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {activeLesson.title}
                </h2>
                <p className="text-sm text-muted">
                  {formatDuration(activeLesson.duration_seconds)}
                  {activeLesson.is_preview ? " · Free preview" : ""}
                </p>
              </div>
              {activeAccessible ? (
                <MarkCompleteButton
                  lessonId={activeLesson.id}
                  courseId={course.id}
                  completed={activeCompleted}
                />
              ) : (
                <UpgradeDialog requiredTier={activeReqTier}>
                  <Button variant="primary">
                    <Lock className="size-4" />
                    Unlock with {activeReqTier}
                  </Button>
                </UpgradeDialog>
              )}
            </div>
          </div>

          {activeAccessible ? (
            <Card>
              <CardContent className="p-6">
                <LessonContent html={content?.content_html ?? null} />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-accent">
                  <Lock className="size-6" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    This lesson is locked.
                  </p>
                  <p className="text-sm text-muted">
                    Upgrade to {activeReqTier} to watch the full lesson and
                    unlock the rest of this course.
                  </p>
                </div>
                <UpgradeDialog requiredTier={activeReqTier}>
                  <Button>View plans</Button>
                </UpgradeDialog>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
            {prevLesson ? (
              <Button variant="outline" asChild>
                <Link href={`/learn/${slug}?lesson=${prevLesson.id}`}>
                  <ChevronLeft className="size-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Button variant="secondary" asChild>
                <Link href={`/learn/${slug}?lesson=${nextLesson.id}`}>
                  Next
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
