import { isAdminRequest } from '../../lib/auth.js';
import {
    isValidUuid,
    isValidDateStr,
    isPlayableDateStr,
    sanitizeDisplayName,
    sanitizeCategory,
    sanitizePlacedCards,
    toBoundedInt,
    readJsonBody,
    jsonResponse,
    errorResponse,
    MAX_SCORE,
    MAX_TIME_MS
} from '../../lib/validate.js';

// Filler entries so a fresh daily board is not empty. They are flagged as
// `isBot` in the response so the UI can label them honestly.
const PLACEHOLDER_NAMES = [
    'Michael', 'Christopher', 'Matthew', 'Joshua', 'David', 'James', 'Daniel', 'Robert', 'John', 'Joseph',
    'Jason', 'Justin', 'Andrew', 'Ryan', 'William', 'Brian', 'Kevin', 'Thomas', 'Steven', 'Timothy',
    'Richard', 'Jeremy', 'Eric', 'Aaron', 'Stephen', 'Mark', 'Anthony', 'Jonathan', 'Adam', 'Kyle',
    'Jacob', 'Nicholas', 'Charles', 'Paul', 'Scott', 'Benjamin', 'Travis', 'Jeffrey', 'Chad',
    'Jessica', 'Ashley', 'Amanda', 'Sarah', 'Jennifer', 'Brittany', 'Stephanie', 'Samantha', 'Nicole',
    'Elizabeth', 'Lauren', 'Megan', 'Tiffany', 'Heather', 'Amber', 'Melissa', 'Danielle', 'Rachel',
    'Courtney', 'Mary', 'Andrea', 'Kathryn', 'Shannon', 'Erica', 'Christina', 'Rebecca', 'Michelle',
    'Kimberly', 'Kelly', 'Crystal', 'Laura', 'Erin', 'Tara', 'Kristen', 'April', 'Angela', 'Monica'
];

const PLACEHOLDER_COUNT = 9;

function mulberry32(a) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function getSeedFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return hash;
}

function buildPlaceholders(date, takenNames) {
    const randomFn = mulberry32(getSeedFromString(`${date}-leaderboard`));

    const available = PLACEHOLDER_NAMES.slice();
    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(randomFn() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }

    // Skip names a real player already uses today, so nobody sees a bot wearing
    // their own name on the board.
    const usable = available.filter((name) => !takenNames.has(name.toLowerCase()));

    const rows = [];
    for (let i = 0; i < PLACEHOLDER_COUNT; i++) {
        const score = Math.floor(randomFn() * 5); // 0 to 4
        const timeMs = 240000 + Math.floor(randomFn() * 300000); // 4 to 9 minutes
        const name = usable[i];
        if (!name) break;
        rows.push({ display_name: name, score, time_ms: timeMs, isBot: true, isMe: false });
    }
    return rows;
}

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    const date = url.searchParams.get('date');
    const userIdParam = url.searchParams.get('user_id');

    if (!isValidDateStr(date)) {
        return errorResponse('Missing or invalid date parameter', 400);
    }

    // Identity comes from the caller's own id only. Matching on display_name
    // previously let two players sharing a name — or a player sharing a name
    // with a placeholder — be reported as each other.
    const userId = isValidUuid(userIdParam) ? userIdParam : null;

    try {
        const { results } = await env.DB.prepare(
            `SELECT l.user_id, l.score, l.time_ms, COALESCE(u.display_name, '') AS display_name
             FROM leaderboard l
             LEFT JOIN users u ON l.user_id = u.id
             WHERE l.puzzle_date = ?
             ORDER BY l.score DESC, l.time_ms ASC`
        )
            .bind(date)
            .all();

        const realRows = (results || []).map((row) => ({
            display_name: row.display_name,
            score: row.score,
            time_ms: row.time_ms,
            isBot: false,
            isMe: userId !== null && row.user_id === userId
        }));

        const takenNames = new Set(
            realRows.map((row) => (row.display_name || '').toLowerCase()).filter(Boolean)
        );

        const allRows = realRows.concat(buildPlaceholders(date, takenNames));

        allRows.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.time_ms - b.time_ms;
        });

        const index = allRows.findIndex((row) => row.isMe);
        const userRank = index === -1 ? -1 : index + 1;
        const userData = index === -1 ? null : allRows[index];

        // The full board exposes every participant; only an authenticated admin
        // gets it. Regular players get the top 10 plus their own row.
        const includeAll = await isAdminRequest(context);

        return jsonResponse({
            top10: allRows.slice(0, 10),
            all: includeAll ? allRows : undefined,
            total: allRows.length,
            userRank,
            userData
        });
    } catch (e) {
        console.error('Leaderboard read failed:', e);
        return errorResponse('Unable to load leaderboard', 500);
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    const data = await readJsonBody(request);
    if (!data) {
        return errorResponse('Bad request', 400);
    }

    const userId = data.user_id;
    if (!isValidUuid(userId)) {
        return errorResponse('Invalid user_id', 400);
    }

    const puzzleDate = data.puzzle_date;
    if (!isPlayableDateStr(puzzleDate)) {
        return errorResponse('Invalid puzzle_date', 400);
    }

    const score = toBoundedInt(data.score, 0, MAX_SCORE);
    if (score === null) {
        return errorResponse('Invalid score', 400);
    }

    const timeMs = toBoundedInt(data.time_ms, 0, MAX_TIME_MS);
    if (timeMs === null) {
        return errorResponse('Invalid time_ms', 400);
    }

    const category = sanitizeCategory(data.category);
    const displayName = sanitizeDisplayName(data.display_name);

    let placedCards = null;
    if (data.placedCards !== undefined && data.placedCards !== null) {
        placedCards = sanitizePlacedCards(data.placedCards);
        if (placedCards === null) {
            return errorResponse('Invalid placedCards', 400);
        }
    }

    try {
        const statements = [
            displayName
                ? env.DB.prepare(
                      `INSERT INTO users (id, display_name) VALUES (?, ?)
                       ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name`
                  ).bind(userId, displayName)
                : env.DB.prepare(
                      `INSERT OR IGNORE INTO users (id, display_name) VALUES (?, ?)`
                  ).bind(userId, ''),

            // One row per player per day.
            env.DB.prepare(`DELETE FROM leaderboard WHERE user_id = ? AND puzzle_date = ?`).bind(
                userId,
                puzzleDate
            ),

            env.DB.prepare(
                `INSERT INTO leaderboard (user_id, puzzle_date, category, score, time_ms, placed_cards)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(
                userId,
                puzzleDate,
                category,
                score,
                timeMs,
                placedCards ? JSON.stringify(placedCards) : null
            )
        ];

        // Batched so a failure part-way cannot leave the player with no row.
        await env.DB.batch(statements);

        return jsonResponse({ success: true });
    } catch (e) {
        console.error('Leaderboard write failed:', e);
        return errorResponse('Unable to save score', 500);
    }
}
