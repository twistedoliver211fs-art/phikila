"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Shield, Smartphone, Monitor, Apple, Terminal, QrCode, Copy, Check, ExternalLink, Clock } from "lucide-react";

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

const RELEASE_URL = "https://github.com/twistedoliver211fs-art/phikila/releases/tag/v0.1.0";

const platforms = [
  {
    id: "android" as Platform,
    name: "Android",
    icon: Smartphone,
    available: true,
    builds: [
      { label: "Release APK", file: "phikila-v0.1.0-android-release.apk", size: "8.9 MB", checksum: "ba1caae5e3bc385696259c85b3c0a9b72beb24257976b764f27941259d57e86c" },
      { label: "Debug APK", file: "phikila-v0.1.0-android-debug.apk", size: "10.9 MB", checksum: "5e4f6c2f8824ffc0aafc6f1f675a1c5146a0b7df72af00412dbdbe5eec642485" },
    ],
    instructions: "Enable 'Install from unknown sources' in your Android settings, then open the APK.",
  },
  {
    id: "windows" as Platform,
    name: "Windows",
    icon: Monitor,
    available: true,
    builds: [
      { label: "Installer (.exe)", file: "phikila-v0.1.0-windows-x64.exe", size: "28.1 MB", checksum: "444efda76e2414cf92d2477426748b114c17bef20a6e9fb600b512dd7226714c" },
      { label: "MSI Installer", file: "phikila-v0.1.0-windows-x64.msi", size: "29.8 MB", checksum: "6def278c7f35f80f06cc0de64323fd1871e248a91615a7b14818144151e7b594" },
    ],
    instructions: "Run the installer. Windows SmartScreen may warn — click 'More info' → 'Run anyway'.",
  },
  {
    id: "linux" as Platform,
    name: "Linux",
    icon: Terminal,
    available: true,
    builds: [
      { label: "Debian/Ubuntu (.deb)", file: "phikila-v0.1.0-linux-x86_64.deb", size: "29.9 MB", checksum: "9d1a5d980218c4128a8e2f041d33d34c80be3ee4645941a8ab24716c5232c8bc" },
      { label: "AppImage (Portable)", file: "phikila-v0.1.0-linux-x86_64.AppImage", size: "101.2 MB", checksum: "4275e1cac345d2630993e72f132a1369c00d687323d58273478b5e6a9d411c68" },
    ],
    instructions: "DEB: sudo dpkg -i phikila.deb · AppImage: chmod +x && ./phikila.AppImage",
  },
  {
    id: "macos" as Platform,
    name: "macOS",
    icon: Apple,
    available: false,
    builds: [],
    instructions: "Coming soon. Use the PWA install option in the meantime.",
  },
  {
    id: "ios" as Platform,
    name: "iOS",
    icon: Smartphone,
    available: false,
    builds: [],
    instructions: "Coming soon. Use the PWA install option in the meantime.",
  },
];

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const primary = platforms.find((p) => p.id === platform && p.available);
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
          <span>September 2026</span>
          <span>·</span>
          <span>Omix Digital Solutions</span>
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
            {primary.builds.map((build, i) => (
              <a key={i} href={`${RELEASE_URL}/download/${build.file}`} download>
                <Button size="lg" className="text-base px-8">
                  <Download className="h-5 w-5 mr-2" />
                  {build.label} ({build.size})
                </Button>
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Self-signed · SHA-256 verified
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
            <h3 className="font-semibold text-foreground">PWA (Web App)</h3>
            <p className="text-sm text-muted-foreground mt-1">Install directly from your browser. No download needed.</p>
            <p className="text-sm text-muted-foreground mt-2">Click the install icon in your browser&apos;s address bar, or use the &apos;Get Started&apos; button on the landing page.</p>
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
            <div key={p.id} className={`rounded-xl border border-border bg-card p-6 ${!p.available ? "opacity-75" : ""}`}>
              <div className="flex items-center gap-3 mb-3">
                <p.icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                {!p.available && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{p.instructions}</p>

              {p.available && p.builds.length > 0 && (
                <>
                  <div className="flex flex-col gap-2 mb-3">
                    {p.builds.map((build, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <a href={`${RELEASE_URL}/download/${build.file}`} download>
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-1.5" />
                            {build.label}
                          </Button>
                        </a>
                        <span className="text-xs text-muted-foreground">{build.size}</span>
                        <a href={`${RELEASE_URL}/download/${build.file}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                  {p.builds.map((build, i) => (
                    <div key={i} className="mt-2 flex items-center gap-2">
                      <code className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                        SHA-256: {build.checksum.slice(0, 16)}...
                      </code>
                      <button
                        onClick={() => copyChecksum(build.checksum, `${p.id}-${i}`)}
                        className="shrink-0 p-1 hover:bg-muted rounded"
                      >
                        {copied === `${p.id}-${i}` ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                  ))}
                </>
              )}
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
            <p className="text-muted-foreground">Source Code</p>
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
              <li>Android APK (via GitHub Releases)</li>
              <li>Desktop apps for Windows and Linux (via GitHub Releases)</li>
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
