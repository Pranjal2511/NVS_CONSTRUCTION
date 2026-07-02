import { Router } from 'express';
import authRoutes from './authRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import projectRoutes from './projectRoutes.js';
import housePlanRoutes from './housePlanRoutes.js';
import galleryRoutes from './galleryRoutes.js';
import blogRoutes from './blogRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import testimonialRoutes from './testimonialRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import adminRoutes from './adminRoutes.js';
import userRoutes from './userRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import searchRoutes from './searchRoutes.js';

import env from '../config/env.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'NVS Buildcon API is running', timestamp: new Date().toISOString() });
});

router.get('/config', (_req, res) => {
  res.json({
    success: true,
    hcaptchaSiteKey: env.HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-ffffffffffff'
  });
});

router.use('/auth', authRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/projects', projectRoutes);
router.use('/house-plans', housePlanRoutes);
router.use('/gallery', galleryRoutes);
router.use('/blogs', blogRoutes);
router.use('/services', serviceRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/settings', settingsRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/uploads', uploadRoutes);
router.use('/search', searchRoutes);

export default router;
