import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { Question } from '../models/Question.js';
import { Setting } from '../models/Setting.js';
import { SEED_CATEGORIES, SEED_SERVICES } from '../data/seedData.js';
import { QUESTION_BANK_SEED } from '../data/questionBankData.js';
import { verifyQuestionBankQuality } from '../utils/questionValidator.js';

dotenv.config();

/**
 * Validates a single question seed object
 */
export const validateSeedQuestion = (q, index, validCategoryIds) => {
  const prefix = `[Question Seed Validation Error at index ${index} (category: ${q?.categoryId || 'unknown'})]`;

  if (!q) {
    throw new Error(`${prefix} Question object is null or undefined.`);
  }

  if (!q.questionText || typeof q.questionText !== 'string' || q.questionText.trim().length === 0) {
    throw new Error(`${prefix} questionText is missing or empty.`);
  }

  if (!q.categoryId || !validCategoryIds.has(q.categoryId)) {
    throw new Error(`${prefix} categoryId '${q.categoryId}' does not exist in seeded categories.`);
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    throw new Error(`${prefix} Question must have exactly 4 options. Found: ${q.options ? q.options.length : 0}.`);
  }

  for (let i = 0; i < 4; i++) {
    if (typeof q.options[i] !== 'string' || q.options[i].trim().length === 0) {
      throw new Error(`${prefix} Option index ${i} is empty or not a string.`);
    }
  }

  if (
    typeof q.correctIndex !== 'number' ||
    !Number.isInteger(q.correctIndex) ||
    q.correctIndex < 0 ||
    q.correctIndex > 3
  ) {
    throw new Error(`${prefix} correctIndex must be an integer between 0 and 3. Found: ${q.correctIndex}.`);
  }

  return true;
};

/**
 * Core loader function that can be executed from CLI or in tests
 */
export const runDataLoader = async () => {
  // 0. Clean up bad/stale data: delete questions with missing/empty questionText or obsolete seed questions
  const deleteResult = await Question.deleteMany({
    $or: [
      { questionText: { $exists: false } },
      { questionText: null },
      { questionText: '' },
      { questionText: { $regex: /^\s*$/ } },
    ],
  });
  if (deleteResult.deletedCount > 0) {
    console.log(`[Load Data CLI] Cleaned up ${deleteResult.deletedCount} corrupted/empty question records.`);
  }

  const validQuestionTexts = new Set(QUESTION_BANK_SEED.map((q) => q.questionText.trim()));
  const validCategoryIds = new Set(SEED_CATEGORIES.map((c) => c.id));
  const staleResult = await Question.deleteMany({
    categoryId: { $in: Array.from(validCategoryIds) },
    questionText: { $nin: Array.from(validQuestionTexts) },
  });
  if (staleResult.deletedCount > 0) {
    console.log(`[Load Data CLI] Cleaned up ${staleResult.deletedCount} obsolete/unrecognized seed questions.`);
  }

  // 1. Sync Categories
  console.log(`[Load Data CLI] Loading ${SEED_CATEGORIES.length} categories...`);
  const categoryOps = SEED_CATEGORIES.map((cat) => ({
    updateOne: {
      filter: { categoryId: cat.id },
      update: {
        $set: {
          categoryId: cat.id,
          name: cat.name,
          tagline: cat.tagline,
          icon: cat.icon,
          startingPrice: cat.startingPrice,
          badge: cat.badge,
          accentBg: cat.accentBg,
          accentText: cat.accentText,
          image: cat.image || '',
          isActive: true,
        },
      },
      upsert: true,
    },
  }));
  await Category.bulkWrite(categoryOps);
  console.log(`[Load Data CLI] ✓ ${SEED_CATEGORIES.length} categories synchronized.`);

  // 2. Sync Services
  console.log(`[Load Data CLI] Loading ${SEED_SERVICES.length} services...`);
  const serviceOps = SEED_SERVICES.map((srv) => ({
    updateOne: {
      filter: { serviceId: srv.id },
      update: {
        $set: {
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
      },
      upsert: true,
    },
  }));
  await Service.bulkWrite(serviceOps);
  console.log(`[Load Data CLI] ✓ ${SEED_SERVICES.length} services synchronized.`);

  // 3. Validate and Sync Question Bank
  const catNameMap = new Map(SEED_CATEGORIES.map((c) => [c.id, c.name]));

  console.log(`[Load Data CLI] Running comprehensive quality & fairness audit on ${QUESTION_BANK_SEED.length} questions...`);
  verifyQuestionBankQuality(QUESTION_BANK_SEED, SEED_CATEGORIES);
  console.log(`[Load Data CLI] ✓ Quality & fairness audit passed (>=20 per category, balanced positions, longest option <=30%).`);

  console.log(`[Load Data CLI] Validating ${QUESTION_BANK_SEED.length} questions schema...`);
  QUESTION_BANK_SEED.forEach((q, index) => {
    validateSeedQuestion(q, index, validCategoryIds);
  });
  console.log(`[Load Data CLI] ✓ All ${QUESTION_BANK_SEED.length} questions validated successfully.`);

  console.log(`[Load Data CLI] Bulk writing ${QUESTION_BANK_SEED.length} questions into Question Bank...`);
  const questionOps = QUESTION_BANK_SEED.map((q) => {
    const categoryName = q.categoryName || catNameMap.get(q.categoryId) || q.categoryId;
    return {
      updateOne: {
        filter: { categoryId: q.categoryId, questionText: q.questionText.trim() },
        update: {
          $set: {
            categoryId: q.categoryId,
            categoryName,
            topic: q.topic || 'Safety',
            difficulty: q.difficulty || 'intermediate',
            questionText: q.questionText.trim(),
            options: q.options.map((opt) => opt.trim()),
            correctIndex: q.correctIndex,
            explanation: (q.explanation || '').trim(),
            isActive: true,
          },
        },
        upsert: true,
        runValidators: true,
      },
    };
  });

  const bulkResult = await Question.bulkWrite(questionOps);
  console.log(
    `[Load Data CLI] ✓ Question bank bulk write complete. Upserted: ${bulkResult.upsertedCount}, Modified: ${bulkResult.modifiedCount}, Matched: ${bulkResult.matchedCount}.`
  );

  // 4. Verify category question counts and ensure at least 20 per category with balanced distribution
  console.log('\n[Load Data CLI] Verifying database question counts and fairness metrics:');
  const allDbQuestions = await Question.find({ isActive: true }).select('+correctIndex +explanation');
  const dbQualityReport = verifyQuestionBankQuality(allDbQuestions, SEED_CATEGORIES);

  const categoryCounts = {};
  for (const cat of SEED_CATEGORIES) {
    const rep = dbQualityReport.categoryReports[cat.id];
    categoryCounts[cat.id] = rep.totalQuestions;
    console.log(
      `  - ${cat.name} (${cat.id}): ${rep.totalQuestions} active questions | Positions: [A: ${rep.positionPercentages[0]}%, B: ${rep.positionPercentages[1]}%, C: ${rep.positionPercentages[2]}%, D: ${rep.positionPercentages[3]}%] | Longest correct: ${rep.longestCorrectCount}/${rep.totalQuestions} (${rep.longestCorrectPercentage.toFixed(1)}%)`
    );
  }

  const totalQuestions = allDbQuestions.length;
  console.log(`[Load Data CLI] Total questions in database: ${totalQuestions}`);

  // 5. Sync Global Settings
  const settings = await Setting.getSettings();
  console.log(
    `[Load Data CLI] ✓ Global platform settings initialized (Platform fee: ₹${settings.platformFee}, Commission: ${settings.platformCommissionPercent}%).`
  );

  return {
    categoriesCount: SEED_CATEGORIES.length,
    servicesCount: SEED_SERVICES.length,
    totalQuestions,
    categoryCounts,
  };
};

const runCLI = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Load Data CLI] Connected to MongoDB.');

    const summary = await runDataLoader();

    console.log('\n======================================================');
    console.log('DATA LOAD SUCCESSFUL:');
    console.log(`- Categories: ${summary.categoriesCount}`);
    console.log(`- Services: ${summary.servicesCount}`);
    console.log(`- Questions: ${summary.totalQuestions}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n[Load Data CLI ERROR]:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('server/scripts/loadData.js')) {
  runCLI();
}
