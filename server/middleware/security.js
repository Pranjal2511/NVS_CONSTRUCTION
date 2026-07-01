import helmet from 'helmet';
import cors from 'cors';
import env from '../config/env.js';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
});

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || env.NODE_ENV !== 'production') {
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
