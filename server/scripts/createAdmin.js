import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

dotenv.config();

export const KNOWN_WEAK_PASSWORDS = [
  'adminsecurepass123!',
  'providersecure123!',
  'admin123456!',
  'password123!',
  'fixnear12345!',
  'administrator!',
  'supersecret123!',
  'adminpassword1!',
  'change_me_123!',
  'defaultpass123!',
];

export const validateScriptPassword = (password, roleName = 'admin') => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: `Password for ${roleName} is required.` };
  }

  if (password.length < 12) {
    return { valid: false, message: `Password for ${roleName} must be at least 12 characters long.` };
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (!hasLetter || !hasNumber || !hasSymbol) {
    return {
      valid: false,
      message: `Password for ${roleName} must contain at least one letter, one number, and one symbol.`,
    };
  }

  const lower = password.toLowerCase();
  const isWeak = KNOWN_WEAK_PASSWORDS.some(
    (weak) => lower === weak.toLowerCase() || lower.includes('adminsecurepass') || lower.includes('providersecure')
  );

  if (isWeak) {
    return {
      valid: false,
      message: `Password for ${roleName} is a known example or weak password. Please choose a strong, unique secret.`,
    };
  }

  return { valid: true };
};

const createAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('[Admin CLI Error] ADMIN_EMAIL and ADMIN_PASSWORD environment variables are strictly required. No default passwords are permitted.');
    process.exit(1);
  }

  const validation = validateScriptPassword(adminPassword, 'Administrator');
  if (!validation.valid) {
    console.error(`[Admin CLI Error] ${validation.message}`);
    process.exit(1);
  }

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
      admin.mustChangePassword = false;
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
        mustChangePassword: false,
      });
      console.log(`[Admin CLI] ✓ New Administrator account created successfully with ID: ${admin._id}`);
    }

    console.log(`\n======================================================`);
    console.log(`ADMIN READY:`);
    console.log(`URL: http://localhost:5173/admin/login`);
    console.log(`Email: ${adminEmail}`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('[Admin CLI] Error creating admin:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

if (process.argv[1] && process.argv[1].endsWith('createAdmin.js')) {
  createAdmin();
}
