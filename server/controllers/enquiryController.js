import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import { sendEnquiryNotification, sendContactFormEmail } from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import logger from '../utils/logger.js';

export const createEnquiry = asyncHandler(async (req, res) => {
  const { name, phone, email, service, blueprintTitle, budget, message, plotSize, constructionArea, location, projectType } = req.body;

  const enquiry = await Enquiry.create({
    name,
    phone,
    email,
    service,
    blueprintTitle,
    budget,
    message,
    plotSize,
    constructionArea,
    location,
    projectType,
    userId: req.user?.id,
  });

  // Send email notification to admin — wrapped so failures don't crash the user's request
  try {
    await sendEnquiryNotification(enquiry);
  } catch (err) {
    logger.warn('Failed to send enquiry email notification', { message: err.message });
  }

  // Send WhatsApp message to admin
  try {
    const waMessage = `🏗️ *New Enquiry — NVS Buildcon*

Name: ${name}
Phone: ${phone}
Email: ${email}
Service: ${service}${blueprintTitle ? `
Blueprint: ${blueprintTitle}` : ''}${budget ? `
Budget: ${budget}` : ''}
Message: ${message}`;
    await sendWhatsAppMessage(waMessage);
  } catch (err) {
    logger.warn('Failed to send WhatsApp notification', { message: err.message });
  }

  if (req.user?.id) {
    try {
      await createNotification(
        req.user.id,
        `Your enquiry for ${service} has been submitted.`,
        'enquiry',
        { enquiryId: enquiry.id }
      );
    } catch (err) {
      logger.warn('Failed to create user notification', { message: err.message });
    }
  }

  res.status(201).json({ message: 'Enquiry submitted successfully.', enquiry });
});

export const createContact = asyncHandler(async (req, res) => {
  const data = req.body;
  const enquiry = await Enquiry.create({
    ...data,
    status: 'New',
    userId: req.user?.id,
  });

  // Send email notification — wrapped so failures don't crash the user's request
  try {
    await sendContactFormEmail(data);
  } catch (err) {
    logger.warn('Failed to send contact form email', { message: err.message });
  }

  // Send WhatsApp message to admin
  try {
    const waMessage = `📋 *Contact Form — NVS Buildcon*

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Service: ${data.service}
Message: ${data.message}`;
    await sendWhatsAppMessage(waMessage);
  } catch (err) {
    logger.warn('Failed to send WhatsApp for contact form', { message: err.message });
  }

  ApiResponse.created(res, 'Contact form submitted successfully', { enquiry });
});

export const getAllEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'Enquiries retrieved', enquiries);
});

export const getUserEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.find({
    $or: [{ userId: req.user.id }, { email: req.user.email }],
  }).sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'Your enquiries retrieved', enquiries);
});

export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');

  if (enquiry.userId) {
    try {
      await createNotification(
        enquiry.userId,
        `Your enquiry status updated to: ${req.body.status}`,
        'enquiry',
        { enquiryId: enquiry.id }
      );
    } catch (err) {
      logger.warn('Failed to create status update notification', { message: err.message });
    }
  }

  await logAudit({
    userId: req.user.id,
    action: 'UPDATE_ENQUIRY_STATUS',
    resource: 'Enquiry',
    resourceId: enquiry.id,
    req,
    details: { status: req.body.status },
  });

  ApiResponse.success(res, 200, 'Status updated', { enquiry });
});

export const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  await logAudit({
    userId: req.user.id,
    action: 'DELETE_ENQUIRY',
    resource: 'Enquiry',
    resourceId: req.params.id,
    req,
  });
  ApiResponse.success(res, 200, 'Enquiry deleted');
});
