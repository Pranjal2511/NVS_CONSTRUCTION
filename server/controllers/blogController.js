import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Blog from '../models/Blog.js';
import ApiError from '../utils/ApiError.js';
import slugify from '../utils/slugify.js';
import { logAudit } from '../services/auditService.js';

export const getBlogs = asyncHandler(async (req, res) => {
  const { category, search, tag } = req.query;
  const filter = { published: { $ne: false } };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }
  const blogs = await Blog.find(filter).sort({ createdAt: -1 });
  ApiResponse.success(res, 200, 'Blogs retrieved', blogs);
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) throw new ApiError(404, 'Blog not found');
  ApiResponse.success(res, 200, 'Blog retrieved', blog);
});

export const createBlog = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = data.slug || slugify(data.title);
  if (data.featuredImage) data.imageUrl = data.featuredImage;
  const blog = await Blog.create(data);
  await logAudit({ userId: req.user.id, action: 'CREATE_BLOG', resource: 'Blog', resourceId: blog.id, req });
  ApiResponse.created(res, 'Blog created', blog);
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!blog) throw new ApiError(404, 'Blog not found');
  await logAudit({ userId: req.user.id, action: 'UPDATE_BLOG', resource: 'Blog', resourceId: blog.id, req });
  ApiResponse.success(res, 200, 'Blog updated', blog);
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) throw new ApiError(404, 'Blog not found');
  await logAudit({ userId: req.user.id, action: 'DELETE_BLOG', resource: 'Blog', resourceId: req.params.id, req });
  ApiResponse.success(res, 200, 'Blog deleted');
});
