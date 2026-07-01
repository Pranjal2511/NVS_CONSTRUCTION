import { Router } from 'express';
import * as enquiryController from '../controllers/enquiryController.js';
import * as appointmentController from '../controllers/appointmentController.js';
import * as adminController from '../controllers/adminController.js';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/enquiries', authenticate, enquiryController.getUserEnquiries);
router.get('/appointments', authenticate, appointmentController.getUserAppointments);
router.get('/pdfs', authenticate, adminController.getSharedPdfs);
router.get('/notifications', authenticate, notificationController.getNotifications);
router.patch('/notifications/:id/read', authenticate, notificationController.readNotification);
router.patch('/notifications/read-all', authenticate, notificationController.readAllNotifications);

export default router;
