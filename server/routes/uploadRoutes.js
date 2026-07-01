import { Router } from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { adminOnly } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = Router();

router.post('/', adminOnly, uploadSingle('file'), uploadController.uploadSingleFile);
router.delete('/', adminOnly, uploadController.deleteUploadedFile);

export default router;
