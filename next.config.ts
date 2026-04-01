import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Inline PostCSS config - most reliable for Hostinger
  // Ensures @tailwindcss/postcss is ALWAYS loaded
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },
};

export default nextConfig;
