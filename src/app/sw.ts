import {
  Serwist,
  NetworkFirst,
  NetworkOnly,
  CacheFirst,
  ExpirationPlugin,
  type RuntimeCaching,
} from "serwist";

declare global {
  interface Window {
    __SW_MANIFEST: (string | { url: string; revision?: string | null })[] | undefined;
  }
}

const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: /^https:\/\/.*\.supabase\.co\/.*/i,
    handler: new NetworkFirst({
      cacheName: "supabase-cache",
      plugins: [
        new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 3600 }),
      ],
    }),
  },
  {
    matcher: /\/api\/.*/i,
    handler: new NetworkOnly(),
  },
  {
    matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
    handler: new CacheFirst({
      cacheName: "images",
      plugins: [
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      ],
    }),
  },
  {
    matcher: /\/_next\/static\/.*/i,
    handler: new CacheFirst({
      cacheName: "next-static",
      plugins: [
        new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 }),
      ],
    }),
  },
  {
    matcher: /^https:\/\/challenges\.cloudflare\.com\/.*/i,
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
  runtimeCaching,
});

serwist.addEventListeners();
