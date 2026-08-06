import { verifyRegistrationResponse } from '@simplewebauthn/server';

import { isAdminRequest } from '../../../lib/auth.js';
import { readJsonBody, jsonResponse, errorResponse } from '../../../lib/validate.js';
import {
    bytesToBase64Url,
    clearChallengeCookieHeader,
    insertCredential,
    readChallenge,
    resolveRelyingParty,
    sanitizeLabel
} from '../../../lib/webauthn.js';

/** Every exit path clears the challenge cookie, so a challenge is used once. */
function spent(body, status) {
    return jsonResponse(body, {
        status,
        headers: { 'Set-Cookie': clearChallengeCookieHeader() }
    });
}

/**
 * Step 2 of enrolling a passkey: check the authenticator's attestation against
 * the challenge we issued, then store the public key.
 */
export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.ADMIN_SECRET) {
        return errorResponse('Admin login is not configured', 503);
    }

    if (!(await isAdminRequest(context))) {
        return errorResponse('Unauthorized', 401);
    }

    const rp = resolveRelyingParty(env, request);
    if (!rp) {
        return errorResponse('Passkeys are not available on this host', 400);
    }

    const body = await readJsonBody(request);
    if (!body || !body.credential || typeof body.credential !== 'object') {
        return spent({ error: 'Bad request' }, 400);
    }

    const expectedChallenge = await readChallenge(request, 'reg', env.ADMIN_SECRET);
    if (!expectedChallenge) {
        return spent({ error: 'Registration expired, please try again' }, 400);
    }

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: body.credential,
            expectedChallenge,
            expectedOrigin: rp.origin,
            expectedRPID: rp.rpID,
            requireUserVerification: true
        });
    } catch (error) {
        // The library throws with a specific reason; log it but do not hand the
        // detail back to the client.
        console.error('Passkey registration failed verification:', error.message);
        return spent({ error: 'Could not verify that passkey' }, 400);
    }

    if (!verification.verified || !verification.registrationInfo) {
        return spent({ error: 'Could not verify that passkey' }, 400);
    }

    const { credential } = verification.registrationInfo;
    const label = sanitizeLabel(body.label);

    try {
        await insertCredential(env, {
            credentialId: credential.id,
            publicKey: bytesToBase64Url(credential.publicKey),
            counter: credential.counter,
            transports: credential.transports,
            label
        });
    } catch (error) {
        // credential_id is the primary key, so a duplicate lands here.
        console.error('Could not store passkey:', error.message);
        return spent({ error: 'That passkey is already registered' }, 409);
    }

    return spent({ success: true, label }, 200);
}
