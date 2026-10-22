import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * `npm run assets` already produces right-sized WebP with inline blur
     * previews, so there is nothing left for an optimizer to do. Skipping
     * it keeps the image-transformation quota untouched and serves the
     * files straight from the CDN.
     */
    unoptimized: true,
  },
};

export default nextConfig;
