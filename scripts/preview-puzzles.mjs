#!/usr/bin/env node
/**
 * Prints upcoming puzzles so you can spot weak or repetitive days before
 * players see them. Read-only — writes nothing.
 *
 *   node scripts/preview-puzzles.mjs                       # next 14 days, local server
 *   node scripts/preview-puzzles.mjs 30                    # next 30 days
 *   node scripts/preview-puzzles.mjs 30 https://timeline-74i.pages.dev
 *   node scripts/preview-puzzles.mjs 60 --quiet            # warnings only
 *
 * Flags each puzzle that is genuinely broken or unreasonably hard:
 *   - duplicate years   two cards share a year, so their order is arbitrary
 *   - short             fewer than 7 events
 *   - tight cluster     all 7 events inside 25 years
 *   - crowded run       3+ events inside a single decade
 * and reports categories that repeat within the window.
 *
 * Ordinary near-ties (two events a year or two apart) are NOT flagged. Ordering
 * close events is the game; warning on every pair produced noise rather than
 * signal. Only a run of three or more bunched together is called out.
 */

const DEFAULT_BASE_URLS = [
    'http://localhost:8788',
    'http://127.0.0.1:8788',
    'http://[::1]:8788'
];
const DEFAULT_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const EVENTS_PER_PUZZLE = 7;

// A puzzle whose events all fall inside this span is very hard to order.
const TIGHT_SPAN_YEARS = 25;

// Mirrors MIN_YEAR_GAP in functions/api/puzzles.js. The generator now prefers
// events at least this far apart, so a closer pair means it had to relax the
// constraint — usually because the category pool is thin or too many of its
// events were used in the last 60 days. That relaxation is the useful signal;
// an ordinary well-spaced puzzle is not flagged at all.
const PREFERRED_MIN_GAP = 3;

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const positional = args.filter(a => !a.startsWith('--'));

const days = Number(positional.find(a => /^\d+$/.test(a))) || DEFAULT_DAYS;
const explicitBaseUrl = positional.find(a => /^https?:\/\//.test(a))?.replace(/\/+$/, '') || null;

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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

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
        'Start the dev server with "npm run dev", or pass a URL:\n\n' +
        '  node scripts/preview-puzzles.mjs 30 https://timeline-74i.pages.dev\n'
    );
    process.exit(1);
}

function formatYear(year) {
    return year < 0 ? `${Math.abs(year)} BCE` : String(year);
}

function inspect(puzzle) {
    const warnings = [];
    const events = [...puzzle.events].sort((a, b) => a.year - b.year);

    if (events.length < EVENTS_PER_PUZZLE) {
        warnings.push(`only ${events.length} events`);
    }
    if (events.length === 0) {
        return { events, span: 0, warnings };
    }

    const years = events.map(e => e.year);
    const duplicateYears = years.filter((y, i) => years.indexOf(y) !== i);
    if (duplicateYears.length > 0) {
        warnings.push(`duplicate year(s): ${[...new Set(duplicateYears)].map(formatYear).join(', ')}`);
    }

    const span = years[years.length - 1] - years[0];
    if (span < TIGHT_SPAN_YEARS) {
        warnings.push(`tight cluster — all within ${span} years`);
    }

    // Pairs closer together than the generator's preferred spacing. Their
    // presence means selection had to fall back to a relaxed pass.
    const tightPairs = [];
    for (let i = 1; i < events.length; i++) {
        const gap = events[i].year - events[i - 1].year;
        if (gap < PREFERRED_MIN_GAP) {
            tightPairs.push(`${formatYear(events[i - 1].year)}/${formatYear(events[i].year)}`);
        }
    }
    if (tightPairs.length > 0) {
        warnings.push(
            `${tightPairs.length} pair(s) under ${PREFERRED_MIN_GAP} years apart: ${tightPairs.join(', ')}`
        );
    }

    return { events, span, warnings };
}

async function main() {
    const start = laToday();
    const baseUrl = await resolveBaseUrl(start);

    console.log(`Previewing ${days} day(s) from ${start} — ${baseUrl}\n`);

    const categoryDays = new Map();
    const flagged = [];
    let shown = 0;

    for (let i = 0; i < days; i++) {
        const dateStr = addDays(start, i);

        let puzzle;
        try {
            puzzle = await fetchPuzzle(baseUrl, dateStr);
        } catch (err) {
            console.log(`${dateStr}  !! ${describeError(err)}`);
            continue;
        }

        if (!puzzle) {
            console.log(`${dateStr}  !! no puzzle returned`);
            flagged.push({ date: dateStr, warnings: ['no puzzle returned'] });
            continue;
        }

        const { events, span, warnings } = inspect(puzzle);

        if (!categoryDays.has(puzzle.category)) categoryDays.set(puzzle.category, []);
        categoryDays.get(puzzle.category).push(dateStr);

        if (warnings.length > 0) flagged.push({ date: dateStr, warnings });

        if (quiet) continue;

        const marker = warnings.length > 0 ? ' ⚠' : '';
        console.log(`${dateStr}  ${puzzle.category}  (span ${span} years)${marker}`);
        for (const ev of events) {
            console.log(`    ${formatYear(ev.year).padStart(9)}  ${ev.event}`);
        }
        for (const w of warnings) console.log(`    ⚠ ${w}`);
        console.log();
        shown++;
    }

    console.log('─'.repeat(60));

    const repeats = [...categoryDays.entries()].filter(([, dates]) => dates.length > 1);
    if (repeats.length > 0) {
        console.log('\nCategories appearing more than once in this window:');
        for (const [category, dates] of repeats.sort((a, b) => b[1].length - a[1].length)) {
            console.log(`  ${category.padEnd(16)} ${dates.length}x  ${dates.join(', ')}`);
        }
    }

    if (flagged.length === 0) {
        console.log(`\nNo issues found across ${days} day(s).`);
    } else {
        console.log(`\n${flagged.length} day(s) flagged:`);
        for (const { date, warnings } of flagged) {
            console.log(`  ${date}  ${warnings.join('; ')}`);
        }
        console.log(
            '\nTo fix a weak day, add more events to that category:\n' +
            '  node scripts/add-events.mjs --list\n' +
            '  node scripts/add-events.mjs <Category> new-events.json'
        );
    }

    if (!quiet && shown === 0) console.log('\nNothing to show.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
