import { body, param } from 'express-validator';

export const blogValidator = [
  body('title').trim().notEmpty().isLength({ max: 300 }),
  body('content').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('tags').optional().isArray(),
];

export const mongoIdParam = [param('id').isMongoId()];
