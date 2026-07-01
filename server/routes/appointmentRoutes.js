import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { validate } from '../middleware/validate.js';
import { authenticate, optionalAuth, adminOnly } from '../middleware/auth.js';
import { createAppointmentValidator, updateAppointmentValidator } from '../validators/appointmentValidators.js';

const router = Router();

router.post('/', optionalAuth, createAppointmentValidator, validate, appointmentController.bookAppointment);
router.get('/', adminOnly, appointmentController.getAllAppointments);
router.get('/mine', authenticate, appointmentController.getUserAppointments);
router.patch('/:id', adminOnly, updateAppointmentValidator, validate, appointmentController.updateAppointment);
router.delete('/:id', adminOnly, appointmentController.deleteAppointment);

export default router;
