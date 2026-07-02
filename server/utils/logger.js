const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'refreshToken'];

const redact = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(copy)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      copy[key] = '[REDACTED]';
    } else if (typeof copy[key] === 'object') {
      copy[key] = redact(copy[key]);
    }
  }
  return copy;
};

const logger = {
  info: (message, meta = {}) => {
    console.info(`[INFO] ${message}`, Object.keys(meta).length ? redact(meta) : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, Object.keys(meta).length ? redact(meta) : '');
  },
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${message}`, Object.keys(meta).length ? redact(meta) : '');
  },
  audit: (action, meta = {}) => {
    console.info(`[AUDIT] ${action}`, redact(meta));
  },
};

export default logger;
