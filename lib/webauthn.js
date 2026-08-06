// Passkey (WebAuthn) support for the admin dashboard.
//
// A passkey is a second way to obtain the *same* admin session cookie that
// /api/login issues — lib/auth.js still owns the session itself. Password login
// stays enabled: it is how the first passkey gets registered, and it is the
// recovery route if every registered device is lost.
//
// Two pieces of state exist here that the password flow does not need:
//
//   * Registered credentials (public key + signature counter) live in D1.
//   * The one-time challenge that links "give me options" to "here is my
//     signed response" lives in a short-lived signed cookie rather than a
//     table, so there is nothing to expire and no cleanup job.
//
// This module deliberately does not import @simplewebauthn/server. The
// endpoints under functions/api/passkey/ do that; keeping it out of here means
// the helpers below stay unit-testable on their own.
//
// Like lib/auth.js, this file lives outside `functions/` so Pages does not turn
// it into a public route.

import { signPayload, timingSafeEqual, readCookie, bytesToBase64Url } from './auth.js';
import { sanitizeCategory } from './validate.js';

const CHALLENGE_COOKIE = 'tl_wa_challenge';
const CHALLENGE_TTL_SECONDS = 300;

// Passkeys are cryptographically bound to a domain. Changing this invalidates
// every credential already registered, so it is a fixed constant rather than
// something derived from the incoming request (a Host header is attacker
// -controlled in the general case). To move to a custom domain, set the
// WEBAUTHN_RP_ID environment variable and re-register from a password login.
export const DEFAULT_RP_ID = 'timeline-74i.pages.dev';
export const RP_NAME = 'Timeline';

// The admin is a single implicit user, so the WebAuthn user handle is a
// constant rather than a per-account value.
export const ADMIN_USER_ID = new TextEncoder().encode('timeline-admin');

export { CHALLENGE_COOKIE, CHALLENGE_TTL_SECONDS };

export function base64UrlToBytes(value) {
    const normalised = String(value).replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalised + '='.repeat((4 - (normalised.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

export { bytesToBase64Url };

/**
 * Works out which relying party the current request belongs to.
 *
 * Returns null when the host is not one we are willing to issue or accept
 * passkeys for, which the endpoints turn into a 400 rather than silently
 * registering a credential against the wrong domain.
 */
export function resolveRelyingParty(env, request) {
    const url = new URL(request.url);
    const host = url.hostname;

    // `wrangler pages dev` serves http://localhost. WebAuthn treats localhost
    // as a secure context and allows it as its own RP ID, so local development
    // works — but those passkeys are separate from the production ones.
    if (host === 'localhost' || host === '127.0.0.1') {
        return { rpID: 'localhost', origin: url.origin };
    }

    const rpID = (env && env.WEBAUTHN_RP_ID) || DEFAULT_RP_ID;

    // Preview deploys live at <hash>.timeline-74i.pages.dev. A credential
    // registered against the parent domain is valid on them, but the origin
    // handed to the verifier still has to be the exact host that was called.
    if (host !== rpID && !host.endsWith(`.${rpID}`)) {
        return null;
    }

    return { rpID, origin: `https://${host}` };
}

/**
 * Signs a challenge into a cookie. `scope` is either 'reg' or 'auth' and is
 * covered by the signature, so a challenge minted for registration cannot be
 * replayed against the login endpoint.
 */
export async function challengeCookieHeader(scope, challenge, secret) {
    const expiresAt = Date.now() + CHALLENGE_TTL_SECONDS * 1000;
    const payload = `${scope}.${challenge}.${expiresAt}`;
    const signature = await signPayload(payload, secret);

    return `${CHALLENGE_COOKIE}=${payload}.${signature}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${CHALLENGE_TTL_SECONDS}`;
}

export function clearChallengeCookieHeader() {
    return `${CHALLENGE_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

/**
 * Reads back a challenge issued by challengeCookieHeader. Returns the challenge
 * string, or null if the cookie is missing, expired, tampered with, or was
 * issued for a different scope.
 *
 * Callers must clear the cookie on the response regardless of the outcome so a
 * challenge is never usable twice.
 */
export async function readChallenge(request, scope, secret) {
    if (typeof secret !== 'string' || secret.length === 0) return null;

    const raw = readCookie(request, CHALLENGE_COOKIE);
    if (typeof raw !== 'string') return null;

    // base64url contains no '.', so a well-formed cookie splits into exactly
    // four fields.
    const parts = raw.split('.');
    if (parts.length !== 4) return null;

    const [cookieScope, challenge, expiresAtRaw, signature] = parts;
    if (cookieScope !== scope) return null;
    if (challenge.length === 0) return null;

    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

    const expected = await signPayload(`${cookieScope}.${challenge}.${expiresAtRaw}`, secret);
    if (!timingSafeEqual(signature, expected)) return null;

    return challenge;
}

/** Transports are stored as a JSON array; treat anything unparseable as unknown. */
export function parseTransports(value) {
    if (typeof value !== 'string' || value.length === 0) return undefined;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
    } catch {
        return undefined;
    }
}

export async function listCredentials(env) {
    const { results } = await env.DB.prepare(
        `SELECT credential_id, public_key, counter, transports, label, created_at, last_used_at
           FROM admin_credentials
          ORDER BY created_at ASC`
    ).all();
    return results || [];
}

export async function getCredential(env, credentialId) {
    return env.DB.prepare(
        `SELECT credential_id, public_key, counter, transports
           FROM admin_credentials
          WHERE credential_id = ?`
    )
        .bind(credentialId)
        .first();
}

export async function insertCredential(env, credential) {
    await env.DB.prepare(
        `INSERT INTO admin_credentials (credential_id, public_key, counter, transports, label)
         VALUES (?, ?, ?, ?, ?)`
    )
        .bind(
            credential.credentialId,
            credential.publicKey,
            credential.counter || 0,
            JSON.stringify(credential.transports || []),
            credential.label
        )
        .run();
}

/** Persists the post-login counter so a cloned authenticator can be detected. */
export async function recordCredentialUse(env, credentialId, counter) {
    await env.DB.prepare(
        `UPDATE admin_credentials
            SET counter = ?, last_used_at = CURRENT_TIMESTAMP
          WHERE credential_id = ?`
    )
        .bind(counter, credentialId)
        .run();
}

export async function deleteCredential(env, credentialId) {
    const result = await env.DB.prepare(
        `DELETE FROM admin_credentials WHERE credential_id = ?`
    )
        .bind(credentialId)
        .run();
    return Boolean(result && result.meta && result.meta.changes > 0);
}

/**
 * Trims a user-supplied passkey label down to something safe to store. Reuses
 * sanitizeCategory for the invisible-character stripping, then bounds it
 * further — labels are only ever displayed back to the admin.
 */
export function sanitizeLabel(value) {
    const cleaned = sanitizeCategory(value).slice(0, 40);
    return cleaned.length > 0 ? cleaned : 'Passkey';
}
