// ===================================================================
// FixNear Trust - Skill Test Engine & Question Bank Verification Tests
// Covers:
// 1. Data loader execution against in-memory MongoDB: 90 questions, 15 per category
// 2. GET /api/skill-test/:categoryId returns 10 questions with text & options, NO correctIndex or explanation
// 3. Server refuses test when category has < 10 active questions (TEST_NOT_PREPARED)
// 4. Server refuses test when category is not in provider's selected skills (SKILL_NOT_SELECTED)
// 5. Provider moves to waiting_for_approval after passing 1 skill
// 6. Dispatch offers jobs ONLY to providers who passed that specific skill
// 7. Admin can approve some skills and reject others
// 8. Provider can add another service via POST /api/providers/skills/add
// ===================================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server.js';
import { runDataLoader } from '../scripts/loadData.js';
import { Question } from '../models/Question.js';
import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { Provider } from '../models/Provider.js';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
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
  it('runs the data loader against MongoDB and asserts 90 questions, 15 per category with valid schema', async () => {
    // Run the data loader
    const summary = await runDataLoader();

    expect(summary.totalQuestions).toBe(90);
    expect(summary.categoriesCount).toBe(6);

    // Verify exactly 15 questions for each of the 6 categories
    for (const cat of SEED_CATEGORIES) {
      const count = await Question.countDocuments({ categoryId: cat.id, isActive: true });
      expect(count, `Expected 15 questions for category ${cat.id}`).toBe(15);
    }

    // Verify that every single question has non-empty questionText, 4 non-empty options, and a correctIndex stored
    const allQuestions = await Question.find({}).select('+correctIndex +explanation');
    expect(allQuestions.length).toBe(90);

    for (const q of allQuestions) {
      expect(q.questionText).toBeTruthy();
      expect(typeof q.questionText).toBe('string');
      expect(q.questionText.trim().length).toBeGreaterThan(5);

      expect(q.categoryName).toBeTruthy();
      expect(typeof q.categoryName).toBe('string');

      expect(q.topic).toBeTruthy();
      expect(typeof q.topic).toBe('string');

      expect(q.difficulty).toBeTruthy();
      expect(['beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard']).toContain(q.difficulty);

      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBe(4);
      q.options.forEach((opt) => {
        expect(typeof opt).toBe('string');
        expect(opt.trim().length).toBeGreaterThan(0);
      });

      expect(typeof q.correctIndex).toBe('number');
      expect([0, 1, 2, 3]).toContain(q.correctIndex);
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

    // Fetch the correct answers from DB to guarantee passing score
    const qDocs = await Question.find({ _id: { $in: questions.map((q) => q._id) } }).select('+correctIndex');
    const qMap = new Map(qDocs.map((q) => [String(q._id), q.correctIndex]));

    const submitRes = await request(app)
      .post('/api/skill-test/plumbing/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: questions.map((q) => ({
          questionId: String(q._id),
          selectedIndex: qMap.get(String(q._id)), // 100% correct
        })),
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
});
