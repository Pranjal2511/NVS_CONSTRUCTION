import twilio from 'twilio';
import env from '../config/env.js';
// Twilio Verify sends a real challenge; a WhatsApp deep link is not delivery.
// Local OTP verification needs the same code, so use an operator-configured SMS sender.
export const sendLoginOtpPhone = async (_user, phoneIdentifier, otp) => {
  const from = process.env.TWILIO_SMS_FROM;
  if (!from || !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) throw new Error('Phone OTP delivery is not configured; use email login');
  if (!/^\+[1-9]\d{7,14}$/.test(phoneIdentifier)) throw new Error('Phone must be in E.164 format');
  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  const result = await client.messages.create({ from, to: phoneIdentifier, body: 'Your NVS Buildcon verification code is ' + otp + '. Valid for 5 minutes.' });
  if (!result.sid || result.errorCode) throw new Error('SMS provider rejected the verification message');
  return { accepted: true, channel: 'phone' };
};
