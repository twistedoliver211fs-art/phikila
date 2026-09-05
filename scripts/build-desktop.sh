#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Building Next.js for production..."
cd "$APP_DIR"
npm run build

echo "==> Building Tauri desktop app..."
npx tauri build

echo "==> Desktop build complete!"
echo "    Check src-tauri/target/release/bundle/ for installers"
