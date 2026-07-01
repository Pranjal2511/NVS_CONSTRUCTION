import { body, param } from 'express-validator';

export const projectValidator = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty(),
  body('category').isIn(['Residential', 'Commercial', 'Interior', 'Exterior']),
  body('location').optional().trim(),
  body('area').optional().trim(),
  body('budget').optional().trim(),
  body('status').optional().isIn(['Planning', 'In Progress', 'Completed', 'On Hold']),
];

export const mongoIdParam = [param('id').isMongoId()];
