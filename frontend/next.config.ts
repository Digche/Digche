import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "172.20.10.3",
    "192.168.1.3",
  ],
};

export default nextConfig;