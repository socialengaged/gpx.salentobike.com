import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/install', destination: '/', permanent: true },
      { source: '/accesso', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;
