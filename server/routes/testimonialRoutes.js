import { Router } from 'express';
import * as contentController from '../controllers/contentController.js';
import { validate } from '../middleware/validate.js';
import { adminOnly } from '../middleware/auth.js';
import { testimonialValidator, mongoIdParam } from '../validators/contentValidators.js';

const router = Router();

router.get('/', contentController.getTestimonials);
router.post('/', adminOnly, testimonialValidator, validate, contentController.createTestimonial);
router.put('/:id', adminOnly, mongoIdParam, testimonialValidator, validate, contentController.updateTestimonial);
router.delete('/:id', adminOnly, mongoIdParam, validate, contentController.deleteTestimonial);

export default router;
