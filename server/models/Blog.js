import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    featuredImage: { type: String },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    published: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

blogSchema.set('toJSON', jsonOptions);
blogSchema.set('toObject', jsonOptions);

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
