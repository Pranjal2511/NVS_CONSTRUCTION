import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadFile, deleteFile } from '../services/uploadService.js';
import { logAudit } from '../services/auditService.js';
import logger from '../utils/logger.js';

export const uploadSingleFile = asyncHandler(async (req, res) => {
  const fileType = req.body.fileType || req.query.fileType || 'image';
  const result = await uploadFile(req.file, fileType);

  await logAudit({
    userId: req.user.id,
    action: 'FILE_UPLOAD',
    resource: 'Upload',
    req,
    details: { fileType, url: result.url },
  });

  logger.info('File uploaded', { fileType, userId: req.user.id });
  ApiResponse.success(res, 200, 'File uploaded', result);
});

export const deleteUploadedFile = asyncHandler(async (req, res) => {
  const { publicId, resourceType } = req.body;
  await deleteFile(publicId, resourceType);
  await logAudit({
    userId: req.user.id,
    action: 'FILE_DELETE',
    resource: 'Upload',
    req,
    details: { publicId },
  });
  ApiResponse.success(res, 200, 'File deleted');
});
