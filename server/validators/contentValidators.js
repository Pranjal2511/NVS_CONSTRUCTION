import { body, param } from 'express-validator';

export const serviceValidator = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('icon').trim().notEmpty(),
];

export const testimonialValidator = [
  body('name').optional().trim().notEmpty(),
  body('clientName').optional().trim().notEmpty(),
  body('review').trim().notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
];

export const settingsValidator = [
  body('whatsappNumber').optional().trim(),
  body('companyPhone').optional().trim(),
  body('emailForNotifications').optional().isEmail(),
  body('contactEmail').optional().isEmail(),
  body('metaTitle').optional().trim(),
  body('metaDescription').optional().trim(),
  body('metaKeywords').optional().trim(),
  body('planningPrice').optional().isNumeric(),
  body('constructionPrice').optional().isNumeric(),
  body('pricingDisclaimer').optional().trim(),
  body('pricingCtaText').optional().trim(),
  body('calculatorFormula').optional().trim(),
  body('planningFeatures').optional().isArray(),
  body('constructionFeatures').optional().isArray(),
  body('customRates').optional().trim(),
];

export const mongoIdParam = [param('id').isMongoId()];
