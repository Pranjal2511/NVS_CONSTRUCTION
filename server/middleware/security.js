import helmet from 'helmet';
import cors from 'cors';
import env from '../config/env.js';
import logger from '../utils/logger.js';

// Warn on startup if running without secure CORS enforcement
if (!env.IS_PRODUCTION) {
  logger.warn(
    'CORS is in permissive mode (IS_PRODUCTION=false). ' +
      'All origins are allowed. Do NOT use this in a publicly accessible deployment.',
    { IS_PRODUCTION: env.IS_PRODUCTION }
  );
}

export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.IS_PRODUCTION ? undefined : false,
  crossOriginEmbedderPolicy: false,
});

// Helper to clean and split comma-separated origin strings
const parseAllowedOrigins = () => {
  const raw = [env.CLIENT_URL, env.APP_URL].filter(Boolean).join(',');
  return raw
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, mobile, curl) or if permissive mode is enabled
    if (!origin || !env.IS_PRODUCTION) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');
    const allowed = parseAllowedOrigins();

    // Check direct matches
    if (allowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments for the project
    if (/^https:\/\/nvs-construction[a-zA-Z0-9-]*\.vercel\.app$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow localhost/127.0.0.1 for local dev even if IS_PRODUCTION flag is accidentally set
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
});
