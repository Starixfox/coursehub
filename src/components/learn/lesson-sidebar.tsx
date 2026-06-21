"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import type { CourseWithCurriculum } from "@/lib/courses";
import { formatDuration, cn } from "@/lib/utils";

export interface SidebarLesson {
  id: string;
  accessible: boolean;
  completed: boolean;
}

export interface LessonSidebarProps {
  slug: string;
  course: CourseWithCurriculum;
  /** Per-lesson access + completion state, keyed by lesson id. */
  states: Record<string, SidebarLesson>;
  activeLessonId: string;
}

export function LessonSidebar({
  slug,
  course,
  states,
  activeLessonId,
}: LessonSidebarProps) {
  return (
    <nav aria-label="Course curriculum" className="flex flex-col gap-6">
      {course.modules.map((module, mi) => (
        <div key={module.id} className="space-y-2">
          <div className="px-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Module {mi + 1}
            </p>
            <h3 className="text-sm font-semibold leading-snug text-foreground">
              {module.title}
            </h3>
          </div>
          <ul className="space-y-0.5">
            {module.lessons.map((lesson) => {
              const state = states[lesson.id];
              const accessible = state?.accessible ?? false;
              const completed = state?.completed ?? false;
              const isActive = lesson.id === activeLessonId;

              const Icon = completed
                ? CheckCircle2
                : !accessible
                  ? Lock
                  : isActive
                    ? PlayCircle
                    : Circle;

              const inner = (
                <span
                  className={cn(
                    "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/15 text-foreground"
                      : accessible
                        ? "text-muted hover:bg-card-hover hover:text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      completed
                        ? "text-success"
                        : isActive
                          ? "text-accent"
                          : !accessible
                            ? "text-muted-foreground"
                            : "text-muted",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDuration(lesson.duration_seconds)}
                  </span>
                </span>
              );

              if (!accessible) {
                return (
                  <li key={lesson.id} aria-disabled="true" title="Upgrade to unlock">
                    {inner}
                  </li>
                );
              }

              return (
                <li key={lesson.id}>
                  <Link
                    href={`/learn/${slug}?lesson=${lesson.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[var(--radius-sm)]"
                  >
                    {inner}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
