import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface CourseProgressProps {
  completed: number;
  total: number;
  /** Optional pre-computed percent (0–100). Falls back to completed/total. */
  percent?: number;
  className?: string;
}

export function CourseProgress({
  completed,
  total,
  percent,
  className,
}: CourseProgressProps) {
  const pct =
    percent ?? (total > 0 ? Math.round((completed / total) * 100) : 0);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Your progress</span>
        <span className="text-muted">
          {completed} of {total} {total === 1 ? "lesson" : "lessons"}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
