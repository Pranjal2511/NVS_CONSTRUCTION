import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    service: { type: String, required: true, trim: true },
    blueprintTitle: { type: String, trim: true },
    budget: { type: String, trim: true },
    message: { type: String, required: true },
    plotSize: { type: String, trim: true },
    constructionArea: { type: String, trim: true },
    location: { type: String, trim: true },
    projectType: {
      type: String,
      enum: ['Residential', 'Commercial', 'Interior', 'Renovation', ''],
      default: '',
    },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Progress', 'Completed', 'Rejected'],
      default: 'New',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

enquirySchema.set('toJSON', jsonOptions);
enquirySchema.set('toObject', jsonOptions);

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
