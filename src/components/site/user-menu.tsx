"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LayoutDashboard, User, PenSquare, Shield, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Profile, Role } from "@/lib/auth/session";

const itemClass = cn(
  "flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-muted outline-none",
  "transition-colors focus:bg-card-hover focus:text-foreground data-[highlighted]:bg-card-hover data-[highlighted]:text-foreground",
);

export interface UserMenuProps {
  profile: Profile;
  role: Role;
}

export function UserMenu({ profile, role }: UserMenuProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  const displayName = profile.full_name ?? profile.email ?? "Account";

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className={cn(
            "rounded-full outline-none transition-opacity hover:opacity-90",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <Avatar name={profile.full_name ?? profile.email} src={profile.avatar_url} size={36} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "glass z-50 min-w-56 rounded-[var(--radius)] border border-border-strong p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          <div className="flex flex-col px-2.5 py-2">
            <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
            {profile.email ? (
              <span className="truncate text-xs text-muted-foreground">{profile.email}</span>
            ) : null}
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item asChild className={itemClass}>
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={itemClass}>
            <Link href="/account">
              <User className="size-4" />
              Account
            </Link>
          </DropdownMenu.Item>

          {(role === "creator" || role === "admin") && (
            <DropdownMenu.Item asChild className={itemClass}>
              <Link href="/creator">
                <PenSquare className="size-4" />
                Creator studio
              </Link>
            </DropdownMenu.Item>
          )}
          {role === "admin" && (
            <DropdownMenu.Item asChild className={itemClass}>
              <Link href="/admin">
                <Shield className="size-4" />
                Admin
              </Link>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            onSelect={(e) => {
              e.preventDefault();
              void handleSignOut();
            }}
            disabled={signingOut}
            className={cn(
              itemClass,
              "text-danger focus:bg-danger/10 focus:text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger",
              "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            )}
          >
            <LogOut className="size-4" />
            {signingOut ? "Signing out…" : "Sign out"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
