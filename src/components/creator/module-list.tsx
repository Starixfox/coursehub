"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Loader2, Trash2, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { LessonList } from "@/components/creator/lesson-list";
import {
  createModule,
  deleteModule,
  createLesson,
  type ActionState,
} from "@/app/creator/actions";
import { TIER_PLANS, PAID_TIERS } from "@/lib/entitlements";
import type { Tables } from "@/lib/supabase/types";

const selectClass =
  "flex h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-border-strong";

export interface ModuleWithLessons extends Tables<"modules"> {
  lessons: Tables<"lessons">[];
}

export interface ModuleListProps {
  courseId: string;
  modules: ModuleWithLessons[];
}

function PendingButton({
  children,
  size = "sm",
  variant,
}: {
  children: React.ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "outline" | "ghost";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size={size} variant={variant} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}

function AddModuleForm({ courseId }: { courseId: string }) {
  const boundAction = createModule.bind(null, courseId);
  const [state, formAction] = useActionState<ActionState, FormData>(boundAction, {});
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="new-module-title">New module title</Label>
          <Input
            id="new-module-title"
            name="title"
            required
            maxLength={160}
            placeholder="e.g. Getting started"
            aria-invalid={Boolean(state.fieldErrors?.title)}
          />
        </div>
        <PendingButton>
          <FolderPlus className="size-4" />
          Add module
        </PendingButton>
      </div>
      {state.fieldErrors?.title ? (
        <p className="text-xs text-danger">{state.fieldErrors.title}</p>
      ) : null}
    </form>
  );
}

function AddLessonForm({ moduleId, courseId }: { moduleId: string; courseId: string }) {
  const boundAction = createLesson.bind(null, moduleId, courseId);
  const [state, formAction] = useActionState<ActionState, FormData>(boundAction, {});
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.ok]);

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        Add lesson
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-[var(--radius-sm)] border border-border bg-surface p-3"
    >
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      <div className="space-y-1.5">
        <Label htmlFor={`lesson-title-${moduleId}`}>Lesson title</Label>
        <Input
          id={`lesson-title-${moduleId}`}
          name="title"
          required
          maxLength={160}
          placeholder="e.g. Why generics matter"
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state.fieldErrors?.title ? (
          <p className="text-xs text-danger">{state.fieldErrors.title}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor={`lesson-duration-${moduleId}`}>Duration (sec)</Label>
          <Input
            id={`lesson-duration-${moduleId}`}
            name="durationSeconds"
            type="number"
            min={0}
            defaultValue={0}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`lesson-tier-${moduleId}`}>Required tier</Label>
          <select
            id={`lesson-tier-${moduleId}`}
            name="requiredTier"
            defaultValue=""
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
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="isPreview"
              value="true"
              className="size-4 rounded border-border bg-surface accent-[var(--color-primary)]"
            />
            Free preview
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PendingButton>Add lesson</PendingButton>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DeleteModuleButton({
  moduleId,
  courseId,
  title,
}: {
  moduleId: string;
  courseId: string;
  title: string;
}) {
  const [pending, setPending] = React.useState(false);
  async function onClick() {
    if (
      !window.confirm(
        `Delete module "${title}" and all its lessons? This cannot be undone.`,
      )
    )
      return;
    setPending(true);
    try {
      await deleteModule(moduleId, courseId);
    } finally {
      setPending(false);
    }
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={onClick}
      aria-label={`Delete module ${title}`}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}

export function ModuleList({ courseId, modules }: ModuleListProps) {
  return (
    <div className="space-y-4">
      {modules.length === 0 ? (
        <p className="text-sm text-muted">
          No modules yet. Add your first module below to start building the curriculum.
        </p>
      ) : (
        <ol className="space-y-4">
          {modules.map((mod) => (
            <li key={mod.id}>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {mod.lessons.length}{" "}
                        {mod.lessons.length === 1 ? "lesson" : "lessons"} · position{" "}
                        {mod.position}
                      </p>
                    </div>
                    <DeleteModuleButton
                      moduleId={mod.id}
                      courseId={courseId}
                      title={mod.title}
                    />
                  </div>

                  <div className="rounded-[var(--radius-sm)] border border-border">
                    <LessonList courseId={courseId} lessons={mod.lessons} />
                  </div>

                  <AddLessonForm moduleId={mod.id} courseId={courseId} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}

      <Card>
        <CardContent className="p-4">
          <AddModuleForm courseId={courseId} />
        </CardContent>
      </Card>
    </div>
  );
}
