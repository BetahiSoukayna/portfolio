import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["172.27.64.1", "127.0.0.1", "localhost"],
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 heure au lieu de 60 secondes
    pagesBufferLength: 5,
  },
};

export default nextConfig;
