import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-[var(--radius)] border px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-foreground [&>svg]:text-accent",
        danger: "border-danger/30 bg-danger/10 text-foreground [&>svg]:text-danger",
        warning: "border-warning/30 bg-warning/10 text-foreground [&>svg]:text-warning",
        success: "border-success/30 bg-success/10 text-foreground [&>svg]:text-success",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const ALERT_ICON = {
  default: Info,
  danger: XCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, children, ...props }: AlertProps) {
  const Icon = ALERT_ICON[variant ?? "default"];
  return (
    <div role="alert" className={cn(alertVariants({ variant, className }))} {...props}>
      <Icon aria-hidden="true" />
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
    </div>
  );
}
