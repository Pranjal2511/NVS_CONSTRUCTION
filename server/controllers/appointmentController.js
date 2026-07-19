import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Appointment from '../models/Appointment.js';
import ApiError from '../utils/ApiError.js';
import { sendAppointmentNotification } from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import logger from '../utils/logger.js';

export const bookAppointment = asyncHandler(async (req, res) => {
  const { name, email, phone, service, notes } = req.body;
  const date = req.body.date || req.body.preferredDate;
  const time = req.body.time || req.body.preferredTime;

  const appointment = await Appointment.create({
    name,
    email,
    phone,
    date,
    time,
    preferredDate: date,
    preferredTime: time,
    service,
    notes,
    userId: req.user?.id,
  });

  // Send email notification — wrapped so failures don't crash the booking
  try {
    await sendAppointmentNotification(appointment);
  } catch (err) {
    logger.warn('Failed to send appointment email notification', { message: err.message });
  }

  // Send WhatsApp message to admin
  try {
    const waMessage = `📅 *New Appointment — NVS Buildcon*

Name: ${name}
Email: ${email}
Phone: ${phone}
Date: ${date}
Time: ${time}
Service: ${service}${notes ? `
Notes: ${notes}` : ''}`;
    await sendWhatsAppMessage(waMessage);
  } catch (err) {
    logger.warn('Failed to send WhatsApp for appointment', { message: err.message });
  }

  if (req.user?.id) {
    try {
      await createNotification(
        req.user.id,
        `Consultation booked for ${date} at ${time}`,
        'appointment',
        { appointmentId: appointment.id }
      );
    } catch (err) {
      logger.warn('Failed to create appointment notification', { message: err.message });
    }
  }

  ApiResponse.created(res, 'Consultation requested successfully', { appointment });
});

export const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find().sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'Appointments retrieved', appointments);
});

export const getUserAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    $or: [{ userId: req.user.id }, { email: req.user.email }],
  }).sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'Your appointments retrieved', appointments);
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const { status, rescheduledDate, rescheduledTime } = req.body;
  const updates = { status };

  if (status === 'Rescheduled') {
    if (!rescheduledDate || !rescheduledTime) {
      throw new ApiError(400, 'Rescheduled date and time are required');
    }
    updates.rescheduledDate = rescheduledDate;
    updates.rescheduledTime = rescheduledTime;
    updates.date = rescheduledDate;
    updates.time = rescheduledTime;
  }

  const appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  if (appointment.userId) {
    await createNotification(
      appointment.userId,
      `Appointment ${status.toLowerCase()}${status === 'Rescheduled' ? ` to ${rescheduledDate} ${rescheduledTime}` : ''}`,
      'appointment',
      { appointmentId: appointment.id }
    );
  }

  await logAudit({
    userId: req.user.id,
    action: 'UPDATE_APPOINTMENT',
    resource: 'Appointment',
    resourceId: appointment.id,
    req,
    details: updates,
  });

  ApiResponse.success(res, 200, 'Appointment updated', { appointment });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  ApiResponse.success(res, 200, 'Appointment deleted');
});
