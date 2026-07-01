import { Router } from 'express';
import * as blogController from '../controllers/blogController.js';
import { validate } from '../middleware/validate.js';
import { adminOnly } from '../middleware/auth.js';
import { blogValidator, mongoIdParam } from '../validators/blogValidators.js';

const router = Router();

router.get('/', blogController.getBlogs);
router.get('/slug/:slug', blogController.getBlogBySlug);
router.post('/', adminOnly, blogValidator, validate, blogController.createBlog);
router.put('/:id', adminOnly, mongoIdParam, blogValidator, validate, blogController.updateBlog);
router.delete('/:id', adminOnly, mongoIdParam, validate, blogController.deleteBlog);

export default router;
