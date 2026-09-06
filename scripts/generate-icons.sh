#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$APP_DIR/public/logo.jpeg"
ICONS_DIR="$APP_DIR/public/icons"
TAURI_ICONS_DIR="$APP_DIR/src-tauri/icons"

mkdir -p "$ICONS_DIR" "$TAURI_ICONS_DIR" "$APP_DIR/public/screenshots"

echo "==> Generating PWA icons..."
for size in 32 48 72 96 128 144 152 192 384 512; do
  convert "$SRC" -resize ${size}x${size} -gravity center -extent ${size}x${size} "$ICONS_DIR/icon-${size}.png"
  echo "  icon-${size}.png ✓"
done

# Maskable icons (20% padding for safe zone)
echo "==> Generating maskable icons..."
for size in 192 512; do
  padded=$((size * 80 / 100))
  convert "$SRC" -resize ${padded}x${padded} -gravity center -background "#4F46E5" -extent ${size}x${size} "$ICONS_DIR/icon-maskable-${size}.png"
  echo "  icon-maskable-${size}.png ✓"
done

# Favicon (multi-size ICO)
echo "==> Generating favicon.ico..."
convert "$SRC" -resize 16x16 "$ICONS_DIR/favicon-16.png"
convert "$SRC" -resize 32x32 "$ICONS_DIR/favicon-32.png"
convert "$SRC" -resize 48x48 "$ICONS_DIR/favicon-48.png"
convert "$ICONS_DIR/favicon-16.png" "$ICONS_DIR/favicon-32.png" "$ICONS_DIR/favicon-48.png" "$APP_DIR/public/favicon.ico"
echo "  favicon.ico ✓"

# Shortcut icons (96x96)
echo "==> Generating shortcut icons..."
convert "$SRC" -resize 96x96 -gravity center -extent 96x96 "$ICONS_DIR/shortcut-attendance.png"
convert "$SRC" -resize 96x96 -gravity center -extent 96x96 "$ICONS_DIR/shortcut-timetable.png"
convert "$SRC" -resize 96x96 -gravity center -extent 96x96 "$ICONS_DIR/shortcut-exams.png"
echo "  shortcut icons ✓"

# Tauri icons
echo "==> Generating Tauri icons..."
convert "$SRC" -resize 32x32 "$TAURI_ICONS_DIR/32x32.png"
convert "$SRC" -resize 128x128 "$TAURI_ICONS_DIR/128x128.png"
convert "$SRC" -resize 256x256 "$TAURI_ICONS_DIR/128x128@2x.png"
convert "$SRC" -resize 256x256 "$TAURI_ICONS_DIR/icon.icns" 2>/dev/null || cp "$TAURI_ICONS_DIR/128x128@2x.png" "$TAURI_ICONS_DIR/icon.icns"
convert "$SRC" -resize 256x256 "$TAURI_ICONS_DIR/icon.ico" 2>/dev/null || cp "$TAURI_ICONS_DIR/128x128@2x.png" "$TAURI_ICONS_DIR/icon.ico"
echo "  tauri icons ✓"

# Cleanup intermediate files
rm -f "$ICONS_DIR/favicon-16.png" "$ICONS_DIR/favicon-32.png" "$ICONS_DIR/favicon-48.png"

echo ""
echo "==> All icons generated!"
ls -la "$ICONS_DIR/"
ls -la "$TAURI_ICONS_DIR/"
