import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: false,
  },
  // Turbopack is the default in Next.js 16; Three.js chunks are handled automatically.
  // The empty turbopack key suppresses the "webpack config but no turbopack config" warning.
  turbopack: {},
};

export default nextConfig;
