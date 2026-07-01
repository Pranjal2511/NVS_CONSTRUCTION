import { body, param } from 'express-validator';

export const createEnquiryValidator = [
  body('name').trim().notEmpty().isLength({ max: 100 }).escape(),
  body('email').trim().isEmail().normalizeEmail(),
  body('phone').trim().notEmpty().isLength({ max: 20 }),
  body('service').trim().notEmpty().isLength({ max: 200 }),
  body('message').trim().notEmpty().isLength({ max: 5000 }),
  body('blueprintTitle').optional().trim().isLength({ max: 200 }).escape(),
  body('budget').optional().trim().isLength({ max: 100 }),
  body('plotSize').optional().trim().isLength({ max: 100 }),
  body('constructionArea').optional().trim().isLength({ max: 100 }),
  body('location').optional().trim().isLength({ max: 200 }),
  body('projectType').optional().trim().isIn(['Residential', 'Commercial', 'Interior', 'Renovation', '']),
];

export const updateEnquiryStatusValidator = [
  param('id').isMongoId(),
  body('status').isIn(['New', 'Contacted', 'In Progress', 'Completed', 'Rejected']),
];
