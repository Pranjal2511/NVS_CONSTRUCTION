import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    clientName: { type: String, trim: true },
    role: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    photo: { type: String },
  },
  { timestamps: true }
);

testimonialSchema.set('toJSON', jsonOptions);
testimonialSchema.set('toObject', jsonOptions);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
