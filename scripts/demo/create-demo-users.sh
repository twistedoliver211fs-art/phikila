#!/bin/bash
# Create all demo users via Supabase Admin API
# Run: bash scripts/demo/create-demo-users.sh

set -e

SUPABASE_URL="${SUPABASE_URL:-https://pgiytpbrnyxnnfupvaiv.supabase.co}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXl0cGJybnl4bm5mdXB2YWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzOTA2MzUsImV4cCI6MjEwMzk2NjYzNX0.f_-FVAYXS3pZuGIJGAcqPuRvrV95QVQXslCcHyGu85o}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY}"

DEMO_PASS="Demo1234!"
ADMIN_PASS="Dec1m@lAdm!n2026"

echo "🔐 Creating demo users..."
echo ""

USERS=(
  "principal@decimal.app:Principal"
  "teacher@decimal.app:Teacher"
  "parent@decimal.app:Parent"
  "finance@decimal.app:Finance"
  "secretary@decimal.app:Secretary"
  "admissions@decimal.app:Admissions"
  "admin@decimal.app:Super Admin"
)

for ENTRY in "${USERS[@]}"; do
  IFS=: read -r EMAIL ROLE <<< "$ENTRY"
  
  if [ "$ROLE" = "Super Admin" ]; then
    PASS="$ADMIN_PASS"
  else
    PASS="$DEMO_PASS"
  fi

  echo "📧 $ROLE: $EMAIL"
  
  # Check if exists
  EXISTING=$(curl -s \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    "$SUPABASE_URL/auth/v1/admin/users?email=$EMAIL")
  
  EXISTS=$(echo "$EXISTING" | python3 -c "
import sys,json
d=json.load(sys.stdin)
users = d.get('users',[])
for u in users:
    if u.get('email') == '$EMAIL':
        print('yes')
        break
else:
    print('no')
" 2>/dev/null || echo "no")

  if [ "$EXISTS" = "yes" ]; then
    echo "   ✅ Already exists"
  else
    RESULT=$(curl -s -X POST \
      -H "apikey: $SUPABASE_ANON_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"email_confirm\":true}" \
      "$SUPABASE_URL/auth/v1/admin/users")
    
    ID=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")
    if [ -n "$ID" ]; then
      echo "   ✅ Created ($ID)"
    else
      echo "   ❌ Failed: $(echo "$RESULT" | head -c 100)"
    fi
  fi
done

echo ""
echo "✅ All users ready"
echo ""
echo "📋 Quick Reference:"
echo "   Principal:   principal@decimal.app / $DEMO_PASS"
echo "   Teacher:     teacher@decimal.app / $DEMO_PASS"
echo "   Parent:      parent@decimal.app / $DEMO_PASS"
echo "   Finance:     finance@decimal.app / $DEMO_PASS"
echo "   Secretary:   secretary@decimal.app / $DEMO_PASS"
echo "   Admissions:  admissions@decimal.app / $DEMO_PASS"
echo "   Super Admin: admin@decimal.app / $ADMIN_PASS"
