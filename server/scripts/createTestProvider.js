import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';

dotenv.config();

const createTestProvider = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Error] create-test-provider is a local development script and is strictly blocked in production mode.');
    process.exit(1);
  }

  const providerEmail = (process.env.TEST_PROVIDER_EMAIL || 'provider.test@fixnear.com').toLowerCase();
  const providerPassword = process.env.TEST_PROVIDER_PASSWORD || 'ProviderSecure123!';
  const providerCity = process.env.TEST_PROVIDER_CITY || 'Mumbai';

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Test Provider CLI] Connected to MongoDB.');

    let user = await User.findOne({ email: providerEmail });
    if (user) {
      user.password = providerPassword;
      user.role = 'provider';
      user.city = providerCity;
      user.name = 'Vikram Malhotra';
      user.phone = '+91 98201 54321';
      await user.save();
      console.log('[Test Provider CLI] Updated existing user account.');
    } else {
      user = await User.create({
        name: 'Vikram Malhotra',
        email: providerEmail,
        password: providerPassword,
        role: 'provider',
        phone: '+91 98201 54321',
        city: providerCity,
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
      provider.ratingAvg = 4.95;
      provider.ratingCount = 88;
      provider.jobsDone = 142;
      provider.specialty = 'Master Certified Technician';
      await provider.save();
      console.log('[Test Provider CLI] Provider profile updated to approved and online.');
    } else {
      provider = await Provider.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: providerCity,
        specialty: 'Master Certified Technician',
        status: 'approved',
        isOnline: true,
        skills: allSkills,
        ratingAvg: 4.95,
        ratingCount: 88,
        jobsDone: 142,
        experienceYears: 6,
        badges: ['Skill Verified', 'Police Clearance Verified', 'Top Rated Specialist'],
      });
      console.log('[Test Provider CLI] Created verified, online provider profile.');
    }

    console.log(`\n======================================================`);
    console.log(`TEST PROVIDER READY (Verified & Online):`);
    console.log(`Email: ${providerEmail}`);
    console.log(`Password: ${providerPassword}`);
    console.log(`City: ${providerCity}`);
    console.log(`Provider ID: ${provider._id}`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('[Test Provider CLI] Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestProvider();

