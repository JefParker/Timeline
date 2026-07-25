// Admin session handling for Cloudflare Pages Functions.
//
// Sessions are stateless: the cookie holds `admin.<expiry>.<hmac>` where the
// HMAC is computed over `admin.<expiry>` using the ADMIN_SECRET environment
// variable. Nothing is trusted from the client except the signature.
//
// This file lives outside `functions/` on purpose. Everything under
// `functions/` is turned into a public route by Pages; shared modules must not
// be.

const SESSION_COOKIE = 'tl_admin';
const DEFAULT_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

function bytesToBase64Url(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importHmacKey(secret) {
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
}

async function signPayload(payload, secret) {
    const key = await importHmacKey(secret);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return bytesToBase64Url(new Uint8Array(signature));
}

/**
 * Length-independent string comparison. Returns false for non-strings so that
 * `undefined === undefined` can never be mistaken for a successful match.
 */
export function timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length === 0 || b.length === 0) return false;

    let diff = a.length ^ b.length;
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
        diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return diff === 0;
}

/**
 * Verifies a username/password pair against the configured admin credentials.
 * Returns false when either environment variable is missing, so an
 * unconfigured deployment fails closed instead of accepting empty input.
 */
export function checkAdminCredentials(env, username, password) {
    const expectedUser = env && env.ADMIN_USERNAME;
    const expectedPass = env && env.ADMIN_PASSWORD;

    if (typeof expectedUser !== 'string' || expectedUser.length === 0) return false;
    if (typeof expectedPass !== 'string' || expectedPass.length === 0) return false;

    // Both comparisons always run so the response time does not reveal which
    // half of the credential pair was wrong.
    const userOk = timingSafeEqual(username, expectedUser);
    const passOk = timingSafeEqual(password, expectedPass);
    return userOk && passOk;
}

export async function createSessionToken(secret, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const payload = `admin.${expiresAt}`;
    const signature = await signPayload(payload, secret);
    return `${payload}.${signature}`;
}

export async function verifySessionToken(token, secret) {
    if (typeof token !== 'string' || typeof secret !== 'string' || secret.length === 0) {
        return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [role, expiresAtRaw, signature] = parts;
    if (role !== 'admin') return false;

    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    const expected = await signPayload(`${role}.${expiresAtRaw}`, secret);
    return timingSafeEqual(signature, expected);
}

export function readCookie(request, name) {
    const header = request.headers.get('Cookie');
    if (!header) return null;

    for (const part of header.split(';')) {
        const index = part.indexOf('=');
        if (index === -1) continue;
        if (part.slice(0, index).trim() === name) {
            return part.slice(index + 1).trim();
        }
    }
    return null;
}

/** True only when the request carries a valid, unexpired admin session. */
export async function isAdminRequest(context) {
    const secret = context.env && context.env.ADMIN_SECRET;
    if (!secret) return false;
    return verifySessionToken(readCookie(context.request, SESSION_COOKIE), secret);
}

export function sessionCookieHeader(token, ttlSeconds = DEFAULT_TTL_SECONDS) {
    return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${ttlSeconds}`;
}

export function clearSessionCookieHeader() {
    return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export { SESSION_COOKIE, DEFAULT_TTL_SECONDS };
