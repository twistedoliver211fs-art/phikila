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
const TAG = "v0.1.0";

export const RELEASE = {
  version: "0.1.0",
  tag: TAG,
  releasedAt: "2026-09-06",
  repoUrl: `https://github.com/${REPO}`,
  releaseUrl: `https://github.com/${REPO}/releases/tag/${TAG}`,
  latestUrl: `https://github.com/${REPO}/releases/latest`,
  checksums: {
    filename: "SHA256SUMS.txt",
    url: `${DOWNLOAD_BASE}/${TAG}/SHA256SUMS.txt`,
    sha256: "6bda092c4b27067ba2683fded55b0b12221d4baf2c5b094332790ab9a66b9310",
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
    requirements: "Android 7.0 or newer · ~10.9 MB",
    assets: [
      {
        id: "android-debug",
        label: "APK",
        filename: `phikila-${TAG}-android-debug.apk`,
        url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-android-debug.apk`,
        size: "10.9 MB",
        sha256: "5e4f6c2f8824ffc0aafc6f1f675a1c5146a0b7df72af00412dbdbe5eec642485",
        recommended: true,
        note: "Debug-signed — installs directly on any device",
      },
      {
        id: "android-release",
        label: "Unsigned release APK",
        filename: `phikila-${TAG}-android-release.apk`,
        url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-android-release.apk`,
        size: "8.9 MB",
        sha256: "ba1caae5e3bc385696259c85b3c0a9b72beb24257976b764f27941259d57e86c",
        note: "For signing with your own keystore (Play Store distribution)",
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
    assets: [
      {
        id: "windows-exe",
        label: "Installer (.exe)",
        filename: `phikila-${TAG}-windows-x64.exe`,
        url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-windows-x64.exe`,
        size: "28.1 MB",
        sha256: "444efda76e2414cf92d2477426748b114c17bef20a6e9fb600b512dd7226714c",
        recommended: true,
      },
      {
        id: "windows-msi",
        label: "MSI",
        filename: `phikila-${TAG}-windows-x64.msi`,
        url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-windows-x64.msi`,
        size: "29.8 MB",
        sha256: "6def278c7f35f80f06cc0de64323fd1871e248a91615a7b14818144151e7b594",
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
        sha256: "9d1a5d980218c4128a8e2f041d33d34c80be3ee4645941a8ab24716c5232c8bc",
        recommended: true,
        note: "sudo apt install ./phikila-v0.1.0-linux-x86_64.deb",
      },
      {
        id: "linux-appimage",
        label: "AppImage",
        filename: `phikila-${TAG}-linux-x86_64.AppImage`,
        url: `${DOWNLOAD_BASE}/${TAG}/phikila-${TAG}-linux-x86_64.AppImage`,
        size: "101 MB",
        sha256: "4275e1cac345d2630993e72f132a1369c00d687323d58273478b5e6a9d411c68",
        note: "chmod +x && run — no installation required",
      },
    ],
    installSteps: [
      "Install the .deb: sudo apt install ./phikila-v0.1.0-linux-x86_64.deb",
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
