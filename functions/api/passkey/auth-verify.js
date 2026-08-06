import { verifyAuthenticationResponse } from '@simplewebauthn/server';

import { createSessionToken, sessionCookieHeader, DEFAULT_TTL_SECONDS } from '../../../lib/auth.js';
import { readJsonBody, jsonResponse, errorResponse } from '../../../lib/validate.js';
import {
    base64UrlToBytes,
    clearChallengeCookieHeader,
    getCredential,
    parseTransports,
    readChallenge,
    recordCredentialUse,
    resolveRelyingParty
} from '../../../lib/webauthn.js';

/**
 * Failures are deliberately uniform. Whether a credential ID is registered, and
 * why verification failed, are both things an unauthenticated caller should not
 * be able to probe for.
 */
function rejected(message = 'Could not verify that passkey', status = 401) {
    return jsonResponse(
        { error: message },
        { status, headers: { 'Set-Cookie': clearChallengeCookieHeader() } }
    );
}

/**
 * Step 2 of signing in with a passkey. On success this mints exactly the same
 * session cookie that /api/login issues — passkeys are an alternative way in,
 * not a separate kind of session.
 */
export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.ADMIN_SECRET) {
        return errorResponse('Admin login is not configured', 503);
    }

    const rp = resolveRelyingParty(env, request);
    if (!rp) {
        return errorResponse('Passkeys are not available on this host', 400);
    }

    const body = await readJsonBody(request);
    if (!body || !body.credential || typeof body.credential.id !== 'string') {
        return rejected('Bad request', 400);
    }

    const expectedChallenge = await readChallenge(request, 'auth', env.ADMIN_SECRET);
    if (!expectedChallenge) {
        return rejected('Login expired, please try again', 400);
    }

    const stored = await getCredential(env, body.credential.id);
    if (!stored) {
        return rejected();
    }

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: body.credential,
            expectedChallenge,
            expectedOrigin: rp.origin,
            expectedRPID: rp.rpID,
            requireUserVerification: true,
            credential: {
                id: stored.credential_id,
                publicKey: base64UrlToBytes(stored.public_key),
                counter: stored.counter,
                transports: parseTransports(stored.transports)
            }
        });
    } catch (error) {
        console.error('Passkey login failed verification:', error.message);
        return rejected();
    }

    if (!verification.verified) {
        return rejected();
    }

    // The stored counter is the real replay defence: an assertion captured and
    // replayed carries a counter that no longer exceeds the one on record, and
    // verifyAuthenticationResponse throws above.
    await recordCredentialUse(env, stored.credential_id, verification.authenticationInfo.newCounter);

    const token = await createSessionToken(env.ADMIN_SECRET, DEFAULT_TTL_SECONDS);

    // Two Set-Cookie headers, so build the Headers object directly rather than
    // going through jsonResponse (which takes a plain object and would collapse
    // them into one).
    const headers = new Headers({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
    });
    headers.append('Set-Cookie', sessionCookieHeader(token, DEFAULT_TTL_SECONDS));
    headers.append('Set-Cookie', clearChallengeCookieHeader());

    return new Response(JSON.stringify({ success: true, expiresIn: DEFAULT_TTL_SECONDS }), {
        headers
    });
}
