import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { Question } from '../models/Question.js';
import { SEED_CATEGORIES, SEED_SERVICES } from '../data/seedData.js';
import { QUESTION_BANK_SEED } from '../data/questionBankData.js';

dotenv.config();

const loadData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Load Data CLI] Connected to MongoDB Atlas.');

    // 1. Sync Categories
    console.log(`[Load Data CLI] Loading ${SEED_CATEGORIES.length} categories...`);
    for (const cat of SEED_CATEGORIES) {
      await Category.findOneAndUpdate(
        { categoryId: cat.id },
        {
          categoryId: cat.id,
          name: cat.name,
          tagline: cat.tagline,
          icon: cat.icon,
          startingPrice: cat.startingPrice,
          badge: cat.badge,
          accentBg: cat.accentBg,
          accentText: cat.accentText,
          isActive: true,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`[Load Data CLI] ✓ ${SEED_CATEGORIES.length} categories synchronized.`);

    // 2. Sync Services
    console.log(`[Load Data CLI] Loading ${SEED_SERVICES.length} services...`);
    for (const srv of SEED_SERVICES) {
      await Service.findOneAndUpdate(
        { serviceId: srv.id },
        {
          serviceId: srv.id,
          categoryId: srv.categoryId,
          category: srv.category,
          title: srv.title,
          startingPrice: srv.startingPrice,
          originalPrice: srv.originalPrice || 0,
          discountBadge: srv.discountBadge || '',
          duration: srv.duration || '45 - 60 mins',
          image: srv.image || '',
          features: srv.features || [],
          scope: srv.scope || { included: [], excluded: [] },
          isActive: true,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`[Load Data CLI] ✓ ${SEED_SERVICES.length} services synchronized.`);

    // 3. Sync 90 Test Questions
    console.log(`[Load Data CLI] Loading ${QUESTION_BANK_SEED.length} questions into Question Bank...`);
    for (const q of QUESTION_BANK_SEED) {
      await Question.findOneAndUpdate(
        { categoryId: q.categoryId, questionText: q.questionText },
        {
          categoryId: q.categoryId,
          categoryName: q.categoryName,
          questionText: q.questionText,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation || '',
          isActive: true,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`[Load Data CLI] ✓ ${QUESTION_BANK_SEED.length} examination questions synchronized.`);

    console.log('\n======================================================');
    console.log('DATA LOAD SUCCESSFUL:');
    console.log(`- Categories: ${SEED_CATEGORIES.length}`);
    console.log(`- Services: ${SEED_SERVICES.length}`);
    console.log(`- Questions: ${QUESTION_BANK_SEED.length}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('[Load Data CLI] Error loading data:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

loadData();
