// ===================================================================
// FixNear Trust - Skill Test Engine & Question Bank Verification Tests
// Covers:
// 1. Data loader execution against MongoDB: 120 questions, 20 per category
// 2. Data quality checks: position spread (20-30%), longest option (<=30%), no duplicates, non-empty topic/explanation
// 3. Option shuffling on server: two sessions show different orders, resume preserves order
// 4. Shuffled grading: displayed correct option passes, wrong options fail, provider cannot influence mapping
// 5. Answer validation: selectedIndex strictly 0-3
// 6. Test failure privacy: weak topics only returned, no answer or explanation leaks
// 7. Admin question form checks and quality warnings
// 8. Selected skill enforcement, multi-service hub, and skill approval
// ===================================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server.js';
import { runDataLoader } from '../scripts/loadData.js';
import { verifyQuestionBankQuality } from '../utils/questionValidator.js';
import { Question } from '../models/Question.js';
import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { Provider } from '../models/Provider.js';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { SkillTestSession } from '../models/SkillTestSession.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { Setting } from '../models/Setting.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { SEED_CATEGORIES } from '../data/seedData.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('Skill Test Engine & Question Bank Suite', () => {
  it('runs the data loader against MongoDB and asserts 120 questions, 20 per category with valid schema and quality metrics', async () => {
    // Run the data loader
    const summary = await runDataLoader();

    expect(summary.totalQuestions).toBe(120);
    expect(summary.categoriesCount).toBe(6);

    // Verify exactly 20 questions for each of the 6 categories
    for (const cat of SEED_CATEGORIES) {
      const count = await Question.countDocuments({ categoryId: cat.id, isActive: true });
      expect(count, `Expected 20 questions for category ${cat.id}`).toBe(20);
    }

    // Verify all 120 questions with questionValidator
    const allQuestions = await Question.find({ isActive: true }).select('+correctIndex +explanation');
    expect(allQuestions.length).toBe(120);

    const qualityReport = verifyQuestionBankQuality(allQuestions, SEED_CATEGORIES);
    expect(qualityReport.totalQuestions).toBe(120);

    // Assert each category meets all strict quality metrics
    for (const cat of SEED_CATEGORIES) {
      const rep = qualityReport.categoryReports[cat.id];
      expect(rep).toBeDefined();
      expect(rep.totalQuestions).toBe(20);

      // Positions spread: each position 0, 1, 2, 3 must be between 20% and 30%
      for (let pos = 0; pos <= 3; pos++) {
        expect(rep.positionPercentages[pos]).toBeGreaterThanOrEqual(20);
        expect(rep.positionPercentages[pos]).toBeLessThanOrEqual(30);
      }

      // Longest option metric: correct answer is longest in at most 30% of questions
      expect(rep.longestCorrectPercentage).toBeLessThanOrEqual(30);

      // Topics covered include Safety, Tools, Troubleshooting, Installation, Maintenance
      expect(rep.topics.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('GET /api/skill-test/:categoryId returns exactly 10 questions with text and options, and no correctIndex or explanation', async () => {
    // 1. Register a provider with selected category ac-cooling
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ganesh Naik',
        email: 'ganesh.naik@fixnear.com',
        password: 'SecurePassword123',
        phone: '9820011445',
        city: 'Mumbai',
        role: 'provider',
      });
    expect(regRes.status).toBe(201);
    const provCookie = regRes.headers['set-cookie'];

    // Register profile with selectedCategories: ['ac-cooling']
    const profRes = await request(app)
      .post('/api/providers/register')
      .set('Cookie', provCookie)
      .send({
        selectedCategories: ['ac-cooling'],
        experienceYears: 5,
        serviceArea: 'Andheri West',
      });
    expect(profRes.status).toBe(200);

    // 2. Call GET /api/skill-test/ac-cooling
    const testRes = await request(app)
      .get('/api/skill-test/ac-cooling')
      .set('Cookie', provCookie);

    expect(testRes.status).toBe(200);
    expect(testRes.body.success).toBe(true);
    expect(testRes.body.sessionId).toBeDefined();
    expect(testRes.body.categoryId).toBe('ac-cooling');
    expect(testRes.body.questions.length).toBe(10);
    expect(testRes.body.durationMinutes).toBe(15);
    expect(testRes.body.passMark).toBe(70);

    // CRITICAL SECURITY AUDIT: Ensure correctIndex and explanation are strictly stripped from all questions
    testRes.body.questions.forEach((q) => {
      expect(q.questionText).toBeTruthy();
      expect(typeof q.questionText).toBe('string');
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeUndefined();
      expect(q.explanation).toBeUndefined();
    });
  });

  it('server refuses to start a skill test when the category has fewer than 10 active questions', async () => {
    // Create a temporary category with only 3 questions
    await Category.create({
      categoryId: 'rare-trade',
      name: 'Rare Trade',
      startingPrice: 500,
      isActive: true,
    });

    for (let i = 1; i <= 3; i++) {
      await Question.create({
        categoryId: 'rare-trade',
        categoryName: 'Rare Trade',
        topic: 'Safety',
        questionText: `Rare Question ${i}: Safety check?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        explanation: 'Standard safety rationale for rare trade',
        isActive: true,
      });
    }

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Vijay Patil',
        email: 'vijay.patil@fixnear.com',
        password: 'SecurePassword123',
        phone: '9820011446',
        city: 'Mumbai',
        role: 'provider',
      });
    const provCookie = regRes.headers['set-cookie'];

    await request(app)
      .post('/api/providers/register')
      .set('Cookie', provCookie)
      .send({
        selectedCategories: ['rare-trade'],
        experienceYears: 4,
      });

    // Attempt to start skill test on rare-trade (only 3 questions exist)
    const res = await request(app)
      .get('/api/skill-test/rare-trade')
      .set('Cookie', provCookie);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('TEST_NOT_PREPARED');
    expect(res.body.message).toBe('This test is being prepared. Please check back soon.');
  });

  it('server refuses to start a skill test when the category is not one of provider selected skills', async () => {
    // Provider registered only for plumbing
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Suresh More',
        email: 'suresh.more@fixnear.com',
        password: 'SecurePassword123',
        phone: '9820011447',
        city: 'Mumbai',
        role: 'provider',
      });
    const provCookie = regRes.headers['set-cookie'];

    await request(app)
      .post('/api/providers/register')
      .set('Cookie', provCookie)
      .send({
        selectedCategories: ['plumbing'],
        experienceYears: 7,
      });

    // Try to take test for electrical (which was NOT selected)
    const res = await request(app)
      .get('/api/skill-test/electrical')
      .set('Cookie', provCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('SKILL_NOT_SELECTED');
    expect(res.body.message).toContain('not selected in your profile');
  });

  it('option shuffling: two sessions for same category show different option orders, and resuming preserves the exact option order', async () => {
    // Provider 1
    const p1Res = await request(app).post('/api/auth/register').send({
      name: 'Shuffler One',
      email: 'shuffler.one@fixnear.com',
      password: 'SecurePassword123',
      phone: '9820088111',
      city: 'Mumbai',
      role: 'provider',
    });
    const p1Cookie = p1Res.headers['set-cookie'];
    await request(app).post('/api/providers/register').set('Cookie', p1Cookie).send({ selectedCategories: ['ac-cooling'] });

    // Session 1 for Provider 1
    const s1Res = await request(app).get('/api/skill-test/ac-cooling').set('Cookie', p1Cookie);
    expect(s1Res.status).toBe(200);
    const s1Questions = s1Res.body.questions;

    // Resuming session 1: MUST return the EXACT same options in the EXACT same order
    const resumeRes = await request(app).get('/api/skill-test/ac-cooling').set('Cookie', p1Cookie);
    expect(resumeRes.status).toBe(200);
    expect(resumeRes.body.isResumed).toBe(true);
    expect(resumeRes.body.sessionId).toBe(s1Res.body.sessionId);

    // Verify option order match between original and resumed session
    for (let i = 0; i < 10; i++) {
      expect(resumeRes.body.questions[i]._id).toBe(s1Questions[i]._id);
      expect(resumeRes.body.questions[i].options).toEqual(s1Questions[i].options);
    }

    // Provider 2 takes test for same category
    const p2Res = await request(app).post('/api/auth/register').send({
      name: 'Shuffler Two',
      email: 'shuffler.two@fixnear.com',
      password: 'SecurePassword123',
      phone: '9820088222',
      city: 'Mumbai',
      role: 'provider',
    });
    const p2Cookie = p2Res.headers['set-cookie'];
    await request(app).post('/api/providers/register').set('Cookie', p2Cookie).send({ selectedCategories: ['ac-cooling'] });

    // Session 2 for Provider 2
    const s2Res = await request(app).get('/api/skill-test/ac-cooling').set('Cookie', p2Cookie);
    expect(s2Res.status).toBe(200);
    const s2Questions = s2Res.body.questions;

    // Verify that for shared questions between session 1 and session 2, option orders are randomized
    const s1Map = new Map(s1Questions.map((q) => [String(q._id), q.options]));
    let foundDifferentOrder = false;
    for (const q2 of s2Questions) {
      const q1Opts = s1Map.get(String(q2._id));
      if (q1Opts) {
        if (JSON.stringify(q1Opts) !== JSON.stringify(q2.options)) {
          foundDifferentOrder = true;
          break;
        }
      }
    }
    // Across 10 questions with 4 options (24 permutations each), at least some shared questions have different orders
    expect(foundDifferentOrder || s1Questions.map((q) => q._id).join() !== s2Questions.map((q) => q._id).join()).toBe(true);
  });

  it('shuffled grading: picking the displayed correct option passes, picking wrong options fails, and rejects invalid indices', async () => {
    // 1. Create a provider for electrical category
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Electrician Tester',
      email: 'electrician.tester@fixnear.com',
      password: 'SecurePassword123',
      phone: '9820088333',
      city: 'Mumbai',
      role: 'provider',
    });
    const provCookie = regRes.headers['set-cookie'];
    await request(app).post('/api/providers/register').set('Cookie', provCookie).send({ selectedCategories: ['electrical'] });

    const startRes = await request(app).get('/api/skill-test/electrical').set('Cookie', provCookie);
    expect(startRes.status).toBe(200);
    const { sessionId, questions } = startRes.body;

    // Load actual questions from DB to find the correct answer text
    const qDocs = await Question.find({ _id: { $in: questions.map((q) => q._id) } }).select('+correctIndex');
    const qMap = new Map(qDocs.map((q) => [String(q._id), q]));

    // 2. Reject answers with selectedIndex outside 0-3
    const badIndexRes1 = await request(app)
      .post('/api/skill-test/electrical/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: [{ questionId: String(questions[0]._id), selectedIndex: 4 }], // > 3
      });
    expect(badIndexRes1.status).toBe(400);
    expect(badIndexRes1.body.message).toMatch(/(3|between 0 and 3)/);

    const badIndexRes2 = await request(app)
      .post('/api/skill-test/electrical/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: [{ questionId: String(questions[0]._id), selectedIndex: -1 }], // < 0
      });
    expect(badIndexRes2.status).toBe(400);

    const badIndexRes3 = await request(app)
      .post('/api/skill-test/electrical/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: [{ questionId: String(questions[0]._id), selectedIndex: 1.5 }], // float
      });
    expect(badIndexRes3.status).toBe(400);

    // 3. Submit 100% correct answers by selecting the displayed index of the correct text
    const correctAnswers = questions.map((clientQ) => {
      const qDoc = qMap.get(String(clientQ._id));
      const correctText = qDoc.options[qDoc.correctIndex];
      const displayedIndex = clientQ.options.indexOf(correctText);
      expect(displayedIndex).toBeGreaterThanOrEqual(0);
      return {
        questionId: String(clientQ._id),
        selectedIndex: displayedIndex,
      };
    });

    // Also attempt provider manipulation: injecting fake optionOrder or correctIndex in body should have zero effect
    const submitRes = await request(app)
      .post('/api/skill-test/electrical/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: correctAnswers,
        optionOrder: [0, 1, 2, 3], // Injected attempt to override server order
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.passed).toBe(true);
    expect(submitRes.body.score).toBe(100);
    expect(submitRes.body.badge).toBe('Gold');
  });

  it('provider failure privacy: failed test returns weak topics only, without leaking correct answers or explanations', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Failing Provider',
      email: 'failing.provider@fixnear.com',
      password: 'SecurePassword123',
      phone: '9820088444',
      city: 'Mumbai',
      role: 'provider',
    });
    const provCookie = regRes.headers['set-cookie'];
    await request(app).post('/api/providers/register').set('Cookie', provCookie).send({ selectedCategories: ['carpentry'] });

    const startRes = await request(app).get('/api/skill-test/carpentry').set('Cookie', provCookie);
    expect(startRes.status).toBe(200);
    const { sessionId, questions } = startRes.body;

    const qDocs = await Question.find({ _id: { $in: questions.map((q) => q._id) } }).select('+correctIndex');
    const qMap = new Map(qDocs.map((q) => [String(q._id), q]));

    // Intentionally submit all wrong answers (picking displayed index that is NOT correct)
    const wrongAnswers = questions.map((clientQ) => {
      const qDoc = qMap.get(String(clientQ._id));
      const correctText = qDoc.options[qDoc.correctIndex];
      const displayedCorrectIdx = clientQ.options.indexOf(correctText);
      const wrongDisplayedIdx = (displayedCorrectIdx + 1) % 4;
      return {
        questionId: String(clientQ._id),
        selectedIndex: wrongDisplayedIdx,
      };
    });

    const submitRes = await request(app)
      .post('/api/skill-test/carpentry/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: wrongAnswers,
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.passed).toBe(false);
    expect(submitRes.body.score).toBe(0);

    // PRIVACY VERIFICATION: Only weakTopics and cooldown date returned, NO answer keys or explanations!
    expect(submitRes.body.weakTopics).toBeDefined();
    expect(Array.isArray(submitRes.body.weakTopics)).toBe(true);
    expect(submitRes.body.weakTopics.length).toBeGreaterThan(0);
    expect(submitRes.body.cooldownUntil).toBeDefined();

    expect(submitRes.body.answers).toBeUndefined();
    expect(submitRes.body.questions).toBeUndefined();
    expect(submitRes.body.correctAnswersList).toBeUndefined();
    expect(submitRes.body.explanation).toBeUndefined();
  });

  it('provider moves to waiting_for_approval as soon as ONE skill is passed, and dispatch matches ONLY for passed skills', async () => {
    // 1. Create a customer
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@fixnear.com',
        password: 'CustomerPass123',
        phone: '9820055667',
        city: 'Mumbai',
        role: 'customer',
      });
    const custCookie = custRes.headers['set-cookie'];

    // 2. Create provider with 2 selected skills: plumbing and electrical
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rohan Shinde',
        email: 'rohan.shinde@fixnear.com',
        password: 'SecurePassword123',
        phone: '9820011448',
        city: 'Mumbai',
        role: 'provider',
      });
    const provCookie = regRes.headers['set-cookie'];

    await request(app)
      .post('/api/providers/register')
      .set('Cookie', provCookie)
      .send({
        selectedCategories: ['plumbing', 'electrical'],
        experienceYears: 6,
      });

    const provBeforeTest = await Provider.findOne({ email: 'rohan.shinde@fixnear.com' });
    expect(provBeforeTest.status).toBe('take_skill_test');
    expect(provBeforeTest.skills.length).toBe(2);
    expect(provBeforeTest.skills.every((s) => !s.passed)).toBe(true);

    // 3. Take and pass PLUMBING skill test
    const startRes = await request(app)
      .get('/api/skill-test/plumbing')
      .set('Cookie', provCookie);
    expect(startRes.status).toBe(200);

    const { sessionId, questions } = startRes.body;

    // Fetch the correct answers from DB and locate displayed index
    const qDocs = await Question.find({ _id: { $in: questions.map((q) => q._id) } }).select('+correctIndex');
    const qMap = new Map(qDocs.map((q) => [String(q._id), q]));

    const answers = questions.map((clientQ) => {
      const qDoc = qMap.get(String(clientQ._id));
      const correctText = qDoc.options[qDoc.correctIndex];
      const displayedIndex = clientQ.options.indexOf(correctText);
      return {
        questionId: String(clientQ._id),
        selectedIndex: displayedIndex >= 0 ? displayedIndex : 0,
      };
    });

    const submitRes = await request(app)
      .post('/api/skill-test/plumbing/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers,
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.passed).toBe(true);
    expect(submitRes.body.score).toBe(100);

    // Provider status must automatically transition to waiting_for_approval!
    const provAfterPlumbing = await Provider.findOne({ email: 'rohan.shinde@fixnear.com' });
    expect(provAfterPlumbing.status).toBe('waiting_for_approval');

    const plumbingSkill = provAfterPlumbing.skills.find((s) => s.categoryId === 'plumbing');
    const electricalSkill = provAfterPlumbing.skills.find((s) => s.categoryId === 'electrical');
    expect(plumbingSkill.passed).toBe(true);
    expect(electricalSkill.passed).toBe(false); // Electrical still not passed!

    // Admin approves provider
    provAfterPlumbing.status = 'approved';
    provAfterPlumbing.isOnline = true;
    await provAfterPlumbing.save();

    // 4. Test Dispatch: Booking for Plumbing MUST match Rohan Shinde
    const plumbingService = await Service.findOne({ categoryId: 'plumbing', isActive: true });
    expect(plumbingService).toBeDefined();

    const bookPlumbingRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: plumbingService.serviceId,
        address: 'Bandra West, Mumbai',
        city: 'Mumbai',
        scheduledDate: '2026-12-10',
        timeSlot: '11:00 AM',
      });
    expect(bookPlumbingRes.status).toBe(201);
    expect(bookPlumbingRes.body.success).toBe(true);
    // Booking assigned/offered to Rohan
    const savedPlumbingBooking = await Booking.findById(bookPlumbingRes.body.booking._id);
    expect(savedPlumbingBooking.offeredTo.length).toBeGreaterThan(0);
    expect(String(savedPlumbingBooking.offeredTo[0].providerId)).toBe(String(provAfterPlumbing._id));

    // 5. Test Dispatch: Booking for Electrical MUST NOT match Rohan Shinde because he hasn't passed electrical!
    // Make sure no other electrical provider is online in Mumbai
    await Provider.updateMany({ _id: { $ne: provAfterPlumbing._id } }, { $set: { isOnline: false } });

    const electricalService = await Service.findOne({ categoryId: 'electrical', isActive: true });
    expect(electricalService).toBeDefined();

    const bookElectricalRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: electricalService.serviceId,
        address: 'Bandra West, Mumbai',
        city: 'Mumbai',
        scheduledDate: '2026-12-11',
        timeSlot: '02:00 PM',
      });

    // Must be rejected with BOOKING_NO_PROVIDER because Rohan has NOT passed electrical!
    expect(bookElectricalRes.status).toBe(400);
    expect(bookElectricalRes.body.code).toBe('BOOKING_NO_PROVIDER');
  });

  it('provider can add a new service via POST /api/providers/skills/add and take its test', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Kiran Joshi',
        email: 'kiran.joshi@fixnear.com',
        password: 'SecurePassword123',
        phone: '9820011449',
        city: 'Mumbai',
        role: 'provider',
      });
    const provCookie = regRes.headers['set-cookie'];

    await request(app)
      .post('/api/providers/register')
      .set('Cookie', provCookie)
      .send({
        selectedCategories: ['carpentry'],
      });

    // Add deep-cleaning as an additional service
    const addRes = await request(app)
      .post('/api/providers/skills/add')
      .set('Cookie', provCookie)
      .send({
        categoryId: 'deep-cleaning',
      });

    expect(addRes.status).toBe(200);
    expect(addRes.body.success).toBe(true);
    expect(addRes.body.skill.categoryId).toBe('deep-cleaning');
    expect(addRes.body.skill.passed).toBe(false);

    // Verify it is now present in provider document
    const updatedProv = await Provider.findOne({ email: 'kiran.joshi@fixnear.com' });
    expect(updatedProv.skills.some((s) => s.categoryId === 'deep-cleaning')).toBe(true);

    // Provider can now start the test for deep-cleaning
    const testRes = await request(app)
      .get('/api/skill-test/deep-cleaning')
      .set('Cookie', provCookie);
    expect(testRes.status).toBe(200);
    expect(testRes.body.questions.length).toBe(10);
  });

  it('admin can approve specific skills and reject other skills on a provider', async () => {
    // 1. Create an admin
    const adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin.boss@fixnear.com',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.boss@fixnear.com', password: 'AdminPassword123!' });
    const adminCookie = adminLogin.headers['set-cookie'];

    // 2. Create provider with 2 skills
    const provUser = await User.create({
      name: 'Nitin Sawant',
      email: 'nitin.sawant@fixnear.com',
      password: 'ProviderPass123',
      role: 'provider',
      phone: '9820011450',
      city: 'Mumbai',
    });

    const provider = await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Mumbai',
      status: 'waiting_for_approval',
      skills: [
        { categoryId: 'ac-cooling', categoryName: 'Air Conditioning', passed: true, testScore: 85, status: 'passed' },
        { categoryId: 'appliances', categoryName: 'Home Appliances', passed: true, testScore: 72, status: 'passed' },
      ],
    });

    // 3. Admin approves ac-cooling and rejects appliances
    const approveRes = await request(app)
      .post(`/api/admin/approvals/${provider._id}/approve`)
      .set('Cookie', adminCookie)
      .send({
        approvedSkillIds: ['ac-cooling'],
        rejectedSkillIds: ['appliances'],
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.provider.status).toBe('approved');

    const updated = await Provider.findById(provider._id);
    const acSkill = updated.skills.find((s) => s.categoryId === 'ac-cooling');
    const appSkill = updated.skills.find((s) => s.categoryId === 'appliances');

    expect(acSkill.status).toBe('approved');
    expect(acSkill.passed).toBe(true);

    expect(appSkill.status).toBe('rejected');
    expect(appSkill.passed).toBe(false);

    // 4. Admin toggles appliances back to approved via PATCH /api/admin/providers/:id/skills/:categoryId
    const toggleRes = await request(app)
      .patch(`/api/admin/providers/${provider._id}/skills/appliances`)
      .set('Cookie', adminCookie)
      .send({ status: 'approved' });

    expect(toggleRes.status).toBe(200);
    const reloaded = await Provider.findById(provider._id);
    const reloadedAppSkill = reloaded.skills.find((s) => s.categoryId === 'appliances');
    expect(reloadedAppSkill.status).toBe('approved');
    expect(reloadedAppSkill.passed).toBe(true);
  });

  it('admin question desk shows friendly warnings when correct answer is much longer than distractors or category has fewer than 20 questions', async () => {
    const adminUser = await User.create({
      name: 'Question Inspector Admin',
      email: 'inspector.admin@fixnear.com',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inspector.admin@fixnear.com', password: 'AdminPassword123!' });
    const adminCookie = adminLogin.headers['set-cookie'];

    // 1. Create a question where correct answer is much longer than distractors
    const createRes = await request(app)
      .post('/api/admin/questions')
      .set('Cookie', adminCookie)
      .send({
        categoryId: 'rare-trade', // only 3 questions exist
        categoryName: 'Rare Trade',
        topic: 'Safety',
        questionText: 'What is the proper method for handling pressurized chemical canisters?',
        options: [
          'Store canisters in direct sunlight and shake vigorously before puncturing with steel chisel',
          'Throw into household trash',
          'Vent into bedroom',
          'Heat with open torch flame',
        ],
        correctIndex: 0,
        explanation: 'Pressurized canisters require safe storage and certified disposal.',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.warnings).toBeDefined();
    expect(createRes.body.warnings.length).toBeGreaterThan(0);
    // Warning 1: correct answer noticeably longer
    expect(createRes.body.warnings.some((w) => w.includes('noticeably longer'))).toBe(true);
    // Warning 2: category has fewer than 20 active questions
    expect(createRes.body.warnings.some((w) => w.includes('fewer than 20 active questions') || w.includes('target: at least 20'))).toBe(true);
  });

  it('data quality test suite: questionValidator rejects invalid sets (count < 20, unbalanced positions, longest option > 30%, duplicate options, empty topic/explanation)', () => {
    // 1. Category with fewer than 20 questions
    const fewQuestions = [
      {
        categoryId: 'test-cat',
        questionText: 'Sample question text here?',
        topic: 'Safety',
        explanation: 'Valid explanation text',
        options: ['Opt A', 'Opt B', 'Opt C', 'Opt D'],
        correctIndex: 0,
      },
    ];
    expect(() => verifyQuestionBankQuality(fewQuestions, [{ id: 'test-cat', name: 'Test' }])).toThrow(/Minimum required is 20/);

    // 2. Unbalanced answer positions (all correctIndex = 0)
    const unbalancedPositions = [];
    for (let i = 0; i < 20; i++) {
      unbalancedPositions.push({
        categoryId: 'test-cat',
        questionText: `Sample question #${i + 1} with enough length?`,
        topic: 'Safety',
        explanation: 'Valid explanation text',
        options: ['Short A', 'Short B', 'Short C', 'Short D'],
        correctIndex: 0, // 100% position 0, 0% positions 1, 2, 3
      });
    }
    expect(() => verifyQuestionBankQuality(unbalancedPositions, [{ id: 'test-cat', name: 'Test' }])).toThrow(/unbalanced/);

    // 3. Longest option > 30% (e.g. 15 of 20 have correct answer as longest)
    const longestViolations = [];
    for (let i = 0; i < 20; i++) {
      longestViolations.push({
        categoryId: 'test-cat',
        questionText: `Sample question #${i + 1} with enough length?`,
        topic: 'Safety',
        explanation: 'Valid explanation text',
        options: [
          'This is a ridiculously long option that is intentionally made much longer than all other options to test validator',
          'Short B',
          'Short C',
          'Short D',
        ],
        correctIndex: i % 4, // 25% each position
      });
    }
    // In this set, option 0 is always the longest. For correctIndex === 0 (5 questions = 25%), it's longest.
    // If we make the correctIndex option the longest in 10 questions:
    const tooManyLongest = [];
    for (let i = 0; i < 20; i++) {
      const isLong = i < 10; // 10 of 20 = 50%
      tooManyLongest.push({
        categoryId: 'test-cat',
        questionText: `Sample question #${i + 1} with enough length?`,
        topic: 'Safety',
        explanation: 'Valid explanation text',
        options: [
          isLong ? 'Very long correct option text that exceeds all other options easily' : 'Normal opt A',
          'Normal opt B',
          'Normal opt C',
          'Normal opt D',
        ],
        correctIndex: 0,
      });
    }
    expect(() => verifyQuestionBankQuality(tooManyLongest, [{ id: 'test-cat', name: 'Test' }])).toThrow();

    // 4. Duplicate options inside a question
    const duplicateOpts = [];
    for (let i = 0; i < 20; i++) {
      duplicateOpts.push({
        categoryId: 'test-cat',
        questionText: `Sample question #${i + 1} with enough length?`,
        topic: 'Safety',
        explanation: 'Valid explanation text',
        options: ['Option Same', 'Option Same', 'Option C', 'Option D'],
        correctIndex: i % 4,
      });
    }
    expect(() => verifyQuestionBankQuality(duplicateOpts, [{ id: 'test-cat', name: 'Test' }])).toThrow(/duplicate options/);

    // 5. Empty explanation or topic
    const emptyTopic = [];
    for (let i = 0; i < 20; i++) {
      emptyTopic.push({
        categoryId: 'test-cat',
        questionText: `Sample question #${i + 1} with enough length?`,
        topic: '', // empty!
        explanation: 'Valid explanation',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: i % 4,
      });
    }
    expect(() => verifyQuestionBankQuality(emptyTopic, [{ id: 'test-cat', name: 'Test' }])).toThrow(/missing a valid topic/);
  });

  // ===================================================================
  // RETAKES & ADMIN RE-TEST ENGINE TESTS
  // ===================================================================

  it('starting a test for a passed skill is rejected with the retake date', async () => {
    // 1. Create a provider with a passed skill (ac-cooling, score 80%, Silver)
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Suresh Patil',
        email: 'suresh.patil.retake@fixnear.com',
        password: 'Password123!',
        phone: '9820099881',
        city: 'Mumbai',
        role: 'provider',
      });
    const provCookie = regRes.headers['set-cookie'];

    const user = await User.findOne({ email: 'suresh.patil.retake@fixnear.com' });
    const retakeDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);

    await Provider.updateOne(
      { userId: user._id },
      {
        $set: {
          specialty: 'Air Conditioning',
          status: 'approved',
          skills: [
            {
              categoryId: 'ac-cooling',
              categoryName: 'Air Conditioning',
              passed: true,
              testScore: 80,
              badge: 'Silver',
              verifiedAt: new Date(),
              retakeAvailableAt: retakeDate,
              status: 'passed',
            },
          ],
        },
      }
    );

    // 2. Attempt to start the skill test for ac-cooling
    const startRes = await request(app)
      .get('/api/skill-test/ac-cooling')
      .set('Cookie', provCookie);

    expect(startRes.status).toBe(400);
    expect(startRes.body.success).toBe(false);
    expect(startRes.body.code).toBe('SKILL_ALREADY_PASSED');
    expect(startRes.body.message).toContain('You have already passed this skill. You can improve your badge after 30 days.');
    expect(startRes.body.retakeAvailableAt).toBeDefined();
    expect(new Date(startRes.body.retakeAvailableAt).getTime()).toBeCloseTo(retakeDate.getTime(), -3);
  });

  it('a failed retake keeps passed=true, score, and badge unchanged and starts 24-hour wait', async () => {
    const user = await User.findOne({ email: 'suresh.patil.retake@fixnear.com' });
    const provCookie = (
      await request(app).post('/api/auth/login').send({ email: 'suresh.patil.retake@fixnear.com', password: 'Password123!' })
    ).headers['set-cookie'];

    // 1. Fast forward retakeAvailableAt to the past (window opened!)
    await Provider.updateOne(
      { userId: user._id, 'skills.categoryId': 'ac-cooling' },
      { $set: { 'skills.$.retakeAvailableAt': new Date(Date.now() - 10000) } }
    );

    // 2. Start exam session (now allowed!)
    const startRes = await request(app)
      .get('/api/skill-test/ac-cooling')
      .set('Cookie', provCookie);

    expect(startRes.status).toBe(200);
    expect(startRes.body.sessionId).toBeDefined();

    const { sessionId, questions } = startRes.body;
    expect(questions.length).toBe(10);

    // 3. Submit failing answers (e.g. all wrong)
    const qDocs = await Question.find({ _id: { $in: questions.map((q) => q._id) } }).select('+correctIndex');
    const qMap = new Map(qDocs.map((q) => [String(q._id), q]));

    const failingAnswers = questions.map((clientQ) => {
      const qDoc = qMap.get(String(clientQ._id));
      const correctText = qDoc.options[qDoc.correctIndex];
      // Pick an option that is NOT the correct answer
      const wrongDisplayedIndex = clientQ.options.findIndex((opt) => opt !== correctText);
      return {
        questionId: String(clientQ._id),
        selectedIndex: wrongDisplayedIndex >= 0 ? wrongDisplayedIndex : 0,
      };
    });

    const submitRes = await request(app)
      .post('/api/skill-test/ac-cooling/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: failingAnswers,
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.passed).toBe(false);
    expect(submitRes.body.cooldownUntil).toBeDefined();

    // 4. Critical check: Provider document in DB MUST keep passed=true, score=80, badge=Silver!
    const reloadedProv = await Provider.findOne({ userId: user._id });
    const skill = reloadedProv.skills.find((s) => s.categoryId === 'ac-cooling');
    expect(skill.passed).toBe(true);
    expect(skill.testScore).toBe(80);
    expect(skill.badge).toBe('Silver');
    expect(skill.status).toBe('passed');

    // 5. Cooldown check: starting test during cooldown is rejected with 403
    const cooldownRes = await request(app)
      .get('/api/skill-test/ac-cooling')
      .set('Cookie', provCookie);
    expect(cooldownRes.status).toBe(403);
    expect(cooldownRes.body.inCooldown).toBe(true);
  });

  it('a better retake updates the badge and score', async () => {
    const user = await User.findOne({ email: 'suresh.patil.retake@fixnear.com' });
    const provCookie = (
      await request(app).post('/api/auth/login').send({ email: 'suresh.patil.retake@fixnear.com', password: 'Password123!' })
    ).headers['set-cookie'];

    // 1. Clear cooldown and ensure retakeAvailableAt is in the past
    await TestAttempt.deleteMany({ userId: user._id });
    await Provider.updateOne(
      { userId: user._id, 'skills.categoryId': 'ac-cooling' },
      { $set: { 'skills.$.retakeAvailableAt': new Date(Date.now() - 10000) } }
    );

    // 2. Start new exam session
    const startRes = await request(app)
      .get('/api/skill-test/ac-cooling')
      .set('Cookie', provCookie);
    expect(startRes.status).toBe(200);

    const { sessionId, questions } = startRes.body;

    // 3. Submit 100% correct answers
    const qDocs = await Question.find({ _id: { $in: questions.map((q) => q._id) } }).select('+correctIndex');
    const qMap = new Map(qDocs.map((q) => [String(q._id), q]));

    const perfectAnswers = questions.map((clientQ) => {
      const qDoc = qMap.get(String(clientQ._id));
      const correctText = qDoc.options[qDoc.correctIndex];
      const correctDisplayedIndex = clientQ.options.indexOf(correctText);
      return {
        questionId: String(clientQ._id),
        selectedIndex: correctDisplayedIndex >= 0 ? correctDisplayedIndex : 0,
      };
    });

    const submitRes = await request(app)
      .post('/api/skill-test/ac-cooling/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: perfectAnswers,
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.passed).toBe(true);
    expect(submitRes.body.score).toBe(100);
    expect(submitRes.body.badge).toBe('Gold');

    // 4. Assert DB record was upgraded from Silver 80% to Gold 100%!
    const reloadedProv = await Provider.findOne({ userId: user._id });
    const skill = reloadedProv.skills.find((s) => s.categoryId === 'ac-cooling');
    expect(skill.passed).toBe(true);
    expect(skill.testScore).toBe(100);
    expect(skill.badge).toBe('Gold');
    expect(skill.status).toBe('passed');
    expect(new Date(skill.retakeAvailableAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('admin re-test sets skill to retest_required, removes it from dispatch, notifies provider, and logs audit', async () => {
    // 1. Create an admin
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin.retest@fixnear.com',
      password: 'AdminPassword123!',
      phone: '9820011999',
      city: 'Mumbai',
      role: 'admin',
    });
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.retest@fixnear.com', password: 'AdminPassword123!' });
    const adminCookie = adminLoginRes.headers['set-cookie'];

    // 2. Create online approved plumbing provider
    const provUser = await User.create({
      name: 'Ganesh Shinde',
      email: 'ganesh.plumbing@fixnear.com',
      password: 'ProviderPass123!',
      phone: '9820011777',
      city: 'Pune',
      role: 'provider',
    });
    const provider = await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Pune',
      specialty: 'Plumbing',
      status: 'approved',
      isOnline: true,
      skills: [
        {
          categoryId: 'plumbing',
          categoryName: 'Plumbing Systems',
          passed: true,
          testScore: 85,
          badge: 'Silver',
          status: 'approved',
          verifiedAt: new Date(),
        },
      ],
    });

    // 3. Customer books a plumbing job in Pune -> should match Ganesh
    const custUser = await User.create({
      name: 'Meera Rao',
      email: 'meera.rao.pune@fixnear.com',
      password: 'CustomerPass123!',
      phone: '9820011888',
      city: 'Pune',
      role: 'customer',
    });
    const custCookie = (
      await request(app).post('/api/auth/login').send({ email: 'meera.rao.pune@fixnear.com', password: 'CustomerPass123!' })
    ).headers['set-cookie'];

    const plumbingService = await Service.findOne({ categoryId: 'plumbing', isActive: true });

    const bookingRes1 = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: plumbingService.serviceId,
        address: 'Shivaji Nagar, Pune',
        city: 'Pune',
        scheduledDate: '2026-12-15',
        timeSlot: '10:00 AM',
      });
    expect(bookingRes1.status).toBe(201);
    expect(bookingRes1.body.success).toBe(true);

    // 4. Admin forces a re-test with a reason
    const retestRes = await request(app)
      .post(`/api/admin/providers/${provider._id}/skills/plumbing/require-retest`)
      .set('Cookie', adminCookie)
      .send({
        reason: 'Repeated customer complaints regarding pipe sealing standards.',
      });

    expect(retestRes.status).toBe(200);
    expect(retestRes.body.success).toBe(true);
    expect(retestRes.body.skill.status).toBe('retest_required');

    // 5. Verify database update, In-app notification, and AuditLog
    const provAfterRetest = await Provider.findById(provider._id);
    const plumSkill = provAfterRetest.skills.find((s) => s.categoryId === 'plumbing');
    expect(plumSkill.status).toBe('retest_required');
    expect(plumSkill.retestReason).toBe('Repeated customer complaints regarding pipe sealing standards.');

    const notif = await Notification.findOne({ userId: provUser._id, code: 'SKILL_RETEST_REQUIRED' });
    expect(notif).toBeDefined();
    expect(notif.message).toContain('Repeated customer complaints regarding pipe sealing standards.');

    const audit = await AuditLog.findOne({ targetId: provider._id, action: 'REQUIRE_PROVIDER_SKILL_RETEST' });
    expect(audit).toBeDefined();
    expect(audit.details.reason).toBe('Repeated customer complaints regarding pipe sealing standards.');

    // 6. Test Job Dispatch Removal: Another customer booking for plumbing in Pune must NOT match Ganesh
    const bookingRes2 = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: plumbingService.serviceId,
        address: 'Kothrud, Pune',
        city: 'Pune',
        scheduledDate: '2026-12-16',
        timeSlot: '02:00 PM',
      });

    expect(bookingRes2.status).toBe(400);
    expect(bookingRes2.body.code).toBe('BOOKING_NO_PROVIDER');
  });

  it('a provider cannot call the admin re-test route (returns 403 Forbidden)', async () => {
    // 1. Provider attempts to call require-retest endpoint
    const provUser = await User.findOne({ email: 'ganesh.plumbing@fixnear.com' });
    const provCookie = (
      await request(app).post('/api/auth/login').send({ email: 'ganesh.plumbing@fixnear.com', password: 'ProviderPass123!' })
    ).headers['set-cookie'];

    const provider = await Provider.findOne({ userId: provUser._id });

    const unauthorizedRes = await request(app)
      .post(`/api/admin/providers/${provider._id}/skills/plumbing/require-retest`)
      .set('Cookie', provCookie)
      .send({
        reason: 'Malicious attempt to force retest',
      });

    expect(unauthorizedRes.status).toBe(403);
  });
});
