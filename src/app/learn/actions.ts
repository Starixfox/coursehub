"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";
import { progressSchema } from "@/lib/validation/schemas";

export interface SaveProgressInput {
  lessonId: string;
  courseId: string;
  lastPositionSeconds: number;
  completed?: boolean;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Upsert the current user's progress for a lesson. RLS scopes the write to the
 * caller, and `can_i_access_lesson` is the real gate — a user can't record
 * progress on a lesson they may not access. Unique on (user_id, lesson_id).
 */
export async function saveProgress(input: SaveProgressInput): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = progressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { lessonId, courseId, lastPositionSeconds, completed } = parsed.data;

  const supabase = await createClient();

  // Defence in depth: confirm access before recording anything.
  const { data: allowed } = await supabase.rpc("can_i_access_lesson", {
    p_lesson_id: lessonId,
  });
  if (!allowed) return { ok: false, error: "No access to this lesson" };

  const row: {
    user_id: string;
    lesson_id: string;
    course_id: string;
    last_position_seconds: number;
    updated_at: string;
    completed?: boolean;
    completed_at?: string | null;
  } = {
    user_id: user.id,
    lesson_id: lessonId,
    course_id: courseId,
    last_position_seconds: lastPositionSeconds,
    updated_at: new Date().toISOString(),
  };
  if (completed !== undefined) {
    row.completed = completed;
    row.completed_at = completed ? new Date().toISOString() : null;
  }

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(row, { onConflict: "user_id,lesson_id" });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Mark a lesson complete for the current user. */
export async function markComplete(
  lessonId: string,
  courseId: string,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const supabase = await createClient();

  const { data: allowed } = await supabase.rpc("can_i_access_lesson", {
    p_lesson_id: lessonId,
  });
  if (!allowed) return { ok: false, error: "No access to this lesson" };

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Ensure an enrollment row exists for the current user + course and refresh
 * `last_accessed_at`. Idempotent (unique on user_id + course_id).
 */
export async function ensureEnrollment(courseId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      last_accessed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
