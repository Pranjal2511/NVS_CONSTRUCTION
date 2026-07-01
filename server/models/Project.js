import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const projectSchema = new mongoose.Schema(
  {
    customId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Residential', 'Commercial', 'Interior', 'Exterior'],
    },
    location: { type: String, trim: true },
    area: { type: String, trim: true },
    budget: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
      default: 'Completed',
    },
    completionDate: { type: Date },
    imageUrl: { type: String },
    beforeImageUrl: { type: String },
    images: [{ type: String }],
    videos: [{ type: String }],
    pdfs: [{ type: String }],
    year: { type: String },
    duration: { type: String },
    materials: [{ type: String }],
  },
  { timestamps: true }
);

projectSchema.set('toJSON', jsonOptions);
projectSchema.set('toObject', jsonOptions);

const Project = mongoose.model('Project', projectSchema);
export default Project;
