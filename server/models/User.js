import mongoose from 'mongoose';
import { jsonOptions } from './plugins/toJSON.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    firstName: { type: String, trim: true, maxlength: 60 },
    lastName: { type: String, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: false, trim: true, index: true },
    password: { type: String, required: false, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    blocked: { type: Boolean, default: false },
    avatar: { type: String },
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    refreshToken: { type: String, select: false },
    loginOtpHash: { type: String, select: false },
    loginOtpExpiry: { type: Date, select: false },
    loginOtpChannel: { type: String, enum: ['email', 'phone'], select: false },
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
