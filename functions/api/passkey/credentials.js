import { isAdminRequest } from '../../../lib/auth.js';
import { readJsonBody, jsonResponse, errorResponse } from '../../../lib/validate.js';
import { deleteCredential, listCredentials } from '../../../lib/webauthn.js';

/** Lists registered passkeys for the dashboard's management panel. */
export async function onRequestGet(context) {
    if (!(await isAdminRequest(context))) {
        return errorResponse('Unauthorized', 401);
    }

    const rows = await listCredentials(context.env);

    // Public keys and counters stay server-side; the UI only needs enough to
    // tell one passkey from another.
    return jsonResponse({
        credentials: rows.map((row) => ({
            id: row.credential_id,
            label: row.label,
            createdAt: row.created_at,
            lastUsedAt: row.last_used_at
        }))
    });
}

/**
 * Removes a passkey. Password login always remains available, so it is not
 * possible to lock yourself out by deleting the last one.
 */
export async function onRequestDelete(context) {
    if (!(await isAdminRequest(context))) {
        return errorResponse('Unauthorized', 401);
    }

    const body = await readJsonBody(context.request);
    if (!body || typeof body.id !== 'string' || body.id.length === 0) {
        return errorResponse('Bad request', 400);
    }

    const removed = await deleteCredential(context.env, body.id);
    if (!removed) {
        return errorResponse('No such passkey', 404);
    }

    return jsonResponse({ success: true });
}
