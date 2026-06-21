"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { TIER_PLANS, PAID_TIERS } from "@/lib/entitlements";
import type { ActionState } from "@/app/creator/actions";
import type { Tables } from "@/lib/supabase/types";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const selectClass =
  "flex h-10 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-border-strong disabled:cursor-not-allowed disabled:opacity-50";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-danger">{message}</p>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}

export interface CourseFormProps {
  /** The server action bound to create or update. */
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  course?: Tables<"courses">;
  submitLabel?: string;
}

export function CourseForm({ action, course, submitLabel }: CourseFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  const isEdit = Boolean(course);

  // Track slug auto-fill: for a brand-new course we derive the slug from the
  // title until the user edits the slug field by hand.
  const [title, setTitle] = React.useState(course?.title ?? "");
  const [slug, setSlug] = React.useState(course?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(isEdit);

  React.useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      {state.ok ? <Alert variant="success">Changes saved.</Alert> : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={160}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(fieldErrors.title)}
          placeholder="e.g. Mastering TypeScript Generics"
        />
        <FieldError message={fieldErrors.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL slug</Label>
        <Input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          aria-invalid={Boolean(fieldErrors.slug)}
          aria-describedby="slug-hint"
          placeholder="mastering-typescript-generics"
        />
        <p id="slug-hint" className="text-xs text-muted">
          Lowercase letters, numbers and dashes only. Must be unique.
        </p>
        <FieldError message={fieldErrors.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          name="subtitle"
          maxLength={200}
          defaultValue={course?.subtitle ?? ""}
          aria-invalid={Boolean(fieldErrors.subtitle)}
          placeholder="A short, punchy one-liner"
        />
        <FieldError message={fieldErrors.subtitle} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          maxLength={8000}
          rows={6}
          defaultValue={course?.description ?? ""}
          aria-invalid={Boolean(fieldErrors.description)}
          placeholder="What will learners be able to do after this course?"
        />
        <FieldError message={fieldErrors.description} />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            maxLength={60}
            defaultValue={course?.category ?? ""}
            placeholder="Engineering"
          />
          <FieldError message={fieldErrors.category} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            name="level"
            defaultValue={course?.level ?? ""}
            className={selectClass}
          >
            <option value="">Unspecified</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.level} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requiredTier">Required tier</Label>
          <select
            id="requiredTier"
            name="requiredTier"
            defaultValue={course?.required_tier ?? "basic"}
            className={selectClass}
          >
            {PAID_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {TIER_PLANS[tier].name}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.requiredTier} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel ?? (isEdit ? "Save changes" : "Create course")} />
      </div>
    </form>
  );
}
