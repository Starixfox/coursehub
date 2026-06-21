"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Video, Eye, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, TierBadge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { deleteLesson } from "@/app/creator/actions";
import type { Tables } from "@/lib/supabase/types";

export interface LessonListProps {
  courseId: string;
  lessons: Tables<"lessons">[];
}

export function LessonList({ courseId, lessons }: LessonListProps) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDelete(lessonId: string, title: string) {
    if (!window.confirm(`Delete lesson "${title}"? This cannot be undone.`)) return;
    setPendingId(lessonId);
    try {
      await deleteLesson(lessonId, courseId);
    } finally {
      setPendingId(null);
    }
  }

  if (lessons.length === 0) {
    return (
      <p className="px-3 py-2 text-sm text-muted-foreground">
        No lessons yet. Add one below.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {lessons.map((lesson) => (
        <li
          key={lesson.id}
          className="flex items-center gap-3 px-3 py-2.5 text-sm"
        >
          <GripVertical aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{lesson.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>#{lesson.position}</span>
              {lesson.duration_seconds > 0 ? (
                <span>{formatDuration(lesson.duration_seconds)}</span>
              ) : null}
              {lesson.has_video ? (
                <span className="inline-flex items-center gap-1 text-accent">
                  <Video className="size-3" />
                  Video
                </span>
              ) : null}
              {lesson.is_preview ? (
                <Badge variant="primary">
                  <Eye className="size-3" />
                  Preview
                </Badge>
              ) : null}
              {lesson.required_tier ? <TierBadge tier={lesson.required_tier} /> : null}
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/creator/courses/${courseId}/lessons/${lesson.id}`}>
              <Pencil className="size-3.5" />
              Edit
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pendingId === lesson.id}
            onClick={() => onDelete(lesson.id, lesson.title)}
          >
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
}
