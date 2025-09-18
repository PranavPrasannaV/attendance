import type { NextConfig } from "next";

const apiHost = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).host
  : "localhost:8000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_API_URL?.startsWith("https") ? "https" : "http",
        hostname: apiHost.split(":")[0],
        port: apiHost.includes(":") ? apiHost.split(":")[1] : undefined,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
