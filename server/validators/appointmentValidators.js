import { body, param } from 'express-validator';

export const createAppointmentValidator = [
  body('name').trim().notEmpty().isLength({ max: 100 }).escape(),
  body('email').trim().isEmail().normalizeEmail(),
  body('phone').trim().notEmpty().isLength({ max: 20 }),
  body('service').trim().notEmpty().isLength({ max: 200 }),
  body('notes').optional().trim().isLength({ max: 2000 }),
  body('date').optional().trim(),
  body('time').optional().trim(),
  body('preferredDate').optional().trim(),
  body('preferredTime').optional().trim(),
  body().custom((_, { req }) => {
    const date = req.body.date || req.body.preferredDate;
    const time = req.body.time || req.body.preferredTime;
    if (!date || !time) throw new Error('Preferred date and time are required');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Valid calendar date required');
    if (!/^(?:0?[1-9]|1[0-2]):[0-5]\d (?:AM|PM)$/.test(time) && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Valid appointment time required');
    return true;
  }),
];

export const updateAppointmentValidator = [
  param('id').isMongoId(),
  body('status').isIn(['Approved', 'Rejected', 'Rescheduled']),
  body('rescheduledDate').optional().trim(),
  body('rescheduledTime').optional().trim(),
];
