import { generateAuthenticationOptions } from '@simplewebauthn/server';

import { jsonResponse, errorResponse } from '../../../lib/validate.js';
import { challengeCookieHeader, resolveRelyingParty } from '../../../lib/webauthn.js';

/**
 * Step 1 of signing in with a passkey. Unauthenticated by definition — this is
 * the login path — so it must not reveal anything about what is registered.
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

    const options = await generateAuthenticationOptions({
        rpID: rp.rpID,
        userVerification: 'required'
        // allowCredentials is deliberately omitted. The credentials are
        // discoverable, so the authenticator offers whatever it holds for this
        // domain and the response stays identical whether or not any passkey
        // has ever been registered.
    });

    return jsonResponse(options, {
        headers: {
            'Set-Cookie': await challengeCookieHeader('auth', options.challenge, env.ADMIN_SECRET)
        }
    });
}
