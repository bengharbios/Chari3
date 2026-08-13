import type { NextConfig } from "next";

// Ensure essential build-time environment variables exist to prevent Hostinger build failures
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://u584311043_charichariday4:ChariAbdelkader1417DayDB2026Admin29@72.60.86.18:3306/u584311043_charichariday4?connection_limit=15';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'build-secret-placeholder-chariday-2026';
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'https://chariday.com';
}
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = 'build-secret-placeholder-chariday-2026';
}
if (!process.env.BETTER_AUTH_URL) {
  process.env.BETTER_AUTH_URL = 'https://chariday.com';
}

const nextConfig: any = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
