import Link from "next/link";
import { BookOpen, BarChart2 } from "lucide-react";
import type { Course } from "@/lib/courses";
import { TierBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/** Deterministic gradient per category so cards stay visually stable. */
const CATEGORY_GRADIENTS: string[] = [
  "from-indigo-500/30 via-violet-500/20 to-fuchsia-500/30",
  "from-violet-500/30 via-purple-500/20 to-indigo-500/30",
  "from-fuchsia-500/30 via-pink-500/20 to-violet-500/30",
  "from-sky-500/30 via-indigo-500/20 to-violet-500/30",
  "from-emerald-500/25 via-teal-500/20 to-cyan-500/30",
  "from-amber-500/25 via-orange-500/20 to-rose-500/30",
];

function gradientFor(key: string | null): string {
  if (!key) return CATEGORY_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return CATEGORY_GRADIENTS[hash % CATEGORY_GRADIENTS.length];
}

export interface CourseCardProps {
  course: Course;
  /** 0–100. Renders a progress bar when provided. */
  progressPercent?: number;
}

export function CourseCard({ course, progressPercent }: CourseCardProps) {
  const showProgress = typeof progressPercent === "number";

  return (
    <Link
      href={`/catalog/${course.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card",
        "transition-colors hover:border-border-strong hover:bg-card-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {/* Thumbnail placeholder (gradient by category) */}
      <div
        className={cn(
          "relative aspect-video w-full bg-gradient-to-br",
          gradientFor(course.category),
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="size-9 text-foreground/30 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="absolute left-3 top-3">
          <TierBadge tier={course.required_tier} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {course.category ? <span>{course.category}</span> : null}
          {course.category && course.level ? (
            <span className="text-border-strong">·</span>
          ) : null}
          {course.level ? (
            <span className="inline-flex items-center gap-1 capitalize">
              <BarChart2 className="size-3" />
              {course.level}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground">
          {course.title}
        </h3>

        {course.subtitle ? (
          <p className="line-clamp-2 text-sm text-muted">{course.subtitle}</p>
        ) : null}

        {showProgress ? (
          <div className="mt-auto pt-3">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
              <span>Progress</span>
              <span className="font-medium text-foreground">
                {Math.round(progressPercent!)}%
              </span>
            </div>
            <Progress value={progressPercent} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
