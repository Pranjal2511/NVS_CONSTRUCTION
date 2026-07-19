import twilio from 'twilio';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import SiteSettings from '../models/SiteSettings.js';

// ─── WhatsApp link helpers (for frontend wa.me links) ────────────────────────

export const getWhatsAppNumber = async () => {
  const settings = await SiteSettings.findOne();
  return settings?.whatsappNumber || settings?.companyPhone || '918009363259';
};

export const generateWhatsAppLink = (phone, message = '') => {
  const cleaned = String(phone).replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}${message ? `?text=${encoded}` : ''}`;
};

export const getWhatsAppLink = async (message = '') => {
  const phone = await getWhatsAppNumber();
  return generateWhatsAppLink(phone, message);
};

// ─── Twilio WhatsApp messaging ───────────────────────────────────────────────

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    const sid = env.TWILIO_ACCOUNT_SID;
    const token = env.TWILIO_AUTH_TOKEN;
    if (!sid || !token || token === 'your_twilio_auth_token_here') {
      return null;
    }
    twilioClient = twilio(sid, token);
  }
  return twilioClient;
};

/**
 * Send a WhatsApp message to the admin via Twilio.
 * @param {string} message - The text to send
 * @returns {Promise<boolean>} - true if sent successfully
 */
export const sendWhatsAppMessage = async (message) => {
  const client = getTwilioClient();

  if (!client) {
    logger.warn('[WhatsApp] Twilio credentials not configured — message not sent. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    return false;
  }

  try {
    const result = await client.messages.create({
      from: env.TWILIO_WHATSAPP_FROM,
      to: env.ADMIN_WHATSAPP_TO,
      body: message,
    });

    logger.info(`[WhatsApp] Message sent successfully via Twilio. SID: ${result.sid}`);
    return true;
  } catch (err) {
    logger.error('[WhatsApp] Failed to send message via Twilio', {
      message: err.message,
      code: err.code,
      status: err.status,
    });
    return false;
  }
};
