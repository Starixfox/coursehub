import "server-only";

import { serverEnv } from "@/lib/env.server";
import type { MediaProvider, PlaybackToken, DirectUpload } from "./provider";

const API = "https://api.cloudflare.com/client/v4";

function account() {
  const id = serverEnv.CLOUDFLARE_ACCOUNT_ID;
  const token = serverEnv.CLOUDFLARE_STREAM_API_TOKEN;
  if (!id || !token) {
    throw new Error(
      "Cloudflare Stream is selected but CLOUDFLARE_ACCOUNT_ID / " +
        "CLOUDFLARE_STREAM_API_TOKEN are missing.",
    );
  }
  return { id, token };
}

/**
 * Cloudflare Stream adapter. Videos are uploaded as "require signed URLs", so
 * playback is only possible with a short-lived signed token minted here AFTER
 * the caller has verified entitlement. Content cannot be hot-linked or scraped.
 */
export const cloudflareProvider: MediaProvider = {
  kind: "cloudflare",

  async getPlaybackToken(streamUid: string): Promise<PlaybackToken> {
    const { id, token } = account();
    const expiresIn = 3600;
    const res = await fetch(`${API}/accounts/${id}/stream/${streamUid}/token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        downloadable: false,
      }),
    });
    if (!res.ok) {
      throw new Error(`Cloudflare token mint failed (${res.status})`);
    }
    const json = (await res.json()) as { result?: { token?: string } };
    const signed = json.result?.token;
    if (!signed) throw new Error("Cloudflare returned no signed token");

    return {
      hlsUrl: `https://customer-stream.cloudflarestream.com/${signed}/manifest/video.m3u8`,
      poster: `https://customer-stream.cloudflarestream.com/${signed}/thumbnails/thumbnail.jpg`,
      expiresIn,
      provider: "cloudflare",
    };
  },

  async createDirectUpload(meta): Promise<DirectUpload> {
    const { id, token } = account();
    const res = await fetch(`${API}/accounts/${id}/stream/direct_upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds: meta?.maxDurationSeconds ?? 3600,
        requireSignedURLs: true,
      }),
    });
    if (!res.ok) throw new Error(`Cloudflare direct_upload failed (${res.status})`);
    const json = (await res.json()) as {
      result?: { uploadURL?: string; uid?: string };
    };
    const uploadUrl = json.result?.uploadURL;
    const uid = json.result?.uid;
    if (!uploadUrl || !uid) throw new Error("Cloudflare returned no upload URL");
    return { uploadUrl, uid };
  },
};
