"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { resendVerification, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

/** Resend-verification control. Wraps the `resendVerification` server action
 *  and shows its success/error feedback inline. */
export function ResendVerificationButton() {
  const [pending, startTransition] = React.useTransition();
  const [state, setState] = React.useState<AuthActionState>({});

  function onClick() {
    setState({});
    startTransition(async () => {
      const result = await resendVerification();
      setState(result);
    });
  }

  return (
    <div className="space-y-3">
      {state.message ? <Alert variant="success">{state.message}</Alert> : null}
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      <Button onClick={onClick} disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        Resend verification email
      </Button>
    </div>
  );
}
