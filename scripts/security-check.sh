#!/usr/bin/env bash
# ── Security checklist ──────────────────────────────────────────────────────
# Run from the phikila-app directory (or set PROJECT_DIR below).
#
# 1. Secret scanner — scans git history for hardcoded credentials.
#    Uses native git grep (no external tooling required).
#    Real scanners (gitleaks / trufflehog) should be used in CI.
#
# 2. Dependency audit — npm audit at the project's pinned versions,
#    outputting a machine-readable JSON report for CI.
#
# 3. Package manifest sanity — confirms no known-bad patterns are present
#    (service-role keys, absolute secret values, non-NEXT_PUBLIC secrets
#    referenced from client code).
#
# 4. RLS coverage — verifies that every table in the first migration has
#    an accompanying alter table ... enable row level security line.
#
# Exit codes: 0 = all checks passed; 1 = one or more checks failed.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSES=0
FAILS=0

info() { echo -e "${GREEN}[PASS]${NC} $*"; PASSES=$((PASSES + 1)); }
warn() {
  echo -e "${YELLOW}[WARN]${NC} $*" >&2;
  FAILS=$((FAILS + 1));
}
die() {
  echo -e "${RED}[FAIL]${NC} $*" >&2;
  FAILS=$((FAILS + 1));
}

echo "=========================================="
echo " Phikila security checks"
echo "=========================================="
echo ""

# ── 1. Secret scanner ───────────────────────────────────────────────────────
echo "▶ Scanning git history for secrets..."

BAD_PATTERNS=(
  "AKIA[0-9A-Z]{16}"                       # AWS access key id
  "sk-[0-9a-zA-Z]{32,}"                    # OpenAI-style secret
  "ghp_[0-9a-zA-Z]{36}"                    # GitHub PAT
  "xoxb-[0-9a-zA-Z-]{33,}"                # Slack bot token
  "pk_[0-9a-zA-Z]{32,}"                    # Stripe publishable (harmless, but flag)
  "sk_live_[0-9a-zA-Z]{24}"               # Stripe live secret
  "-----BEGIN (RSA |EC )?PRIVATE KEY-----" # Private keys
  "supabase_(an)`?on_(key|url)"            # In case anon key leaked as raw value
  "service_role"                            # Direct mention of the role escalation key
)

HITS=0
for PAT in "${BAD_PATTERNS[@]}"; do
  # git log --all --raw gives us all blobs; git grep --cached would only
  # scan HEAD. We want history too, so we use git grep on every committed
  # blob referenced by rev-list.
  while IFS= read -r -d '' blob; do
    out=$(git cat-file -p "$blob" 2>/dev/null | grep -E "$PAT" || true)
    if [ -n "$out" ]; then
      HITS=$((HITS + 1))
      # Find the commit that introduced this blob (first-parent history, best effort)
      commit=$(git log --all --diff-filter=A --format="%H" -- "$blob" 2>/dev/null | head -1 || true)
      die "Possible secret in blob $blob${commit:+ (introduced by $commit)}: $out"
    fi
  done < <(git rev-list --all --objects 2>/dev/null | awk '/^[0-9a-f]{40} [^.]+\\.(ts|tsx|js|jsx|json|env|config|yaml|toml|sql|md|txt|css|html)$/ {print $1 "\x00"}' | tr -d '\n' | xargs -0 printf '%s')

done

if [ "$HITS" -eq 0 ]; then
  info "No hardcoded secrets found in git history."
fi
echo ""

# ── 2. Dependency audit ─────────────────────────────────────────────────────
echo "▶ Running npm audit..."

AUDIT_JSON="$ROOT/.security/npm-audit.json"
mkdir -p "$(dirname "$AUDIT_JSON")"

# npm audit --json exits non-zero when vulnerabilities exist; capture output
# anyway and let the post-processing decide.
npm audit --json --omit=dev > "$AUDIT_JSON" 2>/dev/null || true

# Count actionable vulnerabilities (anything other than 'info' severity)
HIGH=$(jq -r '[.advisory[]? | select(.severity=="high")] | length' "$AUDIT_JSON" 2>/dev/null || echo 0)
MODERATE=$(jq -r '[.advisory[]? | select(.severity=="moderate")] | length' "$AUDIT_JSON" 2>/dev/null || echo 0)
LOW=$(jq -r '[.advisory[]? | select(.severity=="low")] | length' "$AUDIT_JSON" 2>/dev/null || echo 0)
CRITICAL=$(jq -r '[.advisory[]? | select(.severity=="critical")] | length' "$AUDIT_JSON" 2>/dev/null || echo 0)

TOTAL=$((HIGH + MODERATE + LOW + CRITICAL))

if [ "$TOTAL" -eq 0 ]; then
  info "No vulnerabilities reported by npm audit."
else
  warn "$TOTAL vulnerability advisory(ies) reported: critical=$CRITICAL high=$HIGH moderate=$MODERATE low=$low. See $AUDIT_JSON"
  echo "     Run: npm audit --fix   (test after!)"
fi
echo ""

# ── 3. Manifest sanity ──────────────────────────────────────────────────────
echo "▶ Checking package.json for bad patterns..."

MANIFEST="$ROOT/package.json"
if [ ! -f "$MANIFEST" ]; then
  die "package.json not found."
else
  # Ensure 'private' is true (already is, but confirm)
  PRIVATE=$(jq -r '.private // false' "$MANIFEST")
  if [ "$PRIVATE" != "true" ]; then
    warn "package.json is not marked 'private'. If this is not an npm-published package, set private: true."
  else
    info "package.json marked private=true."
  fi

  # Look for literal secrets in package.json itself (e.g. an accidentally
  # committed key in an npm script or config block). Very unlikely but cheap.
  if grep -qE '(AKIA|sk-[0-9a-zA-Z]{32}|ghp_|xoxb_|pk_|sk_live_|-----BEGIN)' "$MANIFEST"; then
    die "package.json contains a pattern that looks like a secret."
  else
    info "No secret-like patterns in package.json."
  fi
fi
echo ""

# ── 4. RLS coverage ─────────────────────────────────────────────────────────
echo "▶ Checking RLS coverage in migrations..."

MIG_DIR="$ROOT/supabase/migrations"
FIRST_MIG="$MIG_DIR/001_initial_schema.sql"

if [ ! -f "$FIRST_MIG" ]; then
  die "001_initial_schema.sql not found — cannot verify RLS coverage."
else
  TABLES=$(grep -oE 'create table [a-z_]+' "$FIRST_MIG" | awk '{print $3}' | sort -u)
  RLS_TABLES=$(grep -oE 'alter table [a-z_]+ enable row level security' "$FIRST_MIG" "$MIG_DIR"/*.sql 2>/dev/null | awk '{print $3}' | sort -u)

  MISSING=$(comm -23 <(echo "$TABLES") <(echo "$RLS_TABLES"))

  if [ -z "$MISSING" ]; then
    info "All tables have RLS enabled."
  else
    warn "Tables missing RLS: $(echo "$MISSING" | tr '\n' ' ')"
    echo "     Added: supabase/migrations/007_rls_for_remaining_tables.sql"
  fi
fi
echo ""

# ── 5. Security headers check ──────────────────────────────────────────────
echo "▶ Checking security headers in next.config.ts..."
HEADERS_FILE="$ROOT/next.config.ts"
if [ -f "$HEADERS_FILE" ]; then
  if grep -q 'Strict-Transport-Security' "$HEADERS_FILE" && \
     grep -q 'X-Frame-Options' "$HEADERS_FILE" && \
     grep -q 'X-Content-Type-Options' "$HEADERS_FILE" && \
     grep -q 'Content-Security-Policy' "$HEADERS_FILE"; then
    info "next.config.ts contains the core security headers."
  else
    warn "next.config.ts appears to be missing some security headers."
  fi
else
  warn "next.config.ts not found — security headers may not be set."
fi
echo ""

# ── Summary ────────────────────────────────────────────────────────────────
echo "=========================================="
echo " Results: $PASSES passed, $FAILS flagged"
echo "=========================================="

if [ "$FAILS" -gt 0 ]; then
  echo ""
  echo "Action items:"
  echo "  - Fix any flagged items above."
  echo "  - Install a real secret scanner in CI (gitleaks / trufflehog)."
  echo "  - Run 'npm audit --fix' and re-test."
  echo ""
  exit 1
else
  echo "All checks passed."
  exit 0
fi
