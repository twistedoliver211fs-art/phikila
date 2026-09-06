"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeCardProps {
  url: string;
}

/**
 * Renders a real, scannable QR code pointing at the given download URL
 * (the Android APK on GitHub Releases). Vector SVG so it stays crisp
 * at any size and requires no external image service.
 */
export function QRCodeCard({ url }: QRCodeCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <QRCodeSVG
            value={url}
            size={160}
            level="M"
            marginSize={2}
            aria-label={`QR code linking to ${url}`}
          />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-semibold text-foreground">
            Scan to install on Android
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Point your phone&apos;s camera at the code to download the APK
            directly, or open this page on your phone.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            On iPhone or iPad? Use the Web App instead — no install needed.
          </p>
        </div>
      </div>
    </div>
  );
}
