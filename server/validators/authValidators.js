import { body } from 'express-validator';

const emailValidator = body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required');
const passwordValidator = body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .withMessage('Password must be 8+ chars with upper, lower, number, and special character');

export const registerValidator = [
  body('name').optional().trim().isLength({ max: 100 }).escape(),
  body('firstName').optional().trim().isLength({ max: 60 }).escape(),
  body('lastName').optional().trim().isLength({ max: 60 }).escape(),
  emailValidator,
  body('phone').trim().notEmpty().isLength({ max: 20 }),
  body('profileImage').optional().trim().isLength({ max: 500 }),
  body('password').optional().custom((value) => {
    if (!value) return true;
    if (value.length < 8) throw new Error('Password must be at least 8 characters');
    return true;
  }),
];

export const loginValidator = [emailValidator, body('password').notEmpty()];

export const loginPasswordValidator = [
  emailValidator,
  body('password').notEmpty().withMessage('Password is required'),
];

export const otpRequestValidator = [
  body('identifier')
    .trim()
    .notEmpty()
    .isLength({ max: 120 })
    .withMessage('Email or phone number is required'),
  body('role').optional().isIn(['user', 'admin']),
];

export const otpVerifyValidator = [
  body('identifier').trim().notEmpty().isLength({ max: 120 }),
  body('otp').trim().isLength({ min: 6, max: 6 }).isNumeric(),
  body('role').optional().isIn(['user', 'admin']),
];

export const forgotPasswordValidator = [emailValidator];

export const resetPasswordValidator = [
  body('token').notEmpty(),
  body('newPassword').custom((value, { req }) => {
    if (!value && req.body.password) return true;
    if (!value) throw new Error('New password is required');
    if (value.length < 8) throw new Error('Password must be at least 8 characters');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
      throw new Error('Password must include upper, lower, number, and special character');
    }
    return true;
  }),
];

export const updateProfileValidator = [
  body('name').optional().trim().isLength({ max: 100 }).escape(),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('password').optional().isLength({ min: 8 }),
  body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
];
