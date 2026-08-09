import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/loopwork-concept",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
