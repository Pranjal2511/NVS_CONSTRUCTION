import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/stats', adminOnly, adminController.getDashboardStats);
router.get('/users', adminOnly, adminController.getUsers);
router.put('/users/:id', adminOnly, adminController.updateUser);
router.delete('/users/:id', adminOnly, adminController.deleteUser);

export default router;
