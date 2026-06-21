import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { Tier } from "@/lib/entitlements";
import { PageHeader } from "@/components/site/page-header";
import { Badge, TierBadge } from "@/components/ui/badge";
import {
  DataTable,
  DataTableRow,
  DataTableCell,
} from "@/components/admin/data-table";
import { CourseActions } from "@/components/admin/course-actions";

export const dynamic = "force-dynamic";

function statusVariant(status: string) {
  if (status === "published") return "success" as const;
  if (status === "archived") return "default" as const;
  return "warning" as const;
}

export default async function AdminCoursesPage() {
  await requireRole(["admin"]);
  const db = createAdminClient();

  const [coursesRes, lessonsRes] = await Promise.all([
    db
      .from("courses")
      .select(
        "id, title, creator_id, creator_name, required_tier, status, created_at",
      )
      .order("created_at", { ascending: false }),
    db.from("lessons").select("course_id"),
  ]);

  const lessonCounts = new Map<string, number>();
  for (const row of lessonsRes.data ?? []) {
    lessonCounts.set(
      row.course_id,
      (lessonCounts.get(row.course_id) ?? 0) + 1,
    );
  }

  // Resolve creator display names: prefer the denormalized creator_name, fall
  // back to the profile email for any course that didn't capture one.
  const courses = coursesRes.data ?? [];
  const missingNameIds = [
    ...new Set(
      courses.filter((c) => !c.creator_name).map((c) => c.creator_id),
    ),
  ];
  const creatorEmail = new Map<string, string | null>();
  if (missingNameIds.length > 0) {
    const { data: creators } = await db
      .from("profiles")
      .select("id, email, full_name")
      .in("id", missingNameIds);
    for (const c of creators ?? []) {
      creatorEmail.set(c.id, c.full_name ?? c.email);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader
        title="Courses"
        description="Every course on the platform — publish, unpublish or remove."
      />
      <div className="mt-6">
        <DataTable
          columns={[
            { key: "title", label: "Course" },
            { key: "creator", label: "Creator" },
            { key: "tier", label: "Tier" },
            { key: "status", label: "Status" },
            { key: "lessons", label: "Lessons", className: "text-right" },
            { key: "actions", label: "", className: "text-right" },
          ]}
          empty="No courses yet."
        >
          {courses.map((c) => {
            const creator =
              c.creator_name ?? creatorEmail.get(c.creator_id) ?? "—";
            return (
              <DataTableRow key={c.id}>
                <DataTableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(c.created_at)}
                    </p>
                  </div>
                </DataTableCell>
                <DataTableCell className="text-muted">{creator}</DataTableCell>
                <DataTableCell>
                  <TierBadge tier={c.required_tier as Tier} />
                </DataTableCell>
                <DataTableCell>
                  <Badge variant={statusVariant(c.status)} className="capitalize">
                    {c.status}
                  </Badge>
                </DataTableCell>
                <DataTableCell className="text-right tabular-nums text-muted">
                  {lessonCounts.get(c.id) ?? 0}
                </DataTableCell>
                <DataTableCell className="text-right">
                  <CourseActions
                    courseId={c.id}
                    published={c.status === "published"}
                    title={c.title}
                  />
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTable>
      </div>
    </div>
  );
}
