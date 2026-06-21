"use client";

import * as React from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ManageSubscriptionButtonProps {
  children?: React.ReactNode;
  variant?: ButtonProps["variant"];
  className?: string;
}

export function ManageSubscriptionButton({
  children,
  variant = "secondary",
  className,
}: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setNote(null);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });

      if (res.status === 401) {
        window.location.href = "/login?next=/account";
        return;
      }

      const data = (await res.json()) as
        | { url: string }
        | { mock: true; message: string }
        | { error: string };

      if ("mock" in data && data.mock) {
        setNote("Add Stripe keys to manage billing");
        return;
      }
      if ("url" in data && data.url) {
        window.location.href = data.url;
        return;
      }
      setError("error" in data ? data.error : "Could not open the billing portal.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button variant={variant} onClick={openPortal} disabled={loading}>
        {loading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard aria-hidden="true" />
        )}
        {children ?? "Manage subscription"}
      </Button>
      {note ? (
        <Alert variant="default" className="text-xs">
          {note}
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="danger" className="text-xs">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}
