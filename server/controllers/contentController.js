import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Service from '../models/Service.js';
import Testimonial from '../models/Testimonial.js';
import ApiError from '../utils/ApiError.js';
import { logAudit } from '../services/auditService.js';

export const getServices = asyncHandler(async (_req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'Services retrieved', services);
});

export const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  await logAudit({ userId: req.user.id, action: 'CREATE_SERVICE', resource: 'Service', resourceId: service.id, req });
  ApiResponse.created(res, 'Service created', service);
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!service) throw new ApiError(404, 'Service not found');
  ApiResponse.success(res, 200, 'Service updated', service);
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');
  ApiResponse.success(res, 200, 'Service deleted');
});

export const getTestimonials = asyncHandler(async (_req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'Testimonials retrieved', testimonials);
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.clientName && !data.name) data.name = data.clientName;
  const testimonial = await Testimonial.create(data);
  await logAudit({ userId: req.user.id, action: 'CREATE_TESTIMONIAL', resource: 'Testimonial', resourceId: testimonial.id, req });
  ApiResponse.created(res, 'Testimonial created', testimonial);
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  ApiResponse.success(res, 200, 'Testimonial updated', testimonial);
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  ApiResponse.success(res, 200, 'Testimonial deleted');
});
