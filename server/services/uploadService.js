import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadDir = path.join(__dirname, '../uploads');

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  pdf: ['application/pdf'],
  blueprint: ['application/pdf', 'image/jpeg', 'image/png'],
};

const RESOURCE_TYPES = {
  image: 'image',
  video: 'video',
  pdf: 'raw',
  blueprint: 'raw',
};

export const getAllowedMimeTypes = (fileType) =>
  ALLOWED_MIME_TYPES[fileType] || [
    ...ALLOWED_MIME_TYPES.image,
    ...ALLOWED_MIME_TYPES.video,
    ...ALLOWED_MIME_TYPES.pdf,
  ];

export const validateMimeType = (mimetype, fileType) => {
  const allowed = getAllowedMimeTypes(fileType);
  return allowed.includes(mimetype);
};

const ensureLocalDir = () => {
  if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
  }
  return localUploadDir;
};

const uploadToLocal = (file) => {
  ensureLocalDir();
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const filepath = path.join(localUploadDir, filename);
  fs.writeFileSync(filepath, file.buffer);
  return { url: `/uploads/${filename}`, publicId: filename, resourceType: 'local' };
};

export const uploadFile = async (file, fileType = 'image') => {
  if (!file) throw new ApiError(400, 'No file provided');

  if (!validateMimeType(file.mimetype, fileType)) {
    throw new ApiError(400, `File type ${file.mimetype} is not allowed`);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const blocked = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.html'];
  if (blocked.includes(ext)) {
    throw new ApiError(400, 'Executable files are not allowed');
  }

  if (isCloudinaryConfigured) {
    const resourceType = RESOURCE_TYPES[fileType] || 'auto';
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `nvs-buildcon/${fileType}`,
          resource_type: resourceType,
          public_id: crypto.randomBytes(12).toString('hex'),
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      stream.end(file.buffer);
    });

    logger.info('File uploaded to Cloudinary', { publicId: result.public_id });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      originalName: file.originalname,
    };
  }

  logger.warn('Cloudinary not configured, using local storage');
  const local = uploadToLocal(file);
  return { ...local, originalName: file.originalname };
};

export const deleteFile = async (publicId, resourceType = 'image') => {
  if (!publicId) return;

  if (isCloudinaryConfigured && !publicId.includes('/uploads/')) {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === 'video' ? 'video' : resourceType === 'raw' ? 'raw' : 'image',
    });
    return;
  }

  const filename = publicId.replace('/uploads/', '');
  const filepath = path.join(localUploadDir, filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
};

export const getMaxFileSize = () => env.MAX_FILE_SIZE_MB * 1024 * 1024;
