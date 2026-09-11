#!/bin/bash
# FFmpeg Render Pipeline for Decimal Demo Video
# Combines Playwright recorded video + TTS audio + captions into final 1080p video
#
# Usage: bash scripts/demo/render.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/output"
AUDIO_DIR="$OUTPUT_DIR/audio"
CAPTIONS="$OUTPUT_DIR/captions.srt"
TIMELINE="$OUTPUT_DIR/timeline.json"
METADATA="$OUTPUT_DIR/metadata.json"
FINAL_OUTPUT="$OUTPUT_DIR/decimal-demo.mp4"

# Video settings
WIDTH=1920
HEIGHT=1080
FPS=30
BITRATE="5M"
AUDIO_BITRATE="192k"

echo "🎬 Decimal Demo Video Renderer"
echo "================================"

# Check dependencies
command -v ffmpeg >/dev/null 2>&1 || { echo "❌ ffmpeg not found"; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo "❌ ffprobe not found"; exit 1; }

# Check if Playwright recorded video exists
RECORDED_VIDEO=$(ls "$OUTPUT_DIR"/*.webm 2>/dev/null | head -1)
if [ -z "$RECORDED_VIDEO" ]; then
    echo "❌ No recorded video found in $OUTPUT_DIR"
    echo "   Run: npx tsx scripts/demo/record.ts first"
    exit 1
fi
echo "📹 Found recorded video: $(basename "$RECORDED_VIDEO")"

# Check if audio exists
AUDIO_COUNT=$(ls "$AUDIO_DIR"/*.mp3 2>/dev/null | wc -l)
if [ "$AUDIO_COUNT" -eq 0 ]; then
    echo "❌ No audio files found in $AUDIO_DIR"
    echo "   Run: python3 scripts/demo/generate-tts.py first"
    exit 1
fi
echo "🔊 Found $AUDIO_COUNT audio files"

# Step 1: Convert Playwright video to MP4 and normalize
echo ""
echo "📹 Step 1: Converting recorded video to MP4..."
ffmpeg -y \
  -i "$RECORDED_VIDEO" \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -s "${WIDTH}x${HEIGHT}" \
  -r "$FPS" \
  -an \
  "$OUTPUT_DIR/video_only.mp4" \
  2>/dev/null

echo "   ✅ Video converted"

# Step 2: Concatenate audio files
echo ""
echo "🔊 Step 2: Concatenating audio..."
AUDIO_LIST="$OUTPUT_DIR/audio_list.txt"
> "$AUDIO_LIST"

for scene in $(jq -r '.[].id' "$TIMELINE"); do
  AUDIO_FILE="$AUDIO_DIR/$scene.mp3"
  if [ -f "$AUDIO_FILE" ]; then
    echo "file '$AUDIO_FILE'" >> "$AUDIO_LIST"
  fi
done

ffmpeg -y \
  -f concat \
  -safe 0 \
  -i "$AUDIO_LIST" \
  -c:a aac \
  -b:a "$AUDIO_BITRATE" \
  "$OUTPUT_DIR/audio_full.m4a" \
  2>/dev/null

echo "   ✅ Audio concatenated"

# Step 3: Merge video + audio
echo ""
echo "🎞️  Step 3: Merging video and audio..."
ffmpeg -y \
  -i "$OUTPUT_DIR/video_only.mp4" \
  -i "$OUTPUT_DIR/audio_full.m4a" \
  -c:v copy \
  -c:a aac \
  -shortest \
  "$OUTPUT_DIR/video_with_audio.mp4" \
  2>/dev/null

echo "   ✅ Video + audio merged"

# Step 4: Burn captions
echo ""
echo "📝 Step 4: Adding captions..."
if [ -f "$CAPTIONS" ]; then
  ffmpeg -y \
    -i "$OUTPUT_DIR/video_with_audio.mp4" \
    -vf "subtitles=$CAPTIONS:force_style='FontName=Arial,FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,BackColour=&H80000000,MarginV=40'" \
    -c:v libx264 \
    -preset medium \
    -crf 23 \
    -c:a copy \
    "$FINAL_OUTPUT" \
    2>/dev/null

  echo "   ✅ Captions burned in"
else
  echo "   ⚠️  No captions file found, skipping"
  cp "$OUTPUT_DIR/video_with_audio.mp4" "$FINAL_OUTPUT"
fi

# Step 5: Add intro/outro fade
echo ""
echo "✨ Step 5: Adding fade effects..."
DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$FINAL_OUTPUT" 2>/dev/null | cut -d. -f1)

if [ -n "$DURATION" ] && [ "$DURATION" -gt 3 ]; then
  ffmpeg -y \
    -i "$FINAL_OUTPUT" \
    -vf "fade=t=in:st=0:d=1,fade=t=out:st=$((DURATION-2)):d=2" \
    -af "afade=t=in:st=0:d=1,afade=t=out:st=$((DURATION-2)):d=2" \
    -c:v libx264 \
    -preset medium \
    -crf 23 \
    -c:a aac \
    "$OUTPUT_DIR/decimal-demo-final.mp4" \
    2>/dev/null

  mv "$OUTPUT_DIR/decimal-demo-final.mp4" "$FINAL_OUTPUT"
  echo "   ✅ Fade effects applied"
else
  echo "   ⚠️  Video too short for fades, skipping"
fi

# Step 6: Generate thumbnail
echo ""
echo "🖼️  Step 6: Generating thumbnail..."
ffmpeg -y \
  -i "$FINAL_OUTPUT" \
  -ss 5 \
  -vframes 1 \
  -s 1280x720 \
  "$OUTPUT_DIR/thumbnail.jpg" \
  2>/dev/null

echo "   ✅ Thumbnail generated"

# Summary
echo ""
echo "================================"
echo "✅ Render complete!"
echo ""
FINAL_SIZE=$(du -h "$FINAL_OUTPUT" | cut -f1)
FINAL_DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$FINAL_OUTPUT" 2>/dev/null)
echo "📁 Output: $FINAL_OUTPUT"
echo "📏 Size: $FINAL_SIZE"
echo "⏱️  Duration: ${FINAL_DURATION}s"
echo "🖼️  Thumbnail: $OUTPUT_DIR/thumbnail.jpg"
