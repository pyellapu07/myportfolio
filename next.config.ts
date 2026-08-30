import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Next 15.3+ only honours `quality` values listed here; anything else
     * silently falls back to 75. The case study figures ask for 90, which
     * matters because they are dense UI screenshots where WebP ringing shows
     * up on 1px hairlines and small type.
     */
    qualities: [75, 90],
  },
};

export default nextConfig;
