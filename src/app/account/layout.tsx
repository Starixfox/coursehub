import * as React from "react";
import { SiteShell } from "@/components/site/site-shell";
import { requireUser } from "@/lib/auth/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reachable even if email is unverified (middleware allows /account through).
  await requireUser();
  return <SiteShell>{children}</SiteShell>;
}
