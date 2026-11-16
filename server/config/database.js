import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

mongoose.set('bufferCommands', false);
mongoose.set('autoCreate', false);
mongoose.set('autoIndex', false);
export const databaseReady = () => mongoose.connection.readyState === 1;
export const requireDatabase = (_req, res, next) => {
  if (databaseReady()) return next();
  res.set('Retry-After', '5').status(503).json({ success: false, message: 'Database temporarily unavailable. Please try again shortly.' });
};
mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected; database APIs unavailable'));
mongoose.connection.on('error', () => logger.error('MongoDB connection error; inspect Atlas access, DNS and credentials'));
const connectDB = async ({ attempts = 3 } = {}) => {
  if (!/^mongodb(?:\+srv)?:\/\/[^/]+\/[^?]+/.test(env.MONGODB_URI)) {
    logger.error('MONGODB_URI must specify an explicit database name; refusing the driver default database');
    if (env.IS_PRODUCTION) throw new Error('Explicit database name required');
    return false;
  }
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, socketTimeoutMS: 15000 });
      return true;
    } catch {
      logger.warn(`MongoDB connection attempt ${attempt}/${attempts} failed`);
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, attempt * 500));
    }
  }
  if (env.IS_PRODUCTION) throw new Error('Database unavailable; production startup refused');
  logger.warn('Development frontend available; database APIs return 503. Restart after correcting configuration.');
  return false;
};

export default connectDB;
