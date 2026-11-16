import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimatePrice, validPricingGroups, escapeHtml } from '../src/utils/pricing.ts';
import { apiFetch } from '../src/utils/api.ts';

test('calculator computes square-foot estimates and currency rounding', () => {
  assert.equal(estimatePrice(1000, 3), 3000);
  assert.equal(estimatePrice(2000, 3), 6000);
  assert.equal(estimatePrice(10.125, 3), 30.38);
  for (const area of [-1, NaN, Infinity]) assert.equal(estimatePrice(area, 3), 0);
});
test('malformed or negative custom pricing cannot replace rate tables', () => {
  assert.equal(validPricingGroups([{ title: 'bad', items: [] }]), false);
  const groups = [{ title: 'Design', startingRate: 'Fixture only', items: [{ label: 'Plan', service: 'Plan', unit: 'sq.ft', rate: 3 }] }];
  assert.equal(validPricingGroups(groups), true);
  groups[0].items[0].rate = -1;
  assert.equal(validPricingGroups(groups), false);
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
test('API fetch uses cookies and renews expired session once', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (path, options) => {
    calls.push(path); assert.equal(options.credentials, 'include');
    assert.equal(options.headers?.Authorization, undefined);
    return new Response('{}', { status: calls.length === 1 ? 401 : 200 });
  });
  assert.equal((await apiFetch('/api/auth/profile')).status, 200);
  assert.deepEqual(calls, ['/api/auth/profile', '/api/auth/refresh', '/api/auth/profile']);
});
test('login failure is returned without automatic retry; service error is preserved', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return new Response('{"message":"Invalid credentials"}', { status: 401 }); });
  assert.equal((await apiFetch('/api/auth/login-password', { method: 'POST' })).status, 401);
  assert.equal(calls, 1);
});
test('failed logout does not falsely clear client session state', async t => {
  const { logout } = await import('../src/utils/auth.ts');
  let cleared = false;
  globalThis.localStorage = { removeItem() { cleared = true; } };
  t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 503 }));
  await assert.rejects(logout(), /Unable to end/);
  assert.equal(cleared, false);
  delete globalThis.localStorage;
});
test('successful logout clears browser helper state', async t => {
  const { logout } = await import('../src/utils/auth.ts');
  const cleared = [];
  globalThis.localStorage = { removeItem(key) { cleared.push(key); } };
  t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 200 }));
  await logout();
  assert.deepEqual(cleared, ['authRole', 'authToken']);
  delete globalThis.localStorage;
});
