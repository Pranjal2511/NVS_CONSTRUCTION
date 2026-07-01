import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import HousePlan from '../models/HousePlan.js';
import ApiError from '../utils/ApiError.js';
import { logAudit } from '../services/auditService.js';
import slugify from '../utils/slugify.js';

export const getHousePlans = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  const plans = await HousePlan.find(filter).sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'House plans retrieved', plans);
});

export const getHousePlan = asyncHandler(async (req, res) => {
  const plan = await HousePlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'House plan not found');
  ApiResponse.success(res, 200, 'House plan retrieved', plan);
});

export const createHousePlan = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.title && !data.customId) data.customId = slugify(data.title);
  if (data.previewImage) data.imageUrl = data.previewImage;
  if (data.pdf) data.pdfUrl = data.pdf;
  const plan = await HousePlan.create(data);
  await logAudit({ userId: req.user.id, action: 'CREATE_HOUSE_PLAN', resource: 'HousePlan', resourceId: plan.id, req });
  ApiResponse.created(res, 'House plan created', plan);
});

export const updateHousePlan = asyncHandler(async (req, res) => {
  const plan = await HousePlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plan) throw new ApiError(404, 'House plan not found');
  await logAudit({ userId: req.user.id, action: 'UPDATE_HOUSE_PLAN', resource: 'HousePlan', resourceId: plan.id, req });
  ApiResponse.success(res, 200, 'House plan updated', plan);
});

export const deleteHousePlan = asyncHandler(async (req, res) => {
  const plan = await HousePlan.findByIdAndDelete(req.params.id);
  if (!plan) throw new ApiError(404, 'House plan not found');
  await logAudit({ userId: req.user.id, action: 'DELETE_HOUSE_PLAN', resource: 'HousePlan', resourceId: req.params.id, req });
  ApiResponse.success(res, 200, 'House plan deleted');
});

export const requestHousePlan = asyncHandler(async (req, res) => {
  const plan = await HousePlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'House plan not found');

  ApiResponse.success(res, 200, 'House plan request received', {
    planId: plan.id,
    title: plan.title,
    message: 'An admin will contact you regarding this house plan.',
  });
});
