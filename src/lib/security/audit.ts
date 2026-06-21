import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isServiceRoleConfigured } from "@/lib/env.server";

export interface AuditInput {
  actorId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/**
 * Append-only audit trail for sensitive actions (logins, payments, role
 * changes). Written with the service role so it cannot be tampered with by the
 * acting user. Never throws — a logging failure must not break the request.
 */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    if (!isServiceRoleConfigured) {
      console.info(`[audit] ${input.action}`, input.targetId ?? "");
      return;
    }
    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      actor_id: input.actorId ?? null,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      metadata: (input.metadata ?? {}) as never,
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
    });
  } catch (err) {
    console.error("[audit] failed to write", err);
  }
}
