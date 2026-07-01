import { Router } from 'express';
import * as galleryController from '../controllers/galleryController.js';
import { validate } from '../middleware/validate.js';
import { adminOnly } from '../middleware/auth.js';
import { galleryValidator, mongoIdParam } from '../validators/galleryValidators.js';

const router = Router();

router.get('/', galleryController.getGallery);
router.get('/categories', galleryController.getGalleryCategories);
router.post('/', adminOnly, galleryValidator, validate, galleryController.createGalleryItem);
router.put('/:id', adminOnly, mongoIdParam, galleryValidator, validate, galleryController.updateGalleryItem);
router.delete('/:id', adminOnly, mongoIdParam, validate, galleryController.deleteGalleryItem);

export default router;
