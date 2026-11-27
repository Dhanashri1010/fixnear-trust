import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Service } from '../models/Service.js';
import { Category } from '../models/Category.js';
import { Provider } from '../models/Provider.js';
import { User } from '../models/User.js';
import { SEED_CATEGORIES, SEED_SERVICES } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PROVIDER_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80'
];

async function syncImages() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
  console.log('[Sync Images] Connecting to MongoDB...');
  await mongoose.connect(uri);

  // 1. Sync Categories
  console.log('[Sync Images] Updating categories with real photography...');
  for (const cat of SEED_CATEGORIES) {
    await Category.updateOne(
      { categoryId: cat.id },
      { $set: { image: cat.image, icon: cat.icon, accentBg: cat.accentBg, accentText: cat.accentText } }
    );
  }
  console.log('✓ Categories updated.');

  // 2. Sync Services
  console.log('[Sync Images] Updating services with real photography...');
  for (const srv of SEED_SERVICES) {
    await Service.updateOne(
      { serviceId: srv.id },
      { $set: { image: srv.image } }
    );
  }
  console.log('✓ Services updated.');

  // 3. Sync Providers with real avatars
  console.log('[Sync Images] Updating providers with real profile photos...');
  const providers = await Provider.find();
  for (let i = 0; i < providers.length; i++) {
    const prov = providers[i];
    const photo = PROVIDER_PHOTOS[i % PROVIDER_PHOTOS.length];
    await Provider.updateOne(
      { _id: prov._id },
      { $set: { profilePhoto: photo } }
    );
    if (prov.userId) {
      await User.updateOne(
        { _id: prov.userId },
        { $set: { avatar: photo } }
      );
    }
  }
  console.log(`✓ ${providers.length} providers updated with real profile photos.`);

  await mongoose.disconnect();
  console.log('[Sync Images] Done!');
}

syncImages().catch(err => {
  console.error('[Sync Images] Error:', err);
  process.exit(1);
});
