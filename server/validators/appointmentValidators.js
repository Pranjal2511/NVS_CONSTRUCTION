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
    return true;
  }),
];

export const updateAppointmentValidator = [
  param('id').isMongoId(),
  body('status').isIn(['Approved', 'Rejected', 'Rescheduled']),
  body('rescheduledDate').optional().trim(),
  body('rescheduledTime').optional().trim(),
];
