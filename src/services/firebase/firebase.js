// ===================================================================
// FixNear Trust - Firebase SDK Configuration & Initialization
// Supports real Firebase Project + fallback demo mode
// ===================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyExampleFakeKeyForDemoPurposeOnly123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fixnear-trust.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fixnear-trust",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fixnear-trust.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890abcdef"
};

// Check if credentials are real production keys vs default demo placeholder
export const isLiveFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes("ExampleFakeKey") &&
  firebaseConfig.projectId !== "fixnear-trust"
);

// Initialize Firebase App singleton safely
let app;
let auth;
let db;
let storage;
let googleProvider;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.warn("[FixNear Firebase] Running in Local Demo / Offline mode:", error.message);
}

export { 
  app, 
  auth, 
  db, 
  storage, 
  googleProvider,
  // Auth methods
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  // Firestore methods
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  // Storage methods
  ref,
  uploadBytes,
  getDownloadURL
};
