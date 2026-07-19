import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/User.js';
import HousePlan from '../models/HousePlan.js';
import ApiError from '../utils/ApiError.js';

// Saved Plans
export const getSavedPlans = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('savedPlans');
  if (!user) throw new ApiError(404, 'User not found');
  ApiResponse.success(res, 200, 'Saved plans retrieved', user.savedPlans || []);
});

export const savePlan = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  if (!planId) throw new ApiError(400, 'planId is required');
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  
  // Find by _id first, then by customId or title
  let plan = null;
  if (planId.match(/^[0-9a-fA-F]{24}$/)) {
    plan = await HousePlan.findById(planId);
  }
  if (!plan) {
    plan = await HousePlan.findOne({ $or: [{ customId: planId }, { title: planId }] });
  }
  if (!plan) throw new ApiError(404, 'House plan not found');

  const planOid = plan._id;
  if (!user.savedPlans.some(id => id.toString() === planOid.toString())) {
    user.savedPlans.push(planOid);
    await user.save();
  }
  ApiResponse.success(res, 200, 'Plan saved successfully', user.savedPlans);
});

export const removePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.savedPlans = user.savedPlans.filter(p => p.toString() !== id);
  await user.save();
  ApiResponse.success(res, 200, 'Plan removed successfully', user.savedPlans);
});

// Saved Quotes
export const getSavedQuotes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  ApiResponse.success(res, 200, 'Saved quotes retrieved', user.savedQuotes || []);
});

export const saveQuote = asyncHandler(async (req, res) => {
  const { title, amount, area, details } = req.body;
  if (!title || amount === undefined) throw new ApiError(400, 'title and amount are required');
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.savedQuotes.push({ title, amount, area, details });
  await user.save();
  ApiResponse.success(res, 200, 'Quote saved successfully', user.savedQuotes);
});

export const removeQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.savedQuotes = user.savedQuotes.filter(q => q._id.toString() !== id);
  await user.save();
  ApiResponse.success(res, 200, 'Quote removed successfully', user.savedQuotes);
});

// Wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  ApiResponse.success(res, 200, 'Wishlist retrieved', user.wishlist || []);
});

export const saveWishlistItem = asyncHandler(async (req, res) => {
  const { title, imageUrl, category, refId } = req.body;
  if (!title || !refId) throw new ApiError(400, 'title and refId are required');
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  
  const exists = user.wishlist.some(item => item.refId === refId);
  if (!exists) {
    user.wishlist.push({ title, imageUrl, category, refId });
    await user.save();
  }
  ApiResponse.success(res, 200, 'Wishlist item saved successfully', user.wishlist);
});

export const removeWishlistItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.wishlist = user.wishlist.filter(item => item.refId !== id && item._id.toString() !== id);
  await user.save();
  ApiResponse.success(res, 200, 'Wishlist item removed successfully', user.wishlist);
});
