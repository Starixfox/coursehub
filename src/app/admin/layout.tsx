import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/session";
import { SiteShell } from "@/components/site/site-shell";

/**
 * Admin section shell. Gates the entire subtree to admins (requireRole
 * redirects non-admins) and wraps everything in the shared SiteShell so the
 * nav/footer match the rest of the app.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole(["admin"]);
  return <SiteShell>{children}</SiteShell>;
}
