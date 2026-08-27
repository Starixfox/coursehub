import type { NextConfig } from "next";

// basePath is leeg, want de site draait sinds 2026-08-21 op het eigen domein
// agora.midnightspaceconsultancy.com, aan de root.
//
// Wil je nog eens naar het oude subpad starixfox.github.io/loopwork-concept/
// bouwen, zet dan bij het bouwen NEXT_PUBLIC_BASE_PATH=/loopwork-concept.
// Zonder die variabele blijft de output rootgebaseerd.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  ...(basePath ? { basePath } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
