import { body, param } from 'express-validator';

export const galleryValidator = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('category').trim().notEmpty(),
];

export const mongoIdParam = [param('id').isMongoId()];
