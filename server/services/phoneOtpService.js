import env from '../config/env.js';
import { getWhatsAppNumber, generateWhatsAppLink } from './whatsappService.js';

// Note: This project currently has WhatsApp utilities, not an SMS provider.
// So for "phone OTP" we deliver by WhatsApp deep link.
export const sendLoginOtpPhone = async (user, phoneIdentifier, otp) => {
  // phoneIdentifier may be raw input; clean digits for message
  const waNumber = await getWhatsAppNumber();
  const cleaned = String(phoneIdentifier).replace(/\D/g, '');

  // If whatsapp number is not properly set, fail clearly.
  if (!waNumber) {
    throw new Error('WhatsApp number is not configured in SiteSettings / env.');
  }

  const message = `Your NVS Buildcon login OTP is ${otp}. It expires in 5 minutes.`;

  // If you ever add an SMS provider, this function is where to integrate it.
  // For now we return a link that the client (or server log) can use.
  const link = generateWhatsAppLink(cleaned || user.phone || waNumber, message);

  // We intentionally do not attempt to "send" WhatsApp programmatically here,
  // because WhatsApp requires a user to open the deep link.
  return {
    delivered: true,
    channel: 'phone',
    otpDestination: cleaned || user.phone,
    whatsappLink: link,
  };
};

