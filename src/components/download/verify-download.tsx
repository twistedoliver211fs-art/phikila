"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Loader,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./copy-button";
import { PLATFORMS } from "@/lib/releases";

type Status = "idle" | "hashing" | "match" | "unknown" | "error";

interface KnownAsset {
  sha256: string;
  label: string;
  filename: string;
  url: string;
}

const KNOWN_ASSETS: KnownAsset[] = PLATFORMS.flatMap((p) =>
  p.assets.map((a) => ({
    sha256: a.sha256,
    label: `${p.name} — ${a.label}`,
    filename: a.filename,
    url: a.url,
  }))
);

/** Hash a file with SHA-256 using the Web Crypto API (fully client-side). */
async function sha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VerifyDownload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");
  const [matched, setMatched] = useState<KnownAsset | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const reset = () => {
    setStatus("idle");
    setFile(null);
    setHash("");
    setMatched(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const verify = async (selected: File) => {
    setFile(selected);
    setStatus("hashing");
    setMatched(null);
    setHash("");
    try {
      const hex = await sha256Hex(selected);
      const asset = KNOWN_ASSETS.find((a) => a.sha256 === hex) ?? null;
      setHash(hex);
      setMatched(asset);
      setStatus(asset ? "match" : "unknown");
    } catch {
      setStatus("error");
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) verify(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) verify(f);
  };

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="verify-download-heading"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <div className="min-w-0 flex-1">
          <h2 id="verify-download-heading" className="font-semibold text-foreground">
            Verify your download
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Drop the file you downloaded below — the checksum is computed{" "}
            <strong className="text-foreground">on your device</strong>. Nothing
            is uploaded anywhere.
          </p>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Choose a downloaded file to verify"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={onDrop}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dropActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={onPick}
          aria-hidden={false}
        />
        {status === "hashing" ? (
          <>
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Computing checksum for {file?.name}…
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {file ? formatSize(file.size) : ""} · large files take a moment
            </p>
          </>
        ) : (
          <>
            <FileUp className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Drop the installer here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              APK · EXE · MSI · DEB · AppImage — any size
            </p>
          </>
        )}
      </div>

      {status === "match" && matched ? (
        <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-sm font-semibold text-success">
              Verified — genuine Phikila release
            </p>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            <strong className="text-foreground">{file?.name}</strong> matches{" "}
            <strong className="text-foreground">{matched.label}</strong> from the
            official v0.1.0 release.
          </p>
          <div className="mt-3 flex min-w-0 items-center gap-1.5">
            <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
              sha256:{hash}
            </code>
            <CopyButton value={hash} label="Copy full SHA-256 checksum" />
          </div>
          <a
            href={matched.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
          >
            Release page for {matched.filename} ↗
          </a>
        </div>
      ) : null}

      {status === "unknown" ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Not a recognised release file
            </p>
          </div>
          <p className="mt-1.5 text-sm text-amber-900/80 dark:text-amber-200/80">
            <strong>{file?.name}</strong> doesn&apos;t match any official
            v0.1.0 asset. If you didn&apos;t build it yourself, download a fresh
            copy from this page. ({file ? formatSize(file.size) : ""} ·{" "}
            {file?.name})
          </p>
          <div className="mt-3 flex min-w-0 items-center gap-1.5">
            <code className="min-w-0 flex-1 truncate rounded bg-black/5 px-2 py-1 font-mono text-[11px] text-amber-900/80 dark:bg-white/10 dark:text-amber-200/80">
              sha256:{hash}
            </code>
            <CopyButton value={hash} label="Copy full SHA-256 checksum" />
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm font-semibold text-destructive">
              Couldn&apos;t read the file
            </p>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your browser blocked or failed the read. Try another browser, or
            verify manually with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              sha256sum
            </code>
            .
          </p>
        </div>
      ) : null}

      {(status === "match" || status === "unknown") && (
        <button
          type="button"
          onClick={reset}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
          Verify another file
        </button>
      )}
    </section>
  );
}
