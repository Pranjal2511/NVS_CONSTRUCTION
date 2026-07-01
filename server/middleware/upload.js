import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import { getMaxFileSize, getAllowedMimeTypes } from '../services/uploadService.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const fileType = req.body?.fileType || req.query?.fileType || 'image';
  const allowed = getAllowedMimeTypes(fileType);
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed`), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: getMaxFileSize(), files: 5 },
  fileFilter,
});

export const uploadSingle = (fieldName = 'file') => upload.single(fieldName);
export const uploadMultiple = (fieldName = 'files', maxCount = 5) => upload.array(fieldName, maxCount);
