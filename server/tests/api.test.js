import crypto from 'crypto';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.MONGOMS_SYSTEM_BINARY = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';

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

});
