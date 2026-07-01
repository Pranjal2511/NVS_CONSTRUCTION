import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/User.js';
import Enquiry from '../models/Enquiry.js';
import Project from '../models/Project.js';
import Appointment from '../models/Appointment.js';
import HousePlan from '../models/HousePlan.js';
import ApiError from '../utils/ApiError.js';
import { logAudit } from '../services/auditService.js';

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalEnquiries, totalProjects, totalAppointments, totalHousePlans] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      Enquiry.countDocuments(),
      Project.countDocuments(),
      Appointment.countDocuments(),
      HousePlan.countDocuments(),
    ]);

  const recentEnquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(3);
  const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(3);

  const recentActivity = [
    ...recentEnquiries.map((e) => ({
      type: 'Enquiry',
      detail: `${e.name} submitted an enquiry for ${e.service}`,
      date: e.createdAt,
    })),
    ...recentAppointments.map((a) => ({
      type: 'Appointment',
      detail: `${a.name} booked a consultation for ${a.date}`,
      date: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  ApiResponse.success(res, 200, 'Dashboard stats retrieved', {
    totalUsers,
    totalEnquiries,
    totalProjects,
    totalAppointments,
    totalDreamHomeRequests: totalEnquiries,
    totalHousePlans,
    recentActivity,
  });
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'Users retrieved', users);
});

export const updateUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, 'User not found');

  if (target.role === 'admin' && req.body.role === 'user') {
    throw new ApiError(403, 'Cannot demote admin accounts');
  }
  if (req.body.role && req.body.role !== target.role && target._id.toString() === req.user.id) {
    throw new ApiError(403, 'Cannot change your own role');
  }

  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.phone) updates.phone = req.body.phone;
  if (req.body.blocked !== undefined) updates.blocked = req.body.blocked;
  if (req.body.role && ['admin', 'user'].includes(req.body.role)) updates.role = req.body.role;
  if (req.body.sharedPdfs) updates.sharedPdfs = req.body.sharedPdfs;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  await logAudit({ userId: req.user.id, action: 'UPDATE_USER', resource: 'User', resourceId: user.id, req });
  ApiResponse.success(res, 200, 'User updated', user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(403, 'Cannot delete admin accounts');
  if (user._id.toString() === req.user.id) throw new ApiError(403, 'Cannot delete your own account');

  await User.findByIdAndDelete(req.params.id);
  await logAudit({ userId: req.user.id, action: 'DELETE_USER', resource: 'User', resourceId: req.params.id, req });
  ApiResponse.success(res, 200, 'User deleted');
});

export const getSharedPdfs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  ApiResponse.success(res, 200, 'Shared PDFs retrieved', user.sharedPdfs || []);
});
