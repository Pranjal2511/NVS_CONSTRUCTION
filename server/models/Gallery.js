import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    videoUrl: { type: String },
    desc: { type: String },
    alt: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

gallerySchema.set('toJSON', jsonOptions);
gallerySchema.set('toObject', jsonOptions);

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
