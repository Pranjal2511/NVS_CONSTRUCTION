import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import SiteSettings from '../models/SiteSettings.js';
import { getWhatsAppLink } from '../services/whatsappService.js';
import { logAudit } from '../services/auditService.js';

export const getSettings = asyncHandler(async (_req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  ApiResponse.success(res, 200, 'Settings retrieved', settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = new SiteSettings();

  const fields = [
    'companyPhone',
    'whatsappNumber',
    'emailForNotifications',
    'contactEmail',
    'contactPhone',
    'address',
    'heroTitle',
    'heroSubtitle',
    'heroHeading',
    'heroSubheading',
    'metaTitle',
    'metaDescription',
    'metaKeywords',
    'projectsCount',
    'citiesCount',
    'yearsCount',
    'planningPrice',
    'constructionPrice',
    'pricingDisclaimer',
    'pricingCtaText',
    'calculatorFormula',
    'planningFeatures',
    'constructionFeatures',
    'customRates',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  });

  if (req.body.heroHeading) settings.heroTitle = req.body.heroHeading;
  if (req.body.heroSubheading) settings.heroSubtitle = req.body.heroSubheading;

  await settings.save();
  await logAudit({ userId: req.user.id, action: 'UPDATE_SETTINGS', resource: 'SiteSettings', req });
  ApiResponse.success(res, 200, 'Settings updated', settings);
});

export const getWhatsApp = asyncHandler(async (req, res) => {
  const message = req.query.message || '';
  const link = await getWhatsAppLink(message);
  ApiResponse.success(res, 200, 'WhatsApp link generated', { link });
});
