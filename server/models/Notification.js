import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['enquiry', 'appointment', 'download', 'general'],
      default: 'general',
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.set('toJSON', jsonOptions);
notificationSchema.set('toObject', jsonOptions);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
