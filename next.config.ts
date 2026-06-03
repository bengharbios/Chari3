import type { NextConfig } from "next";

const nextConfig: any = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    cpus: 2,
    workerThreads: false,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
