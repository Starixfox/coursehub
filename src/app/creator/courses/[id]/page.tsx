import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole, getUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CourseForm } from "@/components/creator/course-form";
import { ModuleList, type ModuleWithLessons } from "@/components/creator/module-list";
import { PublishControls } from "@/components/creator/publish-controls";
import { updateCourse } from "@/app/creator/actions";
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

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole(["creator", "admin"]);
  const user = await getUser();
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // Ownership: the course must exist and be owned by this creator (or admin).
  if (!course) notFound();
  if (profile.role !== "admin" && course.creator_id !== user?.id) notFound();

  const { data: modulesData } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", id)
    .order("position", { ascending: true });

  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("position", { ascending: true });

  const lessonsByModule = new Map<string, Tables<"lessons">[]>();
  for (const lesson of lessonsData ?? []) {
    const arr = lessonsByModule.get(lesson.module_id) ?? [];
    arr.push(lesson);
    lessonsByModule.set(lesson.module_id, arr);
  }

  const modules: ModuleWithLessons[] = (modulesData ?? []).map((m) => ({
    ...m,
    lessons: lessonsByModule.get(m.id) ?? [],
  }));

  // Bind the course id so the form action matches (state, formData) => ....
  const updateAction = updateCourse.bind(null, id);

  return (
    <>
      <PageHeader
        title={course.title}
        description={course.subtitle ?? "Edit course details, build the curriculum, and publish."}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[course.status]}>
              {STATUS_LABEL[course.status]}
            </Badge>
            <Button asChild variant="ghost">
              <Link href="/creator">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Title, description, category and access tier.</CardDescription>
            </CardHeader>
            <CardContent>
              <CourseForm action={updateAction} course={course} submitLabel="Save changes" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
              <CardDescription>
                Organise lessons into modules. Add a module, then add lessons to it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModuleList courseId={id} modules={modules} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
              <CardDescription>
                {course.status === "published"
                  ? "Live in the catalog. Unpublish to hide it."
                  : "Publish to make this course visible in the catalog."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PublishControls courseId={id} status={course.status} />
              <dl className="space-y-1.5 text-xs text-muted">
                <div className="flex justify-between gap-2">
                  <dt>Published</dt>
                  <dd className="text-foreground">{formatDate(course.published_at)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Last updated</dt>
                  <dd className="text-foreground">{formatDate(course.updated_at)}</dd>
                </div>
              </dl>
              {course.status === "published" ? (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/catalog/${course.slug}`} target="_blank">
                    <ExternalLink className="size-3.5" />
                    View in catalog
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
