import Link from "next/link";
import { GraduationCap, PenSquare, Shield } from "lucide-react";
import { getProfile, getCurrentTier } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/badge";
import { UserMenu } from "@/components/site/user-menu";
import { cn } from "@/lib/utils";

const navLinkClass =
  "text-sm font-medium text-muted transition-colors hover:text-foreground";

export async function Navbar() {
  const [profile, tier] = await Promise.all([getProfile(), getCurrentTier()]);
  const role = profile?.role;

  return (
    <header className="glass sticky top-0 z-40 border-b border-border">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="size-6 text-accent" />
            <span className="text-lg font-semibold tracking-tight text-gradient">CourseHub</span>
          </Link>
          <div className="hidden items-center gap-6 sm:flex">
            <Link href="/catalog" className={navLinkClass}>
              Catalog
            </Link>
            <Link href="/pricing" className={navLinkClass}>
              Pricing
            </Link>
            {(role === "creator" || role === "admin") && (
              <Link href="/creator" className={cn(navLinkClass, "inline-flex items-center gap-1.5")}>
                <PenSquare className="size-3.5" />
                Creator
              </Link>
            )}
            {role === "admin" && (
              <Link href="/admin" className={cn(navLinkClass, "inline-flex items-center gap-1.5")}>
                <Shield className="size-3.5" />
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile ? (
            <>
              <div className="hidden sm:block">
                <TierBadge tier={tier} />
              </div>
              <UserMenu profile={profile} role={profile.role} />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
