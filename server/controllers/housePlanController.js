import { writableFields } from '../utils/writableFields.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import HousePlan from '../models/HousePlan.js';
import User from '../models/User.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import { logAudit } from '../services/auditService.js';
import { sendEnquiryNotification } from '../services/emailService.js';
import logger from '../utils/logger.js';
import slugify from '../utils/slugify.js';
import { escapeRegex } from '../utils/regex.js';

export const getHousePlans = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = {};
  if (typeof category === 'string' && category.length <= 100) filter.category = category;
  if (search) {
    const safeSearch = escapeRegex(search);
    if (safeSearch) {
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
      ];
    }
  }
  const plans = await HousePlan.find(filter).sort({ createdAt: -1 }).limit(100);
  ApiResponse.success(res, 200, 'House plans retrieved', plans);
});

export const getHousePlan = asyncHandler(async (req, res) => {
  const plan = await HousePlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'House plan not found');
  ApiResponse.success(res, 200, 'House plan retrieved', plan);
});

export const createHousePlan = asyncHandler(async (req, res) => {
  const data = writableFields('HousePlan', req.body);
  if (data.title && !data.customId) data.customId = slugify(data.title);
  if (data.previewImage) data.imageUrl = data.previewImage;
  if (data.pdf) data.pdfUrl = data.pdf;
  const plan = await HousePlan.create(data);
  await logAudit({ userId: req.user.id, action: 'CREATE_HOUSE_PLAN', resource: 'HousePlan', resourceId: plan.id, req });
  ApiResponse.created(res, 'House plan created', plan);
});

export const updateHousePlan = asyncHandler(async (req, res) => {
  const plan = await HousePlan.findByIdAndUpdate(req.params.id, writableFields('HousePlan', req.body), { new: true, runValidators: true });
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

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  const phone = user.phone || req.body.phone;
  if (typeof phone !== 'string' || !phone.trim()) throw new ApiError(400, 'A contact phone number is required');
  const enquiry = await Enquiry.create({
    name: user.name,
    phone,
    email: user?.email || req.user.email,
    service: 'House Plan Request',
    blueprintTitle: plan.title,
    message: req.body.message || `Customer requested house plan: ${plan.title} (Category: ${plan.category}, Area: ${plan.area || 'N/A'} sqft)`,
    userId: req.user.id,
  });

  try {
    await sendEnquiryNotification(enquiry);
  } catch (err) {
    logger.warn('Failed to send house plan enquiry email notification', { message: err.message });
  }

  await logAudit({ userId: req.user.id, action: 'REQUEST_HOUSE_PLAN', resource: 'HousePlan', resourceId: plan.id, req });

  ApiResponse.created(res, 'House plan request received and registered', {
    planId: plan.id,
    title: plan.title,
    enquiryId: enquiry.id,
    message: 'An admin has received your request and will contact you regarding this house plan.',
  });
});
