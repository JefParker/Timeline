import { isAdminRequest } from '../../lib/auth.js';
import { jsonResponse } from '../../lib/validate.js';

/**
 * Lets the client ask whether it still holds a valid admin session. The cookie
 * itself is HttpOnly, so this is the only way the UI can know.
 */
export async function onRequestGet(context) {
    return jsonResponse({ admin: await isAdminRequest(context) });
}
