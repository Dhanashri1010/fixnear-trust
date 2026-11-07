import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { validateScriptPassword } from './createAdmin.js';

dotenv.config();

const createTestProvider = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Error] create-test-provider is a local development script and is strictly blocked in production mode.');
    process.exit(1);
  }

  const providerEmail = process.env.TEST_PROVIDER_EMAIL;
  const providerPassword = process.env.TEST_PROVIDER_PASSWORD;
  const providerCity = process.env.TEST_PROVIDER_CITY || 'Mumbai';

  if (!providerEmail || !providerPassword) {
    console.error('[Test Provider Error] TEST_PROVIDER_EMAIL and TEST_PROVIDER_PASSWORD environment variables are strictly required. No default passwords are permitted.');
    process.exit(1);
  }

  const validation = validateScriptPassword(providerPassword, 'Test Provider');
  if (!validation.valid) {
    console.error(`[Test Provider Error] ${validation.message}`);
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Test Provider CLI] Connected to MongoDB.');

    let user = await User.findOne({ email: providerEmail.toLowerCase() });
    if (user) {
      user.password = providerPassword;
      user.role = 'provider';
      user.city = providerCity;
      user.name = 'Vikram Malhotra';
      user.phone = '+91 98201 54321';
      user.mustChangePassword = false;
      await user.save();
      console.log('[Test Provider CLI] Updated existing user account.');
    } else {
      user = await User.create({
        name: 'Vikram Malhotra',
        email: providerEmail.toLowerCase(),
        password: providerPassword,
        role: 'provider',
        phone: '+91 98201 54321',
        city: providerCity,
        mustChangePassword: false,
      });
      console.log('[Test Provider CLI] Created new provider user account.');
    }

    let provider = await Provider.findOne({ userId: user._id });
    const allSkills = [
      { categoryId: 'ac-cooling', categoryName: 'Air Conditioning', passed: true, testScore: 96, verifiedAt: new Date() },
      { categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 92, verifiedAt: new Date() },
      { categoryId: 'electrical', categoryName: 'Electrical', passed: true, testScore: 94, verifiedAt: new Date() },
      { categoryId: 'appliances', categoryName: 'Appliances', passed: true, testScore: 90, verifiedAt: new Date() },
      { categoryId: 'cleaning', categoryName: 'Deep Cleaning', passed: true, testScore: 88, verifiedAt: new Date() },
      { categoryId: 'carpentry', categoryName: 'Carpentry', passed: true, testScore: 91, verifiedAt: new Date() },
    ];

    if (provider) {
      provider.name = user.name;
      provider.email = user.email;
      provider.phone = user.phone;
      provider.city = providerCity;
      provider.status = 'approved';
      provider.isOnline = true;
      provider.skills = allSkills;
      provider.serviceCategories = allSkills.map((s) => s.categoryId);
      await provider.save();
      console.log('[Test Provider CLI] Updated existing provider record to approved, online status.');
    } else {
      provider = await Provider.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: providerCity,
        status: 'approved',
        isOnline: true,
        experienceYears: 6,
        skills: allSkills,
        serviceCategories: allSkills.map((s) => s.categoryId),
        serviceRadiusKm: 25,
        ratingAvg: 4.8,
        ratingCount: 15,
        jobsDone: 24,
      });
      console.log('[Test Provider CLI] Created new verified provider record.');
    }

    console.log('\n======================================================');
    console.log('TEST SPECIALIST READY:');
    console.log(`Email:    ${providerEmail}`);
    console.log(`City:     ${providerCity}`);
    console.log('Status:   Approved & Online');
    console.log('Categories: Electrical, Plumbing, AC, Appliances, Cleaning, Carpentry');
    console.log('======================================================\n');
  } catch (err) {
    console.error('[Test Provider Error]:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

if (process.argv[1] && process.argv[1].endsWith('createTestProvider.js')) {
  createTestProvider();
}
