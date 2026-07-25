#!/usr/bin/env bash
#
# One-time housekeeping:
#   1. Moves the superseded one-off scripts and raw event dumps into
#      scripts/archive/ (via git mv, so history is preserved).
#   2. Commits that along with the pending schema.sql tweak.
#
# Safe to re-run: anything already moved or missing is skipped.
#
#   bash scripts/archive-legacy.sh

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

DEST="scripts/archive"
mkdir -p "$DEST"

# Superseded by `npm run build:puzzles`. Several of these rewrite
# functions/api/puzzles.js or public/sw.js from stale templates and are
# currently stubbed out with refuse-to-run guards.
LEGACY=(
    add_puzzles.js
    capture_themes.js
    inject_nobel_puzzles.js
    inject_sports_puzzles.js
    patch_puzzles.js
    stitch_events.js
    update_puzzles.js
    make_icons.sh
    test_generation.js
    test_generation.mjs
    test_puzzles.js
    test_puzzles2.js
    test_puzzles3.js
    test_puzzles4.js
    test_puzzles5.js
    test_run.js
    test_run3.js
    test_run4.js
    test_run5.js
    scripts/add_brainstormed_puzzles.js
)

moved=0
skipped=0

move_one() {
    local path="$1"
    local target="$DEST/$(basename "$path")"

    if [ ! -e "$path" ]; then
        skipped=$((skipped + 1))
        return 0
    fi
    if [ -e "$target" ]; then
        echo "    already archived: $(basename "$path")"
        skipped=$((skipped + 1))
        return 0
    fi

    # git mv keeps history for tracked files; plain mv covers untracked ones.
    if git ls-files --error-unmatch "$path" >/dev/null 2>&1; then
        git mv "$path" "$target"
    else
        mv "$path" "$target"
    fi
    echo "    archived: $path"
    moved=$((moved + 1))
}

echo "==> Archiving legacy scripts"
for f in "${LEGACY[@]}"; do
    move_one "$f"
done

echo "==> Archiving raw event dumps"
shopt -s nullglob
for f in events_*.json; do
    move_one "$f"
done
shopt -u nullglob

cat > "$DEST/README.md" <<'EOF'
# Archived scripts

One-off tools from before the puzzle pipeline was consolidated. Kept for
reference only — none of them are part of the build.

Several rewrite `functions/api/puzzles.js`, `public/sw.js` or
`public/puzzles.json` from templates that no longer match the current code, so
they are stubbed with a refuse-to-run guard. Running one unmodified would
clobber live source.

The supported replacement is:

    node scripts/build-puzzles-json.mjs https://timeline-74i.pages.dev

The `events_*.json` files are the raw category dumps those scripts consumed.
The authoritative event data now lives in `FALLBACK_DATA` inside
`functions/api/puzzles.js`.
EOF

echo "==> Moved $moved file(s), skipped $skipped"

if [ -z "$(git status --porcelain)" ]; then
    echo "==> Nothing to commit; working tree already clean"
    exit 0
fi

echo "==> Committing"
git add -A
git commit -m "Archive superseded one-off scripts and event dumps

Moves the pre-consolidation puzzle tooling into scripts/archive/. These were
stubbed with refuse-to-run guards because several rewrite live source files
from templates that no longer match the current module structure.

Also fixes schema.sql ending on a trailing comment, which made wrangler's SQL
ingest warn about a leftover buffer."

echo
echo "Done. Repo root is now:"
git ls-files --cached -- ':(top)*' | grep -v / | sed 's/^/    /'
