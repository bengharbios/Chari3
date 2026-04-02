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
  // CRITICAL: Inline PostCSS config ensures Tailwind CSS v4
  // is ALWAYS processed during production builds on Hostinger.
  // Without this, CSS variables and utility classes are not generated.
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },
};

export default nextConfig;
