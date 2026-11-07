process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'fixnear_super_secure_jwt_secret_dev_key_2026_xyz';
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

  // 2. Booking rejection when no verified online provider matches
  it('rejects booking creation with friendly message when no verified online provider is available', async () => {
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

    // Create a service
    const service = await Service.create({
      serviceId: 'ac-foam-jet',
      categoryId: 'ac-cooling',
      category: 'Air Conditioning',
      title: 'Split AC Foam Jet Deep Clean',
      startingPrice: 599,
      isActive: true,
    });

    // Try booking when NO provider exists in Mumbai
    const bookRes = await request(app)
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

    expect(bookRes.status).toBe(400);
    expect(bookRes.body.success).toBe(false);
    expect(bookRes.body.message).toContain('do not have a verified, online technician available');
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

});
