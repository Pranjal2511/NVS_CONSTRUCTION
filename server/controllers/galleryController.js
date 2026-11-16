import { writableFields } from '../utils/writableFields.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Gallery from '../models/Gallery.js';
import ApiError from '../utils/ApiError.js';
import { logAudit } from '../services/auditService.js';
import { escapeRegex } from '../utils/regex.js';

export const getGallery = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = {};
  if (typeof category === 'string' && category.length <= 100) filter.category = category;
  if (search) {
    const safeSearch = escapeRegex(search);
    if (safeSearch) {
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { desc: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
      ];
    }
  }
  const items = await Gallery.find(filter).sort({ createdAt: -1 }).limit(100);
  ApiResponse.success(res, 200, 'Gallery retrieved', items);
});

export const createGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.create(writableFields('Gallery', req.body));
  await logAudit({ userId: req.user.id, action: 'CREATE_GALLERY', resource: 'Gallery', resourceId: item.id, req });
  ApiResponse.created(res, 'Gallery item created', item);
});

export const updateGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndUpdate(req.params.id, writableFields('Gallery', req.body), { new: true, runValidators: true });
  if (!item) throw new ApiError(404, 'Gallery item not found');
  await logAudit({ userId: req.user.id, action: 'UPDATE_GALLERY', resource: 'Gallery', resourceId: item.id, req });
  ApiResponse.success(res, 200, 'Gallery item updated', item);
});

export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, 'Gallery item not found');
  await logAudit({ userId: req.user.id, action: 'DELETE_GALLERY', resource: 'Gallery', resourceId: req.params.id, req });
  ApiResponse.success(res, 200, 'Gallery item deleted');
});

export const getGalleryCategories = asyncHandler(async (_req, res) => {
  const categories = await Gallery.distinct('category');
  ApiResponse.success(res, 200, 'Categories retrieved', categories);
});
