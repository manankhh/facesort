import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google Photos base URLs
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "photos.google.com",
      },
      // Google user avatar photos
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
  // Expose only truly public env vars to the client bundle
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;
