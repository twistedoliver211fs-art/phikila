/**
 * Release metadata — single source of truth for the download page and
 * landing-page download section.
 *
 * Values mirror the real assets published by `.github/workflows/ci.yml`
 * (create-release job). When cutting a new release, update `version` and
 * the asset filenames here, or wire this up to the GitHub Releases API.
 */

const REPO = "twistedoliver211fs-art/phikila";
const DOWNLOAD_BASE = `https://github.com/${REPO}/releases/download`;
const TAG = "v0.2.1";

export const RELEASE = {
  version: "0.2.1",
  tag: TAG,
  releasedAt: "2026-09-06",
  repoUrl: `https://github.com/${REPO}`,
  releaseUrl: `https://github.com/${REPO}/releases/tag/${TAG}`,
  latestUrl: `https://github.com/${REPO}/releases/latest`,
  checksums: {
    filename: "SHA256SUMS.txt",
    url: `${DOWNLOAD_BASE}/${TAG}/SHA256SUMS.txt`,
    sha256: "0961dba9d7780b3c54a4599ba0288d56f8e913cade54d070959c23e43460dec6",
  },
  publisher: {
    name: "Omix Digital Solutions",
    website: "https://omixsystems.store",
  },
} as const;

export const WEB_APP_URL = "https://phikila-app.vercel.app";

export type PlatformId = "android" | "windows" | "linux" | "pwa";

export interface DownloadAsset {
  id: string;
  /** Short label shown on the button, e.g. "APK" */
  label: string;
  filename: string;
  url: string;
  size: string;
  sha256: string;
  /** The asset most users should grab — shown first / highlighted */
  recommended?: boolean;
  note?: string;
}

export interface PlatformDownload {
  id: PlatformId;
  name: string;
  /** Icon component from lucide-react */
  icon: "smartphone" | "monitor" | "terminal" | "globe";
  tagline: string;
  requirements: string;
  assets: DownloadAsset[];
  installSteps: string[];
  /** Extra context shown when this is NOT the detected platform */
  hint?: string;
}

export const PLATFORMS: PlatformDownload[] = [
  {
    id: "android",
    name: "Android",
    icon: "smartphone",
    tagline: "Native APK with offline-first sync",
    requirements: "Android 7.0 or newer · ~66 MB",
  assets: [
    {
      id: "android-release",
      label: "APK (signed)",
      filename: `phikila-${TAG}-android-release.apk`,
      url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-android-release.apk`,
      size: "66.3 MB",
      sha256: "8c50f21b15b75633a036aad577ac38415f241167a9351ccecf9597ec03978429",
      recommended: true,
      note: "Signed release build — installs directly on any device",
    },
    {
      id: "android-debug",
      label: "Debug APK",
      filename: `phikila-${TAG}-android-debug.apk`,
      url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-android-debug.apk`,
      size: "84.2 MB",
      sha256: "d48485d1ac898f23ef28c78f1b69e667a1c6d2353eb60d3df6853ca53f877bba",
      note: "Debug-signed, unminified — for development and testing",
    },
  ],
    installSteps: [
      "Download the APK and tap it to install.",
      "If prompted, allow installs from your browser (Settings → Install unknown apps).",
      "Open Phikila and sign in with your Google account.",
    ],
  },
  {
    id: "windows",
    name: "Windows",
    icon: "monitor",
    tagline: "Desktop app for day-to-day administration",
    requirements: "Windows 10/11, 64-bit · ~28 MB",
    // (sizes verified against the v0.2.1 release assets)
    assets: [
      {
        id: "windows-exe",
        label: "Installer (.exe)",
        filename: `phikila-${TAG}-windows-x64.exe`,
        url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-windows-x64.exe`,
        size: "28.2 MB",
        sha256: "6313884828ccde2cddf2d361a57cc3eb3dea6f023c87959f1af21b6f14921956",
        recommended: true,
      },
      {
        id: "windows-msi",
        label: "MSI",
        filename: `phikila-${TAG}-windows-x64.msi`,
        url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-windows-x64.msi`,
        size: "29.8 MB",
        sha256: "045e10b0abeca001885cc6fb1d71f77c91b9e9c473b0ac50e6e90b4ae7e8abf1",
        note: "For IT-managed deployment (GPO / msiexec)",
      },
    ],
    installSteps: [
      "Run the installer.",
      "SmartScreen may appear — builds are self-signed: click “More info” → “Run anyway”.",
      "Launch Phikila from the Start menu.",
    ],
  },
  {
    id: "linux",
    name: "Linux",
    icon: "terminal",
    tagline: "Deb package or portable AppImage",
    requirements: "x86_64 · Ubuntu 20.04+ / Debian 11+ (.deb), any distro (AppImage)",
    assets: [
      {
        id: "linux-deb",
        label: ".deb",
        filename: `phikila-${TAG}-linux-x86_64.deb`,
        url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-linux-x86_64.deb`,
        size: "29.9 MB",
        sha256: "acb17a452cc94fb701232b20560014c86981b60e7bd717389675ef4830c4a1e5",
        recommended: true,
        note: "sudo apt install ./phikila-v0.2.1-linux-x86_64.deb",
      },
      {
        id: "linux-appimage",
        label: "AppImage",
        filename: `phikila-${TAG}-linux-x86_64.AppImage`,
        url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-linux-x86_64.AppImage`,
        size: "101.2 MB",
        sha256: "f810860e3aee91aa33645f4f5941d554b4066bfa132f1c37b70cf23af471e7c0",
        note: "chmod +x && run — no installation required",
      },
    ],
    installSteps: [
      "Install the .deb: sudo apt install ./phikila-v0.2.1-linux-x86_64.deb",
      "Or run the AppImage: chmod +x phikila-*.AppImage && ./phikila-*.AppImage",
      "Launch Phikila from your applications menu.",
    ],
  },
  {
    id: "pwa",
    name: "Web App (PWA)",
    icon: "globe",
    tagline: "Install from your browser — no download",
    requirements: "Any modern browser · works offline via service worker",
    assets: [],
    installSteps: [
      "Open phikila-app.vercel.app in your browser.",
      "Install via the address-bar install icon (Chrome/Edge) or “Add to Home Screen” (Safari).",
      "Phikila keeps working offline and syncs when you reconnect.",
    ],
    hint: "Works on macOS and iOS too — no native build needed.",
  },
];

/** Best-guess platform from the user agent. Returns null when unknown. */
export function detectPlatform(ua: string): PlatformId | null {
  const s = ua.toLowerCase();
  if (/android/.test(s)) return "android";
  if (/win/.test(s)) return "windows";
  if (/linux/.test(s) && !/android/.test(s)) return "linux";
  // No native macOS/iOS builds — those users get the PWA.
  return null;
}

/** True on macOS / iOS, where we point users at the PWA instead. */
export function isApplePlatform(ua: string): boolean {
  return /mac|iphone|ipad|ipod/.test(ua.toLowerCase());
}

export interface ChangelogEntry {
  version: string;
  date: string;
  items: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.2.1",
    date: "September 2026",
    items: [
      "Signed Android release APK — installs without Play Protect warnings",
      "CI signing, Tauri CSP and Android network security hardening",
      "All v0.1.0 platform features: role portals, timetable builder, attendance, exams, fees, offline sync",
    ],
  },
  {
    version: "0.1.0",
    date: "September 2026",
    items: [
      "Initial release of the Phikila multi-school management platform",
      "Role-based portals: Super Admin, Principal, Teacher, Finance, Admissions, Secretary, Parent",
      "Timetable builder with conflict detection and print views",
      "Attendance, exams and fee management with offline support",
      "Installable PWA, Android APK, Windows and Linux desktop builds",
    ],
  },
];
