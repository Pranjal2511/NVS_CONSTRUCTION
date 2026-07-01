import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Project from '../models/Project.js';
import ApiError from '../utils/ApiError.js';
import { logAudit } from '../services/auditService.js';
import slugify from '../utils/slugify.js';

export const getProjects = asyncHandler(async (req, res) => {
  const { category, status, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }
  const projects = await Project.find(filter).sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'Projects retrieved', projects);
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  ApiResponse.success(res, 200, 'Project retrieved', project);
});

export const createProject = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.title && !data.customId) data.customId = slugify(data.title);
  const project = await Project.create(data);
  await logAudit({ userId: req.user.id, action: 'CREATE_PROJECT', resource: 'Project', resourceId: project.id, req });
  ApiResponse.created(res, 'Project created', project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!project) throw new ApiError(404, 'Project not found');
  await logAudit({ userId: req.user.id, action: 'UPDATE_PROJECT', resource: 'Project', resourceId: project.id, req });
  ApiResponse.success(res, 200, 'Project updated', project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  await logAudit({ userId: req.user.id, action: 'DELETE_PROJECT', resource: 'Project', resourceId: req.params.id, req });
  ApiResponse.success(res, 200, 'Project deleted');
});
