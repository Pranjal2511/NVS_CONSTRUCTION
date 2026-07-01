import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService.js';
import ApiError from '../utils/ApiError.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await getUserNotifications(req.user.id);
  ApiResponse.success(res, 200, 'Notifications retrieved', notifications);
});

export const readNotification = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.user.id);
  if (!notification) throw new ApiError(404, 'Notification not found');
  ApiResponse.success(res, 200, 'Notification marked as read', notification);
});

export const readAllNotifications = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user.id);
  ApiResponse.success(res, 200, 'All notifications marked as read');
});
