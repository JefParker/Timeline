import test from 'node:test';
import assert from 'node:assert/strict';

import { signPayload } from '../lib/auth.js';
import {
    DEFAULT_RP_ID,
    base64UrlToBytes,
    bytesToBase64Url,
    challengeCookieHeader,
    clearChallengeCookieHeader,
    parseTransports,
    readChallenge,
    resolveRelyingParty,
    sanitizeLabel
} from '../lib/webauthn.js';

const SECRET = 'test-secret-value';
const PROD_URL = 'https://timeline-74i.pages.dev/api/passkey/auth-verify';

/** Pulls the cookie value back out of a Set-Cookie header. */
function cookieValue(setCookieHeader) {
    const pair = setCookieHeader.split(';')[0];
    return pair.slice(pair.indexOf('=') + 1);
}

function makeRequest(cookieValueOrNull, url = PROD_URL) {
    const cookie = cookieValueOrNull === null ? null : `tl_wa_challenge=${cookieValueOrNull}`;
    return {
        url,
        headers: { get: (name) => (name === 'Cookie' ? cookie : null) }
    };
}

async function issue(scope, challenge) {
    return cookieValue(await challengeCookieHeader(scope, challenge, SECRET));
}

test('a challenge cookie round-trips within its own scope', async () => {
    const value = await issue('auth', 'chAllenge-123');
    assert.equal(await readChallenge(makeRequest(value), 'auth', SECRET), 'chAllenge-123');
});

test('a registration challenge cannot be replayed against login', async () => {
    // The scope is inside the signed payload, so swapping it invalidates the
    // signature rather than just failing a string compare.
    const value = await issue('reg', 'chAllenge-123');
    assert.equal(await readChallenge(makeRequest(value), 'auth', SECRET), null);
});

test('challenge cookies are rejected when anything about them is wrong', async () => {
    const value = await issue('auth', 'chAllenge-123');
    const [scope, challenge, expiresAt, signature] = value.split('.');

    assert.equal(await readChallenge(makeRequest(value), 'auth', 'different-secret'), null);
    assert.equal(await readChallenge(makeRequest(null), 'auth', SECRET), null);
    assert.equal(await readChallenge(makeRequest(value), 'auth', ''), null);
    assert.equal(await readChallenge(makeRequest('not-a-cookie'), 'auth', SECRET), null);

    const swapped = `${scope}.tampered.${expiresAt}.${signature}`;
    assert.equal(await readChallenge(makeRequest(swapped), 'auth', SECRET), null);

    const extended = `${scope}.${challenge}.${Number(expiresAt) + 999999999}.${signature}`;
    assert.equal(await readChallenge(makeRequest(extended), 'auth', SECRET), null);
});

test('an expired challenge is rejected even with a valid signature', async () => {
    const expiresAt = Date.now() - 1000;
    const payload = `auth.chAllenge-123.${expiresAt}`;
    const signature = await signPayload(payload, SECRET);

    assert.equal(await readChallenge(makeRequest(`${payload}.${signature}`), 'auth', SECRET), null);
});

test('clearing the challenge cookie expires it immediately', () => {
    const header = clearChallengeCookieHeader();
    assert.match(header, /Max-Age=0/);
    assert.match(header, /HttpOnly/);
});

test('resolveRelyingParty accepts the production host and its preview subdomains', () => {
    assert.deepEqual(resolveRelyingParty({}, makeRequest(null, PROD_URL)), {
        rpID: DEFAULT_RP_ID,
        origin: 'https://timeline-74i.pages.dev'
    });

    // Preview deploys are subdomains, so a passkey registered against the
    // parent domain is valid there.
    assert.deepEqual(
        resolveRelyingParty({}, makeRequest(null, 'https://bafecea8.timeline-74i.pages.dev/x')),
        { rpID: DEFAULT_RP_ID, origin: 'https://bafecea8.timeline-74i.pages.dev' }
    );
});

test('resolveRelyingParty rejects hosts that are not ours', () => {
    assert.equal(resolveRelyingParty({}, makeRequest(null, 'https://example.com/x')), null);

    // Merely ending with the same characters is not enough: without the dot
    // separator this is a different registrable domain.
    assert.equal(
        resolveRelyingParty({}, makeRequest(null, 'https://eviltimeline-74i.pages.dev/x')),
        null
    );
});

test('resolveRelyingParty allows localhost for wrangler pages dev', () => {
    assert.deepEqual(resolveRelyingParty({}, makeRequest(null, 'http://localhost:8788/x')), {
        rpID: 'localhost',
        origin: 'http://localhost:8788'
    });
});

test('resolveRelyingParty honours the WEBAUTHN_RP_ID override', () => {
    const env = { WEBAUTHN_RP_ID: 'timeline.example.com' };

    assert.deepEqual(resolveRelyingParty(env, makeRequest(null, 'https://timeline.example.com/x')), {
        rpID: 'timeline.example.com',
        origin: 'https://timeline.example.com'
    });

    // Once overridden, the old pages.dev host is no longer accepted.
    assert.equal(resolveRelyingParty(env, makeRequest(null, PROD_URL)), null);
});

test('base64url encoding round-trips arbitrary bytes', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
    assert.deepEqual(base64UrlToBytes(bytesToBase64Url(bytes)), bytes);

    // No padding or non-url-safe characters survive the encode.
    assert.doesNotMatch(bytesToBase64Url(bytes), /[+/=]/);
});

test('parseTransports tolerates junk', () => {
    assert.deepEqual(parseTransports('["internal","hybrid"]'), ['internal', 'hybrid']);
    assert.equal(parseTransports('[]'), undefined);
    assert.equal(parseTransports('not json'), undefined);
    assert.equal(parseTransports(''), undefined);
    assert.equal(parseTransports(null), undefined);
});

test('sanitizeLabel bounds and cleans passkey names', () => {
    assert.equal(sanitizeLabel('MacBook Touch ID'), 'MacBook Touch ID');
    assert.equal(sanitizeLabel('   '), 'Passkey');
    assert.equal(sanitizeLabel(undefined), 'Passkey');
    assert.equal(sanitizeLabel(42), 'Passkey');
    assert.equal(sanitizeLabel('a'.repeat(200)).length, 40);
    assert.equal(sanitizeLabel('<script>alert(1)</script>'), '<script>alert(1)</script>');
});
