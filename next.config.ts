import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['180.149.198.85'],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};

export default nextConfig;
