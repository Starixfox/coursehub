import * as React from "react";
import { SiteShell } from "@/components/site/site-shell";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <SiteShell>{children}</SiteShell>;
}
