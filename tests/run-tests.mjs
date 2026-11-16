/**
 * Automated Verification & Regression Test Suite
 * NVS Buildcon & Architects Platform
 */

import http from 'http';
import assert from 'assert';
import crypto from 'node:crypto';
process.env.NODE_ENV = 'test';
process.env.IS_PRODUCTION = 'false';
process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
process.env.JWT_REFRESH_SECRET = crypto.randomBytes(48).toString('hex');
process.env.HCAPTCHA_SECRET = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';
process.env.RESEND_API_KEY = '';
process.env.EMAIL_PROVIDER = 'smtp';
const { default: app } = await import('../server/app.js');
const { default: mongoose } = await import('mongoose');
const { default: User } = await import('../server/models/User.js');
// Model stubs only: no database connection is ever opened.
Object.defineProperty(mongoose.connection, 'readyState', { configurable: true, get: () => 1 });
User.findById = async () => ({ role: 'user', isVerified: true, sessionVersion: 0 });
import { escapeRegex } from '../server/utils/regex.js';
const { generateAccessToken } = await import('../server/utils/jwt.js');
const { formatAuthResponse } = await import('../server/services/authService.js');

let server;
let baseUrl;

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

async function run() {
  console.log('====================================================');
  console.log('🧪 Starting NVS Buildcon Production Verification Tests');
  console.log('====================================================\n');

  // Start ephemeral test server on random free port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Ephemeral test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      process.stdout.write(`• Testing: ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log('❌ FAIL');
      console.error(`  Error: ${err.message}`);
      if (err.stack) console.error(err.stack);
      failed++;
    }
  }

  // Teardown server
  await new Promise((resolve) => server.close(resolve));

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed (${tests.length} total)`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// ----------------------------------------------------
// 1. UNIT TESTS: Regex Escaping & ReDoS Protection
// ----------------------------------------------------
test('escapeRegex: escapes dangerous characters', () => {
  const dangerous = 'hello.*+?^${}()|[]\\world';
  const escaped = escapeRegex(dangerous);
  assert.strictEqual(escaped, 'hello\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\world');
});

test('escapeRegex: limits maximum length to prevent ReDoS', () => {
  const huge = 'a'.repeat(200);
  const escaped = escapeRegex(huge, 50);
  assert.strictEqual(escaped.length, 50);
});

test('escapeRegex: handles non-string and empty input safely', () => {
  assert.strictEqual(escapeRegex(null), '');
  assert.strictEqual(escapeRegex(undefined), '');
  assert.strictEqual(escapeRegex(123), '');
});

// ----------------------------------------------------
// 2. SECURITY & AUTH TOKEN INTEGRITY
// ----------------------------------------------------
test('formatAuthResponse: does NOT expose refreshToken in JSON payload', () => {
  const mockTokens = {
    accessToken: 'mock_access_token_123',
    refreshToken: 'mock_refresh_token_secret_456',
    user: {
      _id: '507f1f77bcf86cd799439011',
      name: 'NVS Client',
      email: 'client@example.com',
      role: 'user',
    },
  };
  const response = formatAuthResponse(mockTokens);
  assert.strictEqual(response.token, undefined);
  assert.strictEqual(response.accessToken, undefined);
  assert.strictEqual(response.refreshToken, undefined, 'refreshToken must NOT be exposed in JSON response body');
  assert.strictEqual(response.user.email, 'client@example.com');
});

test('Security Headers: X-Content-Type-Options is nosniff on API', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
});

test('Health Check: /api/health returns 200 with success status', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.message.includes('NVS Buildcon API'));
});

// ----------------------------------------------------
// 3. ACCESS CONTROL & PERMISSIONS
// ----------------------------------------------------
test('Access Control: /api/admin/stats blocks unauthenticated requests with 401 JSON', async () => {
  const res = await fetch(`${baseUrl}/api/admin/stats`);
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Authentication required');
});

test('Access Control: Non-admin tokens blocked from admin endpoints (403)', async () => {
  const userToken = generateAccessToken({ id: '507f1f77bcf86cd799439011', email: 'user@example.com', role: 'user' });
  const res = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Access denied');
});

// ----------------------------------------------------
// 4. INPUT VALIDATION & SCHEMA ENFORCEMENT
// ----------------------------------------------------
test('Input Validation: /api/auth/register validates required email and phone (400)', async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.ok(data.errors && data.errors.length > 0);
});

test('Input Validation: /api/auth/login requires valid email format (400)', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bad-email', password: 'Short' }),
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

test('Enquiry Route: Rejects invalid empty payload with 400', async () => {
  const res = await fetch(`${baseUrl}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '' }),
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

test('Appointment Route: Rejects missing date/time with 400', async () => {
  const res = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

// ----------------------------------------------------
// 5. GLOBAL SEARCH
// ----------------------------------------------------
test('Global Search: Empty query returns empty structured arrays without DB hit', async () => {
  const res = await fetch(`${baseUrl}/api/search?q=`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.deepStrictEqual(data.data.projects, []);
  assert.deepStrictEqual(data.data.housePlans, []);
  assert.deepStrictEqual(data.data.gallery, []);
  assert.deepStrictEqual(data.data.blogs, []);
});

// ----------------------------------------------------
// 6. HOUSE PLAN ROUTE
// ----------------------------------------------------
test('House Plan Request: Requires authentication (401)', async () => {
  const res = await fetch(`${baseUrl}/api/house-plans/507f1f77bcf86cd799439011/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

// ----------------------------------------------------
// 7. REGRESSION: SEARCH SECURITY (escapeRegex applied)
// ----------------------------------------------------
test('escapeRegex: project/gallery search metacharacters handled literally', () => {
  const dangerous = 'title.*+?^${}()|[]\\world';
  const escaped = escapeRegex(dangerous);
  assert.strictEqual(escaped, 'title\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\world');
  assert.ok(!escaped.includes('.*'));
  assert.ok(!escaped.includes('+?'));
});

test('escapeRegex: caps query length to prevent ReDoS on search', () => {
  const huge = 'a'.repeat(500);
  const escaped = escapeRegex(huge);
  assert.strictEqual(escaped.length, 100);
});

run();
