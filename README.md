# Timeline

A daily historical-event ordering game. Static front end plus Cloudflare Pages
Functions and a D1 database.

## Layout

```
public/            Static app shell (served by Pages)
functions/api/     Pages Functions — every file here is a public route
lib/               Shared server modules (NOT routed — must stay outside functions/)
scripts/           Maintenance scripts
test/              Node test-runner unit tests
migrations/        Optional one-off SQL migrations
```

## Required environment variables

Set these in the Cloudflare dashboard under **Settings → Environment variables**,
or in a local `.dev.vars` file (already gitignored).

| Variable | Purpose |
| --- | --- |
| `ADMIN_USERNAME` | Admin dashboard username |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `ADMIN_SECRET` | Random string used to HMAC-sign the admin session cookie |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**If any of the three are missing, `/api/login` returns 503 and admin login is
disabled.** This is deliberate — it previously accepted an empty request body
when the variables were unset.

`.dev.vars` example:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-something-long
ADMIN_SECRET=paste-the-generated-value-here
```

## Development

```bash
npm install
npm run dev          # http://127.0.0.1:8788
npm test             # unit tests for lib/
```

## Database

```bash
npm run db:schema    # safe: only creates missing tables and indexes
```

- `schema.sql` is idempotent and never drops anything.
- `schema-reset.sql` **destroys all data** and rebuilds from scratch.
- `migrations/001_unique_user_date.sql` adds a uniqueness constraint on
  `(user_id, puzzle_date)`. Run it once; it de-duplicates first.

## Regenerating the offline puzzle set

`public/puzzles.json` is the last-resort fallback used when both the API and the
localStorage cache are unavailable. It is a snapshot with a finite horizon, so
it needs periodic regeneration — otherwise offline players eventually see
"Error Loading Puzzle".

```bash
npm run dev                                    # terminal 1
npm run build:puzzles                          # terminal 2 — defaults to 180 days
node scripts/build-puzzles-json.mjs https://your-deployment.pages.dev 365
```

The script fetches each day from `/api/puzzles`, so the fallback always matches
what the API serves. It warns about gaps and missing days. **After regenerating,
bump `CACHE_NAME` in `public/sw.js`** so existing installs pick up the new file.

## API

| Route | Method | Notes |
| --- | --- | --- |
| `/api/puzzles` | GET | 60-day window, or one day via `?date=YYYY-MM-DD` |
| `/api/leaderboard` | GET | Top 10 for a date, plus the caller's own row |
| `/api/leaderboard` | POST | Submit a score |
| `/api/user` | GET / PUT | Read or set the caller's profile |
| `/api/login` | POST | Sets a signed, HttpOnly admin session cookie |
| `/api/logout` | POST | Clears it |
| `/api/session` | GET | Whether the caller currently holds an admin session |

The leaderboard response never includes player IDs. The full board (`all`) is
only returned to an authenticated admin.

## Known limitation: score submission is not verifiable

Scores are submitted by the client and range-checked server-side, but they
cannot be *verified*. Correctness depends on the order cards were dealt and
where the player dropped each one; the stored `placedCards` array is always the
fully-sorted timeline, so it carries no record of the player's actual guesses.

Closing this properly needs a server-authoritative game loop — deal one card at
a time, validate each placement, keep the score server-side. That is a protocol
change, not a patch. Until then a determined player can POST an arbitrary score
for their own player ID.
