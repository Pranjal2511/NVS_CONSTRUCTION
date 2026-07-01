import { Router } from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { validate } from '../middleware/validate.js';
import { adminOnly } from '../middleware/auth.js';
import { settingsValidator } from '../validators/contentValidators.js';

const router = Router();

router.get('/', settingsController.getSettings);
router.put('/', adminOnly, settingsValidator, validate, settingsController.updateSettings);
router.get('/whatsapp', settingsController.getWhatsApp);

export default router;
