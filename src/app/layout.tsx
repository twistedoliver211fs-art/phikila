import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Phikila — The School Management Platform",
  description:
    "Run your school with clarity. Administration, academics, attendance, finance, admissions, communication and intelligent scheduling in one platform.",
  other: {
    "google-site-verification": "googled3a1c2771becc781.html",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Phikila",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom must stay enabled for accessibility (WCAG 1.4.4).
  // Layout is responsive; zooming is safe.
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/app-icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Phikila" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
