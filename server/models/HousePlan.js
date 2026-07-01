import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const housePlanSchema = new mongoose.Schema(
  {
    customId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    floors: { type: Number, min: 0 },
    beds: { type: Number, min: 0 },
    baths: { type: Number, min: 0 },
    cars: { type: Number, min: 0 },
    area: { type: String, trim: true },
    imageUrl: { type: String },
    previewImage: { type: String },
    pdfUrl: { type: String },
    pdf: { type: String },
    description: { type: String, required: true },
    specs: {
      foundation: String,
      superstructure: String,
      flooring: String,
      glazing: String,
      hvac: String,
      automation: String,
    },
  },
  { timestamps: true }
);

housePlanSchema.set('toJSON', jsonOptions);
housePlanSchema.set('toObject', jsonOptions);

const HousePlan = mongoose.model('HousePlan', housePlanSchema);
export default HousePlan;
