"use client";

import * as React from "react";
import { Loader2, Send, EyeOff, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { setCourseStatus } from "@/app/creator/actions";
import type { Enums } from "@/lib/supabase/types";

export interface PublishControlsProps {
  courseId: string;
  status: Enums<"course_status">;
}

export function PublishControls({ courseId, status }: PublishControlsProps) {
  const [pending, setPending] = React.useState<Enums<"course_status"> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function change(next: Enums<"course_status">) {
    setError(null);
    setPending(next);
    try {
      const res = await setCourseStatus(courseId, next);
      if (res.error) setError(res.error);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <div className="flex flex-wrap items-center gap-2">
        {status !== "published" ? (
          <Button
            type="button"
            onClick={() => change("published")}
            disabled={pending !== null}
          >
            {pending === "published" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Publish
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => change("draft")}
            disabled={pending !== null}
          >
            {pending === "draft" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <EyeOff className="size-4" />
            )}
            Unpublish
          </Button>
        )}

        {status !== "archived" ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => change("archived")}
            disabled={pending !== null}
          >
            {pending === "archived" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Archive className="size-4" />
            )}
            Archive
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={() => change("draft")}
            disabled={pending !== null}
          >
            {pending === "draft" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <EyeOff className="size-4" />
            )}
            Restore to draft
          </Button>
        )}
      </div>
    </div>
  );
}
