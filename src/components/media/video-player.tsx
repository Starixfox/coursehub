"use client";

import * as React from "react";
import Hls from "hls.js";
import { Lock, Loader2, AlertTriangle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "@/components/site/upgrade-dialog";

export interface VideoPlayerProps {
  lessonId: string;
  /** Render the lock overlay immediately, before any token request. */
  locked?: boolean;
  poster?: string;
  className?: string;
}

interface TokenResponse {
  hlsUrl: string;
  poster: string | null;
  expiresIn: number;
  provider: "cloudflare" | "mock";
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; token: TokenResponse }
  | { kind: "locked" }
  | { kind: "error"; message: string };

export function VideoPlayer({
  lessonId,
  locked = false,
  poster,
  className,
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [state, setState] = React.useState<State>(
    locked ? { kind: "locked" } : { kind: "idle" },
  );

  const load = React.useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/media/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      if (res.status === 403) {
        setState({ kind: "locked" });
        return;
      }
      if (!res.ok) {
        setState({ kind: "error", message: "This video could not be loaded." });
        return;
      }

      const token = (await res.json()) as TokenResponse;
      setState({ kind: "ready", token });
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  }, [lessonId]);

  // Attach the HLS stream once we have a token and a <video> element.
  React.useEffect(() => {
    if (state.kind !== "ready") return;
    const video = videoRef.current;
    if (!video) return;

    const { hlsUrl } = state.token;
    let hls: Hls | null = null;

    // Safari (and a few others) play HLS natively; prefer that path.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          setState({
            kind: "error",
            message: "Playback error. Please try again.",
          });
        }
      });
    } else {
      // Last resort — let the browser try directly.
      video.src = hlsUrl;
    }

    return () => {
      hls?.destroy();
    };
  }, [state]);

  const frame =
    "relative aspect-video w-full overflow-hidden rounded-[var(--radius)] border border-border bg-black";

  // Locked: never even request a token. Offer an upgrade path.
  if (state.kind === "locked") {
    return (
      <div className={cn(frame, className)}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-30"
          />
        ) : null}
        <div className="absolute inset-0 grid place-items-center bg-black/60 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-accent">
              <Lock className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                This lesson is locked
              </p>
              <p className="text-sm text-muted">
                Upgrade your plan to watch the full video.
              </p>
            </div>
            <UpgradeDialog requiredTier="pro">
              <Button size="sm">Upgrade to watch</Button>
            </UpgradeDialog>
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === "idle") {
    return (
      <div className={cn(frame, className)}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : null}
        <button
          type="button"
          onClick={load}
          className="group absolute inset-0 grid place-items-center bg-black/40 transition-colors hover:bg-black/55"
          aria-label="Play video"
        >
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_24px_-8px_rgba(124,108,246,0.7)] transition-transform group-hover:scale-105">
            <Play className="size-6 translate-x-0.5 fill-current" />
          </span>
        </button>
      </div>
    );
  }

  if (state.kind === "loading") {
    return (
      <div className={cn(frame, "grid place-items-center", className)}>
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className={cn(frame, "grid place-items-center p-6", className)}>
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="size-6 text-warning" />
          <p className="text-sm text-muted">{state.message}</p>
          <Button size="sm" variant="secondary" onClick={load}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // ready
  return (
    <div className={cn(frame, className)}>
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        poster={state.token.poster ?? poster}
        className="size-full bg-black"
      />
    </div>
  );
}
