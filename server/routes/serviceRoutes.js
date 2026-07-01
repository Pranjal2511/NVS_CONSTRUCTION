import { Router } from 'express';
import * as contentController from '../controllers/contentController.js';
import { validate } from '../middleware/validate.js';
import { adminOnly } from '../middleware/auth.js';
import {
  serviceValidator,
  testimonialValidator,
  mongoIdParam,
} from '../validators/contentValidators.js';

const router = Router();

router.get('/', contentController.getServices);
router.post('/', adminOnly, serviceValidator, validate, contentController.createService);
router.put('/:id', adminOnly, mongoIdParam, serviceValidator, validate, contentController.updateService);
router.delete('/:id', adminOnly, mongoIdParam, validate, contentController.deleteService);

export default router;
