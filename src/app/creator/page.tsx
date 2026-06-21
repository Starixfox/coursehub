import Link from "next/link";
import { Plus, BookOpen, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { getUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, TierBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Tables, Enums } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<Enums<"course_status">, "default" | "success" | "warning"> = {
  draft: "warning",
  published: "success",
  archived: "default",
};

const STATUS_LABEL: Record<Enums<"course_status">, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

type CourseRow = Tables<"courses">;

export default async function CreatorHomePage() {
  const profile = await requireRole(["creator", "admin"]);
  const user = await getUser();
  const supabase = await createClient();

  // RLS lets a creator read their own courses (any status). Admins see theirs
  // too; the dashboard is intentionally scoped to the signed-in author.
  let query = supabase
    .from("courses")
    .select("*")
    .order("updated_at", { ascending: false });
  if (profile.role !== "admin" && user) query = query.eq("creator_id", user.id);

  const { data: courses } = await query;
  const list = (courses ?? []) as CourseRow[];

  // Lesson counts per course in a single query.
  const lessonCounts = new Map<string, number>();
  if (list.length > 0) {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("course_id")
      .in(
        "course_id",
        list.map((c) => c.id),
      );
    for (const l of lessons ?? []) {
      lessonCounts.set(l.course_id, (lessonCounts.get(l.course_id) ?? 0) + 1);
    }
  }

  return (
    <>
      <PageHeader
        title="Your courses"
        description="Create, edit and publish courses. Drafts are only visible to you until published."
        actions={
          <Button asChild>
            <Link href="/creator/courses/new">
              <Plus className="size-4" />
              New course
            </Link>
          </Button>
        }
      />

      {list.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-accent">
              <BookOpen className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-foreground">No courses yet</p>
              <p className="max-w-sm text-sm text-muted">
                Start by creating your first course. You can add modules, lessons and
                video before publishing.
              </p>
            </div>
            <Button asChild>
              <Link href="/creator/courses/new">
                <Plus className="size-4" />
                Create your first course
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((course) => {
            const count = lessonCounts.get(course.id) ?? 0;
            return (
              <li key={course.id}>
                <Link
                  href={`/creator/courses/${course.id}`}
                  className="block h-full rounded-[var(--radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Card className="h-full transition-colors hover:bg-card-hover">
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold leading-tight tracking-tight text-foreground">
                          {course.title}
                        </h3>
                        <Badge variant={STATUS_VARIANT[course.status]}>
                          {STATUS_LABEL[course.status]}
                        </Badge>
                      </div>
                      {course.subtitle ? (
                        <p className="line-clamp-2 text-sm text-muted">{course.subtitle}</p>
                      ) : null}
                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="size-3.5" />
                          {count} {count === 1 ? "lesson" : "lessons"}
                        </span>
                        <TierBadge tier={course.required_tier} />
                        <span className="ml-auto">Updated {formatDate(course.updated_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
