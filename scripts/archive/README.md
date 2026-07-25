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
