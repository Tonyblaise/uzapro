import type { NextConfig } from "next";

// cacheComponents is off: this demo is client-state only, and Activity-preserved hidden routes
// would keep drawers and forms mounted across navigation (see research R1 addendum).
const nextConfig: NextConfig = {
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
