#!/usr/bin/env node
/**
 * Appends new events to a category's FALLBACK_DATA pool in
 * functions/api/puzzles.js.
 *
 *   node scripts/add-events.mjs <Category> <events.json> [--dry-run]
 *   node scripts/add-events.mjs --list
 *
 * The input file is a JSON array:
 *
 *   [
 *     { "event": "Rugby World Cup is first contested", "year": 1987 },
 *     { "event": "The first Paralympic Winter Games are held", "year": 1976 }
 *   ]
 *
 * ---------------------------------------------------------------------------
 * IMPORTANT: adding events reshuffles that category's ENTIRE history.
 *
 * Puzzle generation shuffles the whole category array with a per-date seed.
 * Changing the array's length changes every permutation, so every past and
 * future puzzle in that category becomes a different set of events. Recorded
 * scores are keyed by date and are unaffected, but the dashboard archive will
 * no longer show what players actually played.
 *
 * The practical consequence: batch your additions, and prefer doing them
 * rarely. Afterwards, re-run `npm run build:puzzles`.
 * ---------------------------------------------------------------------------
 *
 * The file is edited by locating the category's array and matching brackets,
 * not by regex over the whole source. It refuses to write if the result does
 * not re-parse cleanly.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = resolve(__dirname, '..', 'functions', 'api', 'puzzles.js');

const MIN_YEAR = -10000;
const MAX_YEAR = new Date().getFullYear() + 1;
const EVENTS_PER_PUZZLE = 7;

function fail(message) {
    console.error(`\nERROR: ${message}\n`);
    process.exit(1);
}

/**
 * Returns [start, end) offsets of the array literal following `"<name>": [`,
 * found by bracket matching rather than by pattern. String contents are
 * skipped so a `]` inside an event title cannot end the scan early.
 */
function findCategoryArray(source, category) {
    const marker = `"${category}": [`;
    const markerIndex = source.indexOf(marker);
    if (markerIndex === -1) return null;

    const open = markerIndex + marker.length - 1; // index of '['
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = open; i < source.length; i++) {
        const ch = source[i];

        if (inString) {
            if (escaped) escaped = false;
            else if (ch === '\\') escaped = true;
            else if (ch === '"') inString = false;
            continue;
        }

        if (ch === '"') inString = true;
        else if (ch === '[') depth++;
        else if (ch === ']') {
            depth--;
            if (depth === 0) return { start: open, end: i + 1 };
        }
    }
    return null;
}

function listCategories(source) {
    const start = source.indexOf('const FALLBACK_DATA = {');
    if (start === -1) fail('Could not find FALLBACK_DATA in the source file.');

    const names = [];
    const re = /^ {4}"([^"]+)": \[/gm;
    let match;
    while ((match = re.exec(source)) !== null) {
        names.push(match[1]);
    }
    return names;
}

function validateIncoming(raw) {
    if (!Array.isArray(raw) || raw.length === 0) {
        fail('The events file must contain a non-empty JSON array.');
    }

    const cleaned = [];
    raw.forEach((entry, i) => {
        const where = `entry ${i + 1}`;

        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            fail(`${where}: expected an object with "event" and "year".`);
        }
        if (typeof entry.event !== 'string' || entry.event.trim().length === 0) {
            fail(`${where}: "event" must be a non-empty string.`);
        }
        if (entry.event.length > 300) {
            fail(`${where}: "event" is longer than 300 characters.`);
        }
        if (!Number.isInteger(entry.year)) {
            fail(`${where}: "year" must be a whole number (negative for BCE).`);
        }
        if (entry.year < MIN_YEAR || entry.year > MAX_YEAR) {
            fail(`${where}: "year" ${entry.year} is outside ${MIN_YEAR}..${MAX_YEAR}.`);
        }

        cleaned.push({ event: entry.event.trim().replace(/\s+/g, ' '), year: entry.year });
    });

    return cleaned;
}

function formatEntry(entry) {
    return (
        '        {\n' +
        `            "event": ${JSON.stringify(entry.event)},\n` +
        `            "year": ${entry.year}\n` +
        '        }'
    );
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const positional = args.filter(a => !a.startsWith('--'));

    const source = await readFile(SOURCE_PATH, 'utf8');

    if (args.includes('--list') || positional.length === 0) {
        const names = listCategories(source);
        console.log('Categories in FALLBACK_DATA:\n');
        for (const name of names) {
            const span = findCategoryArray(source, name);
            const events = JSON.parse(source.slice(span.start, span.end));
            const uniqueYears = new Set(events.map(e => e.year)).size;
            console.log(
                `  ${name.padEnd(16)} ${String(events.length).padStart(3)} events, ` +
                `${String(uniqueYears).padStart(3)} unique years`
            );
        }
        console.log('\nUsage: node scripts/add-events.mjs <Category> <events.json> [--dry-run]');
        return;
    }

    const [category, eventsPath] = positional;
    if (!eventsPath) fail('Missing events file. Usage: add-events.mjs <Category> <events.json>');

    const span = findCategoryArray(source, category);
    if (!span) {
        fail(
            `No category "${category}" in FALLBACK_DATA.\n` +
            `Known categories: ${listCategories(source).join(', ')}`
        );
    }

    const arrayText = source.slice(span.start, span.end);
    let existing;
    try {
        existing = JSON.parse(arrayText);
    } catch (err) {
        fail(`Could not parse the existing "${category}" array as JSON: ${err.message}`);
    }

    let incoming;
    try {
        incoming = validateIncoming(JSON.parse(await readFile(eventsPath, 'utf8')));
    } catch (err) {
        if (err.code === 'ENOENT') fail(`Events file not found: ${eventsPath}`);
        throw err;
    }

    // Reject exact duplicates; warn on duplicate years, which are legal but can
    // never appear in the same puzzle (the generator de-duplicates by year).
    const existingEvents = new Set(existing.map(e => e.event.toLowerCase()));
    const existingYears = new Set(existing.map(e => e.year));
    const seenInBatch = new Set();

    const accepted = [];
    const skipped = [];
    const yearClashes = [];

    for (const entry of incoming) {
        const key = entry.event.toLowerCase();
        if (existingEvents.has(key) || seenInBatch.has(key)) {
            skipped.push(entry);
            continue;
        }
        seenInBatch.add(key);
        if (existingYears.has(entry.year)) yearClashes.push(entry);
        accepted.push(entry);
    }

    console.log(`Category "${category}": ${existing.length} events, ${existingYears.size} unique years`);
    console.log(`Input: ${incoming.length} event(s) — ${accepted.length} new, ${skipped.length} duplicate`);

    for (const entry of skipped) {
        console.log(`  skipped (already present): ${entry.event}`);
    }
    for (const entry of yearClashes) {
        console.log(`  note: ${entry.year} already used — both will never appear in one puzzle`);
    }

    if (accepted.length === 0) {
        console.log('\nNothing to add.');
        return;
    }

    const merged = existing.concat(accepted);
    const mergedUniqueYears = new Set(merged.map(e => e.year)).size;
    if (mergedUniqueYears < EVENTS_PER_PUZZLE) {
        fail(
            `"${category}" would have only ${mergedUniqueYears} unique years; ` +
            `${EVENTS_PER_PUZZLE} are needed to build a puzzle.`
        );
    }

    // Splice the new entries in before the array's closing bracket. `body`
    // already begins with its own newline, so it is concatenated directly.
    const body = arrayText.slice(1, arrayText.lastIndexOf(']')).replace(/\s+$/, '');
    const rebuilt =
        '[' +
        body +
        ',\n' +
        accepted.map(formatEntry).join(',\n') +
        '\n    ]';

    // Re-parse before writing: never leave the source file unparseable.
    try {
        const check = JSON.parse(rebuilt);
        if (check.length !== merged.length) {
            fail(`Rebuilt array has ${check.length} entries, expected ${merged.length}.`);
        }
    } catch (err) {
        fail(`Rebuilt array is not valid JSON, refusing to write: ${err.message}`);
    }

    const updated = source.slice(0, span.start) + rebuilt + source.slice(span.end);

    if (dryRun) {
        console.log(`\n--dry-run: would add ${accepted.length} event(s):\n`);
        for (const entry of accepted) console.log(`  ${String(entry.year).padStart(6)}  ${entry.event}`);
        console.log('\nNo files written.');
        return;
    }

    await writeFile(SOURCE_PATH, updated, 'utf8');

    console.log(`\nAdded ${accepted.length} event(s). "${category}" now has ${merged.length} events, ${mergedUniqueYears} unique years.`);
    console.log(
        '\nNOTE: this reshuffles every past and future puzzle in this category.\n' +
        'Recorded scores are keyed by date and are unaffected, but the archive\n' +
        'view will no longer match what players originally saw.\n\n' +
        'Next:\n' +
        `  node scripts/preview-puzzles.mjs        # sanity-check the result\n` +
        '  npm run build:puzzles                   # refresh the offline fallback\n' +
        '  git diff functions/api/puzzles.js       # review before committing'
    );
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
