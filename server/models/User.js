import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: false, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    blocked: { type: Boolean, default: false },
    avatar: { type: String },
    refreshToken: { type: String, select: false },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    sharedPdfs: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.set('toJSON', jsonOptions);
userSchema.set('toObject', jsonOptions);

userSchema.methods.isLocked = function isLocked() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

const User = mongoose.model('User', userSchema);
export default User;
