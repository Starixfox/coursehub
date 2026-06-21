"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { changeUserRole } from "@/app/admin/actions";

type Role = "admin" | "creator" | "subscriber";

const ROLES: Role[] = ["admin", "creator", "subscriber"];

/**
 * Inline role dropdown. Optimistic-ish: shows a spinner while the server action
 * runs, reverts the <select> value on failure, refreshes on success so the
 * audit-driven server state stays authoritative.
 */
export function RoleSelect({
  userId,
  role,
  disabled,
  disabledReason,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [value, setValue] = React.useState<Role>(role);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setValue(role);
  }, [role]);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Role;
    const prev = value;
    setValue(next);
    setError(null);
    setPending(true);
    try {
      const res = await changeUserRole(userId, next);
      if (!res.ok) {
        setValue(prev);
        setError(res.error);
      } else {
        router.refresh();
      }
    } catch {
      setValue(prev);
      setError("Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          aria-label="User role"
          value={value}
          onChange={onChange}
          disabled={disabled || pending}
          title={disabled ? disabledReason : undefined}
          className={cn(
            "h-8 cursor-pointer appearance-none rounded-[var(--radius-sm)] border border-border bg-surface px-3 pr-8 text-sm text-foreground capitalize transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {ROLES.map((r) => (
            <option key={r} value={r} className="capitalize">
              {r}
            </option>
          ))}
        </select>
        {pending ? (
          <Loader2 className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted" />
        ) : null}
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
