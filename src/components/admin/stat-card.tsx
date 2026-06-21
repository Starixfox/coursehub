import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Compact KPI tile for the analytics overview. `value` is pre-formatted by the
 * caller (e.g. "$1,240", "37") so this stays presentational.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("bg-card", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-primary/30 bg-primary/15 text-accent">
            <Icon className="size-5" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
