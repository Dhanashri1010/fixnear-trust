import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Provider } from '../models/Provider.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Dispute } from '../models/Dispute.js';
import { Setting } from '../models/Setting.js';
import { Question } from '../models/Question.js';
import { SkillTestSession } from '../models/SkillTestSession.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { checkExpiredOffers } from '../controllers/bookingController.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'fixnear_test',
    },
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}, 60000);

beforeEach(async () => {
  await User.deleteMany({});
  await Service.deleteMany({});
  await Provider.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Dispute.deleteMany({});
  await Setting.deleteMany({});
  await Question.deleteMany({});
  await SkillTestSession.deleteMany({});
  await TestAttempt.deleteMany({});
});

describe('FixNear Trust API Test Suite - Phase B', () => {

  // 1. User Registration & Login
  it('enforces password policy (min 8 chars, letter + number) and sets httpOnly cookie without token in body', async () => {
    // Weak password: rejected
    const weakRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Customer',
        email: 'customer@fixnear.com',
        password: 'password', // Missing number
        phone: '9876543210',
        city: 'Mumbai',
        role: 'customer',
      });
    expect(weakRes.status).toBe(400);

    // Valid password: accepted
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Customer',
        email: 'customer@fixnear.com',
        password: 'Password123',
        phone: '9876543210',
        city: 'Mumbai',
        role: 'customer',
      });
    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    // Security check: token must NOT be returned in response body
    expect(regRes.body.token).toBeUndefined();

    // Check cookie
    const cookies = regRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('token=');
    expect(cookies[0]).toContain('HttpOnly');

    // Login test
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@fixnear.com',
        password: 'Password123',
      });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeUndefined();
    expect(loginRes.headers['set-cookie']).toBeDefined();
  });

  // 2. Booking rejection when no verified online provider matches skill or city
  it('rejects booking creation with friendly message when no verified online provider is available with matching skill', async () => {
    // Register customer
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ananya Roy',
        email: 'ananya@fixnear.com',
        password: 'SecurePass123',
        phone: '9876543211',
        city: 'Mumbai',
        role: 'customer',
      });
    const cookie = regRes.headers['set-cookie'];

    // Create an AC service
    const service = await Service.create({
      serviceId: 'ac-foam-jet',
      categoryId: 'ac-cooling',
      category: 'Air Conditioning',
      title: 'Split AC Foam Jet Deep Clean',
      startingPrice: 599,
      isActive: true,
    });

    // Case A: NO provider exists in Mumbai at all
    const bookRes1 = await request(app)
      .post('/api/bookings')
      .set('Cookie', cookie)
      .send({
        serviceId: service.serviceId,
        address: 'Flat 401, Palm Beach Road',
        city: 'Mumbai',
        scheduledDate: '2026-12-01',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'AC cooling issue',
      });

    expect(bookRes1.status).toBe(400);
    expect(bookRes1.body.success).toBe(false);
    expect(bookRes1.body.message).toContain('do not have a verified, online technician available');

    // Case B: A provider exists in Mumbai, is verified and online, but has NON-MATCHING skill (e.g. carpentry)
    const carpUser = await User.create({
      name: 'Carpentry Tech',
      email: 'carpentry@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543219',
      city: 'Mumbai',
      role: 'provider',
    });
    await Provider.create({
      userId: carpUser._id,
      name: carpUser.name,
      email: carpUser.email,
      phone: carpUser.phone,
      city: 'Mumbai',
      specialty: 'Carpentry',
      skills: [{ categoryId: 'carpentry', categoryName: 'Carpentry', passed: true, testScore: 90 }],
      status: 'approved',
      isOnline: true,
    });

    const bookRes2 = await request(app)
      .post('/api/bookings')
      .set('Cookie', cookie)
      .send({
        serviceId: service.serviceId,
        address: 'Flat 401, Palm Beach Road',
        city: 'Mumbai',
        scheduledDate: '2026-12-01',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'AC cooling issue',
      });

    expect(bookRes2.status).toBe(400);
    expect(bookRes2.body.success).toBe(false);
    expect(bookRes2.body.message).toContain('do not have a verified, online technician available');
  });

  // 3. Customer cannot set their own price
  it('enforces price from Service record and ignores client-provided price, status, or finish code', async () => {
    // Register customer
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rohan Mehra',
        email: 'rohan@fixnear.com',
        password: 'SecurePass123',
        phone: '9876543212',
        city: 'Mumbai',
        role: 'customer',
      });
    const customerCookie = regRes.headers['set-cookie'];

    // Create verified provider in Mumbai
    const provUser = await User.create({
      name: 'Santosh Kumar',
      email: 'santosh@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543213',
      city: 'Mumbai',
      role: 'provider',
    });

    await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Mumbai',
      specialty: 'Air Conditioning',
      skills: [{ categoryId: 'ac-cooling', categoryName: 'Air Conditioning', passed: true, testScore: 92 }],
      status: 'approved',
      isOnline: true,
      ratingAvg: 4.9,
    });

    // Create service with base price 649
    const service = await Service.create({
      serviceId: 'ac-filter-service',
      categoryId: 'ac-cooling',
      category: 'Air Conditioning',
      title: 'AC Standard Servicing',
      startingPrice: 649,
      isActive: true,
    });

    // Customer attempts to set price: 50, status: COMPLETED, finishCode: 9999
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', customerCookie)
      .send({
        serviceId: service.serviceId,
        address: 'Building 12, Powai',
        city: 'Mumbai',
        scheduledDate: '2026-12-05',
        timeSlot: 'Afternoon (01:00 PM - 04:00 PM)',
        problemNote: 'Routine checkup',
        price: 50,
        basePrice: 50,
        status: 'COMPLETED',
        finishCode: '9999',
      });

    expect(bookRes.status).toBe(201);
    const booking = bookRes.body.booking;

    // Price must be 649 (from Service record), NOT 50
    expect(booking.basePrice).toBe(649);
    // Status must be REQUESTED, NOT COMPLETED
    expect(booking.status).toBe('REQUESTED');
    // Booking number must be formatted FX-xxxxx
    expect(booking.bookingId).toMatch(/^FX-[A-Z0-9]{5}$/);
    // Completion OTP must be a 4-digit code generated by server
    expect(booking.completionOtp).toMatch(/^\d{4}$/);
  });

  // 4. Customer cannot read another customer's booking
  it('returns 403 Forbidden when a customer tries to read another customer booking', async () => {
    // Customer 1
    const reg1 = await request(app).post('/api/auth/register').send({
      name: 'Customer One',
      email: 'c1@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543201',
      city: 'Mumbai',
      role: 'customer',
    });
    const c1Cookie = reg1.headers['set-cookie'];

    // Customer 2
    const reg2 = await request(app).post('/api/auth/register').send({
      name: 'Customer Two',
      email: 'c2@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543202',
      city: 'Mumbai',
      role: 'customer',
    });
    const c2Cookie = reg2.headers['set-cookie'];

    // Setup Provider & Service
    const provUser = await User.create({
      name: 'Verified Tech',
      email: 'tech@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543203',
      city: 'Mumbai',
      role: 'provider',
    });
    await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Mumbai',
      specialty: 'Plumbing',
      skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 88 }],
      status: 'approved',
      isOnline: true,
    });
    const service = await Service.create({
      serviceId: 'pipe-leak-fix',
      categoryId: 'plumbing',
      category: 'Plumbing',
      title: 'Pipe Leakage Repair',
      startingPrice: 399,
      isActive: true,
    });

    // Customer 1 creates a booking
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', c1Cookie)
      .send({
        serviceId: service.serviceId,
        address: '101 Marine Lines',
        city: 'Mumbai',
        scheduledDate: '2026-12-10',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'Water leakage',
      });
    const bookingId = bookRes.body.booking._id;

    // Customer 2 attempts to read Customer 1's booking
    const getRes = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Cookie', c2Cookie);

    expect(getRes.status).toBe(403);
    expect(getRes.body.success).toBe(false);
  });

  // 5. Customer cannot review before COMPLETED
  it('rejects review submission if booking is not yet COMPLETED', async () => {
    // Register customer
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Reviewer Customer',
      email: 'reviewer@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543299',
      city: 'Mumbai',
      role: 'customer',
    });
    const customerCookie = reg.headers['set-cookie'];

    // Setup Provider & Service
    const provUser = await User.create({
      name: 'Good Tech',
      email: 'goodtech@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543298',
      city: 'Mumbai',
      role: 'provider',
    });
    await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Mumbai',
      specialty: 'Electrical',
      skills: [{ categoryId: 'electrical', categoryName: 'Electrical', passed: true, testScore: 95 }],
      status: 'approved',
      isOnline: true,
    });
    const service = await Service.create({
      serviceId: 'switchboard-repair',
      categoryId: 'electrical',
      category: 'Electrical',
      title: 'Switchboard Repair',
      startingPrice: 299,
      isActive: true,
    });

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', customerCookie)
      .send({
        serviceId: service.serviceId,
        address: 'Bandra West',
        city: 'Mumbai',
        scheduledDate: '2026-12-15',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'Spark in switchboard',
      });
    const bookingId = bookRes.body.booking._id;

    // Try reviewing while status is REQUESTED
    const reviewRes = await request(app)
      .post(`/api/bookings/${bookingId}/review`)
      .set('Cookie', customerCookie)
      .send({
        rating: 5,
        comment: 'Great job!',
      });

    expect(reviewRes.status).toBe(400);
    expect(reviewRes.body.message).toContain('COMPLETED');
  });

  // 6. Finish code verification on status completion
  it('rejects wrong finish code on COMPLETED and accepts the correct 4-digit code', async () => {
    // Setup Provider user & login
    const provUser = await User.create({
      name: 'Field Tech',
      email: 'fieldtech@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543288',
      city: 'Mumbai',
      role: 'provider',
    });
    await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Mumbai',
      specialty: 'Appliances',
      skills: [{ categoryId: 'appliances', categoryName: 'Appliances', passed: true, testScore: 89 }],
      status: 'approved',
      isOnline: true,
    });

    const provLogin = await request(app).post('/api/auth/login').send({
      email: 'fieldtech@fixnear.com',
      password: 'SecurePass123',
    });
    const provCookie = provLogin.headers['set-cookie'];

    // Setup Customer & Booking
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Finish Customer',
      email: 'finish@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543287',
      city: 'Mumbai',
      role: 'customer',
    });
    const custCookie = custRes.headers['set-cookie'];

    const service = await Service.create({
      serviceId: 'washing-machine-triage',
      categoryId: 'appliances',
      category: 'Appliances',
      title: 'Washing Machine Triage',
      startingPrice: 499,
      isActive: true,
    });

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: service.serviceId,
        address: 'Andheri East',
        city: 'Mumbai',
        scheduledDate: '2026-12-20',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'Drum not rotating',
      });

    const bookingId = bookRes.body.booking._id;
    const correctFinishCode = bookRes.body.booking.completionOtp;
    expect(correctFinishCode).toBeDefined();

    // Provider advances status through the sequence:
    // REQUESTED -> ACCEPTED -> ON_THE_WAY -> WORKING
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'ACCEPTED' });
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'ON_THE_WAY' });
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'WORKING' });

    // Try completing with WRONG finish code
    const wrongCodeRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', provCookie)
      .send({
        status: 'COMPLETED',
        finishCode: '0000',
      });

    expect(wrongCodeRes.status).toBe(400);
    expect(wrongCodeRes.body.message).toContain('Invalid 4-digit finish code');

    // Complete with CORRECT finish code
    const correctCodeRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', provCookie)
      .send({
        status: 'COMPLETED',
        finishCode: correctFinishCode,
      });

    expect(correctCodeRes.status).toBe(200);
    expect(correctCodeRes.body.booking.status).toBe('COMPLETED');
  });

  // 7. Item 2: Dispatch - new booking is REQUESTED with providerId empty, offered with 60s window, technician details hidden until ACCEPTED
  it('dispatch: creates booking as REQUESTED with empty provider, offers with 60s window, and hides technician details until ACCEPTED', async () => {
    // 1. Create verified provider with matching skill
    const provUser = await User.create({
      name: 'Deepak Sharma',
      email: 'deepak@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543250',
      city: 'Mumbai',
      role: 'provider',
    });
    const providerDoc = await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Mumbai',
      specialty: 'Plumbing',
      skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 94 }],
      status: 'approved',
      isOnline: true,
      ratingAvg: 4.8,
    });

    const provLogin = await request(app).post('/api/auth/login').send({
      email: 'deepak@fixnear.com',
      password: 'SecurePass123',
    });
    const provCookie = provLogin.headers['set-cookie'];

    // 2. Create customer
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Kavita Joshi',
      email: 'kavita@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543251',
      city: 'Mumbai',
      role: 'customer',
    });
    const custCookie = custRes.headers['set-cookie'];

    // 3. Create service
    const service = await Service.create({
      serviceId: 'plumbing-tap-repair',
      categoryId: 'plumbing',
      category: 'Plumbing',
      title: 'Tap Leakage Repair',
      startingPrice: 349,
      isActive: true,
    });

    // 4. Customer books service
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: service.serviceId,
        address: '14 Marine Drive',
        city: 'Mumbai',
        scheduledDate: '2026-12-15',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'Leaking kitchen tap',
      });

    expect(bookRes.status).toBe(201);
    const booking = bookRes.body.booking;

    // Must be REQUESTED with providerId empty/null
    expect(booking.status).toBe('REQUESTED');
    expect(booking.providerId).toBeNull();
    expect(booking.providerName).toBe('');
    expect(booking.providerPhone).toBe('');

    // Must have offeredTo and currentOfferExpiresAt (60 seconds)
    expect(booking.offeredTo).toBeDefined();
    expect(booking.offeredTo.length).toBe(1);
    expect(String(booking.offeredTo[0].providerId)).toBe(String(providerDoc._id));
    expect(booking.offeredTo[0].status).toBe('PENDING');
    expect(new Date(booking.currentOfferExpiresAt).getTime()).toBeGreaterThan(Date.now());

    // 5. Customer fetches booking: technician name/phone must NOT be returned while REQUESTED
    const getResCust = await request(app)
      .get(`/api/bookings/${booking._id}`)
      .set('Cookie', custCookie);
    expect(getResCust.body.booking.providerName).toBe('');
    expect(getResCust.body.booking.providerPhone).toBe('');

    // 6. Provider accepts the booking
    const acceptRes = await request(app)
      .patch(`/api/bookings/${booking._id}/status`)
      .set('Cookie', provCookie)
      .send({ status: 'ACCEPTED' });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.booking.status).toBe('ACCEPTED');
    // Never send finish code to provider!
    expect(acceptRes.body.booking.completionOtp).toBeUndefined();

    // 7. Customer fetches booking again: technician name/phone are now visible!
    const getResAfterAccept = await request(app)
      .get(`/api/bookings/${booking._id}`)
      .set('Cookie', custCookie);
    expect(getResAfterAccept.body.booking.status).toBe('ACCEPTED');
    expect(getResAfterAccept.body.booking.providerName).toBe('Deepak Sharma');
    expect(getResAfterAccept.body.booking.providerPhone).toBe('9876543250');
  });

  // 8. Item 3: Finish code - counts failed attempts, locks completion for 30 minutes after 5 failures, never reveals code
  it('finish code security: counts wrong attempts, blocks completion for 30 minutes after 5 failures, and never reveals code to provider', async () => {
    // Setup Provider
    const provUser = await User.create({
      name: 'Electrician Pro',
      email: 'elecpro@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543260',
      city: 'Mumbai',
      role: 'provider',
    });
    await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Mumbai',
      specialty: 'Electrical',
      skills: [{ categoryId: 'electrical', categoryName: 'Electrical', passed: true, testScore: 96 }],
      status: 'approved',
      isOnline: true,
    });

    const provLogin = await request(app).post('/api/auth/login').send({
      email: 'elecpro@fixnear.com',
      password: 'SecurePass123',
    });
    const provCookie = provLogin.headers['set-cookie'];

    // Setup Customer & Service
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Pooja Nair',
      email: 'pooja@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543261',
      city: 'Mumbai',
      role: 'customer',
    });
    const custCookie = custRes.headers['set-cookie'];

    const service = await Service.create({
      serviceId: 'fuse-box-repair',
      categoryId: 'electrical',
      category: 'Electrical',
      title: 'Main Fuse Box Repair',
      startingPrice: 499,
      isActive: true,
    });

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: service.serviceId,
        address: 'Bandra Reclamation',
        city: 'Mumbai',
        scheduledDate: '2026-12-18',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'Main breaker tripping',
      });

    const bookingId = bookRes.body.booking._id;
    const correctFinishCode = bookRes.body.booking.completionOtp;
    expect(correctFinishCode).toBeDefined();

    // Advance: REQUESTED -> ACCEPTED -> ON_THE_WAY -> WORKING
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'ACCEPTED' });
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'ON_THE_WAY' });
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'WORKING' });

    // Wrong attempts 1 to 4: returns 400 with attempt count
    for (let attempt = 1; attempt <= 4; attempt++) {
      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/status`)
        .set('Cookie', provCookie)
        .send({ status: 'COMPLETED', finishCode: '0000' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain(`Attempt ${attempt} of 5`);
    }

    // 5th wrong attempt: triggers 30-minute lockout (returns 403)
    const lockRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', provCookie)
      .send({ status: 'COMPLETED', finishCode: '0000' });

    expect(lockRes.status).toBe(403);
    expect(lockRes.body.message).toContain('blocked for 30 minutes after 5 failed finish code attempts');

    // Verify in database: locked and counter is 5
    const dbBooking = await Booking.findById(bookingId);
    expect(dbBooking.failedFinishCodeAttempts).toBe(5);
    expect(dbBooking.finishCodeBlockedUntil).not.toBeNull();
    expect(new Date(dbBooking.finishCodeBlockedUntil).getTime()).toBeGreaterThan(Date.now());

    // 6th attempt while blocked (even with the CORRECT code): returns 403 Forbidden
    const blockedRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', provCookie)
      .send({ status: 'COMPLETED', finishCode: correctFinishCode });

    expect(blockedRes.status).toBe(403);
    expect(blockedRes.body.message).toContain('Completion is blocked due to repeated incorrect finish code attempts');

    // Verify completionOtp is NEVER revealed to provider on GET /api/bookings/:id
    const provGetRes = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Cookie', provCookie);
    expect(provGetRes.body.booking.completionOtp).toBeUndefined();
  });

  // 9. Item 4: Complaints - rejected before ACCEPTED, keeps status unchanged with disputeStatus OPEN, prevents duplicates, allows reviews on COMPLETED bookings
  it('complaints: rejects complaint before ACCEPTED, keeps job status unchanged with disputeStatus OPEN, prevents duplicate open complaints, and allows reviews on COMPLETED bookings with open complaints', async () => {
    // 1. Setup Provider & Customer
    const provUser = await User.create({
      name: 'Harish Patel',
      email: 'harish@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543270',
      city: 'Mumbai',
      role: 'provider',
    });
    await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Mumbai',
      specialty: 'Plumbing',
      skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 91 }],
      status: 'approved',
      isOnline: true,
      ratingAvg: 5.0,
      ratingCount: 1,
    });

    const provLogin = await request(app).post('/api/auth/login').send({
      email: 'harish@fixnear.com',
      password: 'SecurePass123',
    });
    const provCookie = provLogin.headers['set-cookie'];

    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Maya Sen',
      email: 'maya@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543271',
      city: 'Mumbai',
      role: 'customer',
    });
    const custCookie = custRes.headers['set-cookie'];

    const service = await Service.create({
      serviceId: 'drain-cleaning',
      categoryId: 'plumbing',
      category: 'Plumbing',
      title: 'Drainage Jet Cleaning',
      startingPrice: 599,
      isActive: true,
    });

    // 2. Create booking (status: REQUESTED)
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: service.serviceId,
        address: 'Worli Sea Face',
        city: 'Mumbai',
        scheduledDate: '2026-12-22',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'Blocked bathroom drain',
      });

    const bookingId = bookRes.body.booking._id;
    const finishCode = bookRes.body.booking.completionOtp;

    // 3. Customer tries to file complaint while status is REQUESTED -> must fail (400)
    const earlyComplaintRes = await request(app)
      .post(`/api/bookings/${bookingId}/complaint`)
      .set('Cookie', custCookie)
      .send({
        reason: 'Technician did not show up',
        notes: 'Waiting for someone to accept',
      });
    expect(earlyComplaintRes.status).toBe(400);
    expect(earlyComplaintRes.body.message).toContain('Complaints can only be filed once a booking has been accepted');

    // 4. Provider accepts booking (status: ACCEPTED)
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'ACCEPTED' });

    // 5. Customer files complaint on ACCEPTED booking -> succeeds (201)
    const validComplaintRes = await request(app)
      .post(`/api/bookings/${bookingId}/complaint`)
      .set('Cookie', custCookie)
      .send({
        reason: 'Technician arrived late',
        claimAmount: 200,
        notes: 'Technician was 45 minutes late without calling.',
      });

    expect(validComplaintRes.status).toBe(201);
    expect(validComplaintRes.body.dispute).toBeDefined();
    expect(validComplaintRes.body.dispute.status).toBe('OPEN');

    // Crucial check: booking.status MUST NOT change to DISPUTED or CANCELLED!
    // It remains ACCEPTED, while disputeStatus is set to 'OPEN'
    const dbBookingAfterComplaint = await Booking.findById(bookingId);
    expect(dbBookingAfterComplaint.status).toBe('ACCEPTED');
    expect(dbBookingAfterComplaint.disputeStatus).toBe('OPEN');

    // 6. Customer tries to file a SECOND complaint while first is still OPEN -> must fail (400)
    const duplicateComplaintRes = await request(app)
      .post(`/api/bookings/${bookingId}/complaint`)
      .set('Cookie', custCookie)
      .send({
        reason: 'Another complaint',
        notes: 'Still unhappy with the service.',
      });
    expect(duplicateComplaintRes.status).toBe(400);
    expect(duplicateComplaintRes.body.message).toContain('already an open complaint');

    // 7. Complete the booking: ACCEPTED -> ON_THE_WAY -> WORKING -> COMPLETED
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'ON_THE_WAY' });
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'WORKING' });
    const completeRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', provCookie)
      .send({ status: 'COMPLETED', finishCode });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.booking.status).toBe('COMPLETED');

    // Check payment status was set to CASH_RECEIVED and paymentMethod to PAY_ON_SERVICE (Item 5)
    const dbCompletedBooking = await Booking.findById(bookingId);
    expect(dbCompletedBooking.paymentMethod).toBe('PAY_ON_SERVICE');
    expect(dbCompletedBooking.paymentStatus).toBe('CASH_RECEIVED');
    expect(dbCompletedBooking.disputeStatus).toBe('OPEN');

    // 8. Customer submits review on COMPLETED booking with OPEN complaint -> must SUCCEED (201)!
    const reviewRes = await request(app)
      .post(`/api/bookings/${bookingId}/review`)
      .set('Cookie', custCookie)
      .send({
        rating: 4,
        comment: 'Resolved eventually, service quality was okay.',
      });

    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.success).toBe(true);
    expect(reviewRes.body.review.rating).toBe(4);
  });

  // 10. Item A2: Atomic job acceptance & collision rejection (409)
  it('enforces atomic job acceptance, rejecting unauthorized, suspended, or unoffered providers with 409/403', async () => {
    // 1. Create 3 providers
    // Provider A: Verified, online, offered
    const userA = await User.create({
      name: 'Provider Alpha',
      email: 'alpha@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543111',
      city: 'Mumbai',
      role: 'provider',
    });
    const provA = await Provider.create({
      userId: userA._id,
      name: userA.name,
      email: userA.email,
      phone: userA.phone,
      city: 'Mumbai',
      specialty: 'Plumbing',
      skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 92 }],
      status: 'approved',
      isOnline: true,
      ratingAvg: 4.9,
    });
    const loginA = await request(app).post('/api/auth/login').send({ email: 'alpha@fixnear.com', password: 'SecurePass123' });
    const cookieA = loginA.headers['set-cookie'];

    // Provider B: Verified, online, NOT offered
    const userB = await User.create({
      name: 'Provider Beta',
      email: 'beta@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543112',
      city: 'Mumbai',
      role: 'provider',
    });
    await Provider.create({
      userId: userB._id,
      name: userB.name,
      email: userB.email,
      phone: userB.phone,
      city: 'Mumbai',
      specialty: 'Plumbing',
      skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 88 }],
      status: 'approved',
      isOnline: true,
      ratingAvg: 4.5,
    });
    const loginB = await request(app).post('/api/auth/login').send({ email: 'beta@fixnear.com', password: 'SecurePass123' });
    const cookieB = loginB.headers['set-cookie'];

    // Provider C: Suspended
    const userC = await User.create({
      name: 'Provider Gamma',
      email: 'gamma@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543113',
      city: 'Mumbai',
      role: 'provider',
    });
    await Provider.create({
      userId: userC._id,
      name: userC.name,
      email: userC.email,
      phone: userC.phone,
      city: 'Mumbai',
      specialty: 'Plumbing',
      skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 85 }],
      status: 'suspended',
      isOnline: true,
    });
    const loginC = await request(app).post('/api/auth/login').send({ email: 'gamma@fixnear.com', password: 'SecurePass123' });
    const cookieC = loginC.headers['set-cookie'];

    // 2. Setup Customer & Service
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Sunil Rao',
      email: 'sunil@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543114',
      city: 'Mumbai',
      role: 'customer',
    });
    const custCookie = custRes.headers['set-cookie'];

    const service = await Service.create({
      serviceId: 'plumbing-general-check',
      categoryId: 'plumbing',
      category: 'Plumbing',
      title: 'Plumbing General Checkup',
      startingPrice: 299,
      isActive: true,
    });

    // 3. Customer places booking -> offered to Provider Alpha
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: service.serviceId,
        address: 'Bandra Reclamation, Mumbai',
        city: 'Mumbai',
        scheduledDate: '2026-12-25',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'Water pressure low',
      });
    const bookingId = bookRes.body.booking._id;

    // 4. Suspended Provider C attempts to accept -> 403 Forbidden
    const suspendedRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', cookieC)
      .send({ status: 'ACCEPTED' });
    expect(suspendedRes.status).toBe(403);
    expect(suspendedRes.body.message).toContain('suspended');

    // 5. Unoffered Provider B attempts to accept -> 409 Conflict
    const unofferedRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', cookieB)
      .send({ status: 'ACCEPTED' });
    expect(unofferedRes.status).toBe(409);
    expect(unofferedRes.body.message).toContain('already taken or the offer has expired');

    // 6. Offered Provider A accepts -> 200 OK
    const acceptResA = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', cookieA)
      .send({ status: 'ACCEPTED' });
    expect(acceptResA.status).toBe(200);
    expect(acceptResA.body.booking.status).toBe('ACCEPTED');
    expect(acceptResA.body.booking.providerId).toBe(String(provA._id));

    // 7. Duplicate acceptance attempt by Provider A or Provider B -> 400+
    const dupRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', cookieA)
      .send({ status: 'ACCEPTED' });
    expect(dupRes.status).toBeGreaterThanOrEqual(400);
  });

  // 11. Item A2 & A3: Provider decline, atomic re-dispatch to next provider, and expiry transition to NO_PROVIDER_FOUND
  it('handles provider decline, atomically offers to next eligible provider, and marks NO_PROVIDER_FOUND when offers expire', async () => {
    // 1. Create Provider 1 (Rating 5.0) & Provider 2 (Rating 4.7)
    const user1 = await User.create({
      name: 'First Tech',
      email: 'first@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543121',
      city: 'Mumbai',
      role: 'provider',
    });
    const prov1 = await Provider.create({
      userId: user1._id,
      name: user1.name,
      email: user1.email,
      phone: user1.phone,
      city: 'Mumbai',
      specialty: 'Plumbing',
      skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 95 }],
      status: 'approved',
      isOnline: true,
      ratingAvg: 5.0,
      jobsDone: 10,
    });
    const login1 = await request(app).post('/api/auth/login').send({ email: 'first@fixnear.com', password: 'SecurePass123' });
    const cookie1 = login1.headers['set-cookie'];

    const user2 = await User.create({
      name: 'Second Tech',
      email: 'second@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543122',
      city: 'Mumbai',
      role: 'provider',
    });
    const prov2 = await Provider.create({
      userId: user2._id,
      name: user2.name,
      email: user2.email,
      phone: user2.phone,
      city: 'Mumbai',
      specialty: 'Plumbing',
      skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 90 }],
      status: 'approved',
      isOnline: true,
      ratingAvg: 4.7,
      jobsDone: 5,
    });

    // 2. Setup Customer & Service
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Varun Shah',
      email: 'varun@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543123',
      city: 'Mumbai',
      role: 'customer',
    });
    const custCookie = custRes.headers['set-cookie'];

    const service = await Service.create({
      serviceId: 'plumbing-flush-repair',
      categoryId: 'plumbing',
      category: 'Plumbing',
      title: 'Toilet Flush Repair',
      startingPrice: 349,
      isActive: true,
    });

    // 3. Customer books -> offered first to highest rated provider (prov1)
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: service.serviceId,
        address: 'Chembur East, Mumbai',
        city: 'Mumbai',
        scheduledDate: '2026-12-28',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'Flush tank running continuously',
      });
    const bookingId = bookRes.body.booking._id;

    const initialBooking = await Booking.findById(bookingId);
    expect(initialBooking.offeredTo.length).toBe(1);
    expect(String(initialBooking.offeredTo[0].providerId)).toBe(String(prov1._id));
    expect(initialBooking.offeredTo[0].status).toBe('PENDING');

    // 4. Provider 1 declines the offer
    const declineRes = await request(app)
      .patch(`/api/bookings/${bookingId}/decline`)
      .set('Cookie', cookie1);
    expect(declineRes.status).toBe(200);
    expect(declineRes.body.message).toBe('Job offer declined.');

    // 5. Verify offer was declined and atomically re-offered to Provider 2!
    const reofferedBooking = await Booking.findById(bookingId);
    expect(reofferedBooking.status).toBe('REQUESTED');
    expect(reofferedBooking.offeredTo.length).toBe(2);
    expect(reofferedBooking.offeredTo[0].status).toBe('DECLINED');
    expect(String(reofferedBooking.offeredTo[1].providerId)).toBe(String(prov2._id));
    expect(reofferedBooking.offeredTo[1].status).toBe('PENDING');

    // 6. Provider 2's offer expires (simulate expiration time reached)
    await Booking.findByIdAndUpdate(bookingId, {
      currentOfferExpiresAt: new Date(Date.now() - 1000), // Expired
    });

    // Run the background ticker function
    await checkExpiredOffers();

    // 7. Verify: Provider 2's offer is marked EXPIRED, and since no more providers exist,
    // status transitions to NO_PROVIDER_FOUND
    const finalBooking = await Booking.findById(bookingId);
    expect(finalBooking.offeredTo[1].status).toBe('EXPIRED');
    expect(finalBooking.status).toBe('NO_PROVIDER_FOUND');
    expect(finalBooking.currentOfferExpiresAt).toBeNull();
  });

  // 12. Fix 3: Special characters in city like "Mum(bai" do not crash regex, and city > 60 chars is rejected
  it('handles regex special characters safely in city/search and rejects city length > 60 characters', async () => {
    // Register customer
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Regex User',
      email: 'regex@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543130',
      city: 'Mum(bai',
      role: 'customer',
    });
    expect(custRes.status).toBe(201);
    const cookie = custRes.headers['set-cookie'];

    // Create service
    const service = await Service.create({
      serviceId: 'regex-test-service',
      categoryId: 'electrical',
      category: 'Electrical',
      title: 'AC Voltage Check (50Hz)',
      startingPrice: 399,
      isActive: true,
    });

    // Create provider in "Mum(bai"
    const provUser = await User.create({
      name: 'Special Char Tech',
      email: 'special@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543131',
      city: 'Mum(bai',
      role: 'provider',
    });
    await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: provUser.phone,
      city: 'Mum(bai',
      specialty: 'Electrical',
      skills: [{ categoryId: 'electrical', categoryName: 'Electrical', passed: true, testScore: 90 }],
      status: 'approved',
      isOnline: true,
    });

    // Query providers with city="Mum(bai" -> does not crash!
    const provListRes = await request(app).get('/api/providers?city=Mum(bai');
    expect(provListRes.status).toBe(200);
    expect(provListRes.body.count).toBe(1);

    // Book service in "Mum(bai" -> succeeds cleanly
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', cookie)
      .send({
        serviceId: service.serviceId,
        address: 'Sector 4, Mum(bai',
        city: 'Mum(bai',
        scheduledDate: '2026-12-30',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
        problemNote: 'Voltage fluctuation',
      });
    expect(bookRes.status).toBe(201);

    // City longer than 60 characters is rejected by validation with 400
    const longCity = 'A'.repeat(61);
    const badCityRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', cookie)
      .send({
        serviceId: service.serviceId,
        address: 'Some address',
        city: longCity,
        scheduledDate: '2026-12-30',
        timeSlot: 'Morning (10:00 AM - 01:00 PM)',
      });
    expect(badCityRes.status).toBe(400);
    expect(badCityRes.body.message).toContain('City name cannot exceed 60 characters');
  });

  // 13. Fix 1: Concurrent decline + expiry creates exactly one new offer
  it('prevents double-dispatch: concurrent decline and expiry race creates exactly one new offer', async () => {
    // Setup Provider 1 (Rating 5.0), Provider 2 (Rating 4.8), Provider 3 (Rating 4.5)
    const u1 = await User.create({ name: 'Tech One', email: 't1@fixnear.com', password: 'SecurePass123', phone: '9876543141', city: 'Mumbai', role: 'provider' });
    const p1 = await Provider.create({ userId: u1._id, name: u1.name, email: u1.email, phone: u1.phone, city: 'Mumbai', specialty: 'Plumbing', skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 95 }], status: 'approved', isOnline: true, ratingAvg: 5.0, jobsDone: 10 });
    const log1 = await request(app).post('/api/auth/login').send({ email: 't1@fixnear.com', password: 'SecurePass123' });
    const c1 = log1.headers['set-cookie'];

    const u2 = await User.create({ name: 'Tech Two', email: 't2@fixnear.com', password: 'SecurePass123', phone: '9876543142', city: 'Mumbai', role: 'provider' });
    const p2 = await Provider.create({ userId: u2._id, name: u2.name, email: u2.email, phone: u2.phone, city: 'Mumbai', specialty: 'Plumbing', skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 90 }], status: 'approved', isOnline: true, ratingAvg: 4.8, jobsDone: 8 });

    const u3 = await User.create({ name: 'Tech Three', email: 't3@fixnear.com', password: 'SecurePass123', phone: '9876543143', city: 'Mumbai', role: 'provider' });
    await Provider.create({ userId: u3._id, name: u3.name, email: u3.email, phone: u3.phone, city: 'Mumbai', specialty: 'Plumbing', skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 85 }], status: 'approved', isOnline: true, ratingAvg: 4.5, jobsDone: 5 });

    const cust = await request(app).post('/api/auth/register').send({ name: 'Customer Race', email: 'race@fixnear.com', password: 'SecurePass123', phone: '9876543144', city: 'Mumbai', role: 'customer' });
    const custCookie = cust.headers['set-cookie'];

    const service = await Service.create({ serviceId: 'pipe-fix-race', categoryId: 'plumbing', category: 'Plumbing', title: 'Pipe Fix Race', startingPrice: 399, isActive: true });

    const bookRes = await request(app).post('/api/bookings').set('Cookie', custCookie).send({
      serviceId: service.serviceId, address: 'Andheri West, Mumbai', city: 'Mumbai', scheduledDate: '2026-12-31', timeSlot: 'Morning (10:00 AM - 01:00 PM)',
    });
    const bookingId = bookRes.body.booking._id;

    // Simulate offer expiration time reached
    await Booking.findByIdAndUpdate(bookingId, { currentOfferExpiresAt: new Date(Date.now() - 1000) });

    // Race: Provider 1 declines while checkExpiredOffers runs simultaneously
    await Promise.all([
      request(app).patch(`/api/bookings/${bookingId}/decline`).set('Cookie', c1),
      checkExpiredOffers(),
    ]);

    // Check DB: Exactly one new offer to Provider 2 was added (total offers = 2)
    const raceBooking = await Booking.findById(bookingId);
    expect(raceBooking.status).toBe('REQUESTED');
    expect(raceBooking.offeredTo.length).toBe(2);
    // Provider 2 is the ONLY pending offer
    const pendingOffers = raceBooking.offeredTo.filter(o => o.status === 'PENDING');
    expect(pendingOffers.length).toBe(1);
    expect(String(pendingOffers[0].providerId)).toBe(String(p2._id));
  });

  // 14. Fix 2: Stuck expired booking with no pending offer gets re-offered
  it('automatically recovers a stuck expired booking with no pending offer and re-offers to next provider', async () => {
    // Setup Provider 1 (already declined) & Provider 2 (eligible)
    const u1 = await User.create({ name: 'Stuck P1', email: 'stuck1@fixnear.com', password: 'SecurePass123', phone: '9876543151', city: 'Mumbai', role: 'provider' });
    const p1 = await Provider.create({ userId: u1._id, name: u1.name, email: u1.email, phone: u1.phone, city: 'Mumbai', specialty: 'Plumbing', skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 92 }], status: 'approved', isOnline: true });

    const u2 = await User.create({ name: 'Stuck P2', email: 'stuck2@fixnear.com', password: 'SecurePass123', phone: '9876543152', city: 'Mumbai', role: 'provider' });
    const p2 = await Provider.create({ userId: u2._id, name: u2.name, email: u2.email, phone: u2.phone, city: 'Mumbai', specialty: 'Plumbing', skills: [{ categoryId: 'plumbing', categoryName: 'Plumbing', passed: true, testScore: 89 }], status: 'approved', isOnline: true });

    const cust = await request(app).post('/api/auth/register').send({ name: 'Stuck Cust', email: 'stuckcust@fixnear.com', password: 'SecurePass123', phone: '9876543153', city: 'Mumbai', role: 'customer' });

    const service = await Service.create({ serviceId: 'stuck-recovery-service', categoryId: 'plumbing', category: 'Plumbing', title: 'Stuck Recovery Service', startingPrice: 299, isActive: true });

    // Manually create a "stuck" booking: status REQUESTED, offer expired, NO pending offer
    const stuckBooking = await Booking.create({
      bookingId: 'FX-STUCK1',
      customerId: cust.body.user ? cust.body.user.id : new mongoose.Types.ObjectId(),
      customerName: 'Stuck Cust',
      customerPhone: '9876543153',
      providerId: null,
      providerName: '',
      providerPhone: '',
      serviceId: service.serviceId,
      serviceTitle: service.title,
      basePrice: service.startingPrice,
      address: 'Dadar, Mumbai',
      city: 'Mumbai',
      scheduledDate: '2026-12-31',
      timeSlot: 'Morning (10:00 AM - 01:00 PM)',
      status: 'REQUESTED',
      completionOtp: '4567',
      currentOfferExpiresAt: new Date(Date.now() - 5000), // In past
      offeredTo: [
        {
          providerId: p1._id,
          offeredAt: new Date(Date.now() - 70000),
          status: 'EXPIRED', // No PENDING offer
        },
      ],
      timeline: [],
    });

    // Run checkExpiredOffers -> Case (b) detects stuck booking and re-offers to Provider 2!
    await checkExpiredOffers();

    const recoveredBooking = await Booking.findById(stuckBooking._id);
    expect(recoveredBooking.offeredTo.length).toBe(2);
    expect(String(recoveredBooking.offeredTo[1].providerId)).toBe(String(p2._id));
    expect(recoveredBooking.offeredTo[1].status).toBe('PENDING');
    expect(new Date(recoveredBooking.currentOfferExpiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  // 15. Settings API: Public endpoint returns dynamic platform settings
  it('settings API: returns dynamic platform fee, commission percent, pass marks, and cooldown from DB', async () => {
    // Initial fetch returns defaults
    const getRes = await request(app).get('/api/settings');
    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.settings.platformFee).toBe(20);
    expect(getRes.body.settings.platformCommissionPercent).toBe(10);
    expect(getRes.body.settings.skillTestPassMark).toBe(70);
    expect(getRes.body.settings.skillTestTimeLimitMinutes).toBe(15);
    expect(getRes.body.settings.skillTestCooldownHours).toBe(24);

    // Dynamic update test: modify DB setting
    await Setting.findOneAndUpdate(
      { key: 'global_settings' },
      { $set: { platformFee: 30, platformCommissionPercent: 12 } }
    );

    const updatedRes = await request(app).get('/api/settings');
    expect(updatedRes.body.settings.platformFee).toBe(30);
    expect(updatedRes.body.settings.platformCommissionPercent).toBe(12);
  });

  // 16. Provider Onboarding (3-step registration) & Profile Management
  it('provider onboarding: registers 3-step profile, forbids customers, and calculates live net earnings', async () => {
    // 1. Customer cannot access provider console
    const cust = await request(app).post('/api/auth/register').send({
      name: 'Regular Customer',
      email: 'customer-no-console@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543160',
      city: 'Mumbai',
      role: 'customer',
    });
    const custCookie = cust.headers['set-cookie'];

    const forbiddenRes = await request(app).get('/api/providers/me').set('Cookie', custCookie);
    expect(forbiddenRes.status).toBe(403);

    // 2. Register provider user
    const provUser = await request(app).post('/api/auth/register').send({
      name: 'Ramesh Sharma',
      email: 'ramesh.sharma@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543161',
      city: 'Mumbai',
      role: 'provider',
    });
    const provCookie = provUser.headers['set-cookie'];

    // 3-step onboarding registration: rejects unauthorized publicId outside user folder
    const badIdRes = await request(app)
      .post('/api/providers/register')
      .set('Cookie', provCookie)
      .send({
        name: 'Ramesh Sharma',
        idProofPublicId: 'other_user_doc_123',
      });
    expect(badIdRes.status).toBe(400);
    expect(badIdRes.body.message).toContain('private folder');

    // Valid registration with per-user folder publicId
    const validIdPublicId = `fixnear_kyc_private/${provUser.body.user.id}/id_doc_ramesh_123.jpg`;
    const validCertPublicId = `fixnear_kyc_private/${provUser.body.user.id}/cert_ramesh_456.jpg`;

    const regStepRes = await request(app)
      .post('/api/providers/register')
      .set('Cookie', provCookie)
      .send({
        name: 'Ramesh Sharma',
        phone: '9876543161',
        city: 'Mumbai',
        serviceArea: 'Andheri & Juhu',
        specialty: 'Plumbing & Drainage',
        categoryId: 'plumbing',
        categoryName: 'Plumbing',
        experienceYears: 6,
        idProofPublicId: validIdPublicId,
        idProofUrl: `https://fixnear.local/${validIdPublicId}`,
        certificatePublicId: validCertPublicId,
        certificateUrl: `https://fixnear.local/${validCertPublicId}`,
      });

    expect(regStepRes.status).toBe(200);
    expect(regStepRes.body.success).toBe(true);
    expect(regStepRes.body.provider.status).toBe('take_skill_test');
    expect(regStepRes.body.provider.serviceArea).toBe('Andheri & Juhu');
    expect(regStepRes.body.provider.experienceYears).toBe(6);
    expect(regStepRes.body.provider.skills.length).toBe(1);
    expect(regStepRes.body.provider.skills[0].categoryId).toBe('plumbing');
    expect(regStepRes.body.provider.skills[0].passed).toBe(false);

    // Console: get profile and check live earnings calculation
    const profileRes = await request(app).get('/api/providers/me').set('Cookie', provCookie);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.success).toBe(true);
    expect(profileRes.body.provider.name).toBe('Ramesh Sharma');
    expect(profileRes.body.earnings.today).toBe(0);
    expect(profileRes.body.settings.platformFee).toBe(20);
    expect(profileRes.body.settings.commissionPercent).toBe(10);
  });

  // 17. Provider Online Toggle Enforcement: strictly refuses non-approved status
  it('online toggle: refuses unapproved (take_skill_test, waiting_for_approval, rejected, suspended) providers', async () => {
    const provUser = await request(app).post('/api/auth/register').send({
      name: 'Amit Verma',
      email: 'amit.verma@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543162',
      city: 'Mumbai',
      role: 'provider',
    });
    const provCookie = provUser.headers['set-cookie'];

    const providerDoc = await Provider.findOne({ email: 'amit.verma@fixnear.com' });

    // 1. In 'take_skill_test' -> 403 Forbidden
    const res1 = await request(app).patch('/api/providers/me/status').set('Cookie', provCookie).send({ isOnline: true });
    expect(res1.status).toBe(403);
    expect(res1.body.message).toContain('Take the skill test');

    // 2. In 'waiting_for_approval' -> 403 Forbidden
    providerDoc.status = 'waiting_for_approval';
    await providerDoc.save();
    const res2 = await request(app).patch('/api/providers/me/status').set('Cookie', provCookie).send({ isOnline: true });
    expect(res2.status).toBe(403);
    expect(res2.body.message).toContain('Waiting for approval');

    // 3. In 'suspended' -> 403 Forbidden
    providerDoc.status = 'suspended';
    await providerDoc.save();
    const res3 = await request(app).patch('/api/providers/me/status').set('Cookie', provCookie).send({ isOnline: true });
    expect(res3.status).toBe(403);
    expect(res3.body.message).toContain('Suspended');

    // 4. In 'approved' -> 200 OK
    providerDoc.status = 'approved';
    await providerDoc.save();
    const res4 = await request(app).patch('/api/providers/me/status').set('Cookie', provCookie).send({ isOnline: true });
    expect(res4.status).toBe(200);
    expect(res4.body.isOnline).toBe(true);

    // Can switch back to offline
    const res5 = await request(app).patch('/api/providers/me/status').set('Cookie', provCookie).send({ isOnline: false });
    expect(res5.status).toBe(200);
    expect(res5.body.isOnline).toBe(false);
  });

  // 18. Private KYC Document Upload & Signed URL Access Control
  it('private uploads & signed URLs: allows private doc upload and restricts signed document URLs to provider/admin', async () => {
    const provUser = await request(app).post('/api/auth/register').send({
      name: 'Pooja Patil',
      email: 'pooja.patil@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543163',
      city: 'Mumbai',
      role: 'provider',
    });
    const provCookie = provUser.headers['set-cookie'];

    // 1. Provider uploads private PDF doc
    const uploadRes = await request(app)
      .post('/api/upload/private')
      .set('Cookie', provCookie)
      .attach('file', Buffer.from('%PDF-1.4 Fake PDF ID Proof Content'), {
        filename: 'aadhaar_card.pdf',
        contentType: 'application/pdf',
      });

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.publicId).toBeDefined();
    expect(uploadRes.body.publicId.startsWith(`fixnear_kyc_private/${provUser.body.user.id}/`)).toBe(true);
    expect(uploadRes.body.resourceType).toBe('raw');

    // Save publicId to provider profile
    await Provider.findOneAndUpdate(
      { email: 'pooja.patil@fixnear.com' },
      {
        idProofPublicId: uploadRes.body.publicId,
        idProofUrl: uploadRes.body.url,
        idProofResourceType: uploadRes.body.resourceType,
      }
    );

    // 2. Provider accesses signed URL / local file endpoint
    const docRes = await request(app)
      .get('/api/providers/documents/idProof')
      .set('Cookie', provCookie);

    expect(docRes.status).toBe(200);
    expect(docRes.body.success).toBe(true);
    expect(docRes.body.signedUrl).toBeDefined();
    expect(docRes.body.resourceType).toBe('raw');
    expect(docRes.body.expiresInSeconds).toBe(600);

    // 3. Provider accesses file download/view route directly and receives real PDF stream
    const fileRes = await request(app)
      .get('/api/providers/documents/idProof/file')
      .set('Cookie', provCookie);
    expect(fileRes.status).toBe(200);
    expect(fileRes.headers['content-type']).toContain('application/pdf');

    // 4. Customer attempts to access provider private document -> 403 Forbidden
    const cust = await request(app).post('/api/auth/register').send({
      name: 'Snoop Customer',
      email: 'snoop@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543164',
      city: 'Mumbai',
      role: 'customer',
    });
    const custCookie = cust.headers['set-cookie'];

    const unauthorizedDocRes = await request(app)
      .get('/api/providers/documents/idProof')
      .set('Cookie', custCookie);

    expect(unauthorizedDocRes.status).toBe(403);

    const unauthorizedFileRes = await request(app)
      .get('/api/providers/documents/idProof/file')
      .set('Cookie', custCookie);

    expect(unauthorizedFileRes.status).toBe(403);
  });

  // 19. Skill Test Session, Masked Questions, Server-Side Evaluation, and 24h Cooldown
  it('skill test: session hides correctIndex/explanation, server grades test, updates status, and enforces 24h cooldown on failure', async () => {
    // 1. Seed 10 questions for electrician category
    const createdQuestions = [];
    for (let i = 1; i <= 10; i++) {
      const q = await Question.create({
        categoryId: 'electrician',
        categoryName: 'Electrician',
        questionText: `Electrician Safety Question ${i}: What is the proper procedure?`,
        options: ['Step A', 'Step B', 'Step C', 'Step D'],
        correctIndex: 1, // 'Step B' is correct for all
        explanation: 'Detailed safety protocol explanation',
        isActive: true,
      });
      createdQuestions.push(q);
    }

    // 2. Register provider
    const provUser = await request(app).post('/api/auth/register').send({
      name: 'Sunil Kadam',
      email: 'sunil.kadam@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543165',
      city: 'Mumbai',
      role: 'provider',
    });
    const provCookie = provUser.headers['set-cookie'];

    // 3. Provider starts test: GET /api/skill-test/electrician
    const startRes = await request(app).get('/api/skill-test/electrician').set('Cookie', provCookie);
    expect(startRes.status).toBe(200);
    expect(startRes.body.success).toBe(true);
    expect(startRes.body.sessionId).toBeDefined();
    expect(startRes.body.questions.length).toBe(10);
    expect(startRes.body.durationMinutes).toBe(15);
    expect(startRes.body.passMark).toBe(70);

    // CRITICAL SECURITY AUDIT: correctIndex and explanation MUST NOT BE LEAKED to client!
    startRes.body.questions.forEach((q) => {
      expect(q.correctIndex).toBeUndefined();
      expect(q.explanation).toBeUndefined();
      expect(q.options.length).toBe(4);
    });

    const sessionId = startRes.body.sessionId;
    const sessionQIds = startRes.body.questions.map((q) => q._id);

    // 4. Fix 2: Resuming active session returns the EXACT same session and questions
    const resumeRes = await request(app).get('/api/skill-test/electrician').set('Cookie', provCookie);
    expect(resumeRes.status).toBe(200);
    expect(resumeRes.body.sessionId).toBe(sessionId);
    expect(resumeRes.body.isResumed).toBe(true);
    expect(resumeRes.body.questions.length).toBe(10);
    expect(String(resumeRes.body.questions[0]._id)).toBe(String(startRes.body.questions[0]._id));

    // 5. Fix 1: Reject duplicate answers for same questionId (e.g. submitting all 4 options)
    const duplicateAnsRes = await request(app)
      .post('/api/skill-test/electrician/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: [
          { questionId: String(sessionQIds[0]), selectedIndex: 0 },
          { questionId: String(sessionQIds[0]), selectedIndex: 1 },
        ],
      });
    expect(duplicateAnsRes.status).toBe(400);
    expect(duplicateAnsRes.body.message).toContain('Duplicate answers');

    // Reject selectedIndex outside 0..3
    const badIndexRes = await request(app)
      .post('/api/skill-test/electrician/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: [{ questionId: String(sessionQIds[0]), selectedIndex: 5 }],
      });
    expect(badIndexRes.status).toBe(400);
    expect(badIndexRes.body.message).toContain('3');

    // Reject answer with unknown question ID
    const badAnsRes = await request(app)
      .post('/api/skill-test/electrician/submit')
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: [{ questionId: new mongoose.Types.ObjectId().toString(), selectedIndex: 1 }],
      });
    expect(badAnsRes.status).toBe(400);
    expect(badAnsRes.body.message).toContain('not assigned in this session');

    // 6. Submit 8 correct answers (80% -> passes Silver badge)
    const validAnswers = sessionQIds.map((qId, idx) => ({
      questionId: String(qId),
      selectedIndex: idx < 8 ? 1 : 0, // 8 correct (idx 1), 2 wrong (idx 0)
    }));

    // Fix 3: Concurrent submits: exactly one succeeds, the other gets 400
    const [sub1, sub2] = await Promise.all([
      request(app).post('/api/skill-test/electrician/submit').set('Cookie', provCookie).send({ sessionId, answers: validAnswers }),
      request(app).post('/api/skill-test/electrician/submit').set('Cookie', provCookie).send({ sessionId, answers: validAnswers }),
    ]);

    const statuses = [sub1.status, sub2.status].sort();
    expect(statuses).toEqual([200, 400]);

    const submitRes = sub1.status === 200 ? sub1 : sub2;
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.score).toBe(80);
    expect(submitRes.body.passed).toBe(true);
    expect(submitRes.body.badge).toBe('Silver');
    expect(submitRes.body.newStatus).toBe('waiting_for_approval');

    // Verify Provider status automatically updated in DB
    const updatedProv = await Provider.findOne({ email: 'sunil.kadam@fixnear.com' });
    expect(updatedProv.status).toBe('waiting_for_approval');
    expect(updatedProv.badges).toContain('Silver Certified');
    expect(updatedProv.skills[0].passed).toBe(true);
    expect(updatedProv.skills[0].badge).toBe('Silver');

    // 7. Test Fix 2: Unsubmitted expired session starts 24h cooldown
    const p2User = await request(app).post('/api/auth/register').send({
      name: 'Anup Kumar',
      email: 'anup.kumar@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543168',
      city: 'Mumbai',
      role: 'provider',
    });
    const p2Cookie = p2User.headers['set-cookie'];

    // Start session
    const p2Start = await request(app).get('/api/skill-test/electrician').set('Cookie', p2Cookie);
    expect(p2Start.status).toBe(200);

    // Simulate session expired (started 20 mins ago)
    await SkillTestSession.findByIdAndUpdate(p2Start.body.sessionId, {
      startedAt: new Date(Date.now() - 20 * 60 * 1000),
    });

    // Calling start again detects expired unsubmitted session -> 403 inCooldown!
    const p2ExpiredStart = await request(app).get('/api/skill-test/electrician').set('Cookie', p2Cookie);
    expect(p2ExpiredStart.status).toBe(403);
    expect(p2ExpiredStart.body.inCooldown).toBe(true);
    expect(p2ExpiredStart.body.message.toLowerCase()).toContain('expired');

    const expiredAttempt = await TestAttempt.findOne({ userId: p2User.body.user.id });
    expect(expiredAttempt).toBeDefined();
    expect(expiredAttempt.weakTopics).toContain('Time limit expired');
    expect(expiredAttempt.passed).toBe(false);

    const cooldownStartRes = await request(app).get('/api/skill-test/electrician').set('Cookie', p2Cookie);
    expect(cooldownStartRes.status).toBe(403);
    expect(cooldownStartRes.body.inCooldown).toBe(true);
    expect(cooldownStartRes.body.message.toLowerCase()).toContain('cooldown');
  });

  // 20. Extra Parts Quotation Flow (Itemized spare parts quotation & Customer Approval)
  it('extra parts quotation: provider submits itemized parts quote and customer approves to update invoice', async () => {
    // 1. Create assigned provider and customer
    const provUser = await request(app).post('/api/auth/register').send({
      name: 'Vijay Tech',
      email: 'vijay.tech@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543166',
      city: 'Mumbai',
      role: 'provider',
    });
    const provCookie = provUser.headers['set-cookie'];
    const pDoc = await Provider.findOneAndUpdate(
      { email: 'vijay.tech@fixnear.com' },
      {
        $set: {
          status: 'approved',
          isOnline: true,
          specialty: 'AC Repair',
          skills: [{ categoryId: 'ac-repair', categoryName: 'AC Repair', passed: true, testScore: 90 }],
        },
      },
      { new: true }
    );

    const cust = await request(app).post('/api/auth/register').send({
      name: 'Anjali Desai',
      email: 'anjali.desai@fixnear.com',
      password: 'SecurePass123',
      phone: '9876543167',
      city: 'Mumbai',
      role: 'customer',
    });
    const custCookie = cust.headers['set-cookie'];

    const service = await Service.create({
      serviceId: 'ac-servicing-quote-test',
      categoryId: 'ac-repair',
      category: 'AC Repair',
      title: 'AC Deep Clean & Repair',
      startingPrice: 499,
      isActive: true,
    });

    // Create booking and assign to provider (status: WORKING)
    const booking = await Booking.create({
      bookingId: 'FX-QUOTE1',
      customerId: cust.body.user ? cust.body.user.id : new mongoose.Types.ObjectId(),
      customerName: 'Anjali Desai',
      customerPhone: '9876543167',
      providerId: pDoc._id,
      providerName: pDoc.name,
      providerPhone: pDoc.phone,
      serviceId: service.serviceId,
      serviceTitle: service.title,
      basePrice: service.startingPrice,
      address: 'Bandra West, Mumbai',
      city: 'Mumbai',
      scheduledDate: '2026-12-31',
      timeSlot: 'Afternoon (01:00 PM - 04:00 PM)',
      status: 'WORKING',
      completionOtp: '8899',
      timeline: [],
      invoice: {
        invoiceNo: 'INV-QUOTE1',
        status: 'UNPAID',
        baseAmount: 499,
        extraAmount: 0,
        totalAmount: 499,
      },
    });

    // 2. Assigned provider submits quotation for burnt capacitor & copper pipe
    const quoteRes = await request(app)
      .post(`/api/bookings/${booking._id}/quotation`)
      .set('Cookie', provCookie)
      .send({
        items: [
          { desc: 'Running Capacitor 45uF', amount: 450, partNo: 'CAP-45UF' },
          { desc: 'Copper Pipe Flare Nut & Joint', amount: 350, partNo: 'COP-NUT-01' },
        ],
        reason: 'Capacitor swollen and flare nut leaking refrigerant gas',
      });

    expect(quoteRes.status).toBe(200);
    expect(quoteRes.body.success).toBe(true);
    expect(quoteRes.body.quotation.status).toBe('PENDING_CUSTOMER_APPROVAL');
    expect(quoteRes.body.quotation.total).toBe(800); // 450 + 350
    expect(quoteRes.body.quotation.items.length).toBe(2);

    // 3. Customer approves quotation
    const approveRes = await request(app)
      .patch(`/api/bookings/${booking._id}/quotation/approve`)
      .set('Cookie', custCookie);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);
    expect(approveRes.body.quotation.status).toBe('APPROVED');
    // Invoice is automatically updated: 499 base + 800 extra = 1299 total
    expect(approveRes.body.invoice.extraAmount).toBe(800);
    expect(approveRes.body.invoice.totalAmount).toBe(1299);

    // Verify DB consistency
    const updatedBooking = await Booking.findById(booking._id);
    expect(updatedBooking.quotation.status).toBe('APPROVED');
    expect(updatedBooking.invoice.totalAmount).toBe(1299);
  });

});
