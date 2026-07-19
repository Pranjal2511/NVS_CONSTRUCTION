import nodemailer from 'nodemailer';
import env from '../config/env.js';
import SiteSettings from '../models/SiteSettings.js';
import logger from '../utils/logger.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
};

export const isEmailTransportConfigured = () => {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
};

const getAdminEmail = async () => {
  const settings = await SiteSettings.findOne();
  return settings?.emailForNotifications || 'admin@nvsbuildcon.com';
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transport = getTransporter();
  if (!transport) {
    if (env.IS_PRODUCTION) {
      throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
    }
    logger.info('Simulated email because SMTP is not configured', { to, subject, text });
    return true;
  }

  await transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
  return true;
};

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
  await sendEmail({
    to: user.email,
    subject: 'Your NVS Buildcon login OTP',
    text: `Hello ${user.name},\n\nYour NVS Buildcon login OTP is ${otp}. It expires in 5 minutes.\n\nIf you did not request this, please ignore this message.`,
    html: `<p>Hello ${user.name},</p><p>Your NVS Buildcon login OTP is <strong>${otp}</strong>.</p><p>It expires in 5 minutes.</p>`,
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

