import {
    checkAdminCredentials,
    createSessionToken,
    sessionCookieHeader,
    DEFAULT_TTL_SECONDS
} from '../../lib/auth.js';
import { readJsonBody, jsonResponse, errorResponse } from '../../lib/validate.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    // Fail closed when the deployment is not configured. Previously a missing
    // ADMIN_USERNAME/ADMIN_PASSWORD meant `undefined === undefined`, so an
    // empty body authenticated successfully.
    if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.ADMIN_SECRET) {
        console.error('Admin login attempted but ADMIN_USERNAME/ADMIN_PASSWORD/ADMIN_SECRET are not all configured.');
        return errorResponse('Admin login is not configured', 503);
    }

    const data = await readJsonBody(request);
    if (!data) {
        return errorResponse('Bad request', 400);
    }

    if (!checkAdminCredentials(env, data.username, data.password)) {
        return errorResponse('Invalid credentials', 401);
    }

    const token = await createSessionToken(env.ADMIN_SECRET, DEFAULT_TTL_SECONDS);

    return jsonResponse(
        { success: true, expiresIn: DEFAULT_TTL_SECONDS },
        { headers: { 'Set-Cookie': sessionCookieHeader(token, DEFAULT_TTL_SECONDS) } }
    );
}
