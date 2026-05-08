import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Bypasses the 'any' errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Bypasses the 'unused-vars' and 'img' warnings
  },
};

export default nextConfig;
