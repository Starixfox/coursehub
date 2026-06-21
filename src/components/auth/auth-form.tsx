"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Mail } from "lucide-react";
import {
  signIn,
  signUp,
  requestPasswordReset,
  updatePassword,
  signInWithMagicLink,
  type AuthActionState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Mode = "login" | "register" | "reset" | "update";

export interface AuthFormProps {
  mode: Mode;
  /** Same-origin path to return to after auth. Forwarded to the action. */
  next?: string;
  className?: string;
}

const ACTION: Record<
  Mode,
  (prev: AuthActionState, fd: FormData) => Promise<AuthActionState>
> = {
  login: signIn,
  register: signUp,
  reset: requestPasswordReset,
  update: updatePassword,
};

const SUBMIT_LABEL: Record<Mode, string> = {
  login: "Sign in",
  register: "Create account",
  reset: "Send reset link",
  update: "Update password",
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-danger" role="alert">
      {errors[0]}
    </p>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Working…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

function MagicLinkButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Mail className="size-4" aria-hidden="true" />
      )}
      Email me a sign-in link
    </Button>
  );
}

export function AuthForm({ mode, next, className }: AuthFormProps) {
  const [state, formAction] = useActionState<AuthActionState, FormData>(
    ACTION[mode],
    {},
  );
  const [magicState, magicAction] = useActionState<AuthActionState, FormData>(
    signInWithMagicLink,
    {},
  );

  const fieldErrors = state.fieldErrors ?? {};
  const showName = mode === "register";
  const showEmail = mode !== "update";
  const showPassword = mode === "login" || mode === "register" || mode === "update";

  return (
    <div className={cn("space-y-4", className)}>
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      {state.message ? <Alert variant="success">{state.message}</Alert> : null}

      <form action={formAction} className="space-y-4" noValidate>
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {showName ? (
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="Ada Lovelace"
              className="mt-1.5"
              aria-invalid={Boolean(fieldErrors.fullName)}
            />
            <FieldError errors={fieldErrors.fullName} />
          </div>
        ) : null}

        {showEmail ? (
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="mt-1.5"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            <FieldError errors={fieldErrors.email} />
          </div>
        ) : null}

        {showPassword ? (
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">
                {mode === "update" ? "New password" : "Password"}
              </Label>
              {mode === "login" ? (
                <a
                  href="/reset"
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Forgot?
                </a>
              ) : null}
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              placeholder="••••••••••"
              className="mt-1.5"
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {mode !== "login" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                At least 10 characters.
              </p>
            ) : null}
            <FieldError errors={fieldErrors.password} />
          </div>
        ) : null}

        <SubmitButton label={SUBMIT_LABEL[mode]} />
      </form>

      {/* Magic-link alternative, only on the login screen. */}
      {mode === "login" ? (
        <>
          <div className="relative py-1 text-center">
            <span className="relative z-10 bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
              or
            </span>
            <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
          </div>

          {magicState.error ? (
            <Alert variant="danger">{magicState.error}</Alert>
          ) : null}
          {magicState.message ? (
            <Alert variant="success">{magicState.message}</Alert>
          ) : null}

          <form action={magicAction} className="space-y-3" noValidate>
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <div>
              <Label htmlFor="magic-email" className="sr-only">
                Email for sign-in link
              </Label>
              <Input
                id="magic-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                aria-invalid={Boolean(magicState.fieldErrors?.email)}
              />
              <FieldError errors={magicState.fieldErrors?.email} />
            </div>
            <MagicLinkButton />
          </form>
        </>
      ) : null}
    </div>
  );
}
