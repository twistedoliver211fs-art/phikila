"use client";

import { useEffect, useState } from "react";
import {
  Apple,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  FileCheck2,
  Globe,
  Info,
  Monitor,
  ShieldCheck,
  Smartphone,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./copy-button";
import {
  PLATFORMS,
  detectPlatform,
  isApplePlatform,
  type DownloadAsset,
  type PlatformDownload,
} from "@/lib/releases";

const ICONS = {
  smartphone: Smartphone,
  monitor: Monitor,
  terminal: Terminal,
  globe: Globe,
} as const;

function AssetRow({ asset }: { asset: DownloadAsset }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-3 first:border-t-0 first:pt-0">
      <a href={asset.url} download className="shrink-0">
        <Button size="sm">
          <Download data-icon="inline-start" />
          {asset.label}
          <span className="ml-1.5 font-normal text-primary-foreground/70">
            {asset.size}
          </span>
        </Button>
      </a>
      <a
        href={asset.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Direct link
        <ExternalLink className="h-3 w-3" />
      </a>
      <div className="ml-auto flex min-w-0 items-center gap-1.5">
        <code className="min-w-0 truncate rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
          sha256:{asset.sha256.slice(0, 16)}…
        </code>
        <CopyButton
          value={asset.sha256}
          label="Copy full SHA-256 checksum"
        />
      </div>
      {asset.note ? (
        <p className="w-full text-xs text-muted-foreground">{asset.note}</p>
      ) : null}
    </div>
  );
}

function PlatformCard({
  platform,
  isRecommended,
}: {
  platform: PlatformDownload;
  isRecommended: boolean;
}) {
  const [expanded, setExpanded] = useState(isRecommended);
  const Icon = ICONS[platform.icon];

  return (
    <div
      className={
        isRecommended
          ? "rounded-xl border-2 border-primary/40 bg-card shadow-lg shadow-primary/5"
          : "rounded-xl border border-border bg-card"
      }
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <span
          className={
            isRecommended
              ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10"
              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted"
          }
        >
          <Icon className={isRecommended ? "h-5 w-5 text-primary" : "h-5 w-5 text-muted-foreground"} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{platform.name}</span>
            {isRecommended ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                Detected
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {platform.tagline} · {platform.requirements}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded ? (
        <div className="space-y-4 px-5 pb-5">
          {platform.assets.length > 0 ? (
            <div className="space-y-3">
              {platform.assets.map((asset) => (
                <AssetRow key={asset.id} asset={asset} />
              ))}
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Install steps
            </p>
            <ol className="mt-2 space-y-1.5">
              {platform.installSteps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {platform.hint ? (
            <p className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {platform.hint}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Renders one card per platform. The visitor's detected platform is
 * expanded and highlighted by default; everything else stays collapsed.
 * Falls back to all-collapsed when the OS can't be determined.
 */
export function PlatformDownloads() {
  const [detected, setDetected] = useState<PlatformDownload["id"] | null>(null);
  const [appleUser, setAppleUser] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setDetected(detectPlatform(ua));
    setAppleUser(isApplePlatform(ua));
  }, []);

  const ordered = detected
    ? [...PLATFORMS].sort((a, b) =>
        a.id === detected ? -1 : b.id === detected ? 1 : 0
      )
    : PLATFORMS;

  return (
    <div className="space-y-3">
      {appleUser ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-500/20 dark:bg-amber-500/10">
          <Apple className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-amber-900 dark:text-amber-200">
            There&apos;s no native macOS or iOS build yet. Install the{" "}
            <strong>Web App (PWA)</strong> below — it supports offline use and
            works great on Mac, iPhone and iPad.
          </p>
        </div>
      ) : null}

      {ordered.map((platform) => (
        <PlatformCard
          key={platform.id}
          platform={platform}
          isRecommended={platform.id === detected}
        />
      ))}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          Builds are self-signed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileCheck2 className="h-3.5 w-3.5 text-success" />
          Every asset ships with a SHA-256 checksum
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-success" />
          Verified downloads from GitHub Releases
        </span>
      </div>
    </div>
  );
}
