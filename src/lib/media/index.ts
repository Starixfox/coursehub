import "server-only";

import { serverEnv, isCloudflareConfigured } from "@/lib/env.server";
import type { MediaProvider } from "./provider";
import { mockProvider } from "./mock";
import { cloudflareProvider } from "./cloudflare";

/** Resolve the active media provider from env. Falls back to mock so the app
 *  (and its tests) run without a real video account. */
export function getMediaProvider(): MediaProvider {
  if (serverEnv.MEDIA_PROVIDER === "cloudflare" && isCloudflareConfigured) {
    return cloudflareProvider;
  }
  return mockProvider;
}

export type { MediaProvider, PlaybackToken, DirectUpload } from "./provider";
