<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Phikila — Agent Guide

## Project Overview

Multi-school management platform. Next.js 16 App Router + Supabase + Vercel.
Role-based portals: super_admin, principal, teacher, finance, admissions_officer, secretary, parent.

**Repo:** `https://github.com/twistedoliver211fs-art/phikila`
**Live:** `https://phikila-app.vercel.app`
**Publisher:** Omix Digital Solutions (`omixsystems.store`)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.3.4 (App Router) |
| UI | React 19, shadcn/ui (`@base-ui/react`), Tailwind CSS 4, Framer Motion |
| Auth | Supabase Auth + Google OAuth + Turnstile captcha |
| DB | Supabase Postgres (22+ tables, RLS policies) |
| PWA | Serwist v9 (service worker + precaching) |
| Offline | IndexedDB (idb) + background sync engine |
| Android | Capacitor v8 (WebView wrapper) |
| Desktop | Tauri v2 (Rust + WebView) |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

---

## Critical Conventions

### shadcn/ui — NO `asChild` prop
This project uses `@base-ui/react` button, NOT Radix. The `asChild` prop does NOT exist.
**Always** use the wrapper pattern:
```tsx
<Link href="/path">
  <Button>Click me</Button>
</Link>
```
NEVER: `<Button asChild><Link>...</Link></Button>`

### DB Schema Notes
- `terms` uses `is_current` (NOT `is_active`), linked to `academic_years`
- `staff` table has NO `email`, `phone`, `tsc_number`, `staff_type` columns
- `school_members.user_id` is NOT NULL
- `member_role` enum: `super_admin, principal, teacher, finance, admissions_officer, secretary, parent`

### Supabase Clients
- `src/lib/supabase/server.ts` — cookie-based SSR client (uses `@supabase/ssr`)
- `src/lib/supabase/server-admin.ts` — service-role client (admin operations)
- `src/lib/supabase/client.ts` — browser client

### CLI Tools
- `npx supabase` — must use `npx` (not installed globally)
- `gh` — GitHub CLI (authenticated)
- `vercel` — Vercel CLI (authenticated as `twistedoliver211fs-1271`)

---

## Build & Deploy

### Local Development
```bash
cd phikila-app
npm run dev          # starts dev server on :3000
```

### Production Build
```bash
npm run build        # runs: next build --webpack
```
The `--webpack` flag is REQUIRED. Next.js 16 defaults to Turbopack, but serwist uses webpack.

### TypeScript Check
```bash
npx tsc --noEmit
```

### Lint
```bash
npm run lint
```
Note: There are ~59 existing lint warnings (React hooks rules). Lint is non-blocking in CI.

### Deploy to Vercel
```bash
# Option 1: CLI (requires fast network)
vercel --prod --yes

# Option 2: Push to main (triggers CI deploy if VERCEL_TOKEN secret is set)
git push origin main
```

---

## Release Process

Releases are fully automated via GitHub Actions.

### To create a release:
```bash
# 1. Bump version in package.json and src-tauri/tauri.conf.json
# 2. Commit
git add -A && git commit -m "release: v0.2.0"

# 3. Tag
git tag -a v0.2.0 -m "v0.2.0"

# 4. Push both
git push origin main && git push origin v0.2.0
```

### What CI does automatically:
1. **lint-and-build** — TypeScript check, lint, Next.js build
2. **build-android** — JDK 21 + Android SDK → debug + release APK
3. **build-desktop-linux** — Rust + Tauri → `.deb` + `.AppImage`
4. **build-desktop-windows** — Rust + Tauri → `.exe` + `.msi`
5. **create-release** — GitHub Release with all artifacts + SHA-256 checksums

### Artifacts per release:
| Platform | File |
|----------|------|
| Android | `phikila-vX.Y.Z-android-debug.apk` |
| Android | `phikila-vX.Y.Z-android-release.apk` |
| Linux | `phikila-vX.Y.Z-linux-x86_64.deb` |
| Linux | `phikila-vX.Y.Z-linux-x86_64.AppImage` |
| Windows | `phikila-vX.Y.Z-windows-x64.exe` |
| Windows | `phikila-vX.Y.Z-windows-x64.msi` |
| All | `SHA256SUMS.txt` |

---

## Capacitor Android

### Setup
- Config: `capacitor.config.ts`
- App ID: `com.omixdigital.phikila`
- Web URL: `https://phikila-app.vercel.app`

### Build locally (requires JDK 21)
```bash
# Set environment
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk  # or wherever JDK 21 is
export ANDROID_HOME=~/android-sdk

# Sync and build
npx cap sync android
cd android && ./gradlew assembleDebug
```

### JDK 21 Patch
Capacitor v8 plugins require JDK 21 (`jvmToolchain(21)` in their build.gradle).
CI runners have JDK 22 pre-installed, so this works automatically.

For local dev with JDK 17 only:
```bash
bash scripts/patch-capacitor-jdk17.sh
```
This patches `node_modules/@capacitor/*/android/build.gradle` to use JDK 17.
**Must re-run after every `npx cap sync android`.**

---

## Tauri Desktop

### Setup
- Config: `src-tauri/tauri.conf.json`
- App ID: `com.omixdigital.phikila`
- Version: managed in `tauri.conf.json` (must match `package.json`)

### Build locally (requires Rust)
```bash
source "$HOME/.cargo/env"
npx tauri build
```
Output: `src-tauri/target/release/bundle/`

---

## PWA / Offline

- Service worker: `src/app/sw.ts` (serwist)
- Offline data: `src/lib/db.ts` (IndexedDB)
- Sync engine: `src/lib/sync.ts`
- Hooks: `useOnlineStatus`, `useOfflineMutation`, `useSyncQueueCount`
- Sync API: `/api/sync/attendance`, `/api/sync/marks`

### Important: serwist v9 API
- Use `matcher` (NOT `urlPattern`)
- Use Strategy instances (NOT strings): `new NetworkFirst()`, `new CacheFirst()`, etc.
- Use `fallbacks.entries` (NOT `navigationFallback`)

---

## Icons

Generated from `public/logo.jpeg` (1254x1254).
```bash
bash scripts/generate-icons.sh
```
Generates: PWA icons, maskable icons, favicon.ico, Tauri icons, shortcut icons.

---

## CI/CD Secrets Required

For Vercel auto-deploy in GitHub Actions, add these to repo Settings → Secrets → Actions:
- `VERCEL_TOKEN` — from `npx vercel tokens create`
- `VERCEL_ORG_ID` — from `.vercel/project.json`
- `VERCEL_PROJECT_ID` — from `.vercel/project.json`

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `next build` fails with serwist | Use `npm run build` (includes `--webpack` flag) |
| Capacitor sync fails with Node error | Need Node.js ≥ 22 |
| Android build fails with JDK 21 | Run `bash scripts/patch-capacitor-jdk17.sh` |
| `asChild` prop error | Use `<Link><Button>` wrapper, NOT `<Button asChild>` |
| Tauri build picks up `src-tauri/gen/` TS errors | Already excluded in `tsconfig.json` |
| Lint fails in CI | Non-blocking — warnings only |
| Vercel deploy timeout | Use CI deploy (push to main) or faster network |

---

## Key Files Reference

```
phikila-app/
├── AGENTS.md                    # This file
├── capacitor.config.ts          # Capacitor Android config
├── next.config.ts               # Next.js + serwist config
├── package.json                 # version: 0.1.0
├── tsconfig.json                # excludes src-tauri
├── .github/workflows/ci.yml     # CI/CD pipeline
├── public/
│   ├── favicon.ico
│   ├── icons/                   # Generated PNGs from logo.jpeg
│   ├── manifest.json            # PWA manifest
│   └── offline.html             # Offline fallback
├── scripts/
│   ├── generate-icons.sh        # Regenerate all icons
│   ├── patch-capacitor-jdk17.sh # JDK 17 compat for local dev
│   ├── build-android.sh         # Local Android build
│   ├── build-desktop.sh         # Local Tauri build
│   └── sign-android.sh         # APK signing
├── src/
│   ├── app/
│   │   ├── sw.ts                # Serwist service worker
│   │   ├── (auth)/              # Login, callback, register
│   │   ├── (public)/            # Landing, download, security, docs
│   │   ├── (platform)/          # Role-based portals
│   │   └── api/sync/            # Offline sync endpoints
│   ├── components/
│   │   ├── landing/             # Hero, features, CTA, download
│   │   └── platform/            # Sidebar, sync indicator
│   ├── hooks/                   # useOnlineStatus, useOfflineMutation
│   ├── lib/
│   │   ├── db.ts                # IndexedDB operations
│   │   ├── sync.ts              # Background sync engine
│   │   └── supabase/            # Server + browser clients
├── android/                     # Capacitor Android project
└── src-tauri/                   # Tauri desktop project
    ├── Cargo.toml
    ├── tauri.conf.json
    └── icons/                   # Generated from logo.jpeg
```
