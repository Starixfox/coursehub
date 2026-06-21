"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole, getUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/security/audit";

const roleEnum = z.enum(["admin", "creator", "subscriber"]);

const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  role: roleEnum,
});

const setPublishSchema = z.object({
  courseId: z.string().uuid(),
  publish: z.boolean(),
});

const deleteCourseSchema = z.object({
  courseId: z.string().uuid(),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Promote/demote a user. Admin-only and self-protecting: an admin cannot strip
 * their own admin role (avoids locking the platform out of admin entirely).
 * The write uses the service role because changing another user's profile is a
 * trusted op the target user cannot do; RLS is intentionally bypassed here, so
 * we re-gate with requireRole on every call.
 */
export async function changeUserRole(
  userId: string,
  role: z.infer<typeof roleEnum>,
): Promise<ActionResult> {
  const admin = await requireRole(["admin"]);
  const parsed = changeRoleSchema.safeParse({ userId, role });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  if (parsed.data.userId === admin.id && parsed.data.role !== "admin") {
    return { ok: false, error: "You can't remove your own admin role." };
  }

  const db = createAdminClient();

  const { data: current, error: readErr } = await db
    .from("profiles")
    .select("role")
    .eq("id", parsed.data.userId)
    .single();
  if (readErr || !current) return { ok: false, error: "User not found." };

  if (current.role === parsed.data.role) return { ok: true };

  const { error } = await db
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);
  if (error) return { ok: false, error: "Could not update role." };

  await logAudit({
    actorId: admin.id,
    action: "role.changed",
    targetType: "profile",
    targetId: parsed.data.userId,
    metadata: { from: current.role, to: parsed.data.role },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Admin override to publish/unpublish any course regardless of creator.
 * Sets published_at on first publish so catalog ordering stays sane.
 */
export async function setCoursePublish(
  courseId: string,
  publish: boolean,
): Promise<ActionResult> {
  const admin = await requireRole(["admin"]);
  const parsed = setPublishSchema.safeParse({ courseId, publish });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const db = createAdminClient();

  const { data: course, error: readErr } = await db
    .from("courses")
    .select("id, status, published_at")
    .eq("id", parsed.data.courseId)
    .single();
  if (readErr || !course) return { ok: false, error: "Course not found." };

  const { error } = await db
    .from("courses")
    .update({
      status: parsed.data.publish ? "published" : "draft",
      published_at:
        parsed.data.publish && !course.published_at
          ? new Date().toISOString()
          : course.published_at,
    })
    .eq("id", parsed.data.courseId);
  if (error) return { ok: false, error: "Could not update course." };

  await logAudit({
    actorId: admin.id,
    action: parsed.data.publish ? "course.published" : "course.unpublished",
    targetType: "course",
    targetId: parsed.data.courseId,
    metadata: { from: course.status },
  });

  revalidatePath("/admin/courses");
  return { ok: true };
}

/** Admin override to delete any course. */
export async function deleteCourse(courseId: string): Promise<ActionResult> {
  const admin = await requireRole(["admin"]);
  const parsed = deleteCourseSchema.safeParse({ courseId });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const db = createAdminClient();

  const { data: course, error: readErr } = await db
    .from("courses")
    .select("id, title")
    .eq("id", parsed.data.courseId)
    .single();
  if (readErr || !course) return { ok: false, error: "Course not found." };

  const { error } = await db
    .from("courses")
    .delete()
    .eq("id", parsed.data.courseId);
  if (error) return { ok: false, error: "Could not delete course." };

  await logAudit({
    actorId: admin.id,
    action: "course.deleted",
    targetType: "course",
    targetId: parsed.data.courseId,
    metadata: { title: course.title },
  });

  revalidatePath("/admin/courses");
  return { ok: true };
}

// Re-exported so client components don't reach into next/auth internals; keeps
// the actions file the single entry point for admin mutations.
export async function currentAdminId(): Promise<string | null> {
  await requireRole(["admin"]);
  const user = await getUser();
  return user?.id ?? null;
}
