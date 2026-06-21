import * as React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

/**
 * Standalone auth shell: centered card, brand mark, no navbar/footer. Wraps
 * login / register / reset / reset-update.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
            aria-label="CourseHub home"
          >
            <GraduationCap className="size-7 text-accent" />
            <span className="text-xl font-semibold tracking-tight text-gradient">
              CourseHub
            </span>
          </Link>
        </div>

        <div className="glass rounded-[var(--radius)] border border-border-strong p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected by industry-standard encryption. By continuing you agree to
          our terms.
        </p>
      </div>
    </div>
  );
}
