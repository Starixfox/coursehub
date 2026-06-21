"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { PaidTier, Interval } from "@/lib/stripe/config";

interface CheckoutButtonProps {
  tier: PaidTier;
  interval: Interval;
  children?: React.ReactNode;
  variant?: ButtonProps["variant"];
  className?: string;
}

export function CheckoutButton({
  tier,
  interval,
  children,
  variant = "primary",
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setNote(null);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, interval }),
      });

      if (res.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }

      const data = (await res.json()) as
        | { url: string }
        | { mock: true; message: string }
        | { error: string };

      if ("mock" in data && data.mock) {
        setNote("Add Stripe keys to enable checkout");
        return;
      }
      if ("url" in data && data.url) {
        window.location.href = data.url;
        return;
      }
      setError("error" in data ? data.error : "Could not start checkout.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button variant={variant} onClick={startCheckout} disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {children ?? "Choose plan"}
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
