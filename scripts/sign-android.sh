#!/usr/bin/env bash
set -euo pipefail

KEYSTORE_DIR="$HOME/.phikila-keystore"
KEYSTORE="$KEYSTORE_DIR/phikila-release.jks"
KEY_ALIAS="phikila"
KEYSTORE_PASS="Phikila2026!"

if [ ! -f "$KEYSTORE" ]; then
  echo "==> Generating self-signed keystore..."
  mkdir -p "$KEYSTORE_DIR"
  keytool -genkeypair \
    -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$KEYSTORE_PASS" \
    -keypass "$KEYSTORE_PASS" \
    -dname "CN=Omix Digital Solutions, OU=Development, O=Omix Digital Solutions, L=Nairobi, ST=Nairobi, C=KE"
  echo "==> Keystore created at $KEYSTORE"
fi

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$APP_DIR/android"

if [ ! -d "$BUILD_DIR" ]; then
  echo "==> Android project not found. Run build-android.sh first."
  exit 1
fi

echo "==> Building signed release APK..."
cd "$BUILD_DIR"
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file="$KEYSTORE" \
  -Pandroid.injected.signing.store.password="$KEYSTORE_PASS" \
  -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
  -Pandroid.injected.signing.key.password="$KEYSTORE_PASS"

APK_PATH="$BUILD_DIR/app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
  CHECKSUM=$(sha256sum "$APK_PATH" | cut -d' ' -f1)
  echo ""
  echo "==> Signed APK: $APK_PATH"
  echo "==> SHA-256: $CHECKSUM"
  echo ""
  echo "To distribute:"
  echo "  1. Upload APK to GitHub Releases"
  echo "  2. Or share directly via WhatsApp / email"
else
  echo "==> Build failed. Check Android Studio for errors."
  exit 1
fi
