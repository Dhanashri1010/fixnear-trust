import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
import { SupportTicket } from '../models/SupportTicket.js';
import { Notification } from '../models/Notification.js';
import { FailedCleanup } from '../models/FailedCleanup.js';
import { Counter, getNextInvoiceNumber } from '../models/Counter.js';
import { redactSensitiveData } from '../middleware/errorMonitoring.js';
import { validateScriptPassword } from '../scripts/createAdmin.js';

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
  await Counter.deleteMany({});
  await SupportTicket.deleteMany({});
  await Notification.deleteMany({});
  await FailedCleanup.deleteMany({});

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

  it('rejects verify if razorpayOrderId does not match booking record', async () => {
    const customer = await User.create({
      name: 'Mismatch Customer',
      email: 'mismatch@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });
    const cLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mismatch@fixnear.com', password: 'SecurePassword123' });
    const cCookie = cLogin.headers['set-cookie'];

    const booking = await Booking.create({
      bookingId: 'BK-MISMATCH-01',
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
      status: 'COMPLETED',
      completionOtp: '1122',
      paymentStatus: 'PENDING',
      razorpayOrderId: 'order_actual_12345',
    });

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', cCookie)
      .send({
        bookingId: booking.bookingId,
        razorpayOrderId: 'order_different_99999',
        razorpayPaymentId: 'pay_test_123',
        razorpaySignature: 'any_signature',
      });

    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.message).toContain('Payment order ID does not match');
  });

  it('rejects verify if user does not own the booking', async () => {
    const ownerCustomer = await User.create({
      name: 'Owner Customer',
      email: 'owner@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });
    const attackerCustomer = await User.create({
      name: 'Attacker Customer',
      email: 'attacker@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });
    const aLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'attacker@fixnear.com', password: 'SecurePassword123' });
    const aCookie = aLogin.headers['set-cookie'];

    const booking = await Booking.create({
      bookingId: 'BK-OWN-01',
      customerId: ownerCustomer._id,
      customerName: ownerCustomer.name,
      customerPhone: '9876543210',
      address: '101 Marine Drive',
      city: 'Mumbai',
      scheduledDate: '2026-12-05',
      timeSlot: 'Morning',
      serviceId: 'srv-ac',
      serviceTitle: 'Split AC Servicing',
      basePrice: 500,
      status: 'COMPLETED',
      completionOtp: '1122',
      paymentStatus: 'PENDING',
      razorpayOrderId: 'order_owner_123',
    });

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', aCookie)
      .send({
        bookingId: booking.bookingId,
        razorpayOrderId: 'order_owner_123',
        razorpayPaymentId: 'pay_test_123',
        razorpaySignature: 'any_signature',
      });

    expect(verifyRes.status).toBe(403);
    expect(verifyRes.body.message).toContain('Forbidden');
  });

  it('rejects verify if payment record amount does not match current server total', async () => {
    const customer = await User.create({
      name: 'Amount Customer',
      email: 'amountcheck@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });
    const cLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amountcheck@fixnear.com', password: 'SecurePassword123' });
    const cCookie = cLogin.headers['set-cookie'];

    const booking = await Booking.create({
      bookingId: 'BK-AMT-01',
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
      status: 'COMPLETED',
      completionOtp: '1122',
      paymentStatus: 'PENDING',
      razorpayOrderId: 'order_amt_123',
    });

    // Stored payment record amount is tampered / mismatched (e.g. ₹400 instead of ₹520)
    await Payment.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: customer._id,
      amount: 400, // Mismatched amount
      currency: 'INR',
      method: 'ONLINE',
      status: 'INITIATED',
      razorpayOrderId: 'order_amt_123',
    });

    const bodyStr = `order_amt_123|pay_amt_123`;
    const sig = crypto.createHmac('sha256', TEST_RAZORPAY_SECRET).update(bodyStr).digest('hex');

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', cCookie)
      .send({
        bookingId: booking.bookingId,
        razorpayOrderId: 'order_amt_123',
        razorpayPaymentId: 'pay_amt_123',
        razorpaySignature: sig,
      });

    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.message).toContain('does not match current server-calculated total');
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
      platformFeeSnapshot: 20,
      status: 'COMPLETED',
      completionOtp: '1122',
      paymentStatus: 'PENDING',
      razorpayOrderId: 'order_fake_123',
    });

    await Payment.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: customer._id,
      amount: 619,
      currency: 'INR',
      method: 'ONLINE',
      status: 'INITIATED',
      razorpayOrderId: 'order_fake_123',
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
      razorpayOrderId: 'order_valid_7788',
    });

    const orderId = 'order_valid_7788';
    const paymentId = 'pay_valid_9900';
    const bodyStr = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', TEST_RAZORPAY_SECRET)
      .update(bodyStr)
      .digest('hex');

    await Payment.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: customer._id,
      amount: 520,
      currency: 'INR',
      method: 'ONLINE',
      status: 'INITIATED',
      razorpayOrderId: orderId,
    });

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

  it('credits provider earnings exactly once under two simultaneous verifies', async () => {
    const provUser = await User.create({
      name: 'Rohan Tech',
      email: 'rohan.concurrent@fixnear.com',
      password: 'SecurePassword123',
      role: 'provider',
      city: 'Mumbai',
    });
    const provider = await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: '9988776655',
      city: 'Mumbai',
      status: 'approved',
      isOnline: true,
      earningsToday: 0,
      earningsWeek: 0,
      earningsMonth: 0,
    });

    const customer = await User.create({
      name: 'Concurrent Customer',
      email: 'concurrent@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });
    const cLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'concurrent@fixnear.com', password: 'SecurePassword123' });
    const cCookie = cLogin.headers['set-cookie'];

    const booking = await Booking.create({
      bookingId: 'BK-CONCURRENT-01',
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: '9876543210',
      address: '101 Marine Drive',
      city: 'Mumbai',
      scheduledDate: '2026-12-05',
      timeSlot: 'Morning',
      providerId: provider._id,
      serviceId: 'srv-ac',
      serviceTitle: 'Split AC Servicing',
      basePrice: 500,
      platformFeeSnapshot: 20,
      commissionRateSnapshot: 10, // 10% commission on 500 = 50 -> net payout = 450
      status: 'COMPLETED',
      completionOtp: '7788',
      paymentStatus: 'PENDING',
      razorpayOrderId: 'order_concurrent_111',
    });

    const orderId = 'order_concurrent_111';
    const paymentId = 'pay_concurrent_222';
    const validSignature = crypto
      .createHmac('sha256', TEST_RAZORPAY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    await Payment.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: customer._id,
      providerId: provider._id,
      amount: 520,
      currency: 'INR',
      method: 'ONLINE',
      status: 'INITIATED',
      razorpayOrderId: orderId,
    });

    // Execute two simultaneous verifies concurrently
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/payments/verify')
        .set('Cookie', cCookie)
        .send({
          bookingId: booking.bookingId,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: validSignature,
        }),
      request(app)
        .post('/api/payments/verify')
        .set('Cookie', cCookie)
        .send({
          bookingId: booking.bookingId,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: validSignature,
        }),
    ]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // Database verification: provider must receive payout EXACTLY ONCE (450), never doubled (900)
    const freshProvider = await Provider.findById(provider._id);
    expect(freshProvider.earningsToday).toBe(450);
  });

  it('cash payment: blocks cash confirmation if online payment initiated within 15 minutes, allows after expiration', async () => {
    const provUser = await User.create({
      name: 'Cash Specialist',
      email: 'cash.spec@fixnear.com',
      password: 'SecurePassword123',
      role: 'provider',
      city: 'Mumbai',
    });
    const provider = await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: '9871122334',
      city: 'Mumbai',
      status: 'approved',
      isOnline: true,
      earningsToday: 0,
    });
    const pLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cash.spec@fixnear.com', password: 'SecurePassword123' });
    const pCookie = pLogin.headers['set-cookie'];

    const customer = await User.create({
      name: 'Cash Customer',
      email: 'cash.cust@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });

    const booking = await Booking.create({
      bookingId: 'BK-CASH-GUARD-01',
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: '9876543210',
      address: '101 Marine Drive',
      city: 'Mumbai',
      scheduledDate: '2026-12-05',
      timeSlot: 'Morning',
      providerId: provider._id,
      serviceId: 'srv-ac',
      serviceTitle: 'Split AC Servicing',
      basePrice: 400,
      platformFeeSnapshot: 20,
      commissionRateSnapshot: 10, // 400 - 40 = 360 payout
      status: 'COMPLETED',
      completionOtp: '3344',
      paymentStatus: 'PENDING',
    });

    // 1. Create an active INITIATED online payment from 3 minutes ago
    const activePayment = await Payment.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: customer._id,
      providerId: provider._id,
      amount: 420,
      currency: 'INR',
      method: 'ONLINE',
      status: 'INITIATED',
      razorpayOrderId: 'order_guard_001',
      createdAt: new Date(Date.now() - 3 * 60 * 1000), // 3 min ago
    });

    // Attempting cash confirmation must be rejected
    const blockedRes = await request(app)
      .post('/api/payments/cash-confirm')
      .set('Cookie', pCookie)
      .send({ bookingId: booking.bookingId });

    expect(blockedRes.status).toBe(400);
    expect(blockedRes.body.message).toContain('started an online payment within the last 15 minutes');

    // 2. Age the initiated payment beyond 15 minutes (e.g. 20 minutes ago)
    await Payment.collection.updateOne(
      { _id: activePayment._id },
      { $set: { createdAt: new Date(Date.now() - 20 * 60 * 1000) } }
    );

    // Now cash confirmation must succeed
    const successRes = await request(app)
      .post('/api/payments/cash-confirm')
      .set('Cookie', pCookie)
      .send({ bookingId: booking.bookingId });

    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);
    expect(successRes.body.paymentStatus).toBe('PAID');

    const freshBooking = await Booking.findById(booking._id);
    expect(freshBooking.paymentStatus).toBe('PAID');
    expect(freshBooking.paymentMethod).toBe('CASH');

    const freshProv = await Provider.findById(provider._id);
    expect(freshProv.earningsToday).toBe(360);
  });

  it('webhook: rejects missing signature header or missing secret with 400', async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;

    const resNoSecret = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', 'some_sig')
      .send(JSON.stringify({ event: 'payment.captured' }));

    expect(resNoSecret.status).toBe(400);
    expect(resNoSecret.body.message).toContain('Missing signature header or RAZORPAY_WEBHOOK_SECRET');

    process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret_123';

    const resNoSig = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ event: 'payment.captured' }));

    expect(resNoSig.status).toBe(400);
    expect(resNoSig.body.message).toContain('Missing signature header or RAZORPAY_WEBHOOK_SECRET');
  });

  it('webhook: rejects invalid HMAC signature with 400', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret_123';

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', 'forged_webhook_signature_abcdef1234567890')
      .send(JSON.stringify({ event: 'payment.captured' }));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid webhook signature');
  });

  it('webhook: valid webhook with raw request body marks booking paid once and is idempotent on repeat', async () => {
    const webhookSecret = 'whsec_secure_test_999';
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    const customer = await User.create({
      name: 'Webhook Customer',
      email: 'wh.cust@fixnear.com',
      password: 'SecurePassword123',
      role: 'customer',
      city: 'Mumbai',
    });

    const provUser = await User.create({
      name: 'Webhook Specialist',
      email: 'wh.spec@fixnear.com',
      password: 'SecurePassword123',
      role: 'provider',
      city: 'Mumbai',
    });
    const provider = await Provider.create({
      userId: provUser._id,
      name: provUser.name,
      email: provUser.email,
      phone: '9811122233',
      city: 'Mumbai',
      status: 'approved',
      isOnline: true,
      earningsToday: 0,
    });

    const orderId = 'order_wh_live_001';
    const paymentId = 'pay_wh_live_001';

    const booking = await Booking.create({
      bookingId: 'BK-WH-01',
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: '9876543210',
      address: '101 Marine Drive',
      city: 'Mumbai',
      scheduledDate: '2026-12-05',
      timeSlot: 'Morning',
      providerId: provider._id,
      serviceId: 'srv-ac',
      serviceTitle: 'Split AC Servicing',
      basePrice: 600,
      platformFeeSnapshot: 20,
      commissionRateSnapshot: 10, // 600 - 60 = 540 payout
      status: 'COMPLETED',
      completionOtp: '5566',
      paymentStatus: 'PENDING',
      razorpayOrderId: orderId,
    });

    await Payment.create({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: customer._id,
      providerId: provider._id,
      amount: 620,
      currency: 'INR',
      method: 'ONLINE',
      status: 'INITIATED',
      razorpayOrderId: orderId,
    });

    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: 62000,
            status: 'captured',
          },
        },
      },
    });

    const validSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(Buffer.from(rawPayload))
      .digest('hex');

    // 1. First webhook delivery
    const res1 = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', validSig)
      .send(rawPayload);

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    const freshBooking = await Booking.findById(booking._id);
    expect(freshBooking.paymentStatus).toBe('PAID');
    expect(freshBooking.paymentMethod).toBe('ONLINE');

    const freshProv = await Provider.findById(provider._id);
    expect(freshProv.earningsToday).toBe(540);

    // 2. Second webhook delivery (idempotency retry)
    const res2 = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', validSig)
      .send(rawPayload);

    expect(res2.status).toBe(200);

    // Earnings remain credited once
    const provAfterSecond = await Provider.findById(provider._id);
    expect(provAfterSecond.earningsToday).toBe(540);
  });

  it('webhook: records refund on Payment record when refund.processed event arrives', async () => {
    const webhookSecret = 'whsec_secure_test_999';
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    const dummyBookingId = new mongoose.Types.ObjectId();
    const dummyCustId = new mongoose.Types.ObjectId();

    const payment = await Payment.create({
      bookingId: dummyBookingId,
      customerId: dummyCustId,
      bookingNumber: 'BK-REFUND-01',
      amount: 500,
      currency: 'INR',
      method: 'ONLINE',
      status: 'PAID',
      razorpayPaymentId: 'pay_refund_target_01',
      razorpayOrderId: 'order_refund_01',
    });

    const rawPayload = JSON.stringify({
      event: 'refund.processed',
      payload: {
        refund: {
          entity: {
            id: 'rfnd_target_999',
            payment_id: 'pay_refund_target_01',
            amount: 20000, // ₹200 (partial)
          },
        },
      },
    });

    const validSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(Buffer.from(rawPayload))
      .digest('hex');

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', validSig)
      .send(rawPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const freshPayment = await Payment.findById(payment._id);
    expect(freshPayment.refundId).toBe('rfnd_target_999');
    expect(freshPayment.refundAmount).toBe(200);
    expect(freshPayment.status).toBe('PARTIALLY_REFUNDED');
  });

  it('script password validation: enforces min 12 chars, letters, numbers, symbols and rejects weak example passwords', () => {
    // Missing or short
    expect(validateScriptPassword('').valid).toBe(false);
    expect(validateScriptPassword('Short1!').valid).toBe(false);

    // Missing symbol or number
    expect(validateScriptPassword('NoNumbersOrSymbolsHere').valid).toBe(false);
    expect(validateScriptPassword('OnlyNumbers1234567890').valid).toBe(false);

    // Known weak or example passwords
    const weakAdmin = ['Admin', 'Secure', 'Pass', '123!'].join('');
    const weakProvider = ['Provider', 'Secure', '123!'].join('');
    expect(validateScriptPassword(weakAdmin).valid).toBe(false);
    expect(validateScriptPassword(weakProvider).valid).toBe(false);
    expect(validateScriptPassword('password123!').valid).toBe(false);

    // Strong unique password
    expect(validateScriptPassword('Secure#Pr0jectPass2026!').valid).toBe(true);
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

describe('Final Round - Sequential Invoices, Quotation Locks, Account Data & Deletion', () => {
  it('generates sequential unique invoice numbers per year with Counter and guarantees no duplicates under heavy concurrency', async () => {
    const year = 2026;
    const inv1 = await getNextInvoiceNumber(year);
    expect(inv1).toBe('INV-2026-000001');

    const inv2 = await getNextInvoiceNumber(year);
    expect(inv2).toBe('INV-2026-000002');

    // Run 30 calls concurrently
    const concurrentCount = 30;
    const promises = Array.from({ length: concurrentCount }, () => getNextInvoiceNumber(year));
    const results = await Promise.all(promises);

    expect(results.length).toBe(concurrentCount);
    const uniqueSet = new Set(results);
    expect(uniqueSet.size).toBe(concurrentCount);

    // Each should strictly match INV-2026-XXXXXX format
    for (const inv of results) {
      expect(inv).toMatch(/^INV-2026-\d{6}$/);
    }
  });

  it('rejects new quotations when job is COMPLETED, CANCELLED, or payment has started', async () => {
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Quote Test Customer',
        email: 'quote.cust@fixnear.test',
        password: 'Password123!',
        phone: '9876543210',
        city: 'Mumbai',
        role: 'customer',
      });
    const customer = userRes.body.user;

    const provUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Quote Test Provider',
        email: 'quote.prov@fixnear.test',
        password: 'Password123!',
        phone: '9876543211',
        city: 'Mumbai',
        role: 'provider',
      });
    const provLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'quote.prov@fixnear.test', password: 'Password123!' });
    const provCookie = provLoginRes.headers['set-cookie'];

    const provider = await Provider.findOne({ userId: provUserRes.body.user.id });
    provider.status = 'approved';
    provider.isOnline = true;
    await provider.save();

    // 1. Booking is COMPLETED
    const completedBooking = await Booking.create({
      bookingId: 'FX-QTCMP1',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: '9876543210',
      serviceId: 'electrical-repair',
      serviceTitle: 'Electrical Repair',
      completionOtp: '1234',
      providerId: provider._id,
      providerName: provider.name,
      status: 'COMPLETED',
      basePrice: 500,
      address: '123 Test Road',
      scheduledDate: '2026-11-20',
      timeSlot: '10:00 AM',
    });

    const quoteOnCompleted = await request(app)
      .post(`/api/bookings/${completedBooking._id}/quotation`)
      .set('Cookie', provCookie)
      .send({
        items: [{ desc: 'New capacitor', amount: 300 }],
      });
    expect(quoteOnCompleted.status).toBe(400);
    expect(quoteOnCompleted.body.message).toMatch(/Cannot submit a new quotation after the job is completed/i);

    // 2. Booking is CANCELLED
    const cancelledBooking = await Booking.create({
      bookingId: 'FX-QTCAN1',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: '9876543210',
      serviceId: 'electrical-repair',
      serviceTitle: 'Electrical Repair',
      completionOtp: '1234',
      providerId: provider._id,
      providerName: provider.name,
      status: 'CANCELLED',
      basePrice: 500,
      address: '123 Test Road',
      scheduledDate: '2026-11-20',
      timeSlot: '10:00 AM',
    });

    const quoteOnCancelled = await request(app)
      .post(`/api/bookings/${cancelledBooking._id}/quotation`)
      .set('Cookie', provCookie)
      .send({
        items: [{ desc: 'New switch', amount: 200 }],
      });
    expect(quoteOnCancelled.status).toBe(400);

    // 3. Payment has started (razorpayOrderId exists)
    const paidStartedBooking = await Booking.create({
      bookingId: 'FX-QTPAY1',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: '9876543210',
      serviceId: 'electrical-repair',
      serviceTitle: 'Electrical Repair',
      completionOtp: '1234',
      providerId: provider._id,
      providerName: provider.name,
      status: 'WORKING',
      razorpayOrderId: 'order_pay_started_123',
      basePrice: 500,
      address: '123 Test Road',
      scheduledDate: '2026-11-20',
      timeSlot: '10:00 AM',
    });

    const quoteOnPaidStarted = await request(app)
      .post(`/api/bookings/${paidStartedBooking._id}/quotation`)
      .set('Cookie', provCookie)
      .send({
        items: [{ desc: 'New fuse', amount: 150 }],
      });
    expect(quoteOnPaidStarted.status).toBe(400);
    expect(quoteOnPaidStarted.body.message).toMatch(/Cannot submit a quotation after payment has started/i);
  });

  it('rejects approve and decline when booking is COMPLETED, CANCELLED, or payment has started', async () => {
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Decision Test Cust',
        email: 'decision.cust@fixnear.test',
        password: 'Password123!',
        phone: '9876543210',
        city: 'Mumbai',
        role: 'customer',
      });
    const custLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'decision.cust@fixnear.test', password: 'Password123!' });
    const custCookie = custLogin.headers['set-cookie'];
    const customer = custRes.body.user;

    // 1. COMPLETED booking with pending quotation
    const completedBooking = await Booking.create({
      bookingId: 'FX-QDEC1',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: '9876543210',
      serviceId: 'plumbing-repair',
      serviceTitle: 'Plumbing Repair',
      completionOtp: '1234',
      status: 'COMPLETED',
      basePrice: 400,
      address: '123 Test St',
      scheduledDate: '2026-11-20',
      timeSlot: '10:00 AM',
      quotation: {
        status: 'PENDING_CUSTOMER_APPROVAL',
        total: 250,
        items: [{ desc: 'Filter', amount: 250 }],
      },
      invoice: { baseAmount: 400, extraAmount: 0, totalAmount: 420 },
    });

    const approveCompleted = await request(app)
      .patch(`/api/bookings/${completedBooking._id}/quotation/approve`)
      .set('Cookie', custCookie);
    expect(approveCompleted.status).toBe(400);
    expect(approveCompleted.body.message).toMatch(/Cannot approve quotation for a completed booking/i);

    const declineCompleted = await request(app)
      .patch(`/api/bookings/${completedBooking._id}/quotation/decline`)
      .set('Cookie', custCookie);
    expect(declineCompleted.status).toBe(400);
    expect(declineCompleted.body.message).toMatch(/Cannot decline quotation for a completed booking/i);

    // 2. CANCELLED booking
    const cancelledBooking = await Booking.create({
      bookingId: 'FX-QDEC2',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: '9876543210',
      serviceId: 'plumbing-repair',
      serviceTitle: 'Plumbing Repair',
      completionOtp: '1234',
      status: 'CANCELLED',
      basePrice: 400,
      address: '123 Test St',
      scheduledDate: '2026-11-20',
      timeSlot: '10:00 AM',
      quotation: {
        status: 'PENDING_CUSTOMER_APPROVAL',
        total: 250,
        items: [{ desc: 'Filter', amount: 250 }],
      },
    });

    const approveCancelled = await request(app)
      .patch(`/api/bookings/${cancelledBooking._id}/quotation/approve`)
      .set('Cookie', custCookie);
    expect(approveCancelled.status).toBe(400);
    expect(approveCancelled.body.message).toMatch(/Cannot approve quotation for a cancelled booking/i);

    const declineCancelled = await request(app)
      .patch(`/api/bookings/${cancelledBooking._id}/quotation/decline`)
      .set('Cookie', custCookie);
    expect(declineCancelled.status).toBe(400);
    expect(declineCancelled.body.message).toMatch(/Cannot decline quotation for a cancelled booking/i);

    // 3. Payment has started
    const paymentBooking = await Booking.create({
      bookingId: 'FX-QDEC3',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: '9876543210',
      serviceId: 'plumbing-repair',
      serviceTitle: 'Plumbing Repair',
      completionOtp: '1234',
      status: 'WORKING',
      paymentStatus: 'PAID',
      basePrice: 400,
      address: '123 Test St',
      scheduledDate: '2026-11-20',
      timeSlot: '10:00 AM',
      quotation: {
        status: 'PENDING_CUSTOMER_APPROVAL',
        total: 250,
        items: [{ desc: 'Filter', amount: 250 }],
      },
    });

    const approvePaid = await request(app)
      .patch(`/api/bookings/${paymentBooking._id}/quotation/approve`)
      .set('Cookie', custCookie);
    expect(approvePaid.status).toBe(400);
    expect(approvePaid.body.message).toMatch(/Cannot approve quotation after payment has started/i);

    const declinePaid = await request(app)
      .patch(`/api/bookings/${paymentBooking._id}/quotation/decline`)
      .set('Cookie', custCookie);
    expect(declinePaid.status).toBe(400);
    expect(declinePaid.body.message).toMatch(/Cannot decline quotation after payment has started/i);
  });

  it('downloads user data in JSON format and executes account deletion with password verification and anonymization', async () => {
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Anonymize Target',
        email: 'anonymize.me@fixnear.test',
        password: 'Password123!',
        phone: '9876543210',
        city: 'Mumbai',
        role: 'customer',
      });
    const custLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'anonymize.me@fixnear.test', password: 'Password123!' });
    const custCookie = custLogin.headers['set-cookie'];
    const userId = custRes.body.user.id;

    // Create a finished booking and a review
    const settledBooking = await Booking.create({
      bookingId: 'FX-ANON1',
      customerId: userId,
      customerName: 'Anonymize Target',
      customerPhone: '9876543210',
      serviceId: 'cleaning-service',
      serviceTitle: 'Deep Cleaning',
      completionOtp: '1234',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      basePrice: 450,
      address: '42 Secret Residency, Bandra West',
      scheduledDate: '2026-11-10',
      timeSlot: '11:00 AM',
      invoiceNumber: 'INV-2026-000100',
    });

    const dummyProviderId = new mongoose.Types.ObjectId();
    await Review.create({
      bookingId: settledBooking._id,
      customerId: userId,
      authorName: 'Anonymize Target',
      providerId: dummyProviderId,
      rating: 5,
      comment: 'Very helpful and punctual!',
    });

    // 1. Download data
    const downloadRes = await request(app)
      .get('/api/auth/download-data')
      .set('Cookie', custCookie);
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers['content-type']).toContain('application/json');
    expect(downloadRes.headers['content-disposition']).toContain('attachment');
    expect(downloadRes.body.platform).toBe('FixNear Trust');
    expect(downloadRes.body.profile.email).toBe('anonymize.me@fixnear.test');
    expect(downloadRes.body.bookings.length).toBe(1);
    expect(downloadRes.body.reviewsWritten.length).toBe(1);

    // 2. Attempt delete with wrong password -> rejected
    const badPassRes = await request(app)
      .post('/api/auth/delete-account')
      .set('Cookie', custCookie)
      .send({ password: 'WrongPassword999!' });
    expect(badPassRes.status).toBe(400);
    expect(badPassRes.body.message).toMatch(/Incorrect password/i);

    // 3. Attempt delete while active booking exists -> rejected
    const activeBooking = await Booking.create({
      bookingId: 'FX-ACTV1',
      customerId: userId,
      customerName: 'Anonymize Target',
      customerPhone: '9876543210',
      serviceId: 'cleaning-service',
      serviceTitle: 'Deep Cleaning',
      completionOtp: '1234',
      status: 'WORKING',
      basePrice: 500,
      address: '42 Secret Residency',
      scheduledDate: '2026-11-20',
      timeSlot: '10:00 AM',
    });

    const blockedActiveRes = await request(app)
      .post('/api/auth/delete-account')
      .set('Cookie', custCookie)
      .send({ password: 'Password123!' });
    expect(blockedActiveRes.status).toBe(400);
    expect(blockedActiveRes.body.message).toMatch(/Cannot delete account while you have active bookings/i);

    // Remove active booking
    await Booking.deleteOne({ _id: activeBooking._id });

    // 4. Attempt delete while an unpaid completed booking exists -> rejected
    const unpaidBooking = await Booking.create({
      bookingId: 'FX-UNPD1',
      customerId: userId,
      customerName: 'Anonymize Target',
      customerPhone: '9876543210',
      serviceId: 'cleaning-service',
      serviceTitle: 'Deep Cleaning',
      completionOtp: '1234',
      status: 'COMPLETED',
      paymentStatus: 'PENDING',
      basePrice: 500,
      address: '42 Secret Residency',
      scheduledDate: '2026-11-20',
      timeSlot: '10:00 AM',
    });

    const blockedUnpaidRes = await request(app)
      .post('/api/auth/delete-account')
      .set('Cookie', custCookie)
      .send({ password: 'Password123!' });
    expect(blockedUnpaidRes.status).toBe(400);
    expect(blockedUnpaidRes.body.message).toMatch(/Cannot delete account while you have unpaid completed bookings/i);

    // Remove unpaid booking
    await Booking.deleteOne({ _id: unpaidBooking._id });

    // 5. Successful account deletion with valid password
    const deleteRes = await request(app)
      .post('/api/auth/delete-account')
      .set('Cookie', custCookie)
      .send({ password: 'Password123!' });
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify user document was anonymized and blocked
    const anonymizedUser = await User.findById(userId);
    expect(anonymizedUser.name).toBe('Deleted User');
    expect(anonymizedUser.email).toContain('@deleted.fixnear.local');
    expect(anonymizedUser.phone).toBe('0000000000');
    expect(anonymizedUser.isBlocked).toBe(true);

    // Verify booking personal fields are redacted while accounting fields remain
    const anonymizedBooking = await Booking.findById(settledBooking._id);
    expect(anonymizedBooking.customerName).toBe('Deleted User');
    expect(anonymizedBooking.customerPhone).toBe('0000000000');
    expect(anonymizedBooking.address).toContain('Redacted');
    expect(anonymizedBooking.basePrice).toBe(450); // Accounting financial record preserved
    expect(anonymizedBooking.invoiceNumber).toBe('INV-2026-000100'); // Accounting invoice number preserved

    // Verify review is anonymized
    const anonymizedReview = await Review.findOne({ customerId: userId });
    expect(anonymizedReview.authorName).toBe('Deleted User');

    // Verify audit log entry was created
    const auditRecord = await AuditLog.findOne({ targetId: String(userId) });
    expect(auditRecord).toBeDefined();
    expect(auditRecord.action).toBe('USER_ACCOUNT_DELETED_ANONYMIZED');

    // Attempting login with old email must now fail (unauthorized or not found)
    const loginAgain = await request(app)
      .post('/api/auth/login')
      .send({ email: 'anonymize.me@fixnear.test', password: 'Password123!' });
    expect([400, 401]).toContain(loginAgain.status);
  });

  it('attaches X-Request-Id header and sanitizes passwords, card numbers and tokens in error logs', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-request-id'].length).toBeGreaterThan(10);

    // Test redactor utility directly
    const rawData = {
      password: 'MySecretPassword123!',
      token: 'jwt.token.here',
      cardNumber: '4532 1122 3344 5566',
      normalField: 'Hello World',
      nested: {
        authorization: 'Bearer super_secret_token_12345',
        creditCard: '5105105105105100',
        clean: 42,
      },
    };
    const redacted = redactSensitiveData(rawData);
    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.token).toBe('[REDACTED]');
    expect(redacted.cardNumber).toBe('[REDACTED]');
    expect(redacted.normalField).toBe('Hello World');
    expect(redacted.nested.authorization).toBe('[REDACTED]');
    expect(redacted.nested.creditCard).toBe('[REDACTED]');
    expect(redacted.nested.clean).toBe(42);
  });

  it('explicit field lists in data export: strips completionOtp and customer phone from provider export, isolates customer exports, and verifies select:false on completionOtp', async () => {
    // 1. Create Customer A and Customer B
    const custARes = await request(app).post('/api/auth/register').send({
      name: 'Customer Alpha',
      email: 'custA@fixnear.test',
      password: 'Password123!',
      phone: '9876543201',
      city: 'Mumbai',
      role: 'customer',
    });
    const custLoginA = await request(app).post('/api/auth/login').send({
      email: 'custA@fixnear.test',
      password: 'Password123!',
    });
    const custCookieA = custLoginA.headers['set-cookie'];
    const userA = custARes.body.user;

    const custBRes = await request(app).post('/api/auth/register').send({
      name: 'Customer Beta',
      email: 'custB@fixnear.test',
      password: 'Password123!',
      phone: '9876543202',
      city: 'Mumbai',
      role: 'customer',
    });
    const userB = custBRes.body.user;

    // 2. Create Provider P
    const provRes = await request(app).post('/api/auth/register').send({
      name: 'Provider Pradeep',
      email: 'provP@fixnear.test',
      password: 'Password123!',
      phone: '9876543203',
      city: 'Mumbai',
      role: 'provider',
    });
    const provLogin = await request(app).post('/api/auth/login').send({
      email: 'provP@fixnear.test',
      password: 'Password123!',
    });
    const provCookie = provLogin.headers['set-cookie'];
    const providerDoc = await Provider.findOne({ userId: provRes.body.user.id });
    providerDoc.status = 'approved';
    providerDoc.isOnline = true;
    await providerDoc.save();

    // 3. Create Booking for Customer A, completed by Provider P
    const bookingA = await Booking.create({
      bookingId: 'FX-EXPO-A',
      customerId: userA.id,
      customerName: 'Customer Alpha',
      customerPhone: '9876543201',
      serviceId: 'electrical-repair',
      serviceTitle: 'Electrical Repair',
      completionOtp: '7890',
      providerId: providerDoc._id,
      providerName: 'Provider Pradeep',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      basePrice: 500,
      address: '404 Alpha Street, Andheri West',
      city: 'Mumbai',
      scheduledDate: '2026-11-25',
      timeSlot: '02:00 PM',
      invoiceNumber: 'INV-2026-000500',
    });

    // 4. Create Booking and SupportTicket for Customer B
    const bookingB = await Booking.create({
      bookingId: 'FX-EXPO-B',
      customerId: userB.id,
      customerName: 'Customer Beta',
      customerPhone: '9876543202',
      serviceId: 'cleaning-service',
      serviceTitle: 'Home Cleaning',
      completionOtp: '4321',
      status: 'REQUESTED',
      basePrice: 600,
      address: '505 Beta Road, Bandra',
      city: 'Mumbai',
      scheduledDate: '2026-11-26',
      timeSlot: '11:00 AM',
    });

    const ticketB = await SupportTicket.create({
      userId: userB.id,
      ticketId: 'TCK-BETA-01',
      subject: 'Customer B Secret Issue',
      message: 'Private ticket from customer B',
      userName: 'Customer Beta',
      userEmail: 'custB@fixnear.test',
    });

    const ticketA = await SupportTicket.create({
      userId: userA.id,
      ticketId: 'TCK-ALPH-01',
      subject: 'Customer A Billing Question',
      message: 'General inquiry on invoice',
      userName: 'Customer Alpha',
      userEmail: 'custA@fixnear.test',
    });

    await Review.create({
      bookingId: bookingA._id,
      customerId: userA.id,
      providerId: providerDoc._id,
      authorName: 'Customer Alpha',
      serviceTitle: 'Electrical Repair',
      rating: 5,
      comment: 'Very thorough electrician!',
    });

    // --- Check select: false on Booking schema ---
    const rawBooking = await Booking.findById(bookingA._id);
    expect(rawBooking.completionOtp).toBeUndefined();

    const explicitBooking = await Booking.findById(bookingA._id).select('+completionOtp');
    expect(explicitBooking.completionOtp).toBe('7890');

    // --- Check Customer portal views own finish code ---
    const custView = await request(app).get(`/api/bookings/${bookingA.bookingId}`).set('Cookie', custCookieA);
    expect(custView.status).toBe(200);
    expect(custView.body.booking.completionOtp).toBe('7890');

    const custMine = await request(app).get('/api/bookings/mine').set('Cookie', custCookieA);
    expect(custMine.status).toBe(200);
    expect(custMine.body.bookings[0].completionOtp).toBe('7890');

    // --- Check Provider portal NEVER views finish code ---
    const provView = await request(app).get(`/api/bookings/${bookingA.bookingId}`).set('Cookie', provCookie);
    expect(provView.status).toBe(200);
    expect(provView.body.booking.completionOtp).toBeUndefined();

    const provMine = await request(app).get('/api/bookings/mine').set('Cookie', provCookie);
    expect(provMine.status).toBe(200);
    expect(provMine.body.bookings[0].completionOtp).toBeUndefined();

    // --- Check Customer Data Export isolation & sanitized fields ---
    const custExport = await request(app).get('/api/auth/download-data').set('Cookie', custCookieA);
    expect(custExport.status).toBe(200);
    expect(custExport.body.role).toBe('customer');
    expect(custExport.body.profile.email).toBe('custa@fixnear.test');
    expect(custExport.body.bookings.length).toBe(1);
    expect(custExport.body.bookings[0].bookingId).toBe('FX-EXPO-A');
    expect(custExport.body.bookings[0].providerName).toBe('Provider Pradeep');
    // Isolation: Customer A export must NOT contain Customer B's records
    expect(custExport.body.bookings.some((b) => b.bookingId === 'FX-EXPO-B')).toBe(false);
    expect(custExport.body.supportTickets.some((t) => t.ticketId === 'TCK-BETA-01')).toBe(false);
    expect(custExport.body.supportTickets.some((t) => t.ticketId === 'TCK-ALPH-01')).toBe(true);
    // Secrets stripped
    expect(custExport.body.bookings[0].completionOtp).toBeUndefined();
    expect(custExport.body.bookings[0].offeredTo).toBeUndefined();
    expect(custExport.body.bookings[0].failedFinishCodeAttempts).toBeUndefined();

    // --- Check Provider Data Export confidentiality ---
    const provExport = await request(app).get('/api/auth/download-data').set('Cookie', provCookie);
    expect(provExport.status).toBe(200);
    expect(provExport.body.role).toBe('provider');
    expect(provExport.body.profile.email).toBe('provp@fixnear.test');
    expect(provExport.body.jobHistory.length).toBe(1);

    const job = provExport.body.jobHistory[0];
    expect(job.bookingId).toBe('FX-EXPO-A');
    expect(job.customerFirstName).toBe('Customer'); // First name only
    expect(job.area).toBeDefined();
    // Confidentially withheld from provider export:
    expect(job.completionOtp).toBeUndefined();
    expect(job.customerPhone).toBeUndefined();
    expect(job.phone).toBeUndefined();
    expect(job.address).toBeUndefined();
    expect(job.offeredTo).toBeUndefined();
    expect(job.failedFinishCodeAttempts).toBeUndefined();
  });

  it('account deletion: removes uploaded files, records FailedCleanup if unconfigured/failing, cancels pending offers and re-dispatches, anonymizes SupportTickets and deletes notifications', async () => {
    // 1. Create Category and Service
    const cat = await Category.create({ name: 'Appliance Repair', categoryId: 'appliance-repair' });
    const srv = await Service.create({
      serviceId: 'fridge-repair',
      categoryId: 'appliance-repair',
      category: 'Appliance Repair',
      title: 'Refrigerator Repair',
      startingPrice: 450,
      isActive: true,
    });

    // 2. Register Provider 1 and Provider 2
    const prov1Res = await request(app).post('/api/auth/register').send({
      name: 'Deleting Tech',
      email: 'deltech@fixnear.test',
      password: 'Password123!',
      phone: '9876543401',
      city: 'Mumbai',
      role: 'provider',
    });
    const prov1Login = await request(app).post('/api/auth/login').send({
      email: 'deltech@fixnear.test',
      password: 'Password123!',
    });
    const prov1Cookie = prov1Login.headers['set-cookie'];
    const user1Id = prov1Res.body.user.id;

    const prov2Res = await request(app).post('/api/auth/register').send({
      name: 'Backup Tech',
      email: 'backuptech@fixnear.test',
      password: 'Password123!',
      phone: '9876543402',
      city: 'Mumbai',
      role: 'provider',
    });
    const user2Id = prov2Res.body.user.id;

    const prov1 = await Provider.findOne({ userId: user1Id });
    prov1.status = 'approved';
    prov1.isOnline = true;
    prov1.city = 'Mumbai';
    prov1.skills = [{ categoryId: 'appliance-repair', categoryName: 'Appliance Repair', passed: true }];
    prov1.idProofPublicId = 'cloudinary_private_id_proof_del_123';
    prov1.idProofResourceType = 'image';
    prov1.certificatePublicId = 'cloudinary_private_cert_del_456';
    prov1.certificateResourceType = 'raw';
    await prov1.save();

    const prov2 = await Provider.findOne({ userId: user2Id });
    prov2.status = 'approved';
    prov2.isOnline = true;
    prov2.city = 'Mumbai';
    prov2.skills = [{ categoryId: 'appliance-repair', categoryName: 'Appliance Repair', passed: true }];
    await prov2.save();

    // 3. Create a local file on disk in server/uploads-private/<userId>/
    const localUserDir = path.resolve(__dirname, '../uploads-private', String(user1Id));
    fs.mkdirSync(localUserDir, { recursive: true });
    const localPdfPath = path.join(localUserDir, 'license.pdf');
    fs.writeFileSync(localPdfPath, 'Mock license contents for deletion test');
    expect(fs.existsSync(localPdfPath)).toBe(true);

    // 4. Create a REQUESTED booking offered to Provider 1 with PENDING status
    const booking = await Booking.create({
      bookingId: 'FX-REDISP-01',
      customerId: new mongoose.Types.ObjectId(),
      customerName: 'Aarti Sharma',
      customerPhone: '9876543499',
      serviceId: srv.serviceId,
      serviceTitle: srv.title,
      completionOtp: '5555',
      basePrice: 450,
      address: '701 Palm Beach Road, Vashi',
      city: 'Mumbai',
      scheduledDate: '2026-11-29',
      timeSlot: '04:00 PM',
      status: 'REQUESTED',
      offeredTo: [
        {
          providerId: prov1._id,
          status: 'PENDING',
          offeredAt: new Date(),
          expiresAt: new Date(Date.now() + 60000),
        },
      ],
      currentOfferExpiresAt: new Date(Date.now() + 60000),
    });

    // 5. Create a SupportTicket and a Notification for Provider 1
    const ticket = await SupportTicket.create({
      userId: user1Id,
      ticketId: 'TCK-DEL-99',
      subject: 'Document check',
      message: 'Please review my certificate upload',
      userName: 'Deleting Tech',
      userEmail: 'deltech@fixnear.test',
    });

    await Notification.create({
      userId: user1Id,
      role: 'provider',
      title: 'Document Verified',
      message: 'Your documents have been checked',
    });

    // 6. Provider 1 deletes account with password
    const delRes = await request(app)
      .post('/api/auth/delete-account')
      .set('Cookie', prov1Cookie)
      .send({ password: 'Password123!' });
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Assert 1: Local file was removed from server/uploads-private/<userId>/
    expect(fs.existsSync(localPdfPath)).toBe(false);

    // Assert 2: FailedCleanup collection records unconfigured Cloudinary files
    const failedRecords = await FailedCleanup.find({ userId: user1Id });
    expect(failedRecords.length).toBeGreaterThanOrEqual(2);
    expect(failedRecords.some((r) => r.publicId === 'cloudinary_private_id_proof_del_123')).toBe(true);
    expect(failedRecords.some((r) => r.publicId === 'cloudinary_private_cert_del_456')).toBe(true);
    expect(failedRecords[0].status).toBe('PENDING_RETRY');

    // Assert 3: PENDING offer was closed and job re-offered to Provider 2
    const recheckedBooking = await Booking.findById(booking._id);
    const prov1Offer = recheckedBooking.offeredTo.find((o) => String(o.providerId) === String(prov1._id));
    expect(prov1Offer.status).toBe('DECLINED');

    const prov2Offer = recheckedBooking.offeredTo.find((o) => String(o.providerId) === String(prov2._id));
    expect(prov2Offer).toBeDefined();
    expect(prov2Offer.status).toBe('PENDING');

    // Assert 4: SupportTicket contact fields are anonymized
    const recheckedTicket = await SupportTicket.findById(ticket._id);
    expect(recheckedTicket.userName).toBe('Deleted User');
    expect(recheckedTicket.userEmail).toContain('@deleted.fixnear.local');

    // Assert 5: User notifications were deleted
    const remainingNotifs = await Notification.countDocuments({ userId: user1Id });
    expect(remainingNotifs).toBe(0);
  });
});
