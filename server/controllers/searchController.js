import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Project from '../models/Project.js';
import HousePlan from '../models/HousePlan.js';
import Gallery from '../models/Gallery.js';
import Blog from '../models/Blog.js';
import { escapeRegex } from '../utils/regex.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const sanitized = escapeRegex(req.query.q);
  if (!sanitized) {
    return ApiResponse.success(res, 200, 'Search results', {
      projects: [],
      housePlans: [],
      gallery: [],
      blogs: [],
    });
  }

  const regex = { $regex: sanitized, $options: 'i' };

  const [projects, housePlans, gallery, blogs] = await Promise.all([
    Project.find({ $or: [{ title: regex }, { description: regex }, { category: regex }, { location: regex }] }).limit(20),
    HousePlan.find({ $or: [{ title: regex }, { description: regex }, { category: regex }] }).limit(20),
    Gallery.find({ $or: [{ title: regex }, { desc: regex }, { category: regex }] }).limit(20),
    Blog.find({ published: { $ne: false }, $or: [{ title: regex }, { content: regex }, { category: regex }, { tags: regex }] }).limit(20),
  ]);

  ApiResponse.success(res, 200, 'Search results', { projects, housePlans, gallery, blogs });
});
