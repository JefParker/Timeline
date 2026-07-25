#!/usr/bin/env bash
#
# Provisions the three admin environment variables the app needs:
#   ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SECRET
#
# ADMIN_SECRET signs the admin session cookie. ADMIN_PASSWORD is generated
# rather than chosen, so it is not something guessable or reused.
#
# Usage:
#   bash scripts/setup-secrets.sh                 # production
#   ENVIRONMENT=preview bash scripts/setup-secrets.sh
#   ADMIN_USERNAME=jake bash scripts/setup-secrets.sh
#
# Values are piped to wrangler over stdin, so they never appear in your shell
# history or in the process list.

set -euo pipefail

PROJECT="${PROJECT:-timeline}"
ENVIRONMENT="${ENVIRONMENT:-production}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"

# The JS is single-quoted so the shell cannot touch it; the byte count is passed
# as a real argument rather than interpolated into the source.
gen() {
  node -e 'console.log(require("crypto").randomBytes(Number(process.argv[1])).toString("base64url"))' "$1"
}

echo "==> Checking Pages project '$PROJECT'"
# Matched as a whole table field. A plain `grep -w timeline` would also match
# "timeline-74i", since the hyphen counts as a word boundary.
if ! npx --yes wrangler@4 pages project list 2>/dev/null \
     | grep -qE "(^|[[:space:]|])${PROJECT}([[:space:]|]|\$)"; then
  echo
  echo "ERROR: no Pages project named '$PROJECT'." >&2
  echo "Your deployment URL suggests it may be 'timeline-74i'. Projects found:" >&2
  echo >&2
  npx --yes wrangler@4 pages project list >&2 || true
  echo >&2
  echo "Re-run with the right name, e.g.:  PROJECT=timeline-74i bash scripts/setup-secrets.sh" >&2
  exit 1
fi

ADMIN_SECRET="$(gen 32)"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(gen 18)}"

put() {
  printf '%s' "$2" | npx --yes wrangler@4 pages secret put "$1" \
    --project-name "$PROJECT" --env "$ENVIRONMENT" >/dev/null
  echo "    set $1"
}

echo "==> Writing secrets to '$PROJECT' ($ENVIRONMENT)"
put ADMIN_USERNAME "$ADMIN_USERNAME"
put ADMIN_PASSWORD "$ADMIN_PASSWORD"
put ADMIN_SECRET   "$ADMIN_SECRET"

echo "==> Writing .dev.vars for local development"
umask 077
cat > .dev.vars <<EOF
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_SECRET=$ADMIN_SECRET
EOF

echo "==> Remote secrets now configured:"
npx --yes wrangler@4 pages secret list --project-name "$PROJECT" --env "$ENVIRONMENT" || true

cat <<EOF

------------------------------------------------------------
SAVE THESE NOW — the password is not recoverable from Cloudflare.

  Username:  $ADMIN_USERNAME
  Password:  $ADMIN_PASSWORD

Also written to .dev.vars (gitignored) for local dev.
Pages applies new secrets on the next deployment, so redeploy
before logging in:  npx wrangler pages deploy public --project-name $PROJECT
------------------------------------------------------------
EOF
