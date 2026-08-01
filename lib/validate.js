// Shared request validation helpers for the Pages Functions API.
//
// Lives outside `functions/` so Pages does not expose it as a route.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// C0/C1 control characters plus zero-width, bidi-override and BOM characters.
// These render invisibly and are used to spoof or impersonate other players.
// Built via the RegExp constructor to keep literal control bytes out of source.
const INVISIBLE_PATTERN = new RegExp(
    '[' +
        '\\u0000-\\u001F' +
        '\\u007F-\\u009F' +
        '\\u200B-\\u200F' +
        '\\u2028\\u2029' +
        '\\u202A-\\u202E' +
        '\\u2066-\\u2069' +
        '\\uFEFF' +
    ']',
    'g'
);

// Puzzles are generated forward from this date; nothing before it can exist.
export const PUZZLE_EPOCH = '2024-01-01';

export const MAX_DISPLAY_NAME_LENGTH = 20;
export const MAX_SCORE = 7;
export const MAX_TIME_MS = 24 * 60 * 60 * 1000;
export const MAX_CATEGORY_LENGTH = 64;
export const MAX_BODY_BYTES = 16 * 1024;

export function isValidUuid(value) {
    return typeof value === 'string' && UUID_PATTERN.test(value);
}

/** Checks both the shape and that it is a real calendar date (rejects 2026-02-31). */
export function isValidDateStr(value) {
    if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;

    const [year, month, day] = value.split('-').map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;

    const parsed = new Date(Date.UTC(year, month - 1, day));
    return (
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day
    );
}

/**
 * A date that could plausibly be a playable puzzle: a real date, not before the
 * puzzle epoch, and not implausibly far in the future.
 */
export function isPlayableDateStr(value, maxDaysAhead = 3) {
    if (!isValidDateStr(value)) return false;
    if (value < PUZZLE_EPOCH) return false;

    const limit = new Date(Date.now() + maxDaysAhead * 24 * 60 * 60 * 1000);
    const limitStr = `${limit.getUTCFullYear()}-${String(limit.getUTCMonth() + 1).padStart(2, '0')}-${String(limit.getUTCDate()).padStart(2, '0')}`;
    return value <= limitStr;
}

/**
 * Normalises a user-supplied display name: strips invisible characters,
 * collapses whitespace and truncates. Returns '' when nothing usable remains.
 */
export function sanitizeDisplayName(value) {
    if (typeof value !== 'string') return '';

    const stripped = value.replace(INVISIBLE_PATTERN, '');
    return stripped.replace(/\s+/g, ' ').trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
}

/** Returns the integer when it is a whole number inside [min, max], otherwise null. */
export function toBoundedInt(value, min, max) {
    if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
        return null;
    }
    if (value < min || value > max) return null;
    return value;
}

export function sanitizeCategory(value) {
    if (typeof value !== 'string') return '';
    return value.replace(INVISIBLE_PATTERN, '').replace(/\s+/g, ' ').trim().slice(0, MAX_CATEGORY_LENGTH);
}

/**
 * Validates the `placedCards` payload. It is stored for the player's own replay
 * view, so it must be a well-formed, bounded array before it reaches the DB.
 */
export function sanitizePlacedCards(value) {
    if (!Array.isArray(value) || value.length === 0 || value.length > 20) return null;

    const cleaned = [];
    for (const card of value) {
        if (!card || typeof card !== 'object') return null;

        const year = card.year;
        if (typeof year !== 'number' || !Number.isInteger(year) || year < -10000 || year > 10000) {
            return null;
        }
        if (typeof card.event !== 'string' || card.event.length === 0 || card.event.length > 300) {
            return null;
        }

        const entry = { event: card.event.replace(INVISIBLE_PATTERN, ''), year };
        if (card.wasWrong === true) entry.wasWrong = true;
        cleaned.push(entry);
    }
    return cleaned;
}

/** Reads a JSON body, rejecting oversized or malformed payloads. */
export async function readJsonBody(request, maxBytes = MAX_BODY_BYTES) {
    const declaredLength = Number(request.headers.get('Content-Length'));
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        return null;
    }

    const text = await request.text();
    // UTF-8 is at least one byte per UTF-16 code unit, so this cheap check can
    // only under-count: use it to reject the huge case without encoding...
    if (text.length > maxBytes) return null;
    // ...then measure actual bytes, since multibyte text can be up to 3x the
    // code-unit count.
    if (new TextEncoder().encode(text).length > maxBytes) return null;

    try {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function jsonResponse(body, init = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        ...(init.headers || {})
    };
    return new Response(JSON.stringify(body), { ...init, headers });
}

/**
 * Generic error response. Internal exception text is never echoed to the
 * client; callers log details server-side instead.
 */
export function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, { status });
}
