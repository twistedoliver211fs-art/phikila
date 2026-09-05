#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$APP_DIR/android"

echo "==> Building Next.js for production..."
cd "$APP_DIR"
npm run build

echo "==> Syncing web assets to Android..."
npx cap sync android

echo "==> Opening Android Studio (if available)..."
npx cap open android || echo "Android Studio not found. Open android/ manually."

echo "==> To build APK:"
echo "    cd $BUILD_DIR && ./gradlew assembleDebug"
echo "    APK: $BUILD_DIR/app/build/outputs/apk/debug/app-debug.apk"
