import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const siteSettingsSchema = new mongoose.Schema(
  {
    companyPhone: { type: String, default: '+918009363259' },
    whatsappNumber: { type: String, default: '+918009363259' },
    emailForNotifications: { type: String, default: 'nvsbuildcon@gmail.com' },
    contactEmail: { type: String, default: 'nvsbuildcon@gmail.com' },
    contactPhone: { type: String, default: '+91 8009363259' },
    address: { type: String, default: 'Lucknow, Uttar Pradesh, India' },
    heroTitle: { type: String, default: 'Engineering Luxury. Crafting Legacy.' },
    heroSubtitle: {
      type: String,
      default: 'Bespoke architectural execution, Vastu-compliant layouts, and structural blueprints engineered for precision.',
    },
    heroHeading: { type: String },
    heroSubheading: { type: String },
    metaTitle: { type: String, default: 'NVS Buildcon | Premium Architecture & Construction' },
    metaDescription: { type: String, default: 'Luxury architectural design, structural engineering, and turnkey construction across India.' },
    metaKeywords: { type: String, default: 'architecture, construction, house plans, interior design, NVS Buildcon' },
    projectsCount: { type: Number, default: 50 },
    citiesCount: { type: Number, default: 12 },
    yearsCount: { type: Number, default: 15 },
    planningPrice: { type: Number, default: 5 },
    constructionPrice: { type: Number, default: 1100 },
    pricingDisclaimer: {
      type: String,
      default: 'Prices shown are starting estimates only. Final quotation depends on project size, structural complexity, location, materials, finishing standards, and client requirements.',
    },
    pricingCtaText: { type: String, default: 'Request Detailed Quotation' },
    calculatorFormula: { type: String, default: 'Area * Price' },
    planningFeatures: {
      type: [String],
      default: [
        '2D Floor Planning',
        'Space Optimization',
        'Vastu Friendly Layout (Optional)',
        'Basic Elevation Guidance',
        'Working Drawings',
        'Consultation Included',
      ],
    },
    constructionFeatures: {
      type: [String],
      default: [
        'Turnkey Construction',
        'RCC Structure',
        'Material Management',
        'Site Supervision',
        'Quality Assurance',
        'Timely Delivery',
      ],
    },
    customRates: { type: String, default: '' },
  },
  { timestamps: true }
);

siteSettingsSchema.set('toJSON', jsonOptions);
siteSettingsSchema.set('toObject', jsonOptions);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
