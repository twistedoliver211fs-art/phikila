import type { Metadata } from "next";
import Link from "next/link";
import { Download, ExternalLink, FileDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformDownloads } from "@/components/download/platform-downloads";
import { QRCodeCard } from "@/components/download/qr-code";
import { CopyButton } from "@/components/download/copy-button";
import { VerifyDownload } from "@/components/download/verify-download";
import { DeferredMount } from "@/components/download/deferred-mount";
import {
  CHANGELOG,
  RELEASE,
  WEB_APP_URL,
} from "@/lib/releases";
import { CONTACTS } from "@/lib/contacts";

export const metadata: Metadata = {
  title: "Download Phikila — Android, Windows, Linux & Web App",
  description:
    "Install Phikila on any device: Android APK, Windows installer, Linux .deb or AppImage, or the installable PWA. Verified SHA-256 checksums for every build.",
  alternates: { canonical: "/download" },
  openGraph: {
    title: "Download Phikila",
    description:
      "Phikila for Android, Windows, Linux and the web. Verified downloads with SHA-256 checksums.",
    url: "/download",
    type: "website",
  },
};

const REPO_RELEASES_API =
  "https://api.github.com/repos/twistedoliver211fs-art/phikila/releases/latest";

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Download className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Download Phikila
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          One school OS, every device. Pick your platform below — Android,
          Windows, Linux, or install the web app right from your browser.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              v{RELEASE.version}
            </span>
          </span>
          <span>Released {RELEASE.releasedAt}</span>
          <span aria-hidden>·</span>
          <span>By {RELEASE.publisher.name}</span>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={WEB_APP_URL}>
            <Button size="lg" variant="glow" className="text-base">
              Open the Web App
            </Button>
          </a>
          <a
            href={RELEASE.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="text-base">
              <ExternalLink />
              View on GitHub
            </Button>
          </a>
        </div>
      </header>

      {/* ── Platform cards ─────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="platforms-heading">
        <h2 id="platforms-heading" className="sr-only">
          Downloads by platform
        </h2>
        <PlatformDownloads />
      </section>

      {/* ── QR code (deferred — below the fold) ─────────────────── */}
      <section className="mt-8" aria-label="Scan to download">
        <DeferredMount minHeight={130} label="Loading QR code">
          <QRCodeCard
            url="https://github.com/twistedoliver211fs-art/phikila/releases/download/v0.1.0/phikila-v0.1.0-android-debug.apk"
          />
        </DeferredMount>
      </section>

      {/* ── Verify download (deferred — interactive, below the fold) */}
      <div className="mt-8">
        <DeferredMount minHeight={300} label="Loading download verifier">
          <VerifyDownload />
        </DeferredMount>
      </div>

      {/* ── Manual checksum verification ────────────────────────── */}
      <section
        className="mt-8 rounded-xl border border-border bg-card p-6"
        aria-labelledby="verify-heading"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="min-w-0">
            <h2 id="verify-heading" className="font-semibold text-foreground">
              Verify manually (command line)
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Prefer the terminal? All release assets are hashed with SHA-256.
              Download{" "}
              <a
                href={RELEASE.checksums.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                SHA256SUMS.txt
              </a>{" "}
              and run:
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={RELEASE.checksums.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline">
                  <FileDown />
                  Download SHA256SUMS.txt
                </Button>
              </a>
              <code className="min-w-0 truncate rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
                sha256:{RELEASE.checksums.sha256.slice(0, 16)}…
              </code>
              <CopyButton
                value={RELEASE.checksums.sha256}
                label="Copy SHA256SUMS.txt checksum"
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Example:{" "}
              <code className="font-mono">
                sha256sum phikila-v{RELEASE.version}-android-debug.apk
              </code>{" "}
              then compare with the matching line in the file.
            </p>
          </div>
        </div>
      </section>

      {/* ── Publisher info ─────────────────────────────────────── */}
      <section
        className="mt-8 rounded-xl border border-border bg-card p-6"
        aria-labelledby="publisher-heading"
      >
        <h2 id="publisher-heading" className="text-lg font-semibold text-foreground">
          Publisher information
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Publisher</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {RELEASE.publisher.name}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Website</dt>
            <dd className="mt-0.5">
              <a
                href={CONTACTS.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                omixsystems.store
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Support &amp; security</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <a
                href={CONTACTS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                WhatsApp {CONTACTS.phoneInternational}
              </a>
              <a
                href={CONTACTS.mailto}
                className="font-medium text-primary hover:underline"
              >
                {CONTACTS.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Source code</dt>
            <dd className="mt-0.5">
              <a
                href={RELEASE.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                GitHub repository
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Latest releases</dt>
            <dd className="mt-0.5">
              <a
                href={RELEASE.latestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                github.com/releases/latest
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Privacy</dt>
            <dd className="mt-0.5">
              <Link
                href="/privacy"
                className="font-medium text-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </dd>
          </div>
        </dl>
      </section>

      {/* ── Changelog ──────────────────────────────────────────── */}
      <section
        className="mt-8 rounded-xl border border-border bg-card p-6"
        aria-labelledby="changelog-heading"
      >
        <h2 id="changelog-heading" className="text-lg font-semibold text-foreground">
          What&apos;s new
        </h2>
        <div className="mt-4 space-y-6">
          {CHANGELOG.map((entry) => (
            <div key={entry.version}>
              <div className="flex items-baseline gap-3">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  v{entry.version}
                </span>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {entry.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
          Release notes are also generated on each GitHub{" "}
          <a
            href={RELEASE.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            release page
          </a>
          .
        </p>
      </section>

      {/* ── Footer links ───────────────────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
        <a
          href={REPO_RELEASES_API}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          Releases API
        </a>
        <Link href="/docs" className="text-muted-foreground hover:text-foreground">
          Documentation
        </Link>
        <Link href="/security" className="text-muted-foreground hover:text-foreground">
          Security
        </Link>
      </div>
    </div>
  );
}
