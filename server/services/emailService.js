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

const getAdminEmail = async () => {
  const settings = await SiteSettings.findOne();
  return settings?.emailForNotifications || 'admin@nvsbuildcon.com';
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transport = getTransporter();
  if (!transport) {
    logger.info('Simulated email', { to, subject });
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

export const sendAdminNotification = async (subject, text) => {
  const adminEmail = await getAdminEmail();
  return sendEmail({ to: adminEmail, subject, text });
};

export const sendEnquiryNotification = async (enquiry) => {
  await sendAdminNotification(
    `New Project Enquiry: ${enquiry.name} (${enquiry.service})`,
    `A new project enquiry has been submitted.\n\nName: ${enquiry.name}\nPhone: ${enquiry.phone}\nEmail: ${enquiry.email}\nService: ${enquiry.service}\nBlueprint: ${enquiry.blueprintTitle || 'N/A'}\nBudget: ${enquiry.budget || 'N/A'}\nMessage: ${enquiry.message}`
  );
};

export const sendAppointmentNotification = async (appointment) => {
  await sendAdminNotification(
    `New Consultation Booking: ${appointment.name}`,
    `A new consultation has been requested.\n\nName: ${appointment.name}\nEmail: ${appointment.email}\nPhone: ${appointment.phone}\nDate: ${appointment.date || appointment.preferredDate}\nTime: ${appointment.time || appointment.preferredTime}\nService: ${appointment.service}\nNotes: ${appointment.notes || 'N/A'}`
  );
};

export const sendPasswordResetEmail = async (user, resetLink) => {
  await sendEmail({
    to: user.email,
    subject: 'Password Reset - NVS Buildcon',
    text: `Hello ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you did not request this, please ignore this email.`,
    html: `<p>Hello ${user.name},</p><p>You requested a password reset. <a href="${resetLink}">Click here to reset your password</a>.</p><p>This link expires in 1 hour.</p>`,
  });
};

export const sendContactFormEmail = async (data) => {
  await sendAdminNotification(
    `Contact Form: ${data.name}`,
    `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nService: ${data.service}\nMessage: ${data.message}`
  );
};
