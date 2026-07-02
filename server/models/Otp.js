import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, lowercase: true, trim: true, index: true },
    channel: { type: String, enum: ['email', 'phone'], required: true },
    role: { type: String, enum: ['admin', 'user'], required: true },
    otpHash: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

otpSchema.set('toJSON', jsonOptions);
otpSchema.set('toObject', jsonOptions);

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
