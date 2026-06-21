import * as React from "react";
import { cn } from "@/lib/utils";

export interface LessonContentProps {
  /**
   * Already-sanitized HTML. Content is sanitized with `sanitizeLessonHtml`
   * before it is STORED, so what RLS returns here is safe to render.
   */
  html: string | null;
  className?: string;
}

/**
 * Renders a lesson's rich text in a readable, prose-like container.
 * The HTML is trusted because it was sanitized at write time and RLS only
 * returns it to users who may access the lesson.
 */
export function LessonContent({ html, className }: LessonContentProps) {
  if (!html || html.trim() === "") {
    return (
      <p className={cn("text-sm text-muted", className)}>
        This lesson has no written notes.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "max-w-none text-[0.95rem] leading-relaxed text-muted",
        "[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-foreground",
        "[&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground",
        "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground",
        "[&_p]:my-4",
        "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary-hover",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5",
        "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5",
        "[&_li]:marker:text-muted-foreground",
        "[&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-4 [&_blockquote]:italic",
        "[&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-accent",
        "[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius-sm)] [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface [&_pre]:p-4 [&_pre]:text-sm",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground",
        "[&_img]:my-5 [&_img]:rounded-[var(--radius-sm)] [&_img]:border [&_img]:border-border",
        "[&_hr]:my-8 [&_hr]:border-border",
        className,
      )}
      // Content is sanitized at write time via sanitizeLessonHtml.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
