import helmet from 'helmet';
import cors from 'cors';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.IS_PRODUCTION ? { directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
    frameSrc: ["'self'", 'https://hcaptcha.com', 'https://*.hcaptcha.com', 'https://www.google.com'],
    connectSrc: ["'self'", 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    mediaSrc: ["'self'", 'https://res.cloudinary.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
    fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
  } } : false,
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
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');
    const allowed = parseAllowedOrigins();

    // Check direct matches
    if (allowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new ApiError(403, 'Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
});

export const csrfProtection = (req, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if ((origin && !parseAllowedOrigins().includes(origin)) || (!origin && req.headers['sec-fetch-site'] === 'cross-site')) return next(new ApiError(403, 'Request origin not allowed'));
  if (!origin && (req.cookies?.accessToken || req.cookies?.refreshToken)) return next(new ApiError(403, 'Origin header required for cookie-authenticated writes'));
  next();
};
