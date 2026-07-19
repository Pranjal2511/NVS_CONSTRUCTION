import { Router } from 'express';
import * as enquiryController from '../controllers/enquiryController.js';
import * as appointmentController from '../controllers/appointmentController.js';
import * as adminController from '../controllers/adminController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/enquiries', authenticate, enquiryController.getUserEnquiries);
router.get('/appointments', authenticate, appointmentController.getUserAppointments);
router.get('/pdfs', authenticate, adminController.getSharedPdfs);
router.get('/notifications', authenticate, notificationController.getNotifications);
router.patch('/notifications/:id/read', authenticate, notificationController.readNotification);
router.patch('/notifications/read-all', authenticate, notificationController.readAllNotifications);

// Saved Plans
router.get('/saved-plans', authenticate, userController.getSavedPlans);
router.post('/saved-plans', authenticate, userController.savePlan);
router.delete('/saved-plans/:id', authenticate, userController.removePlan);

// Saved Quotes
router.get('/saved-quotes', authenticate, userController.getSavedQuotes);
router.post('/saved-quotes', authenticate, userController.saveQuote);
router.delete('/saved-quotes/:id', authenticate, userController.removeQuote);

// Wishlist
router.get('/wishlist', authenticate, userController.getWishlist);
router.post('/wishlist', authenticate, userController.saveWishlistItem);
router.delete('/wishlist/:id', authenticate, userController.removeWishlistItem);

export default router;
