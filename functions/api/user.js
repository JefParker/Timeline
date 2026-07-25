import {
    isValidUuid,
    sanitizeDisplayName,
    readJsonBody,
    jsonResponse,
    errorResponse
} from '../../lib/validate.js';

const MAX_HISTORY_ROWS = 400;

export async function onRequestPut(context) {
    const { request, env } = context;

    const data = await readJsonBody(request);
    if (!data) {
        return errorResponse('Bad request', 400);
    }

    const userId = data.user_id;
    if (!isValidUuid(userId)) {
        return errorResponse('Invalid user_id', 400);
    }

    const displayName = sanitizeDisplayName(data.display_name);
    if (!displayName) {
        return errorResponse('Invalid display_name', 400);
    }

    try {
        await env.DB.prepare(
            `INSERT INTO users (id, display_name) VALUES (?, ?)
             ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name`
        )
            .bind(userId, displayName)
            .run();

        return jsonResponse({ success: true, display_name: displayName });
    } catch (e) {
        console.error('User write failed:', e);
        return errorResponse('Unable to save profile', 500);
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    if (!isValidUuid(userId)) {
        return errorResponse('Invalid user_id', 400);
    }

    try {
        const user = await env.DB.prepare('SELECT display_name FROM users WHERE id = ?')
            .bind(userId)
            .first();

        const history = await env.DB.prepare(
            `SELECT puzzle_date, category, score, time_ms, placed_cards
             FROM leaderboard
             WHERE user_id = ?
             ORDER BY puzzle_date DESC
             LIMIT ?`
        )
            .bind(userId, MAX_HISTORY_ROWS)
            .all();

        return jsonResponse({
            display_name: user ? user.display_name : null,
            history: history.results || []
        });
    } catch (e) {
        console.error('User read failed:', e);
        return errorResponse('Unable to load profile', 500);
    }
}
