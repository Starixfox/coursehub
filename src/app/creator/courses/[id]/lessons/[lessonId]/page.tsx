import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole, getUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LessonForm } from "@/components/creator/lesson-form";

export const dynamic = "force-dynamic";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const profile = await requireRole(["creator", "admin"]);
  const user = await getUser();
  const supabase = await createClient();

  // Verify the course exists and is owned by this creator (or admin).
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, creator_id")
    .eq("id", id)
    .maybeSingle();
  if (!course) notFound();
  if (profile.role !== "admin" && course.creator_id !== user?.id) notFound();

  // The lesson must belong to this course.
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson || lesson.course_id !== id) notFound();

  // Existing content/video (may not exist yet).
  const { data: content } = await supabase
    .from("lesson_content")
    .select("content_html, cf_stream_uid")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  return (
    <>
      <PageHeader
        title="Edit lesson"
        description={`${course.title} · ${lesson.title}`}
        actions={
          <Button asChild variant="ghost">
            <Link href={`/creator/courses/${id}`}>
              <ArrowLeft className="size-4" />
              Back to course
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <LessonForm courseId={id} lesson={lesson} content={content ?? null} />
        </CardContent>
      </Card>
    </>
  );
}
