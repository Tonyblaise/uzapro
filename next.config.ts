import type { NextConfig } from "next";

// cacheComponents is off: this demo is client-state only, and Activity-preserved hidden routes
// would keep drawers and forms mounted across navigation (see research R1 addendum).
// STATIC_EXPORT=1 builds a static site into ./out for the Cloudflare Worker (npm run deploy).
// Tests and local dev keep the normal server build.
const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
