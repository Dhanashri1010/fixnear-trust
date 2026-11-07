import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Category } from '../models/Category.js';
import { Provider } from '../models/Provider.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Dispute } from '../models/Dispute.js';
import { Setting } from '../models/Setting.js';
import { Question } from '../models/Question.js';
import { SkillTestSession } from '../models/SkillTestSession.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { AuditLog } from '../models/AuditLog.js';
import { Payment } from '../models/Payment.js';

let mongod;

const TEST_RAZORPAY_KEY = 'rzp_test_mockKeyId12345';
const TEST_RAZORPAY_SECRET = 'mock_secret_key_abcdef1234567890';

beforeAll(async () => {
  process.env.RAZORPAY_KEY_ID = TEST_RAZORPAY_KEY;
  process.env.RAZORPAY_KEY_SECRET = TEST_RAZORPAY_SECRET;

  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'fixnear_e2e_test',
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
  await Category.deleteMany({});
  await Provider.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Dispute.deleteMany({});
  await Setting.deleteMany({});
  await Question.deleteMany({});
  await SkillTestSession.deleteMany({});
  await TestAttempt.deleteMany({});
  await AuditLog.collection.deleteMany({});
  await Payment.deleteMany({});

  // Seed default platform settings
  await Setting.create({
    key: 'global_settings',
    platformFee: 20,
    platformCommissionPercent: 10,
    skillTestTimeLimitMinutes: 15,
    skillTestPassingScore: 70,
    skillTestQuestionsCount: 2,
    activeAdminCount: 1,
  });
});

describe('Phase E - Security & Data Protection Controls', () => {

  it('AuditLog records are strictly append-only (rejects update and delete operations)', async () => {
    const adminUser = await User.create({
      name: 'System Auditor',
      email: 'auditor@fixnear.com',
      password: 'AuditPassword123',
      role: 'admin',
    });

    const log = await AuditLog.create({
      adminId: adminUser._id,
      adminName: adminUser.name,
      adminEmail: adminUser.email,
      action: 'INITIAL_LOG',
      targetType: 'User',
      targetId: adminUser._id,
      details: 'Audit record created.',
    });

    expect(log._id).toBeDefined();

    // 1. Rejects updateOne
    await expect(
      AuditLog.updateOne({ _id: log._id }, { action: 'TAMPERED_ACTION' })
    ).rejects.toThrow('AuditLog is append-only and cannot be modified or deleted.');

    // 2. Rejects findOneAndUpdate
    await expect(
      AuditLog.findOneAndUpdate({ _id: log._id }, { action: 'TAMPERED_ACTION' })
    ).rejects.toThrow('AuditLog is append-only and cannot be modified or deleted.');

    // 3. Rejects deleteOne
    await expect(
      AuditLog.deleteOne({ _id: log._id })
    ).rejects.toThrow('AuditLog is append-only and cannot be modified or deleted.');

    // 4. Rejects deleteMany
    await expect(
      AuditLog.deleteMany({ _id: log._id })
    ).rejects.toThrow('AuditLog is append-only and cannot be modified or deleted.');

    // Verify record remains untouched
    const untouched = await AuditLog.findById(log._id);
    expect(untouched.action).toBe('INITIAL_LOG');
  });

  it('atomically prevents deactivating the last remaining active admin', async () => {
    const adminUser = await User.create({
      name: 'Sole Administrator',
      email: 'soleadmin@fixnear.com',
      password: 'AdminPassword123',
      role: 'admin',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'soleadmin@fixnear.com', password: 'AdminPassword123' });
    const adminCookie = loginRes.headers['set-cookie'];

    // 1. Admin creates a second administrator
    const createRes = await request(app)
      .post('/api/admin/admins')
      .set('Cookie', adminCookie)
      .send({
        name: 'Second Admin',
        email: 'second@fixnear.com',
        password: 'Password99',
      });
    expect(createRes.status).toBe(201);
    const secondAdminId = createRes.body.admin._id;

    // 2. Admin cannot deactivate their own account
    const selfDeact = await request(app)
      .post(`/api/admin/admins/${adminUser._id}/deactivate`)
      .set('Cookie', adminCookie);
    expect(selfDeact.status).toBe(400);

    // 3. Deactivate second administrator
    const deactSecond = await request(app)
      .post(`/api/admin/admins/${secondAdminId}/deactivate`)
      .set('Cookie', adminCookie);
    expect(deactSecond.status).toBe(200);

    // 4. Sole remaining active admin cannot be deactivated
    const deactLast = await request(app)
      .post(`/api/admin/admins/${adminUser._id}/deactivate`)
      .set('Cookie', adminCookie);
    expect(deactLast.status).toBe(400);
  });

  it('mustChangePassword: true restricts user to change-password, logout, and /me until changed', async () => {
    const user = await User.create({
      name: 'Temp Password Admin',
      email: 'mustchange@fixnear.com',
      password: 'InitialPassword123',
      role: 'admin',
      mustChangePassword: true,
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mustchange@fixnear.com', password: 'InitialPassword123' });
    const sessionCookie = loginRes.headers['set-cookie'];

    // 1. Calling standard protected route is rejected with 403 and MUST_CHANGE_PASSWORD
    const blockedRes = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', sessionCookie);
    expect(blockedRes.status).toBe(403);
    expect(blockedRes.body.code).toBe('MUST_CHANGE_PASSWORD');

    // 2. /api/auth/me is permitted so frontend can display identity
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.mustChangePassword).toBe(true);

    // 3. Attempting to change with invalid / non-compliant password fails
    const weakChange = await request(app)
      .patch('/api/auth/change-password')
      .set('Cookie', sessionCookie)
      .send({
        currentPassword: 'InitialPassword123',
        newPassword: 'short', // invalid
      });
    expect(weakChange.status).toBe(400);

    // 4. Change password with valid compliant password
    const validChange = await request(app)
      .patch('/api/auth/change-password')
      .set('Cookie', sessionCookie)
      .send({
        currentPassword: 'InitialPassword123',
        newPassword: 'BrandNewSecurePass123',
      });
    expect(validChange.status).toBe(200);
    expect(validChange.body.success).toBe(true);
    const updatedCookie = validChange.headers['set-cookie'];

    // 5. User flag is cleared and standard protected routes are now accessible
    const unblockedRes = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', updatedCookie);
    expect(unblockedRes.status).toBe(200);
    expect(unblockedRes.body.success).toBe(true);
  });

  it('passwordChangedAt invalidates tokens issued prior to password modification', async () => {
    const user = await User.create({
      name: 'Token Invalidation User',
      email: 'tokenuser@fixnear.com',
      password: 'OldOriginalPass123',
      role: 'customer',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tokenuser@fixnear.com', password: 'OldOriginalPass123' });
    const oldCookie = loginRes.headers['set-cookie'];

    // Ensure at least 1.1 second difference between JWT iat and passwordChangedAt
    await new Promise((r) => setTimeout(r, 1100));

    const changeRes = await request(app)
      .patch('/api/auth/change-password')
      .set('Cookie', oldCookie)
      .send({
        currentPassword: 'OldOriginalPass123',
        newPassword: 'NewUpdatedPass123',
      });
    expect(changeRes.status).toBe(200);

    // Old token should now be rejected with 401
    const oldTokenRes = await request(app)
      .get('/api/bookings/mine')
      .set('Cookie', oldCookie);
    expect(oldTokenRes.status).toBe(401);
    expect(oldTokenRes.body.message).toContain('Password was changed recently');
  });
});

describe('Phase E - Payment Safety & Razorpay Verification', () => {

  it('ignores client passed amount and computes exact bill strictly from server booking state', async () => {
    const customer = await User.create({
      name: 'Paying Customer',
      email: 'paying@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });
    const cLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'paying@fixnear.com', password: 'SecurePassword123' });
    const cCookie = cLogin.headers['set-cookie'];

    const booking = await Booking.create({
      bookingId: 'BK-SAFETY-01',
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: '9876543210',
      serviceId: 'srv-ac',
      serviceTitle: 'Split AC Servicing',
      basePrice: 599,
      platformFeeSnapshot: 25,
      commissionRateSnapshot: 10,
      address: '101 Marine Drive',
      city: 'Mumbai',
      scheduledDate: '2026-12-05',
      timeSlot: 'Morning',
      status: 'COMPLETED',
      completionOtp: '4455',
      paymentStatus: 'PENDING',
    });

    // Client passes a tampered amount (e.g. ₹1 instead of ₹624)
    const orderRes = await request(app)
      .post('/api/payments/order')
      .set('Cookie', cCookie)
      .send({
        bookingId: booking.bookingId,
        amount: 1, // Malicious client attempt
      });

    expect(orderRes.status).toBe(200);
    expect(orderRes.body.success).toBe(true);
    // Server computes: basePrice (599) + platformFeeSnapshot (25) = 624
    expect(orderRes.body.amount).toBe(624);
  });

  it('rejects invalid Razorpay HMAC signature with 400', async () => {
    const customer = await User.create({
      name: 'Signature Customer',
      email: 'sig@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });
    const cLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sig@fixnear.com', password: 'SecurePassword123' });
    const cCookie = cLogin.headers['set-cookie'];

    const booking = await Booking.create({
      bookingId: 'BK-SIG-01',
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: '9876543210',
      address: '101 Marine Drive',
      city: 'Mumbai',
      scheduledDate: '2026-12-05',
      timeSlot: 'Morning',
      serviceId: 'srv-ac',
      serviceTitle: 'Split AC Servicing',
      basePrice: 599,
      status: 'COMPLETED',
      completionOtp: '1122',
      paymentStatus: 'PENDING',
    });

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', cCookie)
      .send({
        bookingId: booking.bookingId,
        razorpayOrderId: 'order_fake_123',
        razorpayPaymentId: 'pay_fake_456',
        razorpaySignature: 'forged_or_invalid_signature_hex_value',
      });

    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.success).toBe(false);
    expect(verifyRes.body.message).toContain('Invalid transaction signature');
  });

  it('repeated verify calls with valid HMAC signature are idempotent without double marking', async () => {
    const customer = await User.create({
      name: 'Idempotent Customer',
      email: 'idem@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });
    const cLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'idem@fixnear.com', password: 'SecurePassword123' });
    const cCookie = cLogin.headers['set-cookie'];

    const booking = await Booking.create({
      bookingId: 'BK-IDEM-01',
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: '9876543210',
      address: '101 Marine Drive',
      city: 'Mumbai',
      scheduledDate: '2026-12-05',
      timeSlot: 'Morning',
      serviceId: 'srv-ac',
      serviceTitle: 'Split AC Servicing',
      basePrice: 500,
      platformFeeSnapshot: 20,
      commissionRateSnapshot: 10,
      status: 'COMPLETED',
      completionOtp: '9988',
      paymentStatus: 'PENDING',
    });

    const orderId = 'order_valid_7788';
    const paymentId = 'pay_valid_9900';
    const bodyStr = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', TEST_RAZORPAY_SECRET)
      .update(bodyStr)
      .digest('hex');

    // First verify call
    const firstVerify = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', cCookie)
      .send({
        bookingId: booking.bookingId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
      });

    expect(firstVerify.status).toBe(200);
    expect(firstVerify.body.success).toBe(true);

    const updatedBooking = await Booking.findById(booking._id);
    expect(updatedBooking.paymentStatus).toBe('PAID');
    expect(updatedBooking.paymentMethod).toBe('ONLINE');

    // Second verify call with same credentials (network retry / user refresh)
    const secondVerify = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', cCookie)
      .send({
        bookingId: booking.bookingId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
      });

    expect(secondVerify.status).toBe(200);
    expect(secondVerify.body.success).toBe(true);
    expect(secondVerify.body.message).toContain('already been confirmed');
  });
});

describe('Full Customer & Provider End-to-End Lifecycle', () => {

  it('completes the entire 11-step journey: signup -> skill test -> approve -> book -> offer & accept -> quote & approve -> finish code -> online payment -> review -> dispute -> resolve refund', async () => {
    // ---------------------------------------------------------------
    // Setup Service & Category
    // ---------------------------------------------------------------
    const category = await Category.create({
      categoryId: 'electrical-care',
      name: 'Electrical Repairs',
      description: 'Certified electrical rewiring and appliance care',
    });

    const service = await Service.create({
      serviceId: 'fan-motor-rewire',
      categoryId: category.categoryId,
      category: category.name,
      title: 'Ceiling Fan Motor Repair',
      startingPrice: 350,
      isActive: true,
    });

    // Seed 2 skill test questions
    await Question.create([
      {
        questionId: 'q-elec-01',
        categoryId: category.categoryId,
        categoryName: category.name,
        questionText: 'What is the first safety step before opening a ceiling fan regulator?',
        options: [
          'Switch off main MCB breaker power',
          'Touch wires with bare hands',
          'Sprinkle water on terminals',
          'Use a metal spoon to probe socket',
        ],
        correctIndex: 0,
      },
      {
        questionId: 'q-elec-02',
        categoryId: category.categoryId,
        categoryName: category.name,
        questionText: 'Which tool should always be used to check for live voltage?',
        options: [
          'Calibrated neon or digital voltage tester',
          'Bare copper nail',
          'Wet sponge',
          'Plastic pen',
        ],
        correctIndex: 0,
      },
    ]);

    // Admin account
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@fixnear.com',
      password: 'AdminPassword123',
      role: 'admin',
    });
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@fixnear.com', password: 'AdminPassword123' });
    const adminCookie = adminLoginRes.headers['set-cookie'];

    // ---------------------------------------------------------------
    // Step 1: Provider Signs Up & Registers Profile
    // ---------------------------------------------------------------
    const provRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sunil Patil',
        email: 'sunil.patil@fixnear.com',
        password: 'TechPassword123',
        phone: '9820011223',
        city: 'Mumbai',
        role: 'provider',
      });
    expect(provRegRes.status).toBe(201);
    const provCookie = provRegRes.headers['set-cookie'];

    const profileRes = await request(app)
      .post('/api/providers/register')
      .set('Cookie', provCookie)
      .send({
        skills: [category.categoryId],
        experienceYears: 6,
        idProofUrl: 'mock_uploaded_id_file.pdf',
        certificateUrls: ['mock_cert.pdf'],
        travelDistanceKm: 15,
        serviceAreas: ['Andheri', 'Bandra'],
      });
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.success).toBe(true);

    // ---------------------------------------------------------------
    // Step 2: Provider Takes & Passes Skill Test
    // ---------------------------------------------------------------
    const startTestRes = await request(app)
      .get(`/api/skill-test/${category.categoryId}`)
      .set('Cookie', provCookie);
    expect(startTestRes.status).toBe(200);
    expect(startTestRes.body.success).toBe(true);
    const { sessionId, questions } = startTestRes.body;
    expect(questions.length).toBe(2);

    // Submit correct answers
    const submitTestRes = await request(app)
      .post(`/api/skill-test/${category.categoryId}/submit`)
      .set('Cookie', provCookie)
      .send({
        sessionId,
        answers: questions.map((q) => ({
          questionId: String(q._id),
          selectedIndex: 0, // all correct
        })),
      });
    expect(submitTestRes.status).toBe(200);
    expect(submitTestRes.body.passed).toBe(true);
    expect(submitTestRes.body.score).toBe(100);

    // ---------------------------------------------------------------
    // Step 3: Admin Approves Provider & Provider Goes Online
    // ---------------------------------------------------------------
    const providerDoc = await Provider.findOne({ userId: provRegRes.body.user.id });
    expect(providerDoc).toBeDefined();

    const approveRes = await request(app)
      .post(`/api/admin/approvals/${providerDoc._id}/approve`)
      .set('Cookie', adminCookie)
      .send({ note: 'Credentials and electrical assessment verified.' });
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);

    // Provider sets online status
    const statusRes = await request(app)
      .patch('/api/providers/me/status')
      .set('Cookie', provCookie)
      .send({ isOnline: true });
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.isOnline).toBe(true);

    // ---------------------------------------------------------------
    // Step 4: Customer Signs Up & Places Booking
    // ---------------------------------------------------------------
    const custRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Kavita Deshmukh',
        email: 'kavita@fixnear.com',
        password: 'CustPassword123',
        phone: '9819988776',
        city: 'Mumbai',
        role: 'customer',
      });
    expect(custRegRes.status).toBe(201);
    const custCookie = custRegRes.headers['set-cookie'];

    const createBookingRes = await request(app)
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        serviceId: service.serviceId,
        address: 'B-204 Green Heights, Linking Road',
        city: 'Mumbai',
        scheduledDate: '2026-12-10',
        timeSlot: 'Morning (09:00 AM - 12:00 PM)',
        notes: 'Ceiling fan makes humming sound but does not spin.',
      });
    expect(createBookingRes.status).toBe(201);
    expect(createBookingRes.body.success).toBe(true);
    const bookingId = createBookingRes.body.booking.bookingId;
    const finishCode = createBookingRes.body.booking.completionOtp;
    expect(finishCode).toBeDefined();

    // ---------------------------------------------------------------
    // Step 5: Provider Receives Offer & Accepts
    // ---------------------------------------------------------------
    const acceptRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', provCookie)
      .send({ status: 'ACCEPTED' });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.booking.status).toBe('ACCEPTED');
    expect(acceptRes.body.booking.providerName).toBe('Sunil Patil');

    // ---------------------------------------------------------------
    // Step 6: Provider Submits Extra Quotation & Customer Approves
    // ---------------------------------------------------------------
    const quoteRes = await request(app)
      .post(`/api/bookings/${bookingId}/quotation`)
      .set('Cookie', provCookie)
      .send({
        items: [
          { desc: 'New Heavy Duty 2.5 mfd Capacitor', amount: 150 },
          { desc: 'Ball Bearing Replacement', amount: 200 },
        ],
      });
    expect(quoteRes.status).toBe(200);
    expect(quoteRes.body.quotation.status).toBe('PENDING_CUSTOMER_APPROVAL');
    expect(quoteRes.body.quotation.total).toBe(350);

    // Customer approves quotation
    const approveQuoteRes = await request(app)
      .patch(`/api/bookings/${bookingId}/quotation/approve`)
      .set('Cookie', custCookie);
    expect(approveQuoteRes.status).toBe(200);
    expect(approveQuoteRes.body.quotation.status).toBe('APPROVED');

    // ---------------------------------------------------------------
    // Step 7: Technician Completes Job & Verifies 4-Digit Finish Code
    // ---------------------------------------------------------------
    // Move to ON_THE_WAY -> WORKING
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'ON_THE_WAY' });
    await request(app).patch(`/api/bookings/${bookingId}/status`).set('Cookie', provCookie).send({ status: 'WORKING' });

    // Verify completion finish code
    const completeRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Cookie', provCookie)
      .send({
        status: 'COMPLETED',
        finishCode,
      });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.booking.status).toBe('COMPLETED');
    expect(completeRes.body.booking.paymentStatus).toBe('CASH_RECEIVED');

    // ---------------------------------------------------------------
    // Step 8: Customer Creates Online Order & Verifies via Razorpay HMAC
    // ---------------------------------------------------------------
    const orderRes = await request(app)
      .post('/api/payments/order')
      .set('Cookie', custCookie)
      .send({ bookingId });
    expect(orderRes.status).toBe(200);
    // Base (350) + Quotation (350) + Platform fee snapshot (20) = 720
    expect(orderRes.body.amount).toBe(720);

    const rzpOrderId = orderRes.body.orderId;
    const rzpPaymentId = 'pay_e2e_patil_001';
    const sigBody = `${rzpOrderId}|${rzpPaymentId}`;
    const validSig = crypto
      .createHmac('sha256', TEST_RAZORPAY_SECRET)
      .update(sigBody)
      .digest('hex');

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', custCookie)
      .send({
        bookingId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: validSig,
      });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.paymentStatus).toBe('PAID');

    // Verify Payment document is recorded
    const paymentDoc = await Payment.findOne({ razorpayOrderId: rzpOrderId });
    expect(paymentDoc).toBeDefined();
    expect(paymentDoc.status).toBe('PAID');
    expect(paymentDoc.amount).toBe(720);

    // ---------------------------------------------------------------
    // Step 9: Customer Reviews Experience
    // ---------------------------------------------------------------
    const reviewRes = await request(app)
      .post(`/api/bookings/${bookingId}/review`)
      .set('Cookie', custCookie)
      .send({
        rating: 5,
        comment: 'Excellent workmanship! Fixed the humming fan quickly and cleanly.',
      });
    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.success).toBe(true);

    // ---------------------------------------------------------------
    // Step 10: Customer Raises Complaint
    // ---------------------------------------------------------------
    const disputeRes = await request(app)
      .post(`/api/bookings/${bookingId}/complaint`)
      .set('Cookie', custCookie)
      .send({
        reason: 'Poor service quality',
        notes: 'Fan started vibrating slightly at high speed after 3 days.',
      });
    expect(disputeRes.status).toBe(201);
    expect(disputeRes.body.dispute.status).toBe('OPEN');

    // ---------------------------------------------------------------
    // Step 11: Admin Resolves Dispute with Refund
    // ---------------------------------------------------------------
    const disputeId = disputeRes.body.dispute._id;
    const resolveRes = await request(app)
      .post(`/api/admin/disputes/${disputeId}/resolve`)
      .set('Cookie', adminCookie)
      .send({
        decision: 'REFUND_CUSTOMER',
        refundAmount: 200,
        providerPayout: 520,
        note: 'Partial refund approved for minor alignment issue. Technician re-inspected.',
      });
    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.success).toBe(true);
    expect(resolveRes.body.dispute.status).toBe('RESOLVED');

    // Dispute record cannot be resolved twice (must be 409)
    const duplicateResolve = await request(app)
      .post(`/api/admin/disputes/${disputeId}/resolve`)
      .set('Cookie', adminCookie)
      .send({
        decision: 'REFUND_CUSTOMER',
        refundAmount: 200,
        providerPayout: 520,
        note: 'Attempting duplicate resolution on already resolved ticket.',
      });
    expect(duplicateResolve.status).toBe(409);
  });
});
