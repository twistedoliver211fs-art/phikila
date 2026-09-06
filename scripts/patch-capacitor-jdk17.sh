#!/usr/bin/env bash
# Patches Capacitor Android plugins to use JDK 17 instead of JDK 21
# Run after every `npx cap sync android`
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

# Patch node_modules plugins
find node_modules/@capacitor -name "build.gradle" -path "*/android/*" -exec \
  sed -i -e 's/jvmToolchain(21)/jvmToolchain(17)/g' -e 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' {} +

# Patch generated cordova plugins build.gradle
find android -name "build.gradle" -exec \
  sed -i -e 's/jvmToolchain(21)/jvmToolchain(17)/g' -e 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' {} +

echo "✓ Patched Capacitor plugins for JDK 17"
