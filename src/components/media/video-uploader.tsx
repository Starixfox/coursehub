"use client";

import * as React from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface VideoUploaderProps {
  /** Called with the provider asset id once the upload completes. */
  onUploaded: (uid: string) => void;
  /** Optional course context so the API can verify edit rights. */
  courseId?: string;
  className?: string;
}

interface UploadResponse {
  uploadUrl: string;
  uid: string;
}

type State =
  | { kind: "idle" }
  | { kind: "requesting" }
  | { kind: "uploading"; percent: number }
  | { kind: "done"; uid: string; mock: boolean }
  | { kind: "error"; message: string };

// Mock mode hands back a placeholder URL that can't actually receive a PUT.
function isMockUpload(url: string) {
  return url.includes("example.invalid") || url.startsWith("https://example.");
}

export function VideoUploader({
  onUploaded,
  courseId,
  className,
}: VideoUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [state, setState] = React.useState<State>({ kind: "idle" });

  async function handleFile(file: File) {
    setState({ kind: "requesting" });

    // 1. Ask our API for a one-time direct-upload URL.
    let ticket: UploadResponse;
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseId ? { courseId } : {}),
      });
      if (!res.ok) {
        const msg =
          res.status === 403
            ? "You don't have permission to upload here."
            : res.status === 429
              ? "Too many uploads. Please wait a moment."
              : "Could not start the upload.";
        setState({ kind: "error", message: msg });
        return;
      }
      ticket = (await res.json()) as UploadResponse;
    } catch {
      setState({ kind: "error", message: "Network error starting upload." });
      return;
    }

    // 2. Mock mode: nothing to PUT — just surface the placeholder uid.
    if (isMockUpload(ticket.uploadUrl)) {
      setState({ kind: "done", uid: ticket.uid, mock: true });
      onUploaded(ticket.uid);
      return;
    }

    // 3. Real mode: PUT the bytes straight to the provider with progress.
    try {
      await putWithProgress(ticket.uploadUrl, file, (percent) =>
        setState({ kind: "uploading", percent }),
      );
      setState({ kind: "done", uid: ticket.uid, mock: false });
      onUploaded(ticket.uid);
    } catch {
      setState({ kind: "error", message: "Upload failed. Please try again." });
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    // Allow re-selecting the same file later.
    e.target.value = "";
  }

  const busy = state.kind === "requesting" || state.kind === "uploading";

  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-dashed border-border-strong bg-surface/40 p-6",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onPick}
      />

      <div className="flex flex-col items-center gap-3 text-center">
        {state.kind === "done" ? (
          <CheckCircle2 className="size-8 text-success" />
        ) : state.kind === "error" ? (
          <AlertTriangle className="size-8 text-warning" />
        ) : busy ? (
          <Loader2 className="size-8 animate-spin text-accent" />
        ) : (
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-accent">
            <UploadCloud className="size-5" />
          </span>
        )}

        {state.kind === "idle" && (
          <>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Upload a lesson video
              </p>
              <p className="text-xs text-muted">MP4, MOV or WebM</p>
            </div>
            <Button size="sm" onClick={() => inputRef.current?.click()}>
              Choose file
            </Button>
          </>
        )}

        {state.kind === "requesting" && (
          <p className="text-sm text-muted">Preparing upload…</p>
        )}

        {state.kind === "uploading" && (
          <div className="w-full max-w-xs space-y-2">
            <p className="text-sm text-muted">
              Uploading… {state.percent}%
            </p>
            <Progress value={state.percent} />
          </div>
        )}

        {state.kind === "done" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Upload complete</p>
            {state.mock ? (
              <p className="text-xs text-muted">
                Mock mode — no file was stored. Saved placeholder id{" "}
                <code className="rounded bg-card px-1 py-0.5 text-[11px]">
                  {state.uid}
                </code>
                .
              </p>
            ) : null}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setState({ kind: "idle" });
                inputRef.current?.click();
              }}
            >
              Upload another
            </Button>
          </div>
        )}

        {state.kind === "error" && (
          <div className="space-y-2">
            <p className="text-sm text-muted">{state.message}</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setState({ kind: "idle" })}
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** PUT a file with upload progress via XHR (fetch lacks upload progress). */
function putWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}
