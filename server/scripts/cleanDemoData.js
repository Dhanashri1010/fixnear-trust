import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Dispute } from '../models/Dispute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Strictly removes only records marked with isDemo: true.
 * Real customer, provider, booking, review, or dispute records are NEVER touched.
 */
export const cleanDemoData = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Safety violation: Demo data operations are strictly prohibited in production!');
  }

  console.log('[Clean Demo Data] Starting targeted cleanup of demo records (isDemo: true)...');

  const disputesRes = await Dispute.deleteMany({ isDemo: true });
  const reviewsRes = await Review.deleteMany({ isDemo: true });
  const bookingsRes = await Booking.deleteMany({ isDemo: true });
  const providersRes = await Provider.deleteMany({ isDemo: true });
  const usersRes = await User.deleteMany({ isDemo: true });

  const summary = {
    disputesDeleted: disputesRes.deletedCount,
    reviewsDeleted: reviewsRes.deletedCount,
    bookingsDeleted: bookingsRes.deletedCount,
    providersDeleted: providersRes.deletedCount,
    usersDeleted: usersRes.deletedCount,
  };

  console.log('[Clean Demo Data] ✓ Cleanup complete:');
  console.log(`  - Disputes removed:  ${summary.disputesDeleted}`);
  console.log(`  - Reviews removed:   ${summary.reviewsDeleted}`);
  console.log(`  - Bookings removed:  ${summary.bookingsDeleted}`);
  console.log(`  - Providers removed: ${summary.providersDeleted}`);
  console.log(`  - Users removed:     ${summary.usersDeleted}`);

  return summary;
};

// Standalone execution
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
  console.log(`[Clean Demo Data] Connecting to MongoDB: ${mongoUri}...`);
  mongoose
    .connect(mongoUri)
    .then(async () => {
      await cleanDemoData();
      await mongoose.disconnect();
      console.log('[Clean Demo Data] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Clean Demo Data] Error:', err.message);
      process.exit(1);
    });
}
