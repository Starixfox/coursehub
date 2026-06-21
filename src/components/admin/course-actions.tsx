"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { setCoursePublish, deleteCourse } from "@/app/admin/actions";

/**
 * Publish/unpublish toggle + destructive delete (behind a confirm dialog) for a
 * single course row. Server actions re-check admin + ownership-override.
 */
export function CourseActions({
  courseId,
  published,
  title,
}: {
  courseId: string;
  published: boolean;
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function togglePublish() {
    setError(null);
    startTransition(async () => {
      const res = await setCoursePublish(courseId, !published);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteCourse(courseId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      <Button
        variant="secondary"
        size="sm"
        onClick={togglePublish}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="animate-spin" />
        ) : published ? (
          <EyeOff />
        ) : (
          <Eye />
        )}
        {published ? "Unpublish" : "Publish"}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="danger" size="sm" disabled={pending}>
            <Trash2 />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete course</DialogTitle>
            <DialogDescription>
              This permanently deletes “{title}” and its modules, lessons and
              content. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              disabled={pending}
            >
              {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
