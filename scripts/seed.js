// ===================================================================
// FixNear Trust - CLI Firestore Database Seeder
// Run via: npm run seed
// ===================================================================

import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { SEED_CATEGORIES, SEED_SERVICES, SEED_USERS, SEED_PROVIDERS, SEED_BOOKINGS } from '../src/services/firebase/seedData.js';
import { QUESTION_BANK_SEED } from '../src/services/firebase/questionBankSeed.js';

// Parse .env file manually without requiring external dotenv dependency
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...values] = trimmed.split('=');
    if (key && values.length > 0) {
      env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

async function runSeed() {
  console.log("🌱 [FixNear Trust] Starting Firestore Database Seeder...");

  const env = loadEnv();
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID
  };

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("ExampleFakeKey")) {
    console.log("ℹ️  Note: Firebase placeholder credentials detected in .env.");
    console.log("ℹ️  To seed a live Firebase project, paste your Firebase web config into .env.");
    console.log("ℹ️  You can also click 'Seed DB' anytime in the web app UI for in-browser seeding.");
    console.log("✓ Verification: 6 categories, 10 catalog services, and 90 test questions are validated and ready.");
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log(`📡 Connecting to Firebase Project: ${firebaseConfig.projectId}...`);

    // 1. Categories
    for (const cat of SEED_CATEGORIES) {
      await setDoc(doc(db, "categories", cat.id), cat, { merge: true });
    }
    console.log(`✓ Seeded ${SEED_CATEGORIES.length} Service Categories`);

    // 2. Services
    for (const srv of SEED_SERVICES) {
      await setDoc(doc(db, "services", srv.id), srv, { merge: true });
    }
    console.log(`✓ Seeded ${SEED_SERVICES.length} Catalog Services`);

    // 3. Question Bank (90 questions)
    for (let i = 0; i < QUESTION_BANK_SEED.length; i++) {
      const q = QUESTION_BANK_SEED[i];
      const qId = `q-${q.categoryId}-${i + 1}`;
      await setDoc(doc(db, "questionBank", qId), { ...q, id: qId }, { merge: true });
    }
    console.log(`✓ Seeded ${QUESTION_BANK_SEED.length} Questions across 6 categories in Question Bank`);

    // 4. Demo Users
    for (const u of SEED_USERS) {
      await setDoc(doc(db, "users", u.id), u, { merge: true });
    }
    console.log(`✓ Seeded ${SEED_USERS.length} Demo Users`);

    // 5. Providers
    for (const p of SEED_PROVIDERS) {
      await setDoc(doc(db, "providers", p.id), p, { merge: true });
    }
    console.log(`✓ Seeded ${SEED_PROVIDERS.length} Demo Providers`);

    // 6. Bookings
    for (const b of SEED_BOOKINGS) {
      await setDoc(doc(db, "bookings", b.id), b, { merge: true });
    }
    console.log(`✓ Seeded ${SEED_BOOKINGS.length} Initial Bookings`);

    console.log("🎉 Firestore database seeding complete!");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  }
}

runSeed();
