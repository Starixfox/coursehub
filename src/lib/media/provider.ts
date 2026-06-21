/** Secure media abstraction. The app never embeds a raw, public video URL —
 *  playback tokens are minted server-side AFTER an entitlement check. */

export interface PlaybackToken {
  /** HLS manifest URL (signed when the provider requires it). */
  hlsUrl: string;
  /** Poster image, if available. */
  poster?: string;
  /** Seconds until the signed URL/token expires. */
  expiresIn: number;
  provider: "cloudflare" | "mock";
}

export interface DirectUpload {
  /** One-time upload URL the creator's browser PUTs the file to. */
  uploadUrl: string;
  /** The provider's asset id (stored on the lesson as cf_stream_uid). */
  uid: string;
}

export interface MediaProvider {
  readonly kind: "cloudflare" | "mock";
  /** Mint a (possibly signed) playback token. Call ONLY after access checks. */
  getPlaybackToken(streamUid: string): Promise<PlaybackToken>;
  /** Create a one-time direct-upload URL for a creator. */
  createDirectUpload(meta?: { maxDurationSeconds?: number }): Promise<DirectUpload>;
}
