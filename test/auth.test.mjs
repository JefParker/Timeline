import test from 'node:test';
import assert from 'node:assert/strict';

import {
    timingSafeEqual,
    checkAdminCredentials,
    createSessionToken,
    verifySessionToken,
    readCookie,
    SESSION_COOKIE
} from '../lib/auth.js';

const SECRET = 'test-secret-value';

test('timingSafeEqual only matches identical non-empty strings', () => {
    assert.ok(timingSafeEqual('abc', 'abc'));

    assert.equal(timingSafeEqual('abc', 'abd'), false);
    assert.equal(timingSafeEqual('abc', 'abcd'), false);
    assert.equal(timingSafeEqual('', ''), false, 'empty strings never match');
    assert.equal(timingSafeEqual(undefined, undefined), false, 'the original bypass');
    assert.equal(timingSafeEqual(null, null), false);
    assert.equal(timingSafeEqual(1, 1), false);
});

test('checkAdminCredentials fails closed when env is unconfigured', () => {
    // This was the original auth bypass: with no env vars set, an empty JSON
    // body made `undefined === undefined` and logged the caller in.
    assert.equal(checkAdminCredentials({}, undefined, undefined), false);
    assert.equal(checkAdminCredentials({}, '', ''), false);
    assert.equal(checkAdminCredentials({ ADMIN_USERNAME: 'a' }, undefined, undefined), false);
    assert.equal(checkAdminCredentials({ ADMIN_PASSWORD: 'b' }, undefined, undefined), false);
    assert.equal(checkAdminCredentials(undefined, undefined, undefined), false);
});

test('checkAdminCredentials accepts only the exact pair', () => {
    const env = { ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: 'hunter2' };

    assert.ok(checkAdminCredentials(env, 'admin', 'hunter2'));

    assert.equal(checkAdminCredentials(env, 'admin', 'wrong'), false);
    assert.equal(checkAdminCredentials(env, 'wrong', 'hunter2'), false);
    assert.equal(checkAdminCredentials(env, 'Admin', 'hunter2'), false);
    assert.equal(checkAdminCredentials(env, 'admin', ''), false);
});

test('session tokens round-trip and reject tampering', async () => {
    const token = await createSessionToken(SECRET, 3600);

    assert.ok(await verifySessionToken(token, SECRET));

    assert.equal(await verifySessionToken(token, 'different-secret'), false);
    assert.equal(await verifySessionToken(token + 'x', SECRET), false);
    assert.equal(await verifySessionToken('admin.9999999999999.forged', SECRET), false);
    assert.equal(await verifySessionToken('', SECRET), false);
    assert.equal(await verifySessionToken(token, ''), false);
    assert.equal(await verifySessionToken(undefined, SECRET), false);
});

test('an extended expiry is rejected because it is covered by the signature', async () => {
    const token = await createSessionToken(SECRET, 3600);
    const [role, expiresAt, signature] = token.split('.');

    const extended = `${role}.${Number(expiresAt) + 999999999}.${signature}`;
    assert.equal(await verifySessionToken(extended, SECRET), false);

    const escalated = `superadmin.${expiresAt}.${signature}`;
    assert.equal(await verifySessionToken(escalated, SECRET), false);
});

test('expired sessions are rejected', async () => {
    const expired = await createSessionToken(SECRET, -10);
    assert.equal(await verifySessionToken(expired, SECRET), false);
});

test('readCookie parses the session cookie out of a header', () => {
    const makeRequest = (cookie) => ({
        headers: { get: (name) => (name === 'Cookie' ? cookie : null) }
    });

    assert.equal(readCookie(makeRequest(`${SESSION_COOKIE}=abc123`), SESSION_COOKIE), 'abc123');
    assert.equal(
        readCookie(makeRequest(`other=1; ${SESSION_COOKIE}=abc123; another=2`), SESSION_COOKIE),
        'abc123'
    );
    assert.equal(readCookie(makeRequest('other=1'), SESSION_COOKIE), null);
    assert.equal(readCookie(makeRequest(null), SESSION_COOKIE), null);
    assert.equal(
        readCookie(makeRequest(`${SESSION_COOKIE}_other=nope`), SESSION_COOKIE),
        null,
        'prefix must not match'
    );
});
