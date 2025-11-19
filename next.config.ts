import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "check-in-bucket-89067.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
