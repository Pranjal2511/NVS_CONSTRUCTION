import Notification from '../models/Notification.js';

export const createNotification = async (userId, message, type = 'general', metadata = {}) =>
  Notification.create({ userId, message, type, metadata });

export const getUserNotifications = async (userId) =>
  Notification.find({ userId }).sort({ createdAt: -1 });

export const markAsRead = async (notificationId, userId) =>
  Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );

export const markAllAsRead = async (userId) =>
  Notification.updateMany({ userId, read: false }, { read: true });
