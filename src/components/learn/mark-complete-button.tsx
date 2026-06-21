"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, CircleCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markComplete } from "@/app/learn/actions";
import { cn } from "@/lib/utils";

export interface MarkCompleteButtonProps {
  lessonId: string;
  courseId: string;
  completed: boolean;
  className?: string;
}

export function MarkCompleteButton({
  lessonId,
  courseId,
  completed,
  className,
}: MarkCompleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  // Optimistic local view; resets if the server re-renders with new props.
  const [optimisticDone, setOptimisticDone] = React.useState(completed);

  React.useEffect(() => {
    setOptimisticDone(completed);
  }, [completed]);

  function handleClick() {
    if (optimisticDone || isPending) return;
    setOptimisticDone(true);
    startTransition(async () => {
      const result = await markComplete(lessonId, courseId);
      if (!result.ok) {
        setOptimisticDone(false);
        return;
      }
      router.refresh();
    });
  }

  if (optimisticDone) {
    return (
      <Button
        type="button"
        variant="secondary"
        disabled
        className={cn("text-success", className)}
      >
        <CircleCheck className="size-4" />
        Completed
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="primary"
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Check className="size-4" />
      )}
      Mark complete
    </Button>
  );
}
