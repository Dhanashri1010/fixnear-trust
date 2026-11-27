import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function sync() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixnear';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password@123', salt);

  // 1. Admin
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@fixnear.com' },
    {
      $set: {
        name: 'FixNear Administrator',
        email: 'admin@fixnear.com',
        password: hashedPassword,
        role: 'admin',
        isBlocked: false,
        mustChangePassword: false,
        city: 'Mumbai',
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
  console.log('✓ admin@fixnear.com synced with Password@123');

  // 2. Customer
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'customer@fixnear.com' },
    {
      $set: {
        name: 'Demo Customer',
        email: 'customer@fixnear.com',
        password: hashedPassword,
        role: 'customer',
        isBlocked: false,
        city: 'Mumbai',
        phone: '+91 98765 43210',
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
  console.log('✓ customer@fixnear.com synced with Password@123');

  // 3. Provider (Somnath)
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'somnath@gmail.com' },
    {
      $set: {
        password: hashedPassword,
        role: 'provider',
        isBlocked: false,
        updatedAt: new Date()
      }
    }
  );
  console.log('✓ somnath@gmail.com password synced with Password@123');

  await mongoose.disconnect();
  console.log('Sync complete.');
  process.exit(0);
}

sync().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
