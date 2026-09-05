import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            // Prevent clickjacking — the app is embedded in no iframes
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Stop MIME-type sniffing
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Strip referrer when navigating off-site
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Only allow secure HTTPS transport once the browser knows the site is HTTPS
          // (Vercel serves HTTPS at the edge; this header lives in the response so
          //  the browser enforces it for all future navigations to this origin.)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Allow images, script, style, font, and connect (Supabase realtime).
          // Reports violations to the browser console; intentionally strict.
          {
            // Next.js production builds pre-bundle everything — they do not
            // need eval. Leave it out so the browser blocks any at-runtime
            // eval() that might leak in via a compromised dependency.
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' https://*.supabase.co https://challenges.cloudflare.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' blob: data: https:; " +
              "font-src 'self' data:; " +
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co; " +
              "worker-src 'self' blob:; " +
              "frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

export default withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
