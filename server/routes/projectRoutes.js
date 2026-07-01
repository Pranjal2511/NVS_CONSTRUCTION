import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { validate } from '../middleware/validate.js';
import { adminOnly } from '../middleware/auth.js';
import { projectValidator, mongoIdParam } from '../validators/projectValidators.js';

const router = Router();

router.get('/', projectController.getProjects);
router.get('/:id', mongoIdParam, validate, projectController.getProject);
router.post('/', adminOnly, projectValidator, validate, projectController.createProject);
router.put('/:id', adminOnly, mongoIdParam, projectValidator, validate, projectController.updateProject);
router.delete('/:id', adminOnly, mongoIdParam, validate, projectController.deleteProject);

export default router;
