import * as React from "react";
import { SiteShell } from "@/components/site/site-shell";
import { requireRole } from "@/lib/auth/session";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the entire /creator area: only creators and admins may enter.
  await requireRole(["creator", "admin"]);
  return <SiteShell>{children}</SiteShell>;
}
