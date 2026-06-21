import type { MediaProvider, PlaybackToken, DirectUpload } from "./provider";

/** A public test HLS stream so the player works end-to-end without a real
 *  video provider. Used when MEDIA_PROVIDER=mock (the default). */
const SAMPLE_HLS =
  "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8";

export const mockProvider: MediaProvider = {
  kind: "mock",
  async getPlaybackToken(streamUid: string): Promise<PlaybackToken> {
    void streamUid; // every mock asset resolves to the same sample stream
    return {
      hlsUrl: SAMPLE_HLS,
      expiresIn: 3600,
      provider: "mock",
    };
  },
  async createDirectUpload(): Promise<DirectUpload> {
    // No real upload in mock mode; return a placeholder uid the UI can store.
    const uid = `mock-${Math.abs(hashString(String(Date.now())))}`;
    return { uploadUrl: "https://example.invalid/mock-upload", uid };
  },
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}
