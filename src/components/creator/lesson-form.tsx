"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Video, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { VideoUploader } from "@/components/media/video-uploader";
import { TIER_PLANS, PAID_TIERS } from "@/lib/entitlements";
import { updateLesson, setLessonVideo, type ActionState } from "@/app/creator/actions";
import type { Tables } from "@/lib/supabase/types";

const selectClass =
  "flex h-10 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-border-strong disabled:cursor-not-allowed disabled:opacity-50";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      Save lesson
    </Button>
  );
}

export interface LessonFormProps {
  courseId: string;
  lesson: Tables<"lessons">;
  content: Pick<Tables<"lesson_content">, "content_html" | "cf_stream_uid"> | null;
}

export function LessonForm({ courseId, lesson, content }: LessonFormProps) {
  const updateAction = updateLesson.bind(null, lesson.id, courseId);
  const [state, formAction] = useActionState<ActionState, FormData>(updateAction, {});

  // Track the attached video locally so the UI reflects an upload immediately.
  const [videoUid, setVideoUid] = React.useState<string | null>(content?.cf_stream_uid ?? null);
  const [videoError, setVideoError] = React.useState<string | null>(null);
  const [videoSaving, setVideoSaving] = React.useState(false);

  async function onUploaded(uid: string) {
    setVideoError(null);
    setVideoSaving(true);
    try {
      const res = await setLessonVideo(lesson.id, courseId, uid);
      if (res.error) {
        setVideoError(res.error);
      } else {
        setVideoUid(uid);
      }
    } finally {
      setVideoSaving(false);
    }
  }

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-6">
        {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
        {state.ok ? <Alert variant="success">Lesson saved.</Alert> : null}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            maxLength={160}
            defaultValue={lesson.title}
            aria-invalid={Boolean(fieldErrors.title)}
          />
          {fieldErrors.title ? (
            <p className="text-xs text-danger">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              type="number"
              min={0}
              defaultValue={lesson.position}
            />
            {fieldErrors.position ? (
              <p className="text-xs text-danger">{fieldErrors.position}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationSeconds">Duration (sec)</Label>
            <Input
              id="durationSeconds"
              name="durationSeconds"
              type="number"
              min={0}
              defaultValue={lesson.duration_seconds}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredTier">Required tier</Label>
            <select
              id="requiredTier"
              name="requiredTier"
              defaultValue={lesson.required_tier ?? ""}
              className={selectClass}
            >
              <option value="">Inherit from course</option>
              {PAID_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {TIER_PLANS[tier].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="isPreview"
            value="true"
            defaultChecked={lesson.is_preview}
            className="size-4 rounded border-border bg-surface accent-[var(--color-primary)]"
          />
          Free preview (anyone can watch this lesson)
        </label>

        <div className="space-y-2">
          <Label htmlFor="contentHtml">Lesson content (HTML)</Label>
          <Textarea
            id="contentHtml"
            name="contentHtml"
            rows={12}
            maxLength={100_000}
            defaultValue={content?.content_html ?? ""}
            aria-describedby="content-hint"
            className="font-mono text-xs"
            placeholder="<h2>Introduction</h2><p>Write your lesson here…</p>"
          />
          <p id="content-hint" className="text-xs text-muted">
            Rich HTML is supported. For your safety it is sanitized on the server before
            it is stored — scripts and unsafe attributes are stripped.
          </p>
          {fieldErrors.contentHtml ? (
            <p className="text-xs text-danger">{fieldErrors.contentHtml}</p>
          ) : null}
        </div>

        <SubmitButton />
      </form>

      <div className="space-y-3 border-t border-border pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Video className="size-4 text-accent" />
              Lesson video
            </h3>
            <p className="text-xs text-muted">
              Upload a video; it is attached to this lesson automatically.
            </p>
          </div>
          {videoUid ? (
            <Badge variant="success">
              <CheckCircle2 className="size-3" />
              Attached
            </Badge>
          ) : (
            <Badge>No video</Badge>
          )}
        </div>

        {videoError ? <Alert variant="danger">{videoError}</Alert> : null}
        {videoSaving ? (
          <p className="inline-flex items-center gap-2 text-xs text-muted">
            <Loader2 className="size-3.5 animate-spin" />
            Attaching video…
          </p>
        ) : null}

        <VideoUploader onUploaded={onUploaded} />

        {videoUid ? (
          <p className="break-all text-xs text-muted-foreground">
            Stream UID: <span className="font-mono">{videoUid}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
