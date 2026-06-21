import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourseForm } from "@/components/creator/course-form";
import { createCourse } from "@/app/creator/actions";

export default async function NewCoursePage() {
  await requireRole(["creator", "admin"]);

  return (
    <>
      <PageHeader
        title="New course"
        description="Set up the basics. You can add modules, lessons and video next."
        actions={
          <Button asChild variant="ghost">
            <Link href="/creator">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <CourseForm action={createCourse} submitLabel="Create course" />
        </CardContent>
      </Card>
    </>
  );
}
