"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUser, getProfile } from "@/lib/auth/session";
import {
  courseSchema,
  moduleSchema,
  lessonSchema,
} from "@/lib/validation/schemas";
import { sanitizeLessonHtml } from "@/lib/security/sanitize";
import { logAudit } from "@/lib/security/audit";
import type { Enums } from "@/lib/supabase/types";

/** Standard shape returned to client forms via useActionState. */
export type ActionState = {
  ok?: boolean;
  error?: string;
  /** Field-level validation errors, keyed by field name. */
  fieldErrors?: Record<string, string>;
};

const courseStatusEnum = z.enum(["draft", "published", "archived"]);

/** Flatten a ZodError into our { field: message } map. */
function fieldErrorsFrom(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Resolve the current creator/admin and a request-cookie-scoped Supabase
 * client. Returns null when the caller is not an authorised creator — every
 * mutation below treats that as a hard stop (RLS would reject anyway, but we
 * fail fast and never leak why).
 */
async function requireCreator() {
  const profile = await getProfile();
  if (!profile) return null;
  if (profile.role !== "creator" && profile.role !== "admin") return null;
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  return { user, profile, supabase, isAdmin: profile.role === "admin" };
}

/**
 * Load a course and assert the caller owns it (or is an admin). Returns null
 * when the course is missing or not owned — callers map that to a generic
 * error so we don't disclose existence.
 */
async function loadOwnedCourse(courseId: string) {
  const ctx = await requireCreator();
  if (!ctx) return null;
  const { data: course } = await ctx.supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return null;
  if (!ctx.isAdmin && course.creator_id !== ctx.user.id) return null;
  return { ...ctx, course };
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

/** Postgres unique-violation error code. */
const UNIQUE_VIOLATION = "23505";

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export async function createCourse(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireCreator();
  if (!ctx) return { error: "You are not allowed to create courses." };

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    subtitle: formData.get("subtitle") || undefined,
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    level: formData.get("level") || undefined,
    requiredTier: formData.get("requiredTier") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { data: course, error } = await ctx.supabase
    .from("courses")
    .insert({
      creator_id: ctx.user.id,
      creator_name: ctx.profile.full_name,
      title: parsed.data.title,
      slug: parsed.data.slug,
      subtitle: parsed.data.subtitle ?? null,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      level: parsed.data.level ?? null,
      required_tier: parsed.data.requiredTier,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        error: "That slug is already taken.",
        fieldErrors: { slug: "This slug is already in use — try another." },
      };
    }
    return { error: "Could not create the course. Please try again." };
  }

  await logAudit({
    actorId: ctx.user.id,
    action: "course.create",
    targetType: "course",
    targetId: course.id,
    metadata: { slug: parsed.data.slug },
  });

  revalidatePath("/creator");
  redirect(`/creator/courses/${course.id}`);
}

export async function updateCourse(
  courseId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await loadOwnedCourse(courseId);
  if (!ctx) return { error: "Course not found." };

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    subtitle: formData.get("subtitle") || undefined,
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    level: formData.get("level") || undefined,
    requiredTier: formData.get("requiredTier") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { error } = await ctx.supabase
    .from("courses")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      subtitle: parsed.data.subtitle ?? null,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      level: parsed.data.level ?? null,
      required_tier: parsed.data.requiredTier,
    })
    .eq("id", courseId);

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        error: "That slug is already taken.",
        fieldErrors: { slug: "This slug is already in use — try another." },
      };
    }
    return { error: "Could not save changes. Please try again." };
  }

  await logAudit({
    actorId: ctx.user.id,
    action: "course.update",
    targetType: "course",
    targetId: courseId,
  });

  revalidatePath(`/creator/courses/${courseId}`);
  revalidatePath("/creator");
  return { ok: true };
}

export async function setCourseStatus(
  courseId: string,
  status: Enums<"course_status">,
): Promise<ActionState> {
  const parsedStatus = courseStatusEnum.safeParse(status);
  if (!parsedStatus.success) return { error: "Invalid status." };

  const ctx = await loadOwnedCourse(courseId);
  if (!ctx) return { error: "Course not found." };

  // Don't let an empty course be published — it would render as a dead page.
  if (parsedStatus.data === "published") {
    const { count } = await ctx.supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId);
    if (!count || count < 1) {
      return { error: "Add at least one lesson before publishing." };
    }
  }

  const update: { status: Enums<"course_status">; published_at?: string | null } = {
    status: parsedStatus.data,
  };
  // Stamp first publish; preserve the original date on re-publish.
  if (parsedStatus.data === "published" && !ctx.course.published_at) {
    update.published_at = new Date().toISOString();
  }

  const { error } = await ctx.supabase.from("courses").update(update).eq("id", courseId);
  if (error) return { error: "Could not update the course status." };

  await logAudit({
    actorId: ctx.user.id,
    action: `course.${parsedStatus.data}`,
    targetType: "course",
    targetId: courseId,
  });

  revalidatePath(`/creator/courses/${courseId}`);
  revalidatePath("/creator");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export async function createModule(
  courseId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await loadOwnedCourse(courseId);
  if (!ctx) return { error: "Course not found." };

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    position: formData.get("position") ?? undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  // Default the new module to the end of the list.
  let position = parsed.data.position;
  if (!formData.get("position")) {
    const { data: last } = await ctx.supabase
      .from("modules")
      .select("position")
      .eq("course_id", courseId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    position = (last?.position ?? -1) + 1;
  }

  const { error } = await ctx.supabase
    .from("modules")
    .insert({ course_id: courseId, title: parsed.data.title, position });
  if (error) return { error: "Could not add the module." };

  await logAudit({
    actorId: ctx.user.id,
    action: "module.create",
    targetType: "course",
    targetId: courseId,
  });

  revalidatePath(`/creator/courses/${courseId}`);
  return { ok: true };
}

export async function updateModule(
  moduleId: string,
  courseId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await loadOwnedCourse(courseId);
  if (!ctx) return { error: "Course not found." };

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    position: formData.get("position") ?? undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { error } = await ctx.supabase
    .from("modules")
    .update({ title: parsed.data.title, position: parsed.data.position })
    .eq("id", moduleId)
    .eq("course_id", courseId);
  if (error) return { error: "Could not update the module." };

  revalidatePath(`/creator/courses/${courseId}`);
  return { ok: true };
}

export async function deleteModule(
  moduleId: string,
  courseId: string,
): Promise<ActionState> {
  const ctx = await loadOwnedCourse(courseId);
  if (!ctx) return { error: "Course not found." };

  const { error } = await ctx.supabase
    .from("modules")
    .delete()
    .eq("id", moduleId)
    .eq("course_id", courseId);
  if (error) return { error: "Could not delete the module." };

  await logAudit({
    actorId: ctx.user.id,
    action: "module.delete",
    targetType: "module",
    targetId: moduleId,
    metadata: { courseId },
  });

  revalidatePath(`/creator/courses/${courseId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export async function createLesson(
  moduleId: string,
  courseId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await loadOwnedCourse(courseId);
  if (!ctx) return { error: "Course not found." };

  // Confirm the module really belongs to this course before attaching a lesson.
  const { data: mod } = await ctx.supabase
    .from("modules")
    .select("id")
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!mod) return { error: "Module not found." };

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    position: formData.get("position") ?? undefined,
    durationSeconds: formData.get("durationSeconds") ?? undefined,
    isPreview: formData.get("isPreview") ?? undefined,
    requiredTier: formData.get("requiredTier") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  // Append to the end of the module by default.
  let position = parsed.data.position;
  if (!formData.get("position")) {
    const { data: last } = await ctx.supabase
      .from("lessons")
      .select("position")
      .eq("module_id", moduleId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    position = (last?.position ?? -1) + 1;
  }

  const { error } = await ctx.supabase.from("lessons").insert({
    course_id: courseId,
    module_id: moduleId,
    title: parsed.data.title,
    position,
    duration_seconds: parsed.data.durationSeconds,
    is_preview: parsed.data.isPreview,
    required_tier: parsed.data.requiredTier ?? null,
  });
  if (error) return { error: "Could not add the lesson." };

  await logAudit({
    actorId: ctx.user.id,
    action: "lesson.create",
    targetType: "module",
    targetId: moduleId,
    metadata: { courseId },
  });

  revalidatePath(`/creator/courses/${courseId}`);
  return { ok: true };
}

export async function updateLesson(
  lessonId: string,
  courseId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await loadOwnedCourse(courseId);
  if (!ctx) return { error: "Course not found." };

  // Verify the lesson belongs to this (owned) course.
  const { data: lesson } = await ctx.supabase
    .from("lessons")
    .select("id, course_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson || lesson.course_id !== courseId) return { error: "Lesson not found." };

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    position: formData.get("position") ?? undefined,
    durationSeconds: formData.get("durationSeconds") ?? undefined,
    isPreview: formData.get("isPreview") ?? undefined,
    requiredTier: formData.get("requiredTier") || undefined,
    contentHtml: formData.get("contentHtml") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { error: lessonError } = await ctx.supabase
    .from("lessons")
    .update({
      title: parsed.data.title,
      position: parsed.data.position,
      duration_seconds: parsed.data.durationSeconds,
      is_preview: parsed.data.isPreview,
      required_tier: parsed.data.requiredTier ?? null,
    })
    .eq("id", lessonId)
    .eq("course_id", courseId);
  if (lessonError) return { error: "Could not save the lesson." };

  // Always sanitize creator HTML before it is stored — never persist raw input.
  const safeHtml = sanitizeLessonHtml(parsed.data.contentHtml ?? "");
  const { error: contentError } = await ctx.supabase
    .from("lesson_content")
    .upsert(
      { lesson_id: lessonId, content_html: safeHtml, updated_at: new Date().toISOString() },
      { onConflict: "lesson_id" },
    );
  if (contentError) return { error: "Could not save the lesson content." };

  await logAudit({
    actorId: ctx.user.id,
    action: "lesson.update",
    targetType: "lesson",
    targetId: lessonId,
    metadata: { courseId },
  });

  revalidatePath(`/creator/courses/${courseId}`);
  revalidatePath(`/creator/courses/${courseId}/lessons/${lessonId}`);
  return { ok: true };
}

export async function setLessonVideo(
  lessonId: string,
  courseId: string,
  cfUid: string,
): Promise<ActionState> {
  const ctx = await loadOwnedCourse(courseId);
  if (!ctx) return { error: "Course not found." };

  const uid = z.string().min(1).max(200).safeParse(cfUid);
  if (!uid.success) return { error: "Invalid video reference." };

  const { data: lesson } = await ctx.supabase
    .from("lessons")
    .select("id, course_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson || lesson.course_id !== courseId) return { error: "Lesson not found." };

  const { error: contentError } = await ctx.supabase
    .from("lesson_content")
    .upsert(
      { lesson_id: lessonId, cf_stream_uid: uid.data, updated_at: new Date().toISOString() },
      { onConflict: "lesson_id" },
    );
  if (contentError) return { error: "Could not attach the video." };

  const { error: flagError } = await ctx.supabase
    .from("lessons")
    .update({ has_video: true })
    .eq("id", lessonId)
    .eq("course_id", courseId);
  if (flagError) return { error: "Could not attach the video." };

  await logAudit({
    actorId: ctx.user.id,
    action: "lesson.set_video",
    targetType: "lesson",
    targetId: lessonId,
    metadata: { courseId, cfUid: uid.data },
  });

  revalidatePath(`/creator/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/creator/courses/${courseId}`);
  return { ok: true };
}

export async function deleteLesson(
  lessonId: string,
  courseId: string,
): Promise<ActionState> {
  const ctx = await loadOwnedCourse(courseId);
  if (!ctx) return { error: "Course not found." };

  const { data: lesson } = await ctx.supabase
    .from("lessons")
    .select("id, course_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson || lesson.course_id !== courseId) return { error: "Lesson not found." };

  const { error } = await ctx.supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId)
    .eq("course_id", courseId);
  if (error) return { error: "Could not delete the lesson." };

  await logAudit({
    actorId: ctx.user.id,
    action: "lesson.delete",
    targetType: "lesson",
    targetId: lessonId,
    metadata: { courseId },
  });

  revalidatePath(`/creator/courses/${courseId}`);
  return { ok: true };
}

/** Suggest a URL-safe slug from a title. Used by the client course form. */
export async function suggestSlug(title: string): Promise<string> {
  return slug(title);
}
