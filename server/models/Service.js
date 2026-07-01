import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    image: { type: String },
    imageUrl: { type: String },
    details: [{ type: String }],
  },
  { timestamps: true }
);

serviceSchema.set('toJSON', jsonOptions);
serviceSchema.set('toObject', jsonOptions);

const Service = mongoose.model('Service', serviceSchema);
export default Service;
