import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { Tier } from "@/lib/entitlements";

export type Course = Tables<"courses">;
export type Module = Tables<"modules">;
export type Lesson = Tables<"lessons">;

export interface CurriculumModule extends Module {
  lessons: Lesson[];
}
export interface CourseWithCurriculum extends Course {
  modules: CurriculumModule[];
  lessonCount: number;
  totalDurationSeconds: number;
}

/** Published catalog, optionally filtered. RLS already hides unpublished rows. */
export async function listPublishedCourses(opts?: {
  search?: string;
  category?: string;
  tier?: Tier;
}): Promise<Course[]> {
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (opts?.category) query = query.eq("category", opts.category);
  if (opts?.tier) query = query.eq("required_tier", opts.tier);
  if (opts?.search) query = query.ilike("title", `%${opts.search}%`);

  const { data } = await query;
  return data ?? [];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

/** Course + ordered modules + ordered lessons (metadata only — content/video
 *  is fetched separately and gated by RLS). */
export async function getCourseWithCurriculum(
  slug: string,
): Promise<CourseWithCurriculum | null> {
  const supabase = await createClient();
  const course = await getCourseBySlug(slug);
  if (!course) return null;

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  const lessonsByModule = new Map<string, Lesson[]>();
  for (const l of lessons ?? []) {
    const arr = lessonsByModule.get(l.module_id) ?? [];
    arr.push(l);
    lessonsByModule.set(l.module_id, arr);
  }

  const curriculum: CurriculumModule[] = (modules ?? []).map((m) => ({
    ...m,
    lessons: lessonsByModule.get(m.id) ?? [],
  }));

  const allLessons = lessons ?? [];
  return {
    ...course,
    modules: curriculum,
    lessonCount: allLessons.length,
    totalDurationSeconds: allLessons.reduce((s, l) => s + (l.duration_seconds ?? 0), 0),
  };
}

export async function listCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("category")
    .eq("status", "published")
    .not("category", "is", null);
  const set = new Set<string>();
  for (const row of data ?? []) if (row.category) set.add(row.category);
  return [...set].sort();
}
