import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import env from '../config/env.js';
import SiteSettings from '../models/SiteSettings.js';
import logger from '../utils/logger.js';
import dns from 'dns';

// Force Node to resolve IPv4 addresses first (fixes ENETUNREACH IPv6 issue on cloud providers like Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const resend = env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY && !env.RESEND_API_KEY.includes('your_') ? new Resend(env.RESEND_API_KEY) : null;
let transporter = null;

export const resetTransporter = () => {
  transporter = null;
};

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.SMTP_USER || !env.SMTP_PASS) return null;

  const options = smtpOptions();
  transporter = nodemailer.createTransport(options);
  return transporter;
};

export const smtpOptions = () => {
  const port = env.SMTP_PORT;
  if ((port === 587 && env.SMTP_SECURE) || (port === 465 && !env.SMTP_SECURE)) throw new Error('SMTP port/security mismatch: use 587/false or 465/true');
  const host = env.SMTP_HOST || 'smtp.gmail.com';
  return { host, port, secure: env.SMTP_SECURE, requireTLS: !env.SMTP_SECURE,
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    auth: { user: env.SMTP_USER?.trim(), pass: host === 'smtp.gmail.com' ? env.SMTP_PASS?.replace(/\s+/g, '') : env.SMTP_PASS } };
};
export const verifyEmailTransport = async () => {
  if (env.EMAIL_PROVIDER === 'resend') throw new Error('SMTP verification does not apply to Resend; verify API key scope and sender domain in the Resend dashboard');
  const transport = getTransporter();
  if (!transport) throw new Error('SMTP credentials are not configured');
  try { await transport.verify(); return true; } finally { transport.close(); resetTransporter(); }
};
export const isEmailTransportConfigured = () => {
  return Boolean(env.RESEND_API_KEY || (env.SMTP_USER && env.SMTP_PASS));
};

const getAdminEmail = async () => {
  const settings = await SiteSettings.findOne();
  return settings?.emailForNotifications || 'admin@nvsbuildcon.com';
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!['smtp', 'resend'].includes(env.EMAIL_PROVIDER)) throw new Error('Invalid EMAIL_PROVIDER');
  if (env.EMAIL_PROVIDER === 'resend' && !resend) throw new Error('Resend is not configured');
  // 1. If Resend is configured, use Resend HTTPS API (Port 443, never blocked on Render/Vercel)
  if (resend) {
    try {
      const fromAddress = env.SMTP_FROM || 'NVS Buildcon <onboarding@resend.dev>';
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        html,
      });

      if (error) {
        logger.error('Resend API error sending email', { provider: 'resend' });
        throw new Error(error.message || 'Failed to send email via Resend');
      }

      logger.info('Email sent successfully via Resend API', { id: data?.id });
      return true;
    } catch (err) {
      logger.error('Resend exception', { provider: 'resend' });
      throw err;
    }
  }

  // 2. Fallback to Nodemailer SMTP
  const transport = getTransporter();
  if (!transport) {
    throw new Error('Email service is not configured. Please set RESEND_API_KEY or SMTP credentials (SMTP_USER & SMTP_PASS) in your .env file.');
  }

  try {
    const fromAddress = env.SMTP_FROM || `"NVS Buildcon" <${env.SMTP_USER}>`;
    await transport.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });
    logger.info('Email sent successfully via SMTP', { provider: 'smtp' });
    return true;
  } catch (err) {
    if (err.message && (err.message.includes('535') || err.message.includes('Username and Password not accepted') || err.message.includes('BadCredentials'))) {
      resetTransporter();
      logger.error('SMTP Authentication failure', { provider: 'smtp' });
      throw new Error('Gmail SMTP authentication failed: Invalid login credentials. For Gmail, you must generate and use a 16-character Google App Password (not your personal account password). Visit https://myaccount.google.com/apppasswords to generate one.');
    }
    logger.error('SMTP delivery error', { provider: 'smtp' });
    throw new Error(`Email delivery failed: ${err.message}`);
  }
};

export const buildOtpEmailHtml = (userName, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code - NVS Buildcon</title>
</head>
<body style="margin:0;padding:0;background-color:#06090e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#06090e;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:540px;background-color:#0f172a;border-radius:16px;border:1px solid rgba(194,166,73,0.35);overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#c2a649 0%,#e8c96e 100%);padding:28px 36px;text-align:center;">
              <h1 style="margin:0;color:#0a0f18;font-size:22px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;">
                NVS BUILDCON
              </h1>
              <p style="margin:4px 0 0;color:#0a0f18;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;opacity:0.85;">
                Architects & Engineers
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <h2 style="margin:0 0 12px;color:#ffffff;font-size:18px;font-weight:700;">
                Verification Code
              </h2>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Hello <strong style="color:#f1f5f9;">${userName || 'Valued Client'}</strong>,<br/>
                Use the following 6-digit One-Time Password (OTP) to complete your verification with NVS Buildcon.
              </p>

              <!-- OTP Box -->
              <div style="background-color:#1e293b;border:2px dashed #c2a649;border-radius:12px;padding:22px;text-align:center;margin:24px 0;">
                <span style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#c2a649;font-weight:700;display:block;margin-bottom:8px;">
                  Your One-Time Password
                </span>
                <span style="font-family:'Courier New',Courier,monospace;font-size:38px;font-weight:900;letter-spacing:12px;color:#ffffff;display:inline-block;padding-left:12px;">
                  ${otp}
                </span>
              </div>

              <!-- Expiry & Warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;background-color:rgba(255,255,255,0.03);border-radius:8px;padding:14px 18px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;color:#cbd5e1;font-size:13px;font-weight:600;">
                      ⏱ <strong>Valid for 5 minutes</strong>
                    </p>
                    <p style="margin:0;color:#64748b;font-size:12px;line-height:1.5;">
                      🔒 <strong>Security Warning:</strong> Never share this code with anyone. NVS Buildcon staff will never ask for your OTP. If you did not request this verification, please disregard this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;background-color:#0a0f18;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;color:#64748b;font-size:11px;">
                &copy; ${new Date().getFullYear()} NVS Buildcon & Architects. All rights reserved.
              </p>
              <p style="margin:4px 0 0;color:#475569;font-size:10px;">
                This is an automated system security notification. Replies to this email are not monitored.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buildAdminHtml = (title, rows) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0f18;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f18;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:12px;border:1px solid #c2a649;overflow:hidden;max-width:600px;">
        <tr><td style="background:linear-gradient(135deg,#c2a649,#e8c96e);padding:24px 32px;">
          <h1 style="margin:0;color:#0a0f18;font-size:20px;font-weight:bold;">NVS Buildcon</h1>
          <p style="margin:4px 0 0;color:#0a0f18;font-size:13px;opacity:0.8;">${title}</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${rows.map(([label, value]) => `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                <span style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">${label}</span><br/>
                <span style="color:#ffffff;font-size:14px;font-weight:500;">${value || '—'}</span>
              </td>
            </tr>`).join('')}
          </table>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#0a0f18;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;color:#6b7280;font-size:11px;text-align:center;">This is an automated notification from NVS Buildcon system.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const sendAdminNotification = async (subject, text, html) => {
  const adminEmail = await getAdminEmail();
  return sendEmail({ to: adminEmail, subject, text, html });
};

export const sendEnquiryNotification = async (enquiry) => {
  const subject = `New Project Enquiry: ${enquiry.name} (${enquiry.service})`;
  const text = `A new project enquiry has been submitted.\n\nName: ${enquiry.name}\nPhone: ${enquiry.phone}\nEmail: ${enquiry.email}\nService: ${enquiry.service}\nBlueprint: ${enquiry.blueprintTitle || 'N/A'}\nBudget: ${enquiry.budget || 'N/A'}\nMessage: ${enquiry.message}`;
  const html = buildAdminHtml('New Project Enquiry Received', [
    ['Name', enquiry.name],
    ['Phone', enquiry.phone],
    ['Email', enquiry.email],
    ['Service', enquiry.service],
    ['Blueprint', enquiry.blueprintTitle || 'N/A'],
    ['Budget', enquiry.budget || 'N/A'],
    ['Message', enquiry.message],
  ]);
  await sendAdminNotification(subject, text, html);
};

export const sendAppointmentNotification = async (appointment) => {
  const subject = `New Consultation Booking: ${appointment.name}`;
  const text = `A new consultation has been requested.\n\nName: ${appointment.name}\nEmail: ${appointment.email}\nPhone: ${appointment.phone}\nDate: ${appointment.date || appointment.preferredDate}\nTime: ${appointment.time || appointment.preferredTime}\nService: ${appointment.service}\nNotes: ${appointment.notes || 'N/A'}`;
  const html = buildAdminHtml('New Consultation Booking', [
    ['Name', appointment.name],
    ['Email', appointment.email],
    ['Phone', appointment.phone],
    ['Date', appointment.date || appointment.preferredDate],
    ['Time', appointment.time || appointment.preferredTime],
    ['Service', appointment.service],
    ['Notes', appointment.notes || 'N/A'],
  ]);
  await sendAdminNotification(subject, text, html);
};

export const sendPasswordResetEmail = async (user, resetLink) => {
  await sendEmail({
    to: user.email,
    subject: 'Password Reset - NVS Buildcon',
    text: `Hello ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you did not request this, please ignore this email.`,
    html: `<p>Hello ${user.name},</p><p>You requested a password reset. <a href="${resetLink}">Click here to reset your password</a>.</p><p>This link expires in 1 hour.</p>`,
  });
};

export const sendLoginOtpEmail = async (user, otp) => {
  const subject = `Your Verification Code: ${otp} - NVS Buildcon`;
  const text = `NVS BUILDCON & ARCHITECTS\nYour One-Time Password (OTP): ${otp}\n\nHello ${user.name || 'Valued Client'},\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nSecurity Warning: Never share this OTP with anyone. NVS Buildcon staff will never ask for your verification code.\n\nIf you did not request this verification, please disregard this email.\n\n(c) NVS Buildcon & Architects`;
  const html = buildOtpEmailHtml(user.name, otp);

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

export const sendContactFormEmail = async (data) => {
  const subject = `Contact Form: ${data.name}`;
  const text = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nService: ${data.service}\nMessage: ${data.message}`;
  const html = buildAdminHtml('Contact Form Submission', [
    ['Name', data.name],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Service', data.service],
    ['Message', data.message],
  ]);
  await sendAdminNotification(subject, text, html);
};

