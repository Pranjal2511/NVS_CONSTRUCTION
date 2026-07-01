import { Router } from 'express';
import * as enquiryController from '../controllers/enquiryController.js';
import { validate } from '../middleware/validate.js';
import { authenticate, optionalAuth, adminOnly } from '../middleware/auth.js';
import { createEnquiryValidator, updateEnquiryStatusValidator } from '../validators/enquiryValidators.js';

const router = Router();

router.post('/', optionalAuth, createEnquiryValidator, validate, enquiryController.createEnquiry);
router.post('/contact', optionalAuth, createEnquiryValidator, validate, enquiryController.createContact);
router.get('/', adminOnly, enquiryController.getAllEnquiries);
router.get('/mine', authenticate, enquiryController.getUserEnquiries);
router.patch('/:id', adminOnly, updateEnquiryStatusValidator, validate, enquiryController.updateEnquiryStatus);
router.delete('/:id', adminOnly, enquiryController.deleteEnquiry);

export default router;
