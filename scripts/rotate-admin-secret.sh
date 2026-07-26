#!/usr/bin/env bash
#
# Rotates one admin credential for the Cloudflare Pages project and keeps the
# local .dev.vars file in step, so local and deployed values cannot drift apart.
#
# Usage:
#   bash scripts/rotate-admin-secret.sh                  # ADMIN_SECRET (default)
#   bash scripts/rotate-admin-secret.sh ADMIN_PASSWORD
#   PROJECT=timeline-74i bash scripts/rotate-admin-secret.sh ADMIN_SECRET
#
# The two are different things and are not interchangeable:
#   ADMIN_SECRET   — HMAC key that signs the session cookie (lib/auth.js).
#                    Never typed by a human. Rotating it signs everyone out.
#                    Use a long random value:
#                      node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
#   ADMIN_PASSWORD — what you type into the login form. Choose something you
#                    can actually enter by hand.
#   ADMIN_USERNAME — the matching login name.
#
# Rotating one never affects the others.
#
# This script never deploys. Deploying would ship whatever else happens to be
# sitting in the working tree; that has to be a deliberate act.

# No `set -e`: every step below checks its own exit status and reports a FAIL
# line, which gives better messages than an unexplained early exit.
set -u
set -o pipefail

PROJECT="${PROJECT:-timeline}"
ENVIRONMENT="production"
DEV_VARS_FILE=".dev.vars"

# Which variable to rotate. Restricted to an allowlist: a typo here would
# otherwise create a brand-new variable in Cloudflare that nothing reads, and
# the failure would be silent until a login broke.
KEY_NAME="${1:-ADMIN_SECRET}"
case "$KEY_NAME" in
  # 32 random bytes as base64url is 43 chars; 24 is a floor, not a target.
  ADMIN_SECRET)   MIN_LEN=24 ;;
  # Long enough to be worth having, short enough to type.
  ADMIN_PASSWORD) MIN_LEN=12 ;;
  ADMIN_USERNAME) MIN_LEN=1  ;;
  *)
    echo "Unknown variable '$KEY_NAME'." >&2
    echo "Expected one of: ADMIN_SECRET, ADMIN_PASSWORD, ADMIN_USERNAME" >&2
    exit 1
    ;;
esac

# --generate produces the value internally instead of prompting, so it is never
# displayed, never copied through a clipboard, and never enters shell history.
# Allowed only for ADMIN_SECRET: generating a value for ADMIN_PASSWORD or
# ADMIN_USERNAME would hand you a credential you then cannot type.
GENERATE=no
case "${2:-}" in
  "") ;;
  --generate)
    [ "$KEY_NAME" = "ADMIN_SECRET" ] \
      || { echo "--generate is only valid for ADMIN_SECRET." >&2; exit 1; }
    GENERATE=yes
    ;;
  *)
    echo "Unknown option '${2}'. Only --generate is supported." >&2
    exit 1
    ;;
esac

# ---------------------------------------------------------------- output ----

if [ -t 1 ]; then
  C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
  C_BOLD=$'\033[1m'; C_OFF=$'\033[0m'
else
  C_RED=''; C_GREEN=''; C_YELLOW=''; C_BOLD=''; C_OFF=''
fi

pass() { printf '%sPASS%s  %s\n' "$C_GREEN" "$C_OFF" "$1"; }
warn() { printf '%sWARN%s  %s\n' "$C_YELLOW" "$C_OFF" "$1"; }
fail() { printf '%sFAIL%s  %s\n' "$C_RED" "$C_OFF" "$1" >&2; exit 1; }
head_() { printf '\n%s==> %s%s\n' "$C_BOLD" "$1" "$C_OFF"; }

# ------------------------------------------------------------- preflight ----

head_ "Preflight"

[ -f wrangler.toml ] && [ -f package.json ] && [ -d functions ] \
  || fail "Run this from the project root (no wrangler.toml / package.json / functions/ here)."
pass "In project root"

command -v python3 >/dev/null 2>&1 \
  || fail "python3 not found. It is required to rewrite $DEV_VARS_FILE safely."
pass "python3 available"

# Pages and Workers behave differently at the end of this script, so detect
# rather than assume. Pages projects declare pages_build_output_dir; Workers
# declare a `main` entrypoint.
if grep -qE '^[[:space:]]*pages_build_output_dir[[:space:]]*=' wrangler.toml; then
  PLATFORM="pages"
elif grep -qE '^[[:space:]]*main[[:space:]]*=' wrangler.toml; then
  PLATFORM="workers"
else
  fail "Cannot tell from wrangler.toml whether this is Pages or Workers. Refusing to guess."
fi
pass "Platform: Cloudflare ${PLATFORM}"

[ "$PLATFORM" = "pages" ] \
  || fail "This script only implements the Pages path; adapt it before using it on a Worker."

echo "      Checking Cloudflare authentication (this may open a browser)..."
npx --yes wrangler@4 whoami >/dev/null 2>&1 \
  || fail "npx wrangler whoami failed. Run 'npx wrangler login' first."
pass "Authenticated to Cloudflare"

# Matched as a whole table field. A plain `grep -w timeline` would also match
# "timeline-74i", because the hyphen counts as a word boundary.
if ! npx --yes wrangler@4 pages project list 2>/dev/null \
     | grep -qE "(^|[[:space:]|])${PROJECT}([[:space:]|]|\$)"; then
  echo >&2
  echo "Projects visible on this account:" >&2
  npx --yes wrangler@4 pages project list >&2 || true
  echo >&2
  fail "No Pages project named '$PROJECT'. Re-run as: PROJECT=<name> bash $0"
fi
pass "Pages project '$PROJECT' exists"

# A secret in a file that is tracked by git is not a secret. Check before we
# write to it, not after.
DEV_VARS_IGNORED=no
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if git check-ignore -q "$DEV_VARS_FILE" 2>/dev/null; then
    DEV_VARS_IGNORED=yes
    pass "$DEV_VARS_FILE is gitignored"
  else
    warn "$DEV_VARS_FILE is NOT gitignored — the new secret would be committable."
  fi
else
  warn "Not a git work tree; cannot verify $DEV_VARS_FILE is ignored."
fi

# ------------------------------------------------------------ read value ----

head_ "New value for $KEY_NAME"

if [ "$GENERATE" = "yes" ]; then
  command -v node >/dev/null 2>&1 || fail "node not found; needed for --generate."
  # Captured straight into a shell variable. Nothing is echoed, and the value
  # never becomes an argument to any process.
  NEW_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("base64url"))')" \
    || fail "Failed to generate a value."
  [ -n "$NEW_SECRET" ] || fail "Generator produced an empty value."
  pass "Generated a random value (${#NEW_SECRET} characters, not displayed)"
else

# Read from /dev/tty, not stdin, for two reasons:
#   1. It keeps the value out of shell history and out of any pipeline.
#   2. If someone pastes a multi-line block, only the terminal line is consumed
#      as the answer — the rest is not silently swallowed from stdin.
[ -r /dev/tty ] || fail "No terminal available. This script must be run interactively."

if [ "$KEY_NAME" = "ADMIN_SECRET" ]; then
  cat >/dev/tty <<EOF
This value is never typed by a human. Generate a random one:
  node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
EOF
else
  cat >/dev/tty <<EOF
This is the value you will type into the login form. Choose accordingly.
EOF
fi

cat >/dev/tty <<EOF

Input is hidden. Minimum length: $MIN_LEN characters.
EOF

printf 'New %s: ' "$KEY_NAME" >/dev/tty
IFS= read -r -s NEW_SECRET </dev/tty
printf '\n' >/dev/tty

printf 'Confirm %s: ' "$KEY_NAME" >/dev/tty
IFS= read -r -s NEW_SECRET_CONFIRM </dev/tty
printf '\n' >/dev/tty

[ -n "$NEW_SECRET" ] || fail "Empty value rejected."
[ "$NEW_SECRET" = "$NEW_SECRET_CONFIRM" ] || fail "The two entries do not match."
[ "${#NEW_SECRET}" -ge "$MIN_LEN" ] \
  || fail "Value is ${#NEW_SECRET} characters; minimum is $MIN_LEN."
unset NEW_SECRET_CONFIRM

pass "Value accepted (${#NEW_SECRET} characters)"

fi   # end of interactive-prompt branch

# ------------------------------------------------------ push to Cloudflare ---

head_ "Updating $KEY_NAME on '$PROJECT' ($ENVIRONMENT)"

# Piped on stdin, never as an argv element. Anything in argv is visible in
# `ps` and /proc/<pid>/cmdline to every other user on the machine. `printf` is
# a bash builtin, so the value never becomes a separate process's arguments.
if ! printf '%s' "$NEW_SECRET" \
     | npx --yes wrangler@4 pages secret put "$KEY_NAME" \
         --project-name "$PROJECT" --env "$ENVIRONMENT" >/dev/null; then
  fail "wrangler pages secret put failed. Nothing local was changed."
fi
pass "Remote $KEY_NAME updated"

# -------------------------------------------------------- update .dev.vars ---

head_ "Syncing $DEV_VARS_FILE"

# Rewritten with python3, not sed. A secret can contain /, &, backslashes and
# backreference syntax, all of which sed interprets inside a replacement and
# silently corrupts. The value is handed over via the environment rather than
# argv for the same ps-visibility reason as above; /proc/<pid>/environ is
# readable only by the owning user, /proc/<pid>/cmdline by everyone.
if ! ROTATE_SECRET_VALUE="$NEW_SECRET" \
     ROTATE_KEY_NAME="$KEY_NAME" \
     ROTATE_FILE="$DEV_VARS_FILE" \
     python3 - <<'PY'
import os, sys

key   = os.environ["ROTATE_KEY_NAME"]
value = os.environ["ROTATE_SECRET_VALUE"]
path  = os.environ["ROTATE_FILE"]

try:
    with open(path, "r", encoding="utf-8") as fh:
        lines = fh.read().splitlines()
except FileNotFoundError:
    lines = []

# Replace the key in place if present, preserving every other line (comments,
# ordering, unrelated variables). Append only if it was absent.
out, replaced = [], False
for line in lines:
    stripped = line.lstrip()
    if not stripped.startswith("#") and stripped.split("=", 1)[0].strip() == key:
        out.append(f"{key}={value}")
        replaced = True
    else:
        out.append(line)
if not replaced:
    out.append(f"{key}={value}")

# Opened 0600 from the outset: no window in which the file exists world-readable,
# and no temp file left behind holding the value.
fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
with os.fdopen(fd, "w", encoding="utf-8") as fh:
    fh.write("\n".join(out) + "\n")

print("replaced" if replaced else "appended", file=sys.stderr)
PY
then
  fail "Failed to update $DEV_VARS_FILE. The REMOTE secret was already changed — \
local and deployed values are now out of sync. Fix $DEV_VARS_FILE by hand."
fi

chmod 600 "$DEV_VARS_FILE" 2>/dev/null || warn "Could not chmod 600 $DEV_VARS_FILE"
pass "$DEV_VARS_FILE updated and chmod 600"

unset NEW_SECRET

if [ "$DEV_VARS_IGNORED" != "yes" ]; then
  echo
  printf '%s' "$C_RED"
  cat <<EOF
################################################################
#  $DEV_VARS_FILE IS NOT GITIGNORED AND NOW CONTAINS A LIVE SECRET.
#  Add it to .gitignore before your next commit:
#      echo '$DEV_VARS_FILE' >> .gitignore
################################################################
EOF
  printf '%s' "$C_OFF"
fi

# ---------------------------------------------------------- what's next ------

# THE PART THAT IS EASY TO GET WRONG:
# Cloudflare Pages binds environment variables and secrets to a deployment at
# deploy time. The running deployment keeps the OLD value until a NEW deployment
# is created. Workers are the opposite — there a secret takes effect on the very
# next request, with no redeploy. This project is Pages, so the rotation is not
# live yet.
cat <<EOF

$C_BOLD-------------------------------------------------------------$C_OFF
${C_YELLOW}THE ROTATION IS NOT LIVE YET.$C_OFF

Cloudflare Pages binds secrets at DEPLOYMENT time. The currently
running deployment still holds the old $KEY_NAME and will keep
accepting old session cookies until a new deployment exists.
(On a Worker this would already be live — Pages is the exception.)

Deploy when your working tree is in a state you want shipped:

  npx wrangler pages deploy public --project-name $PROJECT

Then confirm it took effect by testing the real endpoint — do not
trust the fact that this script printed PASS.
EOF

if [ "$KEY_NAME" = "ADMIN_SECRET" ]; then
  cat <<EOF
Every existing admin session is invalidated once that deploy lands.
Log in again afterwards with your UNCHANGED username and password.
EOF
fi

printf '%s-------------------------------------------------------------%s\n' "$C_BOLD" "$C_OFF"

pass "Done"
