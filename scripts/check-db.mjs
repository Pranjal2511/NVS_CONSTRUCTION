import mongoose from 'mongoose';
import connectDB from '../server/config/database.js';
try {
  if (!(await connectDB({ attempts: 1 }))) process.exitCode = 1;
  else { await mongoose.connection.db.command({ ping: 1 }); console.log('Database connection and ping succeeded. Intended Atlas project still requires operator verification.'); }
} catch { console.error('Database check failed. Verify Atlas Drivers hostname, credentials, access list, DNS and TLS.'); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
