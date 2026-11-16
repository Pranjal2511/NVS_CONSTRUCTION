import { test, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

Object.assign(process.env, { NODE_ENV: 'test', IS_PRODUCTION: 'false', JWT_SECRET: crypto.randomBytes(48).toString('hex'), JWT_REFRESH_SECRET: crypto.randomBytes(48).toString('hex'), MONGODB_URI: 'mongodb://127.0.0.1:1/nvs_repair_test', EMAIL_PROVIDER: 'smtp', SMTP_USER: 'test@example.invalid', SMTP_PASS: 'test-only', SMTP_PORT: '587', SMTP_SECURE: 'false', SMTP_HOST: 'smtp.example.invalid', RESEND_API_KEY: '', HCAPTCHA_SECRET: '', CLOUDINARY_CLOUD_NAME: '', CLOUDINARY_API_KEY: '', CLOUDINARY_API_SECRET: '', TWILIO_ACCOUNT_SID: '', TWILIO_AUTH_TOKEN: '' });
const { default: app } = await import('../server/app.js');
const { default: env } = await import('../server/config/env.js');
const { default: mongoose } = await import('mongoose');
const { default: User } = await import('../server/models/User.js');
const { default: Otp } = await import('../server/models/Otp.js');
const { default: Enquiry } = await import('../server/models/Enquiry.js');
const { default: Gallery } = await import('../server/models/Gallery.js');
const { default: Testimonial } = await import('../server/models/Testimonial.js');
const { default: HousePlan } = await import('../server/models/HousePlan.js');
const { default: SiteSettings } = await import('../server/models/SiteSettings.js');
const { default: AuditLog } = await import('../server/models/AuditLog.js');
const { default: nodemailer } = await import('nodemailer');
const auth = await import('../server/services/authService.js');
const email = await import('../server/services/emailService.js');
const { generateAccessToken, generateRefreshToken } = await import('../server/utils/jwt.js');
const { writableFields } = await import('../server/utils/writableFields.js');
const { seedDatabase, getSeedEntries } = await import('../server/utils/seed.js');
const { operatorTarget } = await import('../scripts/operator-target.mjs');
const { uploadFile, deleteFile } = await import('../server/services/uploadService.js');
const { hashPassword } = await import('../server/utils/password.js');

let ready = false;
Object.defineProperty(mongoose.connection, 'readyState', { configurable: true, get: () => ready ? 1 : 0 });
// No live MongoDB connection or provider request is permitted by this suite.
mock.method(mongoose, 'connect', async () => { throw new Error('Live DB forbidden in tests'); });
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
after(() => new Promise(resolve => server.close(resolve)));
const post = (path, body, headers = {}) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const user = () => ({ _id: new mongoose.Types.ObjectId(), name: 'Test Fixture', email: 'fixture@example.invalid', phone: '+919999999999', role: 'user', isVerified: true, isLocked: () => false, save: async function () { return this; } });
const query = value => ({ select: async () => value });

test('offline APIs fail promptly with 503 while liveness remains available', async () => {
  for (const path of ['/api/projects', '/api/ready', '/api/settings']) assert.equal((await fetch(base + path)).status, 503);
  assert.equal((await post('/api/auth/send-otp', { identifier: 'fixture@example.invalid' })).status, 503);
  const health = await (await fetch(base + '/api/health')).json();
  assert.equal(health.databaseReady, false);
  ready = true;
});
test('unlisted origins and originless cookie writes are rejected', async () => {
  assert.equal((await post('/api/auth/refresh', {}, { Origin: 'https://unrelated.vercel.app' })).status, 403);
  assert.equal((await post('/api/auth/refresh', {}, { Cookie: 'refreshToken=invalid' })).status, 403);
});
test('invalid JWT is rejected', async () => assert.equal((await fetch(base + '/api/auth/profile', { headers: { Authorization: 'Bearer invalid' } })).status, 401));
test('revoked sessions and changed admin roles are checked against current user', async t => {
  const fixture = user();
  t.mock.method(User, 'findById', async () => ({ ...fixture, sessionVersion: 1 }));
  const token = generateAccessToken({ id: fixture._id.toString(), role: 'admin', sessionVersion: 0 });
  assert.equal((await fetch(base + '/api/admin/stats', { headers: { Authorization: 'Bearer ' + token } })).status, 401);
});
test('SMTP respects 587 STARTTLS and 465 TLS, rejects contradictions', () => {
  assert.equal(email.smtpOptions().secure, false);
  assert.equal(email.smtpOptions().requireTLS, true);
  env.SMTP_SECURE = true;
  assert.throws(email.smtpOptions, /mismatch/);
  env.SMTP_PORT = 465;
  assert.equal(email.smtpOptions().secure, true);
  env.SMTP_PORT = 587; env.SMTP_SECURE = false;
});
test('SMTP verification does not send a message', async t => {
  let sent = 0;
  t.mock.method(nodemailer, 'createTransport', () => ({ verify: async () => true, sendMail: async () => sent++, close() {} }));
  email.resetTransporter(); await email.verifyEmailTransport(); assert.equal(sent, 0);
});
test('registration retains pending account when delivery fails', async t => {
  const fixture = user(); fixture.isVerified = false;
  let calls = 0, deleted = false;
  t.mock.method(User, 'findOne', () => ++calls === 1 ? Promise.resolve(null) : query(fixture));
  t.mock.method(User, 'create', async data => { assert.equal(data.role, 'user'); return fixture; });
  t.mock.method(User, 'findByIdAndDelete', async () => { deleted = true; });
  t.mock.method(Otp, 'findOne', () => query(null));
  t.mock.method(Otp, 'findOneAndUpdate', async () => ({}));
  t.mock.method(Otp, 'deleteMany', async () => ({}));
  t.mock.method(nodemailer, 'createTransport', () => ({ sendMail: async () => { throw new Error('fixture outage'); } }));
  email.resetTransporter();
  await assert.rejects(auth.registerUser({ name: fixture.name, email: fixture.email }), e => e.statusCode === 503);
  assert.equal(deleted, false);
});
test('pending registration resends, stores hashed OTP, and does not replace identity', async t => {
  const fixture = user(); fixture.isVerified = false;
  let calls = 0, created = false, stored, message;
  t.mock.method(User, 'findOne', () => ++calls === 1 ? Promise.resolve(fixture) : query(fixture));
  t.mock.method(User, 'create', async () => { created = true; });
  t.mock.method(Otp, 'findOne', () => query(null));
  t.mock.method(Otp, 'findOneAndUpdate', async (_filter, update) => { stored = update; });
  t.mock.method(nodemailer, 'createTransport', () => ({ sendMail: async data => { message = data; } }));
  email.resetTransporter();
  const result = await auth.registerUser({ email: fixture.email, name: 'Replacement' });
  assert.equal(result.otpRequired, true); assert.equal(created, false);
  assert.match(stored.otpHash, /^[0-9a-f]{64}$/); assert.ok(stored.expiresAt > new Date()); assert.ok(message);
});
test('verified duplicate registration returns 409', async t => {
  t.mock.method(User, 'findOne', async () => user());
  await assert.rejects(auth.registerUser({ email: 'fixture@example.invalid' }), e => e.statusCode === 409);
});
test('OTP cooldown enforced', async t => {
  t.mock.method(User, 'findOne', () => query(user()));
  t.mock.method(Otp, 'findOne', () => query({ lastSentAt: new Date(), expiresAt: new Date(Date.now() + 300000), resendCount: 0 }));
  await assert.rejects(auth.sendLoginOtp('fixture@example.invalid'), e => e.statusCode === 429);
});
test('OTP success consumes challenge and verifies account', async t => {
  const fixture = user(); fixture.isVerified = false;
  t.mock.method(User, 'findOne', () => query(fixture));
  t.mock.method(Otp, 'findOne', () => query({ _id: 'fixture', otpHash: hash('123456'), expiresAt: new Date(Date.now() + 10000), attempts: 0 }));
  t.mock.method(Otp, 'findOneAndDelete', async () => ({}));
  const result = await auth.verifyLoginOtp(fixture.email, '123456');
  assert.ok(result.accessToken); assert.equal(fixture.isVerified, true); assert.equal(fixture.refreshToken, hash(result.refreshToken));
});
test('OTP cannot be consumed twice', async t => {
  t.mock.method(User, 'findOne', () => query(user()));
  t.mock.method(Otp, 'findOne', () => query({ _id: 'fixture', otpHash: hash('123456'), expiresAt: new Date(Date.now() + 10000), attempts: 0 }));
  t.mock.method(Otp, 'findOneAndDelete', async () => null);
  await assert.rejects(auth.verifyLoginOtp('fixture@example.invalid', '123456'), e => e.statusCode === 401);
});
test('password login enforces password and returns tokens only internally', async t => {
  const fixture = user(); fixture.password = await hashPassword('Test-Only-Password-84!');
  t.mock.method(User, 'findOne', () => query(fixture));
  const tokens = await auth.loginWithPassword(fixture.email, 'Test-Only-Password-84!');
  assert.equal(auth.formatAuthResponse(tokens).accessToken, undefined);
  await assert.rejects(auth.loginWithPassword(fixture.email, 'wrong'), e => e.statusCode === 401);
});
test('refresh rotation uses atomic old-token match and unique new tokens', async t => {
  const fixture = user();
  const token = generateRefreshToken({ id: fixture._id.toString(), role: 'user' });
  fixture.refreshToken = hash(token);
  t.mock.method(User, 'findById', () => query(fixture));
  t.mock.method(User, 'findOneAndUpdate', async (filter, update) => { assert.equal(filter.refreshToken, hash(token)); assert.notEqual(update.refreshToken, hash(token)); return fixture; });
  assert.notEqual((await auth.refreshAccessToken(token)).refreshToken, token);
});
test('blocked accounts cannot refresh', async t => {
  const fixture = user(); fixture.blocked = true;
  const token = generateRefreshToken({ id: fixture._id.toString() }); fixture.refreshToken = hash(token);
  t.mock.method(User, 'findById', () => query(fixture));
  await assert.rejects(auth.refreshAccessToken(token), e => e.statusCode === 403);
});
test('logout revokes access sessions and clears both cookies', async t => {
  let update; const cookies = [];
  t.mock.method(User, 'findByIdAndUpdate', async (_id, value) => { update = value; });
  await auth.logoutUser('fixture', { clearCookie: name => cookies.push(name) });
  assert.equal(update.$inc.sessionVersion, 1); assert.deepEqual(cookies, ['accessToken', 'refreshToken']);
});
test('callback accepts missing email while normal enquiry requires email', async () => {
  const data = { name: 'Fixture', phone: '9999999999', service: 'Callback Request', message: 'Please call' };
  await new Enquiry(data).validate();
  await assert.rejects(new Enquiry({ ...data, service: 'Planning' }).validate());
});
test('schema rejects invalid ratings and update allowlist removes internal fields', async () => {
  await assert.rejects(new Testimonial({ name: 'Fixture', rating: 9, review: 'Fixture' }).validate());
  assert.deepEqual(writableFields('Gallery', { title: 'Allowed', createdAt: 'x', _id: 'x', $unset: { title: '' }, role: 'admin' }), { title: 'Allowed' });
});
test('gallery update calls validators and excludes mass-assignment fields', async t => {
  const { updateGalleryItem } = await import('../server/controllers/galleryController.js');
  t.mock.method(Gallery, 'findByIdAndUpdate', async (_id, update, options) => { assert.equal(options.runValidators, true); assert.deepEqual(update, { title: 'Fixture' }); return { id: 'fixture' }; });
  t.mock.method(AuditLog, 'create', async () => ({}));
  let error;
  await updateGalleryItem({ params: { id: 'fixture' }, body: { title: 'Fixture', createdAt: 'forged' }, user: { id: 'fixture' } }, { status() { return this; }, json() {} }, err => { error = err; });
  assert.equal(error, undefined);
});
test('house plan request persists enquiry before returning success', async t => {
  const { requestHousePlan } = await import('../server/controllers/housePlanController.js');
  const fixture = user(); let stored;
  t.mock.method(HousePlan, 'findById', async () => ({ id: 'plan', title: 'Fixture plan', category: 'Residential', area: '1000' }));
  t.mock.method(User, 'findById', async () => fixture);
  t.mock.method(Enquiry, 'create', async data => { stored = data; return { ...data, id: 'enquiry' }; });
  t.mock.method(SiteSettings, 'findOne', async () => ({}));
  t.mock.method(AuditLog, 'create', async () => ({}));
  t.mock.method(nodemailer, 'createTransport', () => ({ sendMail: async () => ({}) })); email.resetTransporter();
  let status, error;
  await requestHousePlan({ params: { id: 'plan' }, user: { id: fixture._id.toString() }, body: {} }, { status(code) { status = code; return this; }, json() {} }, err => { error = err; });
  assert.equal(error, undefined); assert.equal(status, 201); assert.equal(stored.service, 'House Plan Request');
});
test('seed fixtures validate and match documented counts', async () => {
  const entries = await getSeedEntries(); const counts = {};
  for (const { Model, record } of entries) { await new Model(record).validate(); counts[Model.modelName] = (counts[Model.modelName] || 0) + 1; }
  assert.deepEqual(counts, { SiteSettings: 1, Project: 8, HousePlan: 10, Gallery: 17, Service: 3, Testimonial: 4, Blog: 2 });
});
test('seed dry-run writes nothing and applying twice preserves existing records', async t => {
  const entries = await getSeedEntries(); const store = new Set(); let writes = 0;
  for (const Model of new Set(entries.map(e => e.Model))) {
    const key = filter => Model.modelName + JSON.stringify(filter);
    t.mock.method(Model, 'exists', async filter => store.has(key(filter)));
    t.mock.method(Model, 'updateOne', async (filter, update, options) => { assert.ok(update.$setOnInsert); assert.equal(options.runValidators, true); writes++; store.add(key(filter)); return { upsertedCount: 1 }; });
  }
  assert.equal((await seedDatabase()).missing, 45); assert.equal(writes, 0);
  assert.equal((await seedDatabase({ apply: true })).inserted, 45);
  assert.equal((await seedDatabase({ apply: true })).inserted, 0); assert.equal(writes, 45);
});
test('operator guards reject unconfirmed writes and unexpected targets', () => {
  assert.equal(operatorTarget(['--database', 'nvs_repair_test']).apply, false);
  assert.throws(() => operatorTarget(['--database', 'nvs_repair_test', '--apply']), /confirm/);
  assert.throws(() => operatorTarget(['--database', 'production']), /exact/);
});
test('uploads reject unknown types, mismatched extension and local traversal', async () => {
  await assert.rejects(uploadFile({ originalname: 'payload.svg', mimetype: 'image/png', buffer: Buffer.from('x') }, 'image'), e => e.statusCode === 400);
  await assert.rejects(uploadFile({ originalname: 'x.png', mimetype: 'image/png', buffer: Buffer.from('x') }, 'unknown'), e => e.statusCode === 400);
  await assert.rejects(deleteFile('../outside', 'local'), e => e.statusCode === 400);
});

test('connection initialization reports failure without querying or leaking URI', async t => {
  const { default: connectDB } = await import('../server/config/database.js');
  let calls = 0;
  t.mock.method(mongoose, 'connect', async () => { calls++; throw new Error('fixture'); });
  assert.equal(await connectDB({ attempts: 1 }), false); assert.equal(calls, 1);
});
test('CAPTCHA rejection and provider outage fail closed', async t => {
  const { verifyCaptcha } = await import('../server/middleware/captcha.js');
  env.HCAPTCHA_SECRET = 'fixture-secret';
  let status, passed = false;
  const res = { status(code) { status = code; return this; }, json() {} };
  t.mock.method(globalThis, 'fetch', async () => ({ json: async () => ({ success: false }) }));
  await verifyCaptcha({ body: { 'h-captcha-response': 'fixture' }, ip: '127.0.0.1' }, res, () => { passed = true; });
  assert.equal(status, 400); assert.equal(passed, false);
  globalThis.fetch = async () => { throw new Error('fixture outage'); };
  await verifyCaptcha({ body: { 'h-captcha-response': 'fixture' }, ip: '127.0.0.1' }, res, () => { passed = true; });
  assert.equal(status, 503); assert.equal(passed, false);
  env.HCAPTCHA_SECRET = '';
});
test('duplicate submission guard blocks concurrent request and permits retry after failure', async () => {
  const { duplicateSubmission } = await import('../server/middleware/duplicateSubmission.js');
  const { EventEmitter } = await import('node:events');
  const req = { ip: 'fixture', originalUrl: '/fixture', body: { message: 'test' } };
  const response = () => Object.assign(new EventEmitter(), { statusCode: 200, status(code) { this.statusCode = code; return this; }, json() {} });
  const first = response(), second = response(); let passed = 0;
  duplicateSubmission(req, first, () => passed++);
  duplicateSubmission(req, second, () => passed++);
  assert.equal(passed, 1); assert.equal(second.statusCode, 409);
  first.statusCode = 503; first.emit('finish');
  duplicateSubmission(req, response(), () => passed++); assert.equal(passed, 2);
});
test('appointment controller persists before returning 201', async t => {
  const { default: Appointment } = await import('../server/models/Appointment.js');
  const { bookAppointment } = await import('../server/controllers/appointmentController.js');
  let stored, status, error;
  t.mock.method(Appointment, 'create', async data => { stored = data; return data; });
  t.mock.method(SiteSettings, 'findOne', async () => ({}));
  t.mock.method(nodemailer, 'createTransport', () => ({ sendMail: async () => ({}) })); email.resetTransporter();
  await bookAppointment({ body: { name: 'Fixture', email: 'fixture@example.invalid', phone: '9999999999', date: '2026-12-01', time: '9:00 AM', service: 'Planning' } }, { status(code) { status = code; return this; }, json() {} }, err => { error = err; });
  assert.equal(error, undefined); assert.equal(status, 201); assert.equal(stored.preferredDate, '2026-12-01');
});
test('callback endpoint persists real supplied fields without fabricated email', async t => {
  t.mock.method(Enquiry, 'create', async data => { assert.equal(data.email, undefined); assert.equal(data.phone, '9999999999'); return { ...data, id: 'fixture' }; });
  t.mock.method(SiteSettings, 'findOne', async () => ({}));
  t.mock.method(nodemailer, 'createTransport', () => ({ sendMail: async () => ({}) })); email.resetTransporter();
  const response = await post('/api/enquiries', { name: 'Fixture', phone: '9999999999', service: 'Callback Request', message: 'Please call' });
  assert.equal(response.status, 201);
});
test('invalid appointment date is rejected before persistence', async () => {
  const response = await post('/api/appointments', { name: 'Fixture', email: 'fixture@example.invalid', phone: '9999999999', service: 'Planning', date: '2026-02-31', time: '9:00 AM' });
  assert.equal(response.status, 400);
});
test('missing settings return 503 without silently creating a document', async t => {
  let created = false;
  t.mock.method(SiteSettings, 'findOne', async () => null);
  t.mock.method(SiteSettings, 'create', async () => { created = true; });
  assert.equal((await fetch(base + '/api/settings')).status, 503);
  assert.equal(created, false);
});
test('submission rate limit eventually returns 429', async () => {
  let last;
  for (let i = 0; i < 6; i++) last = await post('/api/enquiries', {});
  assert.equal(last.status, 429);
});
test('unknown API returns JSON 404 without leaking query values or reaching Vite', async () => {
  const response = await fetch(base + '/api/does-not-exist?token=private-fixture');
  assert.equal(response.status, 404);
  assert.equal((await response.text()).includes('private-fixture'), false);
});
