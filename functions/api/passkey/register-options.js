import { generateRegistrationOptions } from '@simplewebauthn/server';

import { isAdminRequest } from '../../../lib/auth.js';
import { jsonResponse, errorResponse } from '../../../lib/validate.js';
import {
    ADMIN_USER_ID,
    RP_NAME,
    challengeCookieHeader,
    listCredentials,
    parseTransports,
    resolveRelyingParty
} from '../../../lib/webauthn.js';

/**
 * Step 1 of enrolling a passkey. Privileged: you have to already be signed in
 * (by password, or by a passkey you registered earlier) to add another one.
 */
export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.ADMIN_SECRET) {
        console.error('Passkey registration attempted but ADMIN_SECRET is not configured.');
        return errorResponse('Admin login is not configured', 503);
    }

    if (!(await isAdminRequest(context))) {
        return errorResponse('Unauthorized', 401);
    }

    const rp = resolveRelyingParty(env, request);
    if (!rp) {
        return errorResponse('Passkeys are not available on this host', 400);
    }

    const existing = await listCredentials(env);

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: rp.rpID,
        userName: env.ADMIN_USERNAME || 'admin',
        userID: ADMIN_USER_ID,
        attestationType: 'none',
        // Stops the same authenticator being enrolled twice.
        excludeCredentials: existing.map((row) => ({
            id: row.credential_id,
            transports: parseTransports(row.transports)
        })),
        authenticatorSelection: {
            // A discoverable credential is what allows username-less, one-tap
            // login. Requiring user verification means a biometric or PIN is
            // needed, so an unlocked stolen laptop is not enough by itself.
            residentKey: 'required',
            userVerification: 'required'
        }
    });

    return jsonResponse(options, {
        headers: {
            'Set-Cookie': await challengeCookieHeader('reg', options.challenge, env.ADMIN_SECRET)
        }
    });
}
