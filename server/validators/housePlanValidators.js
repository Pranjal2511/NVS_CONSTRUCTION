import { body, param } from 'express-validator';

export const housePlanValidator = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('category').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isInt({ min: 0 }),
  body('floors').optional().isInt({ min: 0 }),
];

export const mongoIdParam = [param('id').isMongoId()];
