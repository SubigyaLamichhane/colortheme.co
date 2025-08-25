import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // We'll use static + ISR for hubs; individual palette pages will be noindex later
};

export default nextConfig;
