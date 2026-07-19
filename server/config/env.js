import dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------------------------
// IS_PRODUCTION: explicit boolean env var so staging/preview environments can
// opt-in to production-grade security without NODE_ENV tricks.
// ---------------------------------------------------------------------------
const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';

// ---------------------------------------------------------------------------
// JWT secret validation — enforced regardless of NODE_ENV.
// Weak / missing secrets are a critical security flaw in any environment.
// ---------------------------------------------------------------------------
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    '[FATAL] JWT_SECRET is missing or shorter than 32 characters. ' +
      'Set a cryptographically strong secret and restart the server.'
  );
}

if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
  throw new Error(
    '[FATAL] JWT_REFRESH_SECRET is missing or shorter than 32 characters. ' +
      'Set a cryptographically strong secret and restart the server.'
  );
}

// ---------------------------------------------------------------------------
// MongoDB — required in production, defaults to local in development.
// ---------------------------------------------------------------------------
const requiredInProduction = ['MONGODB_URI'];

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION,
  PORT: parseInt(process.env.PORT || '3000', 10),
  APP_URL: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
  CLIENT_URL: process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/nvs_buildcon',
  JWT_SECRET: jwtSecret,
  JWT_REFRESH_SECRET: jwtRefreshSecret,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || '"NVS Buildcon" <noreply@nvsbuildcon.com>',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  LOCKOUT_DURATION_MS: parseInt(process.env.LOCKOUT_DURATION_MS || '900000', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  // CAPTCHA — set whichever service you use; leave blank to disable verification
  HCAPTCHA_SECRET: process.env.HCAPTCHA_SECRET,
  HCAPTCHA_SITE_KEY: process.env.HCAPTCHA_SITE_KEY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
  ADMIN_WHATSAPP_TO: process.env.ADMIN_WHATSAPP_TO || 'whatsapp:+918009363259',
  ADMIN_SECRET_PATH: process.env.ADMIN_SECRET_PATH || '/admin',
};

if (IS_PRODUCTION) {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[FATAL] Missing required environment variables in production: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export default env;
