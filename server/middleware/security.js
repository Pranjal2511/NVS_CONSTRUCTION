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

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // In non-production mode allow all origins (local dev, CI, preview)
    if (!origin || !env.IS_PRODUCTION) {
      return callback(null, true);
    }
    const allowed = [env.CLIENT_URL, env.APP_URL].filter(Boolean);
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
});
