import mongoose from 'mongoose';
import connectDB from '../server/config/database.js';
import User from '../server/models/User.js';
import { hashPassword } from '../server/utils/password.js';
import { operatorTarget } from './operator-target.mjs';

try {
  const { apply } = operatorTarget();
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('ADMIN_SEED_EMAIL required');
  if (!password || password.length < 12 || password.length > 72 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password) || /your_|password123/i.test(password)) throw new Error('Strong ADMIN_SEED_PASSWORD required (12–72 characters, upper/lower/number/symbol)');
  if (!(await connectDB({ attempts: 1 }))) throw new Error('Database unavailable');
  if (await User.exists({ $or: [{ role: 'admin' }, { email }] })) throw new Error('Existing admin or matching account found; no account will be promoted or modified');
  if (apply) {
    await User.createIndexes();
    await User.create({ name: process.env.ADMIN_SEED_NAME || 'NVS Admin', email, password: await hashPassword(password), role: 'admin', isVerified: true });
  }
  console.log(apply ? 'Administrator created; remove bootstrap credentials from environment.' : 'Dry-run: one administrator would be created. No writes performed.');
} catch (err) {
  console.error(/^(ADMIN_|Strong |Pass |Initialization accepts|Writes require|Database unavailable|Existing admin)/.test(err.message) ? err.message : 'Administrator initialization failed');
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
