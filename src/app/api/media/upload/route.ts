import { z } from "zod";

import { requireUser, getProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getMediaProvider } from "@/lib/media";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/security/audit";

const bodySchema = z.object({
  courseId: z.string().uuid().optional(),
  // Clamp duration to Cloudflare's sane bounds; the provider defaults if absent.
  maxDurationSeconds: z.coerce.number().int().min(1).max(21_600).optional(),
});

/**
 * POST /api/media/upload
 *
 * Creates a one-time direct-upload URL for a creator/admin so the file is sent
 * straight to the media provider (never proxied through us). If a courseId is
 * supplied we verify the user may edit that course before handing out a URL.
 */
export async function POST(req: Request) {
  const user = await requireUser();

  const profile = await getProfile();
  if (!profile || (profile.role !== "creator" && profile.role !== "admin")) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const limit = rateLimit(`media:upload:${user.id}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.success) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    // Body is optional for this endpoint; treat an empty/invalid body as {}.
    json = {};
  }

  const parsed = bodySchema.safeParse(json ?? {});
  if (!parsed.success) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }
  const { courseId, maxDurationSeconds } = parsed.data;

  // If a course is named, the user must own it (or be an admin).
  if (courseId && profile.role !== "admin") {
    const supabase = await createClient();
    const { data: course, error } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .eq("creator_id", user.id)
      .maybeSingle();
    if (error) {
      return Response.json({ error: "server_error" }, { status: 500 });
    }
    if (!course) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
  }

  let upload;
  try {
    upload = await getMediaProvider().createDirectUpload({ maxDurationSeconds });
  } catch {
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "lesson.upload",
    targetType: courseId ? "course" : "media",
    targetId: courseId ?? upload.uid,
    metadata: { uid: upload.uid },
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return Response.json({ uploadUrl: upload.uploadUrl, uid: upload.uid });
}
