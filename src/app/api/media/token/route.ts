import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getMediaProvider } from "@/lib/media";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/security/audit";

const bodySchema = z.object({ lessonId: z.string().uuid() });

/**
 * POST /api/media/token
 *
 * Mints a short-lived playback token for a lesson's video — but ONLY after the
 * user's own RLS-scoped entitlement check passes. The provider asset id
 * (cf_stream_uid) and provider secrets are never returned to the client.
 */
export async function POST(req: Request) {
  const user = await requireUser();

  // Rate-limit by user so a single account can't hammer the mint endpoint.
  const limit = rateLimit(`media:token:${user.id}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.success) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }
  const { lessonId } = parsed.data;

  const supabase = await createClient();

  // Entitlement check runs as the USER (RLS + tier logic live in the RPC).
  const { data: allowed, error: accessError } = await supabase.rpc(
    "can_i_access_lesson",
    { p_lesson_id: lessonId },
  );
  if (accessError || allowed !== true) {
    return Response.json({ error: "locked" }, { status: 403 });
  }

  // Read the provider asset id with the user's client (RLS-gated). The uid
  // never leaves the server.
  const { data: content, error: contentError } = await supabase
    .from("lesson_content")
    .select("cf_stream_uid")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (contentError) {
    return Response.json({ error: "server_error" }, { status: 500 });
  }
  const uid = content?.cf_stream_uid;
  if (!uid) {
    return Response.json({ error: "no_video" }, { status: 404 });
  }

  let token;
  try {
    token = await getMediaProvider().getPlaybackToken(uid);
  } catch {
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "lesson.play",
    targetType: "lesson",
    targetId: lessonId,
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  // Only the playback-ready fields are exposed — no uid, no provider secrets.
  return Response.json({
    hlsUrl: token.hlsUrl,
    poster: token.poster ?? null,
    expiresIn: token.expiresIn,
    provider: token.provider,
  });
}
