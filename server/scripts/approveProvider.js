import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';

dotenv.config();

const approveProvider = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL ERROR] approve-provider command is strictly forbidden in production mode.');
    process.exit(1);
  }

  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run approve-provider -- <email>');
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Approve Provider CLI] Connected to MongoDB.');

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`[Approve Provider CLI] No user found with email: ${email}`);
      process.exit(1);
    }

    const provider = await Provider.findOne({
      $or: [{ userId: user._id }, { email }],
    });

    if (!provider) {
      console.error(`[Approve Provider CLI] No provider profile found for: ${email}`);
      process.exit(1);
    }

    provider.status = 'approved';
    provider.isOnline = true; // Auto-set online for instant testing
    await provider.save();

    console.log(`\n======================================================`);
    console.log(`PROVIDER APPROVED SUCCESSFULLY:`);
    console.log(`- Name:     ${provider.name}`);
    console.log(`- Email:    ${provider.email}`);
    console.log(`- City:     ${provider.city}`);
    console.log(`- Status:   ${provider.status} (Verified)`);
    console.log(`- IsOnline: ${provider.isOnline}`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('[Approve Provider CLI] Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

approveProvider();

