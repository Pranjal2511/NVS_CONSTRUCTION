import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Create/Update nvsbuildcon@gmail.com as ADMIN
  const userResult = await db.collection('users').updateOne(
    { email: 'nvsbuildcon@gmail.com' },
    {
      $set: {
        name: 'NVS Admin',
        firstName: 'NVS',
        lastName: 'Buildcon',
        email: 'nvsbuildcon@gmail.com',
        phone: '+918009363259',
        role: 'admin',
        isVerified: true,
        isActive: true,
        blocked: false,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
  console.log('[+] Admin User created/updated:', userResult);

  // 2. Update SiteSettings to send all website notifications to nvsbuildcon@gmail.com
  const settingsResult = await db.collection('sitesettings').updateMany(
    {},
    {
      $set: {
        emailForNotifications: 'nvsbuildcon@gmail.com',
        contactEmail: 'nvsbuildcon@gmail.com'
      }
    }
  );
  console.log('[+] Site settings updated:', settingsResult);

  const admin = await db.collection('users').findOne({ email: 'nvsbuildcon@gmail.com' });
  console.log('[+] Verified Admin Account in DB:', {
    email: admin.email,
    role: admin.role,
    isVerified: admin.isVerified
  });

  await mongoose.disconnect();
}

run().catch(console.error);
