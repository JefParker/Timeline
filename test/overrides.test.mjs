import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Hand-written special-date puzzles bypass the generator, and therefore bypass
// its uniqueness and length guarantees. A malformed override ships silently:
// the 2026-07-28 Sports puzzle carried two 1997 events for months, making two
// of its cards impossible to order.
//
// The source is parsed as text rather than imported, because functions/ is ESM
// while the repo root is commonjs.

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(
    resolve(__dirname, '..', 'functions', 'api', 'puzzles.js'),
    'utf8'
);

const EVENTS_PER_PUZZLE = 7;
const MIN_PLAUSIBLE_YEAR = -3000;
const MAX_PLAUSIBLE_YEAR = new Date().getFullYear() + 5;

/**
 * Offsets of the bracketed span starting at `openIndex`.
 *
 * Skips string literals and line comments. Comment handling matters: an
 * apostrophe in a `//` comment inside an override object (e.g. "Woods' first
 * Masters") would otherwise open a phantom string and swallow the rest of the
 * file, silently dropping every later override from the scan.
 */
function matchBracket(source, openIndex, open, close) {
    let depth = 0;
    let inString = false;
    let inLineComment = false;
    let quote = '';
    let escaped = false;

    for (let i = openIndex; i < source.length; i++) {
        const ch = source[i];

        if (inLineComment) {
            if (ch === '\n') inLineComment = false;
            continue;
        }

        if (inString) {
            if (escaped) escaped = false;
            else if (ch === '\\') escaped = true;
            else if (ch === quote) inString = false;
            continue;
        }

        if (ch === '/' && source[i + 1] === '/') {
            inLineComment = true;
            i++;
        } else if (ch === '"' || ch === "'") {
            inString = true;
            quote = ch;
        } else if (ch === open) {
            depth++;
        } else if (ch === close) {
            depth--;
            if (depth === 0) return { start: openIndex, end: i + 1 };
        }
    }
    return null;
}

/**
 * Collects every override block. Each is written as:
 *
 *   if (puzzles[i].date === "YYYY-MM-DD") {
 *       puzzles[i] = { date: "...", category: "...", events: [ ... ] };
 *
 * Both quoting styles appear in the file (JSON-pasted and hand-written), so
 * years and event strings are extracted by pattern within the events array
 * rather than by parsing it as JS.
 */
function parseOverrides() {
    const guardRe = /if\s*\(puzzles\[i\]\.date === "(\d{4}-\d{2}-\d{2})"\)\s*\{/g;
    const overrides = [];
    let guard;

    while ((guard = guardRe.exec(SOURCE)) !== null) {
        const guardDate = guard[1];
        const blockStart = guard.index;

        // The assigned object literal follows the guard.
        const assignIndex = SOURCE.indexOf('puzzles[i] = {', blockStart);
        assert.notEqual(assignIndex, -1, `${guardDate}: no puzzles[i] assignment found`);

        const objectSpan = matchBracket(SOURCE, SOURCE.indexOf('{', assignIndex), '{', '}');
        assert.ok(objectSpan, `${guardDate}: unbalanced object literal`);
        const objectText = SOURCE.slice(objectSpan.start, objectSpan.end);

        const declaredDate = objectText.match(/"?date"?\s*:\s*"(\d{4}-\d{2}-\d{2})"/)?.[1] ?? null;
        const category = objectText.match(/"?category"?\s*:\s*"([^"]+)"/)?.[1] ?? null;

        const eventsKey = objectText.search(/"?events"?\s*:\s*\[/);
        assert.notEqual(eventsKey, -1, `${guardDate}: no events array`);
        const eventsSpan = matchBracket(objectText, objectText.indexOf('[', eventsKey), '[', ']');
        assert.ok(eventsSpan, `${guardDate}: unbalanced events array`);
        const eventsText = objectText.slice(eventsSpan.start, eventsSpan.end);

        const years = [...eventsText.matchAll(/"?year"?\s*:\s*(-?\d+)/g)].map(m => Number(m[1]));
        const titles = [...eventsText.matchAll(/"?event"?\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);

        overrides.push({ guardDate, declaredDate, category, years, titles });
    }

    return overrides;
}

const OVERRIDES = parseOverrides();

test('override blocks were found and parsed', () => {
    assert.ok(OVERRIDES.length > 20, `expected many overrides, found ${OVERRIDES.length}`);
});

test('every override declares the same date as its guard', () => {
    for (const o of OVERRIDES) {
        assert.equal(
            o.declaredDate,
            o.guardDate,
            `override guarded by ${o.guardDate} declares date ${o.declaredDate}`
        );
    }
});

test('no two overrides target the same date', () => {
    const seen = new Map();
    for (const o of OVERRIDES) {
        assert.equal(
            seen.has(o.guardDate),
            false,
            `${o.guardDate} is overridden more than once; only the last would apply`
        );
        seen.set(o.guardDate, true);
    }
});

test('every override has exactly seven events', () => {
    for (const o of OVERRIDES) {
        assert.equal(
            o.years.length,
            EVENTS_PER_PUZZLE,
            `${o.guardDate} (${o.category}) has ${o.years.length} years, expected ${EVENTS_PER_PUZZLE}`
        );
        assert.equal(
            o.titles.length,
            EVENTS_PER_PUZZLE,
            `${o.guardDate} (${o.category}) has ${o.titles.length} event titles, expected ${EVENTS_PER_PUZZLE}`
        );
    }
});

test('no override contains duplicate years', () => {
    // The regression this suite exists for. Two cards sharing a year cannot be
    // ordered: the placement check accepts equal years on either side, so the
    // puzzle silently loses a card's worth of difficulty.
    for (const o of OVERRIDES) {
        const duplicates = o.years.filter((y, i) => o.years.indexOf(y) !== i);
        assert.deepEqual(
            [...new Set(duplicates)],
            [],
            `${o.guardDate} (${o.category}) repeats year(s) ${[...new Set(duplicates)].join(', ')}`
        );
    }
});

test('no override contains duplicate event text', () => {
    for (const o of OVERRIDES) {
        const lower = o.titles.map(t => t.toLowerCase());
        const duplicates = lower.filter((t, i) => lower.indexOf(t) !== i);
        assert.deepEqual([...new Set(duplicates)], [], `${o.guardDate} repeats an event`);
    }
});

test('override years are plausible', () => {
    for (const o of OVERRIDES) {
        for (const year of o.years) {
            assert.ok(
                Number.isInteger(year) && year >= MIN_PLAUSIBLE_YEAR && year <= MAX_PLAUSIBLE_YEAR,
                `${o.guardDate} (${o.category}) has implausible year ${year}`
            );
        }
    }
});

test('override event titles are non-empty', () => {
    for (const o of OVERRIDES) {
        for (const title of o.titles) {
            assert.ok(title.trim().length > 0, `${o.guardDate} has an empty event title`);
        }
    }
});

test('override event titles render no literal backslashes', () => {
    // Titles here are raw source text, so `\"` (a legitimate escape) shows up
    // with its backslash. The bug pattern is an ESCAPED backslash — source
    // `\\'` — which renders a real backslash on the card ("Pete\'s Super
    // Submarines"). Apostrophes need no escaping inside double quotes.
    for (const o of OVERRIDES) {
        for (const title of o.titles) {
            assert.ok(!title.includes('\\\\'), `${o.guardDate} title renders a literal backslash: ${title}`);
        }
    }
});

function dayNumber(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return Math.round(Date.UTC(year, month - 1, day) / 86400000);
}

test('no event text is repeated across overrides within 60 days', () => {
    // The generator refuses to repeat an event within its 60-day memory
    // window; hand-written overrides must honour the same rule or players see
    // the identical card twice in quick succession.
    for (let a = 0; a < OVERRIDES.length; a++) {
        for (let b = a + 1; b < OVERRIDES.length; b++) {
            const gap = Math.abs(dayNumber(OVERRIDES[a].guardDate) - dayNumber(OVERRIDES[b].guardDate));
            if (gap > 60) continue;
            const titlesB = new Set(OVERRIDES[b].titles.map(t => t.toLowerCase()));
            for (const title of OVERRIDES[a].titles) {
                assert.ok(
                    !titlesB.has(title.toLowerCase()),
                    `"${title}" appears in both ${OVERRIDES[a].guardDate} and ${OVERRIDES[b].guardDate}, only ${gap} days apart`
                );
            }
        }
    }
});

test('no override bunches three or more events under 3 years apart', () => {
    // A single near-tie is the game; a chain of three or more events each
    // within 3 years of the next turns a stretch of the puzzle into coin
    // flips. Mirrors the threshold scripts/preview-puzzles.mjs warns at.
    for (const o of OVERRIDES) {
        const years = [...o.years].sort((x, y) => x - y);
        let streak = 1;
        for (let i = 1; i < years.length; i++) {
            streak = years[i] - years[i - 1] < 3 ? streak + 1 : 1;
            assert.ok(
                streak < 3,
                `${o.guardDate} (${o.category}) bunches ${streak} events inside runs of <3-year gaps (…${years[i - 2]}, ${years[i - 1]}, ${years[i]}…)`
            );
        }
    }
});

test('the 2026-07-28 Sports puzzle no longer repeats 1997', () => {
    const july28 = OVERRIDES.find(o => o.guardDate === '2026-07-28');
    assert.ok(july28, 'expected an override for 2026-07-28');
    assert.equal(new Set(july28.years).size, EVENTS_PER_PUZZLE);
    assert.equal(
        july28.years.filter(y => y === 1997).length,
        1,
        '1997 should appear exactly once'
    );
});
