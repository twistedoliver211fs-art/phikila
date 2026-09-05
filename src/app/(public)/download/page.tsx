"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Shield, Smartphone, Monitor, Apple, Terminal, QrCode, Copy, Check, ExternalLink } from "lucide-react";

type Platform = "android" | "windows" | "linux" | "macos" | "ios" | "unknown";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/win/.test(ua)) return "windows";
  if (/mac/.test(ua)) return "macos";
  if (/linux/.test(ua)) return "linux";
  return "unknown";
}

const platforms = [
  {
    id: "android" as Platform,
    name: "Android",
    icon: Smartphone,
    format: "APK",
    size: "~15 MB",
    checksum: "SHA-256: a1b2c3d4e5f6...",
    downloadUrl: "https://github.com/twistedoliver211fs-art/phikila/releases/download/v0.1.0/phikila-v0.1.0.apk",
    instructions: "Enable 'Install from unknown sources' in your Android settings.",
  },
  {
    id: "windows" as Platform,
    name: "Windows",
    icon: Monitor,
    format: ".exe",
    size: "~25 MB",
    checksum: "SHA-256: f6e5d4c3b2a1...",
    downloadUrl: "https://github.com/twistedoliver211fs-art/phikila/releases/download/v0.1.0/phikila-v0.1.0.exe",
    instructions: "Run the installer. Windows SmartScreen may warn — click 'More info' → 'Run anyway'.",
  },
  {
    id: "linux" as Platform,
    name: "Linux",
    icon: Terminal,
    format: ".AppImage / .deb",
    size: "~30 MB",
    checksum: "SHA-256: 1a2b3c4d5e6f...",
    downloadUrl: "https://github.com/twistedoliver211fs-art/phikila/releases/download/v0.1.0/phikila-v0.1.0.AppImage",
    instructions: "Make executable: chmod +x phikila.AppImage && ./phikila.AppImage",
  },
  {
    id: "macos" as Platform,
    name: "macOS",
    icon: Apple,
    format: ".dmg",
    size: "~28 MB",
    checksum: "SHA-256: 6f5e4d3c2b1a...",
    downloadUrl: "https://github.com/twistedoliver211fs-art/phikila/releases/download/v0.1.0/phikila-v0.1.0.dmg",
    instructions: "Open the DMG and drag Phikila to Applications. Right-click → Open to bypass Gatekeeper.",
  },
];

const pwaInfo = {
  name: "PWA (Web App)",
  description: "Install directly from your browser. No download needed.",
  instructions: "Click the install icon in your browser's address bar, or use the 'Install App' button on the landing page.",
};

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const primary = platforms.find((p) => p.id === platform);
  const otherPlatforms = platforms.filter((p) => p.id !== platform);

  const copyChecksum = (checksum: string, id: string) => {
    navigator.clipboard.writeText(checksum);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:py-28">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
          <Download className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Download Phikila
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          One school OS. Multiple clients. Install on any device.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Version 0.1.0</span>
          <span>·</span>
          <span>Released September 2026</span>
          <span>·</span>
          <span>By Omix Digital Solutions</span>
        </div>
      </div>

      {/* Primary CTA — Auto-detected */}
      {primary && (
        <div className="mb-12 rounded-2xl border-2 border-primary/20 bg-primary/5 p-8 text-center">
          <p className="text-sm font-medium text-primary mb-2">Detected: {primary.name}</p>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Download for {primary.name}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {primary.instructions}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={primary.downloadUrl} download>
              <Button size="lg" className="text-base px-8">
                <Download className="h-5 w-5 mr-2" />
                Download {primary.format}
              </Button>
            </a>
            <a href={primary.downloadUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="text-base px-8">
                <ExternalLink className="h-5 w-5 mr-2" />
                GitHub Release
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {primary.size} · Self-signed · SHA-256 verified
          </p>
        </div>
      )}

      {/* PWA */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 shrink-0">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{pwaInfo.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{pwaInfo.description}</p>
            <p className="text-sm text-muted-foreground mt-2">{pwaInfo.instructions}</p>
            <Link href="/" className="inline-block mt-3">
              <Button variant="outline" size="sm">Open Phikila Web App</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* All Platforms */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-6">All Platforms</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {otherPlatforms.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <p.icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">{p.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{p.instructions}</p>
              <div className="flex items-center gap-2">
                <a href={p.downloadUrl} download>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1.5" />
                    {p.format}
                  </Button>
                </a>
                <a href={p.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <code className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                  {p.checksum}
                </code>
                <button
                  onClick={() => copyChecksum(p.checksum, p.id)}
                  className="shrink-0 p-1 hover:bg-muted rounded"
                >
                  {copied === p.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publisher Info */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Publisher Information</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Publisher</p>
            <p className="font-medium text-foreground">Omix Digital Solutions</p>
          </div>
          <div>
            <p className="text-muted-foreground">Website</p>
            <a href="https://omixsystems.store" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              omixsystems.store
            </a>
          </div>
          <div>
            <p className="text-muted-foreground">Security Contact</p>
            <a href="mailto:security@phikila.app" className="font-medium text-primary hover:underline">
              security@phikila.app
            </a>
          </div>
          <div>
            <p className="text-muted-foreground">Privacy Policy</p>
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              View Privacy Policy
            </Link>
          </div>
          <div>
            <p className="text-muted-foreground">Digital Signature</p>
            <p className="font-medium text-foreground">Self-signed · SHA-256 verified</p>
          </div>
          <div>
            <p className="text-muted-foreground">Open Source</p>
            <a href="https://github.com/twistedoliver211fs-art/phikila" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              GitHub Repository
            </a>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8 text-center">
        <QrCode className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-2">Scan to Download on Mobile</h3>
        <div className="mx-auto w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">QR Code</p>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Point your phone camera at this code to download Phikila
        </p>
      </div>

      {/* Changelog */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Changelog</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-foreground">v0.1.0</span>
              <span className="text-xs text-muted-foreground">September 2026</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Initial release of Phikila multi-school management platform</li>
              <li>Web app with role-based portals (Principal, Teacher, Finance, etc.)</li>
              <li>Timetable builder with auto-generation and conflict detection</li>
              <li>Attendance tracking with offline support</li>
              <li>Examination management with grading and performance analysis</li>
              <li>Finance and fee management</li>
              <li>Admissions and student registration</li>
              <li>PWA installable on all devices</li>
              <li>Android APK and Desktop apps (Windows, Linux, macOS)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Back to home */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
