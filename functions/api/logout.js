import { clearSessionCookieHeader } from '../../lib/auth.js';
import { jsonResponse } from '../../lib/validate.js';

export async function onRequestPost() {
    return jsonResponse(
        { success: true },
        { headers: { 'Set-Cookie': clearSessionCookieHeader() } }
    );
}
