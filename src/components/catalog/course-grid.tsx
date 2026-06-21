import type { Course } from "@/lib/courses";
import { CourseCard } from "@/components/catalog/course-card";
import { cn } from "@/lib/utils";

export interface CourseGridProps {
  courses: Course[];
  /** Map of course id -> progress percent (0–100) to overlay on cards. */
  progressById?: Record<string, number>;
  className?: string;
}

export function CourseGrid({ courses, progressById, className }: CourseGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          progressPercent={progressById?.[course.id]}
        />
      ))}
    </div>
  );
}
