#!/usr/bin/env node
/**
 * Regenerates public/puzzles.json, the offline fallback puzzle set.
 *
 * The file used to be a hand-maintained snapshot. It silently expired (the last
 * committed version ran out on 2026-09-01 and had gaps after that), which meant
 * offline players and anyone with a cold cache got "Error Loading Puzzle".
 *
 * Rather than reimplementing the generator, this script asks the running app
 * for each day. That guarantees the fallback is byte-identical to what the API
 * serves for the same date, including the special-event overrides.
 *
 * Usage:
 *   npm run dev                      # in another terminal
 *   npm run build:puzzles
 *
 *   node scripts/build-puzzles-json.mjs [baseUrl] [days]
 *   node scripts/build-puzzles-json.mjs https://timeline-74i.pages.dev 365
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '..', 'public', 'puzzles.json');

// wrangler reports "localhost", which may resolve to ::1, to 127.0.0.1, or to
// both depending on the machine. Try each candidate rather than guessing.
const DEFAULT_BASE_URLS = [
    'http://localhost:8788',
    'http://127.0.0.1:8788',
    'http://[::1]:8788'
];
const DEFAULT_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CONSECUTIVE_FAILURES = 5;

const explicitBaseUrl = process.argv[2] ? process.argv[2].replace(/\/+$/, '') : null;
const days = Number(process.argv[3]) || DEFAULT_DAYS;

const LA_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

function laToday() {
    return LA_DATE_FORMATTER.format(new Date());
}

function addDays(dateStr, delta) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const shifted = new Date(Date.UTC(year, month - 1, day) + delta * DAY_MS);
    return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
}

function describeError(err) {
    const code = err?.cause?.code || err?.code;
    return code ? `${err.message} (${code})` : err.message;
}

async function fetchPuzzle(baseUrl, dateStr) {
    const res = await fetch(`${baseUrl}/api/puzzles?date=${encodeURIComponent(dateStr)}`);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${dateStr}`);
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
        return null;
    }
    return data[0];
}

/**
 * Finds a reachable server before doing any real work, so a wrong address
 * fails immediately instead of after N identical connection errors.
 */
async function resolveBaseUrl(probeDate) {
    const candidates = explicitBaseUrl ? [explicitBaseUrl] : DEFAULT_BASE_URLS;
    const failures = [];

    for (const candidate of candidates) {
        try {
            await fetchPuzzle(candidate, probeDate);
            return candidate;
        } catch (err) {
            failures.push(`  ${candidate} — ${describeError(err)}`);
        }
    }

    console.error(`\nCould not reach the puzzles API.\n${failures.join('\n')}\n`);
    console.error(
        'Start the dev server in another terminal with "npm run dev", or pass a\n' +
        'URL explicitly:\n\n' +
        '  node scripts/build-puzzles-json.mjs http://localhost:8788\n' +
        '  node scripts/build-puzzles-json.mjs https://timeline-74i.pages.dev\n'
    );
    process.exit(1);
}

async function main() {
    // Start two days back, matching the window the API itself serves.
    const start = addDays(laToday(), -2);

    const baseUrl = await resolveBaseUrl(start);
    console.log(`Building ${days} days of puzzles from ${baseUrl}, starting ${start}`);

    const puzzles = [];
    const missing = [];
    let consecutiveFailures = 0;

    for (let i = 0; i < days; i++) {
        const dateStr = addDays(start, i);
        try {
            const puzzle = await fetchPuzzle(baseUrl, dateStr);
            if (puzzle && Array.isArray(puzzle.events) && puzzle.events.length === 7) {
                puzzles.push(puzzle);
                consecutiveFailures = 0;
            } else {
                missing.push(dateStr);
                consecutiveFailures = 0; // a valid empty answer, not a transport failure
            }
        } catch (err) {
            console.error(`  ${dateStr}: ${describeError(err)}`);
            missing.push(dateStr);

            // Bail out rather than grinding through every remaining day
            // reporting the same connection error.
            if (++consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                console.error(
                    `\nAborting after ${consecutiveFailures} consecutive failures — ` +
                    `the server at ${baseUrl} stopped responding.`
                );
                process.exit(1);
            }
        }

        if ((i + 1) % 25 === 0) {
            console.log(`  ...${i + 1}/${days}`);
        }
    }

    if (puzzles.length === 0) {
        console.error(`\nNo puzzles were returned by ${baseUrl}.`);
        process.exit(1);
    }

    if (missing.length > 0) {
        console.warn(`\nWarning: ${missing.length} day(s) missing, first few: ${missing.slice(0, 5).join(', ')}`);
    }

    // Sorted and contiguity-checked so a gap cannot slip in unnoticed again.
    puzzles.sort((a, b) => a.date.localeCompare(b.date));

    const gaps = [];
    for (let i = 1; i < puzzles.length; i++) {
        if (addDays(puzzles[i - 1].date, 1) !== puzzles[i].date) {
            gaps.push(`${puzzles[i - 1].date} -> ${puzzles[i].date}`);
        }
    }
    if (gaps.length > 0) {
        console.warn(`Warning: ${gaps.length} gap(s) in coverage: ${gaps.slice(0, 5).join(', ')}`);
    }

    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, JSON.stringify(puzzles, null, 2) + '\n', 'utf8');

    console.log(
        `\nWrote ${puzzles.length} puzzles to public/puzzles.json ` +
        `(${puzzles[0].date} to ${puzzles[puzzles.length - 1].date})`
    );
    console.log('Remember to bump CACHE_NAME in public/sw.js so clients pick up the new file.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
