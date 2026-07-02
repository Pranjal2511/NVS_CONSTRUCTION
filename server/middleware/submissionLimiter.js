import rateLimit from 'express-rate-limit';

/**
 * Dedicated rate limiter for public submission endpoints (enquiry, contact, appointment).
 * Much stricter than the general API limiter: 5 requests per 15 minutes per IP.
 * This prevents spam-form abuse independently of the global rate limit.
 */
export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions from this IP. Please wait 15 minutes before trying again.',
  },
  skipSuccessfulRequests: false,
});
