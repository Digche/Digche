import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "172.20.10.3",
    "192.168.1.3",
  ],

   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "digche.s3.ir-thr-at1.arvanstorage.ir",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;