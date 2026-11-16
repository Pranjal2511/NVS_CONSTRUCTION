import { verifyEmailTransport, sendEmail } from '../server/services/emailService.js';
try {
  if (process.argv[2] === '--send' && process.argv[3]) {
    await sendEmail({ to: process.argv[3], subject: 'NVS email delivery check', text: 'Operator-requested email delivery check.' });
    console.log('Provider accepted test email. Confirm inbox receipt manually.');
  } else {
    await verifyEmailTransport();
    console.log('SMTP connection and authentication verified. No email sent.');
  }
} catch (err) { console.error('Email verification failed. Check provider selection, port/TLS, credentials and sender domain.', { code: typeof err.code === 'string' && /^[A-Z0-9_]+$/.test(err.code) ? err.code : 'CONFIG_OR_PROVIDER', responseCode: Number(err.responseCode) || undefined }); process.exitCode = 1; }
