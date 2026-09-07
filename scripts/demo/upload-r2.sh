#!/bin/bash
# Upload demo video to Cloudflare R2 using Wrangler
#
# Usage: bash scripts/demo/upload-r2.sh
# Requires: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_TOKEN env vars

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/output"
FINAL_VIDEO="$OUTPUT_DIR/phikila-demo.mp4"
THUMBNAIL="$OUTPUT_DIR/thumbnail.jpg"
R2_BUCKET="phikila-demo"
R2_KEY="demo/phikila-demo-$(date +%Y%m%d).mp4"
R2_THUMB_KEY="demo/thumbnail-$(date +%Y%m%d).jpg"

echo "☁️  Uploading demo video to Cloudflare R2"
echo "================================"

# Check dependencies
command -v wrangler >/dev/null 2>&1 || {
  echo "❌ Wrangler not found. Install: npm install -g wrangler"
  exit 1
}

# Check files exist
if [ ! -f "$FINAL_VIDEO" ]; then
  echo "❌ Video not found: $FINAL_VIDEO"
  echo "   Run: bash scripts/demo/render.sh first"
  exit 1
fi

# Check auth
if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ] || [ -z "${CLOUDFLARE_R2_TOKEN:-}" ]; then
  echo "⚠️  R2 credentials not set, skipping upload"
  echo "   Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_R2_TOKEN"
  exit 0
fi

# Upload video
echo ""
echo "📤 Uploading video..."
wrangler r2 object put "$R2_BUCKET/$R2_KEY" \
  --file "$FINAL_VIDEO" \
  --content-type "video/mp4" \
  --metadata '{"cache-control": "public, max-age=31536000, immutable"}'

echo "   ✅ Video uploaded: $R2_KEY"

# Upload thumbnail
echo ""
echo "📤 Uploading thumbnail..."
wrangler r2 object put "$R2_BUCKET/$R2_THUMB_KEY" \
  --file "$THUMBNAIL" \
  --content-type "image/jpeg" \
  --metadata '{"cache-control": "public, max-age=31536000, immutable"}'

echo "   ✅ Thumbnail uploaded: $R2_THUMB_KEY"

# Generate public URL
R2_PUBLIC_URL="https://pub-${CLOUDFLARE_ACCOUNT_ID}.r2.dev"
VIDEO_URL="${R2_PUBLIC_URL}/${R2_KEY}"
THUMB_URL="${R2_PUBLIC_URL}/${R2_THUMB_KEY}"

echo ""
echo "================================"
echo "✅ Upload complete!"
echo ""
echo "🎬 Video URL: $VIDEO_URL"
echo "🖼️  Thumbnail: $THUMB_URL"

# Save URL to metadata
cat > "$OUTPUT_DIR/r2-urls.json" << EOF
{
  "videoUrl": "$VIDEO_URL",
  "thumbnailUrl": "$THUMB_URL",
  "uploadedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "r2Key": "$R2_KEY",
  "r2ThumbKey": "$R2_THUMB_KEY"
}
EOF

echo ""
echo "📁 URLs saved to: $OUTPUT_DIR/r2-urls.json"
