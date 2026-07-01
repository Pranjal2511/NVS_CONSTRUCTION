import { Router } from 'express';
import * as housePlanController from '../controllers/housePlanController.js';
import { validate } from '../middleware/validate.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { housePlanValidator, mongoIdParam } from '../validators/housePlanValidators.js';

const router = Router();

router.get('/', housePlanController.getHousePlans);
router.get('/:id', mongoIdParam, validate, housePlanController.getHousePlan);
router.post('/', adminOnly, housePlanValidator, validate, housePlanController.createHousePlan);
router.put('/:id', adminOnly, mongoIdParam, housePlanValidator, validate, housePlanController.updateHousePlan);
router.delete('/:id', adminOnly, mongoIdParam, validate, housePlanController.deleteHousePlan);
router.post('/:id/request', authenticate, mongoIdParam, validate, housePlanController.requestHousePlan);

export default router;
