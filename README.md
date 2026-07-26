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

| Variable | Purpose | Typed by a human? |
| --- | --- | --- |
| `ADMIN_USERNAME` | Admin dashboard username | Yes — at the login form |
| `ADMIN_PASSWORD` | Admin dashboard password | Yes — at the login form |
| `ADMIN_SECRET` | HMAC key that signs the admin session cookie | **Never** |

**`ADMIN_SECRET` is not a password.** It is a machine-only key used by
`lib/auth.js` to sign and verify the `tl_admin` cookie; nobody ever enters it
anywhere. Make it long and random, and don't try to type it into the login form
— that field wants `ADMIN_PASSWORD`. Confusing the two is the easiest mistake to
make here, and it presents as "Invalid credentials" with no hint as to why.

Rotating one has no effect on the others. Rotating `ADMIN_SECRET` signs out
every existing admin session but leaves the username and password unchanged.

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

## Rotating credentials

```bash
bash scripts/rotate-admin-secret.sh ADMIN_SECRET --generate   # generated, never displayed
bash scripts/rotate-admin-secret.sh ADMIN_PASSWORD            # prompts twice, hidden
```

Each run updates Cloudflare and rewrites the matching line in `.dev.vars`, so
local and deployed values cannot drift apart. `scripts/setup-secrets.sh`
provisions all three from scratch; use it for a new project, not for rotation.

**Pages binds environment variables at deployment time.** Updating a secret does
not affect the running deployment — the old value keeps working until a new
deployment exists. (Workers are the opposite: there a secret applies on the next
request.) So rotation is a two-step operation:

```bash
npx wrangler pages deploy public --project-name timeline
```

Neither script deploys for you, because deploying ships whatever else is sitting
in the working tree. Check `git status` first.

Afterwards, verify against the real endpoint rather than trusting that the
command reported success — a session cookie issued before the rotation should
now be rejected:

```bash
curl -s https://timeline-74i.pages.dev/api/session -H "Cookie: tl_admin=<old-token>"
```

`{"admin":false}` means the new `ADMIN_SECRET` is live. On `/api/login`, 200 is
success, 401 means wrong username/password, and 503 means one of the three
variables is missing or empty on the deployment (`functions/api/login.js`).

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

## Authoring puzzle content

Puzzles are not stored — they are generated deterministically from the
`FALLBACK_DATA` pool in `functions/api/puzzles.js`. A seeded PRNG picks a
category per day and draws 7 events with distinct years.

### Previewing

```bash
npm run preview:puzzles                                   # next 14 days
node scripts/preview-puzzles.mjs 30                       # next 30 days
node scripts/preview-puzzles.mjs 60 --quiet               # warnings only
node scripts/preview-puzzles.mjs 30 https://timeline-74i.pages.dev
```

Read-only. Flags puzzles that are hard or malformed — duplicate years, all
events clustered within a few decades, repeated near-ties — and reports
categories that recur inside the window.

### Adding events

```bash
npm run events:list                                       # pool sizes per category
node scripts/add-events.mjs Sports new-events.json --dry-run
node scripts/add-events.mjs Sports new-events.json
```

`new-events.json` is a plain array:

```json
[
  { "event": "Rugby World Cup is first contested", "year": 1987 }
]
```

Duplicate event text is skipped, years are range-checked, and the file is only
written if the rebuilt array re-parses cleanly.

> **Adding events reshuffles that category's entire history.** Generation
> shuffles the whole category array with a per-date seed, so changing its length
> changes every permutation — past dates included. Recorded scores are keyed by
> date and are unaffected, but the dashboard archive will no longer show what
> players actually played. Batch your additions, do them rarely, and re-run
> `npm run build:puzzles` afterwards.

### Special-date puzzles

One-off themed puzzles (World Chocolate Day, the Oscars) are hand-written
override blocks near the bottom of `functions/api/puzzles.js`, applied after
generation. They are immune to the reshuffling caveat above. Copy an existing
block to add another.

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
