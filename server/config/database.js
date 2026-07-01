import mongoose from 'mongoose';
import env from './env.js';
import { seedDatabase } from '../utils/seed.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const maskedUri = env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');
  logger.info(`Connecting to MongoDB at: ${maskedUri}`);

  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
    await seedDatabase();
  } catch (error) {
    logger.error('MongoDB connection error', { message: error.message });
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    logger.warn('Server continuing without database in development');
  }
};

export default connectDB;
