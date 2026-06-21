"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Lock, Play, PlayCircle, FileText } from "lucide-react";
import type { CourseWithCurriculum, CurriculumModule, Lesson } from "@/lib/courses";
import { hasTierAccess, type Tier } from "@/lib/entitlements";
import { VideoPlayer } from "@/components/media/video-player";
import { Badge, TierBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, cn } from "@/lib/utils";

export interface CurriculumListProps {
  course: CourseWithCurriculum;
  currentTier: Tier;
  hasAccess: boolean;
}

/** Effective tier required for a lesson (falls back to the course tier). */
function lessonTier(lesson: Lesson, course: CourseWithCurriculum): Tier {
  return (lesson.required_tier ?? course.required_tier) as Tier;
}

export function CurriculumList({ course, currentTier, hasAccess }: CurriculumListProps) {
  return (
    <div className="space-y-4">
      {course.modules.map((module, i) => (
        <ModuleBlock
          key={module.id}
          module={module}
          index={i}
          course={course}
          currentTier={currentTier}
          hasAccess={hasAccess}
        />
      ))}
    </div>
  );
}

function ModuleBlock({
  module,
  index,
  course,
  currentTier,
  hasAccess,
}: {
  module: CurriculumModule;
  index: number;
  course: CourseWithCurriculum;
  currentTier: Tier;
  hasAccess: boolean;
}) {
  const total = module.lessons.reduce((s, l) => s + (l.duration_seconds ?? 0), 0);

  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary/15 text-xs font-semibold text-accent">
            {index + 1}
          </span>
          <h3 className="text-sm font-semibold text-foreground">{module.title}</h3>
        </div>
        <span className="shrink-0 text-xs text-muted">
          {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
          {total > 0 ? ` · ${formatDuration(total)}` : ""}
        </span>
      </header>

      <ul className="divide-y divide-border">
        {module.lessons.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            course={course}
            currentTier={currentTier}
            hasAccess={hasAccess}
          />
        ))}
        {module.lessons.length === 0 ? (
          <li className="px-4 py-3 text-sm text-muted">No lessons yet.</li>
        ) : null}
      </ul>
    </section>
  );
}

function LessonRow({
  lesson,
  course,
  currentTier,
  hasAccess,
}: {
  lesson: Lesson;
  course: CourseWithCurriculum;
  currentTier: Tier;
  hasAccess: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const required = lessonTier(lesson, course);
  // Preview lessons are always playable; otherwise gate on tier access.
  const unlocked = lesson.is_preview || hasAccess || hasTierAccess(currentTier, required);
  const expandable = lesson.has_video;

  return (
    <li>
      <button
        type="button"
        onClick={() => expandable && setOpen((o) => !o)}
        aria-expanded={expandable ? open : undefined}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
          expandable ? "hover:bg-card-hover" : "cursor-default",
        )}
      >
        <span className="shrink-0 text-muted">
          {!unlocked ? (
            <Lock className="size-4" />
          ) : lesson.has_video ? (
            <PlayCircle className="size-4 text-accent" />
          ) : (
            <FileText className="size-4" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-foreground">{lesson.title}</span>
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {lesson.is_preview ? (
            <Badge variant="success" className="gap-1">
              <Play className="size-3" />
              Preview
            </Badge>
          ) : !unlocked ? (
            <TierBadge tier={required} />
          ) : null}
          {lesson.duration_seconds > 0 ? (
            <span className="text-xs tabular-nums text-muted">
              {formatDuration(lesson.duration_seconds)}
            </span>
          ) : null}
          {expandable ? (
            <ChevronDown
              className={cn(
                "size-4 text-muted transition-transform",
                open && "rotate-180",
              )}
            />
          ) : null}
        </span>
      </button>

      {expandable && open ? (
        <div className="px-4 pb-4">
          {unlocked ? (
            <VideoPlayer
              lessonId={lesson.id}
              locked={false}
              className="overflow-hidden rounded-[var(--radius-sm)] border border-border"
            />
          ) : (
            <div className="space-y-3">
              <VideoPlayer
                lessonId={lesson.id}
                locked
                className="overflow-hidden rounded-[var(--radius-sm)] border border-border"
              />
              <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-border bg-surface/50 px-4 py-3">
                <p className="text-sm text-muted">
                  This lesson requires the{" "}
                  <span className="font-medium text-foreground capitalize">{required}</span>{" "}
                  plan.
                </p>
                <Button size="sm" asChild>
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </li>
  );
}
