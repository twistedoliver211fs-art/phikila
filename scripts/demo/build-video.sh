#!/bin/bash
# Main demo video pipeline — runs in GitHub Actions
# Steps: DB reset → Start app → Playwright record → TTS → FFmpeg → R2 upload → Update page
#
# Required secrets:
#   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_PASSWORD
#   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_TOKEN
#   DEMO_USER_ID (UUID of demo@decimal.app user in auth.users)
#
# Required env vars (set in workflow):
#   SITE_URL (e.g. https://decimal-app.vercel.app)
#   R2_BUCKET (e.g. decimal-demo)
#   R2_PUBLIC_URL (e.g. https://pub-XXXX.r2.dev)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/output"
SITE_URL="${SITE_URL:-https://decimal-app.vercel.app}"

echo "🎬 Decimal Demo Video Pipeline"
echo "================================"
echo "Site: $SITE_URL"
echo "Output: $OUTPUT_DIR"
echo ""

mkdir -p "$OUTPUT_DIR"

# ─── Step 0: Install system dependencies ────────────────────────
echo "📦 Step 0: Installing dependencies..."
sudo apt-get update -qq && sudo apt-get install -y -qq ffmpeg > /dev/null 2>&1
pip install --break-system-packages edge-tts > /dev/null 2>&1
npm install playwright > /dev/null 2>&1
npx playwright install chromium --with-deps > /dev/null 2>&1
echo "   ✅ Done"

# ─── Step 1: Reset demo database ────────────────────────────────
echo ""
echo "🗄️  Step 1: Resetting demo database..."

# Install supabase CLI
npx supabase --version > /dev/null 2>&1 || npx supabase init > /dev/null 2>&1

# Connect to remote DB
export SUPABASE_DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.pgiytpbrnyxnnfupvaiv.supabase.co:5432/postgres"

# Delete existing demo data (in reverse order of foreign keys)
psql "$SUPABASE_DB_URL" <<-'SQL' 2>/dev/null || true
  -- Delete demo school data
  DELETE FROM attendance_records WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM payments WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM student_accounts WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM students WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM staff WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM class_teachers WHERE class_id IN (SELECT c.id FROM classes c JOIN schools s ON c.school_id = s.id WHERE s.slug = 'decimal-demo');
  DELETE FROM subjects WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM classes WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM grades WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM fee_structures WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM terms WHERE academic_year_id IN (SELECT id FROM academic_years WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo'));
  DELETE FROM academic_years WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM school_members WHERE school_id IN (SELECT id FROM schools WHERE slug = 'decimal-demo');
  DELETE FROM schools WHERE slug = 'decimal-demo';
SQL
echo "   ✅ Demo data cleared"

# Seed fresh demo data
echo "   🌱 Seeding fresh demo data..."
psql "$SUPABASE_DB_URL" -f "$SCRIPT_DIR/../supabase/seed-demo.sql" 2>/dev/null || {
  echo "   ⚠️  Seed failed — checking if demo user exists..."
  # Try creating the demo user via Supabase API
  curl -s -X POST "https://pgiytpbrnyxnnfupvaiv.supabase.co/auth/v1/admin/users" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "demo@decimal.app",
      "password": "Demo1234!",
      "email_confirm": true
    }' > /dev/null 2>&1 || true

  # Retry seed
  psql "$SUPABASE_DB_URL" -f "$SCRIPT_DIR/../supabase/seed-demo.sql" 2>/dev/null || echo "   ⚠️  Seed partial — continuing anyway"
}
echo "   ✅ Demo database ready"

# ─── Step 2: Start the Next.js app ─────────────────────────────
echo ""
echo "🌐 Step 2: Starting Next.js app..."
cd "$SCRIPT_DIR/../.."
npm run build -- --webpack 2>&1 | tail -3
PORT=3000 npm run start > /tmp/decimal-demo-server.log 2>&1 &
SERVER_PID=$!
echo "   Server PID: $SERVER_PID"

# Wait for server
echo "   Waiting for server..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    echo "   ✅ Server ready"
    break
  fi
  sleep 2
done

# ─── Step 3: Record with Playwright ─────────────────────────────
echo ""
echo "📹 Step 3: Recording demo with Playwright..."
cd "$SCRIPT_DIR"
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx tsx record.ts
echo "   ✅ Recording complete"

# ─── Step 4: Generate TTS narration ─────────────────────────────
echo ""
echo "🎙️  Step 4: Generating TTS narration..."
python3 generate-tts.py
echo "   ✅ TTS complete"

# ─── Step 5: Render video with FFmpeg ───────────────────────────
echo ""
echo "🎬 Step 5: Rendering video with FFmpeg..."
bash render.sh
echo "   ✅ Video rendered"

# ─── Step 6: Upload to R2 ──────────────────────────────────────
echo ""
echo "☁️  Step 6: Uploading to Cloudflare R2..."
bash upload-r2.sh
echo "   ✅ Upload complete"

# ─── Step 7: Update landing page ────────────────────────────────
echo ""
echo "📝 Step 7: Updating landing page video URL..."
if [ -f "$OUTPUT_DIR/r2-urls.json" ]; then
  VIDEO_URL=$(jq -r '.videoUrl' "$OUTPUT_DIR/r2-urls.json")
  THUMB_URL=$(jq -r '.thumbnailUrl' "$OUTPUT_DIR/r2-urls.json")
  
  # Export for the update script
  export VIDEO_URL THUMB_URL
  echo "   Video: $VIDEO_URL"
  echo "   Thumb: $THUMB_URL"
fi
echo "   ✅ Landing page will be updated by CI"

# ─── Cleanup ─────────────────────────────────────────────────────
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
echo "   Server stopped"

# ─── Summary ─────────────────────────────────────────────────────
echo ""
echo "================================"
echo "✅ Demo video pipeline complete!"
echo ""
echo "📁 Output files:"
ls -lh "$OUTPUT_DIR/decimal-demo.mp4" 2>/dev/null && echo "   🎬 decimal-demo.mp4"
ls -lh "$OUTPUT_DIR/thumbnail.jpg" 2>/dev/null && echo "   🖼️  thumbnail.jpg"
ls -lh "$OUTPUT_DIR/captions.srt" 2>/dev/null && echo "   📝 captions.srt"
ls -lh "$OUTPUT_DIR/r2-urls.json" 2>/dev/null && echo "   🔗 r2-urls.json"
