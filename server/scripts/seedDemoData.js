import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Dispute } from '../models/Dispute.js';
import { cleanDemoData } from './cleanDemoData.js';
import {
  DEMO_CUSTOMERS,
  DEMO_PROVIDERS,
  DEMO_BOOKINGS_TEMPLATE,
  DEMO_REVIEWS_TEMPLATE,
  DEMO_DISPUTES_TEMPLATE,
} from '../data/demo/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Idempotently seeds 20 realistic, interconnected demo records for:
 * - Customers (20)
 * - Providers (20)
 * - Bookings (20)
 * - Reviews (20)
 * - Disputes (20)
 *
 * Restricts cleanup strictly to isDemo: true records.
 * Blocks execution in production mode.
 */
export const seedDemoData = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Safety violation: Demo data seeding is strictly prohibited in production!');
  }

  console.log('===========================================================');
  console.log('[Seed Demo Data] Initializing FixNear Trust Demo Seeder...');
  console.log('===========================================================');

  // Step 1: Clean existing demo data first to ensure idempotency
  await cleanDemoData();

  // Step 2: Seed 20 Customers
  console.log(`[Seed Demo Data] Seeding ${DEMO_CUSTOMERS.length} demo customers...`);
  const createdCustomers = [];
  for (const custData of DEMO_CUSTOMERS) {
    const cust = await User.create(custData);
    createdCustomers.push(cust);
  }
  console.log(`[Seed Demo Data] ✓ ${createdCustomers.length} demo customers created.`);

  // Step 3: Seed 20 Providers (User + Provider profile)
  console.log(`[Seed Demo Data] Seeding ${DEMO_PROVIDERS.length} demo providers...`);
  const createdProviders = [];
  for (const provData of DEMO_PROVIDERS) {
    const userDoc = await User.create(provData.user);
    const profileDoc = await Provider.create({
      userId: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      city: userDoc.city,
      ...provData.profile,
    });
    createdProviders.push(profileDoc);
  }
  console.log(`[Seed Demo Data] ✓ ${createdProviders.length} demo providers created.`);

  // Step 4: Seed 20 Bookings with interconnected references
  console.log(`[Seed Demo Data] Seeding ${DEMO_BOOKINGS_TEMPLATE.length} demo bookings...`);
  const createdBookings = [];
  for (const bTemplate of DEMO_BOOKINGS_TEMPLATE) {
    const customer = createdCustomers[bTemplate.customerIndex];
    const provider = bTemplate.providerIndex !== null ? createdProviders[bTemplate.providerIndex] : null;

    const bookingPayload = {
      bookingId: bTemplate.bookingId,
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      providerId: provider ? provider._id : null,
      providerName: provider ? provider.name : '',
      providerPhone: provider ? provider.phone : '',
      serviceId: bTemplate.serviceId,
      serviceTitle: bTemplate.serviceTitle,
      basePrice: bTemplate.basePrice,
      address: bTemplate.address,
      city: bTemplate.city,
      pincode: bTemplate.pincode,
      scheduledDate: bTemplate.scheduledDate,
      timeSlot: bTemplate.timeSlot,
      status: bTemplate.status,
      disputeStatus: bTemplate.disputeStatus || 'NONE',
      completionOtp: bTemplate.completionOtp,
      paymentMethod: bTemplate.paymentMethod || 'UNPAID',
      paymentStatus: bTemplate.paymentStatus || 'PENDING',
      invoice: bTemplate.invoice,
      timeline: bTemplate.timeline,
      notes: bTemplate.notes || '',
      cancellationReason: bTemplate.cancellationReason || '',
      cancelledBy: bTemplate.cancelledBy || '',
      isDemo: true,
    };

    if (provider) {
      bookingPayload.offeredTo = [
        {
          providerId: provider._id,
          status: bTemplate.status === 'REQUESTED' ? 'PENDING' : 'ACCEPTED',
          offeredAt: new Date(Date.now() - 3600000),
        },
      ];
    }

    const bookingDoc = await Booking.create(bookingPayload);
    createdBookings.push(bookingDoc);
  }
  console.log(`[Seed Demo Data] ✓ ${createdBookings.length} demo bookings created.`);

  // Step 5: Seed 20 Reviews interconnected with Bookings
  console.log(`[Seed Demo Data] Seeding ${DEMO_REVIEWS_TEMPLATE.length} demo reviews...`);
  const createdReviews = [];
  for (const rTemplate of DEMO_REVIEWS_TEMPLATE) {
    const booking = createdBookings[rTemplate.bookingIndex];
    const providerId = booking.providerId || createdProviders[0]._id;

    const reviewDoc = await Review.create({
      bookingId: booking._id,
      customerId: booking.customerId,
      authorName: booking.customerName,
      providerId,
      serviceTitle: booking.serviceTitle,
      rating: rTemplate.rating,
      comment: rTemplate.comment,
      isHidden: rTemplate.isHidden || false,
      hiddenReason: rTemplate.hiddenReason || '',
      isDemo: true,
    });
    createdReviews.push(reviewDoc);
  }
  console.log(`[Seed Demo Data] ✓ ${createdReviews.length} demo reviews created.`);

  // Step 6: Seed 20 Disputes interconnected with Bookings
  console.log(`[Seed Demo Data] Seeding ${DEMO_DISPUTES_TEMPLATE.length} demo disputes...`);
  const createdDisputes = [];
  for (const dTemplate of DEMO_DISPUTES_TEMPLATE) {
    const booking = createdBookings[dTemplate.bookingIndex];
    const providerId = booking.providerId || createdProviders[0]._id;
    const providerName = booking.providerName || createdProviders[0].name;

    const disputeDoc = await Dispute.create({
      disputeId: dTemplate.disputeId,
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      customerId: booking.customerId,
      customerName: booking.customerName,
      providerId,
      providerName,
      reason: dTemplate.reason,
      claimAmount: dTemplate.claimAmount,
      notes: dTemplate.notes,
      status: dTemplate.status,
      decision: dTemplate.decision || '',
      adminNote: dTemplate.adminNote || '',
      adminResolutionNotes: dTemplate.adminResolutionNotes || '',
      refundAmount: dTemplate.refundAmount || 0,
      providerPayout: dTemplate.providerPayout || 0,
      isDemo: true,
    });
    createdDisputes.push(disputeDoc);
  }
  console.log(`[Seed Demo Data] ✓ ${createdDisputes.length} demo disputes created.`);

  const summary = {
    customersCount: createdCustomers.length,
    providersCount: createdProviders.length,
    bookingsCount: createdBookings.length,
    reviewsCount: createdReviews.length,
    disputesCount: createdDisputes.length,
    totalRecords:
      createdCustomers.length +
      createdProviders.length +
      createdBookings.length +
      createdReviews.length +
      createdDisputes.length,
  };

  console.log('===========================================================');
  console.log('[Seed Demo Data] Demo Seeding Summary:');
  console.log(`  - Customers: ${summary.customersCount}`);
  console.log(`  - Providers: ${summary.providersCount}`);
  console.log(`  - Bookings:  ${summary.bookingsCount}`);
  console.log(`  - Reviews:   ${summary.reviewsCount}`);
  console.log(`  - Disputes:  ${summary.disputesCount}`);
  console.log(`  - TOTAL:     ${summary.totalRecords} records`);
  console.log('===========================================================');

  return summary;
};

// Standalone execution
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
  console.log(`[Seed Demo Data] Connecting to MongoDB: ${mongoUri}...`);
  mongoose
    .connect(mongoUri)
    .then(async () => {
      await seedDemoData();
      await mongoose.disconnect();
      console.log('[Seed Demo Data] Completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Demo Data] Fatal error:', err);
      process.exit(1);
    });
}
