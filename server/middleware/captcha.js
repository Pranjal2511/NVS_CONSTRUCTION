import env from '../config/env.js';
import logger from '../utils/logger.js';

const HCAPTCHA_VERIFY_URL = 'https://api.hcaptcha.com/siteverify';

export const verifyCaptcha = async (req, res, next) => {
  if (!env.HCAPTCHA_SECRET) {
    if (!env.IS_PRODUCTION) {
      logger.warn('CAPTCHA verification skipped because HCAPTCHA_SECRET is not set. Set it before deploying.');
      return next();
    }

    logger.error('CAPTCHA verification is disabled in production. Set HCAPTCHA_SECRET immediately.');
    return res.status(503).json({
      success: false,
      message: 'CAPTCHA verification is not configured. Please contact support.',
    });
  }

  const token = req.body['h-captcha-response'];

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'CAPTCHA verification required. Please complete the CAPTCHA and try again.',
    });
  }

  try {
    const params = new URLSearchParams({
      secret: env.HCAPTCHA_SECRET,
      response: token,
      remoteip: req.ip,
    });

    const verifyRes = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await verifyRes.json();

    if (!data.success) {
      logger.warn('CAPTCHA verification failed', { errorCodes: data['error-codes'], ip: req.ip });
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA verification failed. Please try again.',
      });
    }

    next();
  } catch (err) {
    logger.error('CAPTCHA verification request failed', { message: err.message });

    if (env.IS_PRODUCTION) {
      return res.status(503).json({
        success: false,
        message: 'CAPTCHA service temporarily unavailable. Please try again shortly.',
      });
    }

    next();
  }
};
