import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@fixnear.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePass123!';

  console.log(`[Admin CLI] Target Admin Email: ${adminEmail}`);

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Admin CLI] Connected to MongoDB Atlas.');

    let admin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (admin) {
      console.log(`[Admin CLI] Admin account already exists. Updating password & role...`);
      admin.password = adminPassword;
      admin.role = 'admin';
      admin.name = 'FixNear Administrator';
      await admin.save();
      console.log(`[Admin CLI] ✓ Admin password updated successfully.`);
    } else {
      admin = await User.create({
        name: 'FixNear Administrator',
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'admin',
        phone: '+91 99999 88888',
        city: 'Mumbai',
      });
      console.log(`[Admin CLI] ✓ New Administrator account created successfully with ID: ${admin._id}`);
    }

    console.log(`\n======================================================`);
    console.log(`ADMIN READY:`);
    console.log(`URL: http://localhost:5173/admin/login`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('[Admin CLI] Error creating admin:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
