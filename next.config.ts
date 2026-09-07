import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' https://*.supabase.co https://challenges.cloudflare.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' blob: data: https:; " +
              "font-src 'self' data:; " +
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com; " +
              "frame-src https://challenges.cloudflare.com; " +
              "worker-src 'self' blob:; " +
              "frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
