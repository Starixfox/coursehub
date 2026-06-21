"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, ShieldCheck, ShieldPlus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface EnrollData {
  factorId: string;
  qrCode: string; // SVG data URL
  secret: string; // manual-entry key
}

export interface MfaSetupProps {
  className?: string;
}

/**
 * TOTP (authenticator-app) enrollment scaffold. Drives the Supabase MFA API
 * end-to-end: enroll → render QR/secret → challenge → verify. Imported by the
 * account page. Intentionally self-contained (no server action needed; the
 * browser client carries the user session).
 */
export function MfaSetup({ className }: MfaSetupProps) {
  const supabase = React.useMemo(() => createClient(), []);

  const [enrollment, setEnrollment] = React.useState<EnrollData | null>(null);
  const [verifiedFactor, setVerifiedFactor] = React.useState<string | null>(
    null,
  );
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(true);

  // On mount, detect whether a verified TOTP factor already exists.
  React.useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (!active) return;
      if (!listError) {
        const totp = data?.totp?.find((f) => f.status === "verified");
        if (totp) setVerifiedFactor(totp.id);
      }
      setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function startEnrollment() {
    setError(null);
    setBusy(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `CourseHub ${new Date().toISOString().slice(0, 10)}`,
    });
    setBusy(false);
    if (enrollError || !data) {
      setError("Couldn't start MFA setup. Please try again.");
      return;
    }
    setEnrollment({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollment) return;
    setError(null);
    setBusy(true);

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: enrollment.factorId });
    if (challengeError || !challenge) {
      setBusy(false);
      setError("Couldn't reach the verification service. Try again.");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollment.factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    setBusy(false);

    if (verifyError) {
      setError("That code didn't match. Check your authenticator and retry.");
      return;
    }
    setVerifiedFactor(enrollment.factorId);
    setEnrollment(null);
    setCode("");
  }

  async function cancelEnrollment() {
    if (enrollment) {
      // Unenroll the unverified factor so it doesn't linger.
      await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId });
    }
    setEnrollment(null);
    setCode("");
    setError(null);
  }

  async function disableMfa() {
    if (!verifiedFactor) return;
    setBusy(true);
    setError(null);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId: verifiedFactor,
    });
    setBusy(false);
    if (unenrollError) {
      setError("Couldn't disable MFA. Please try again.");
      return;
    }
    setVerifiedFactor(null);
  }

  if (checking) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted",
          className,
        )}
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Checking MFA status…
      </div>
    );
  }

  // Already protected.
  if (verifiedFactor) {
    return (
      <div className={cn("space-y-4", className)}>
        <Alert variant="success">
          <span className="font-medium">Two-factor authentication is on.</span>{" "}
          You'll be asked for a code from your authenticator app when you sign
          in.
        </Alert>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <Button variant="danger" onClick={disableMfa} disabled={busy}>
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-4" aria-hidden="true" />
          )}
          Disable two-factor
        </Button>
      </div>
    );
  }

  // Mid-enrollment: show QR + secret + verification code field.
  if (enrollment) {
    return (
      <form onSubmit={verifyCode} className={cn("space-y-4", className)}>
        <p className="text-sm text-muted">
          Scan this QR code with an authenticator app (Google Authenticator,
          1Password, Authy), then enter the 6-digit code it shows.
        </p>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="rounded-[var(--radius)] border border-border bg-white p-2">
            {/* Supabase returns an SVG data URL for the QR code. */}
            <Image
              src={enrollment.qrCode}
              alt="MFA QR code"
              width={160}
              height={160}
              unoptimized
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Or enter this key manually:
            </p>
            <code className="block break-all rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1 text-xs text-foreground">
              {enrollment.secret}
            </code>
          </div>
        </div>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <div>
          <Label htmlFor="mfa-code">Verification code</Label>
          <Input
            id="mfa-code"
            name="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="mt-1.5 max-w-40 tracking-[0.3em]"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={busy || code.length < 6}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="size-4" aria-hidden="true" />
            )}
            Verify & enable
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={cancelEnrollment}
            disabled={busy}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  // Idle: offer to set up MFA.
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-sm text-muted">
        Add an extra layer of security. After enabling, you'll enter a code
        from your authenticator app each time you sign in.
      </p>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Button onClick={startEnrollment} disabled={busy}>
        {busy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ShieldPlus className="size-4" aria-hidden="true" />
        )}
        Set up two-factor
      </Button>
    </div>
  );
}
