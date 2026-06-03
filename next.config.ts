import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sangsuratma.tech-bss.com',
      },
      {
        protocol: 'http',
        hostname: 'sangsuratma.tech-bss.com',
      }
    ],
  },
};

export default nextConfig;
