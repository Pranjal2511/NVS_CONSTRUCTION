import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    preferredDate: { type: String },
    preferredTime: { type: String },
    service: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Rescheduled'],
      default: 'Pending',
    },
    rescheduledDate: { type: String },
    rescheduledTime: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

appointmentSchema.set('toJSON', jsonOptions);
appointmentSchema.set('toObject', jsonOptions);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
