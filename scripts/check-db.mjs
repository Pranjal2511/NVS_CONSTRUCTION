import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.log('STATUS: FAILED');
  console.log('REASON: MONGODB_URI is not set in .env');
  process.exit(1);
}

const masked = uri.replace(/:([^@]+)@/, ':****@');
console.log(`Connecting to: ${masked}...`);

const start = Date.now();
try {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  const duration = Date.now() - start;
  const state = mongoose.connection.readyState;
  const dbName = mongoose.connection.name;
  const host = mongoose.connection.host;
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collNames = collections.map(c => c.name);

  console.log('==============================================');
  console.log('✅ STATUS: CONNECTED_SUCCESSFULLY');
  console.log(`⏱️ Latency: ${duration}ms`);
  console.log(`📁 Database Name: ${dbName}`);
  console.log(`🌐 Host: ${host}`);
  console.log(`🔌 Ready State: ${state} (Connected)`);
  console.log(`📊 Total Collections: ${collNames.length}`);
  if (collNames.length > 0) {
    console.log(`📦 Collections: ${collNames.join(', ')}`);
  }
  console.log('==============================================');

  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  const duration = Date.now() - start;
  console.log('==============================================');
  console.log('❌ STATUS: CONNECTION_FAILED');
  console.log(`⏱️ Timeout/Elapsed: ${duration}ms`);
  console.log(`⚠️ Error Name: ${err.name}`);
  console.log(`💬 Error Message: ${err.message}`);
  console.log('==============================================');
  process.exit(1);
}
