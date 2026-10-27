// ===================================================================
// FixNear Trust - Authentication Context
// Firebase Auth (Email/Pass + Google) + Firestore Role Management
// With 1-Click Demo Login support for easy academic evaluation
// ===================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider,
  isLiveFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from '../services/firebase/firebase';
import { SEED_USERS, SEED_PROVIDERS } from '../services/firebase/seedData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [role, setRole] = useState('customer'); // 'customer' | 'provider' | 'admin'
  const [loading, setLoading] = useState(true);

  // Initialize demo fallback user from localStorage if present
  useEffect(() => {
    // If running with live Firebase
    if (isLiveFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setCurrentUser(firebaseUser);
          try {
            // Fetch user profile from Firestore
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              const data = userSnap.data();
              setUserProfile(data);
              const userRole = data.role || 'customer';
              setRole(userRole);

              // If user is a provider, also fetch provider document
              if (userRole === 'provider') {
                const provRef = doc(db, 'providers', firebaseUser.uid);
                const provSnap = await getDoc(provRef);
                if (provSnap.exists()) {
                  setProviderProfile(provSnap.data());
                }
              }
            } else {
              // Create default customer profile if none exists
              const defaultProfile = {
                role: 'customer',
                name: firebaseUser.displayName || 'FixNear User',
                email: firebaseUser.email,
                phone: firebaseUser.phoneNumber || '',
                city: 'Mumbai',
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, defaultProfile);
              setUserProfile(defaultProfile);
              setRole('customer');
            }
          } catch (err) {
            console.error('Error fetching Firestore user profile:', err);
          }
        } else {
          // Check if user previously logged in via local demo session
          const savedDemo = localStorage.getItem('fixnear_demo_session');
          if (savedDemo) {
            try {
              const parsed = JSON.parse(savedDemo);
              setCurrentUser(parsed.user);
              setUserProfile(parsed.profile);
              setRole(parsed.profile.role || 'customer');
              if (parsed.provider) setProviderProfile(parsed.provider);
            } catch {
              setCurrentUser(null);
              setUserProfile(null);
              setRole('customer');
            }
          } else {
            setCurrentUser(null);
            setUserProfile(null);
            setRole('customer');
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Local Demo / Offline Mode - Read saved session or default to Customer demo
      const savedDemo = localStorage.getItem('fixnear_demo_session');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setCurrentUser(parsed.user);
          setUserProfile(parsed.profile);
          setRole(parsed.profile.role || 'customer');
          if (parsed.provider) setProviderProfile(parsed.provider);
        } catch {
          // fallback to default demo customer
          setDemoAccount('customer');
        }
      } else {
        setDemoAccount('customer');
      }
      setLoading(false);
    }
  }, []);

  // Helper to activate a demo account (Customer, Provider, or Admin)
  const setDemoAccount = (targetRole) => {
    let mockUser;
    let mockProfile;
    let mockProvider = null;

    if (targetRole === 'admin') {
      const adminData = SEED_USERS.find(u => u.role === 'admin') || SEED_USERS[2];
      mockUser = { uid: adminData.id, email: adminData.email, displayName: adminData.name };
      mockProfile = adminData;
    } else if (targetRole === 'provider') {
      const provData = SEED_USERS.find(u => u.role === 'provider') || SEED_USERS[1];
      mockUser = { uid: provData.id, email: provData.email, displayName: provData.name };
      mockProfile = provData;
      mockProvider = SEED_PROVIDERS.find(p => p.id === provData.id) || SEED_PROVIDERS[0];
    } else {
      const custData = SEED_USERS.find(u => u.role === 'customer') || SEED_USERS[0];
      mockUser = { uid: custData.id, email: custData.email, displayName: custData.name };
      mockProfile = custData;
    }

    setCurrentUser(mockUser);
    setUserProfile(mockProfile);
    setRole(targetRole);
    setProviderProfile(mockProvider);

    localStorage.setItem('fixnear_demo_session', JSON.stringify({
      user: mockUser,
      profile: mockProfile,
      provider: mockProvider
    }));
  };

  // Sign Up with Email and Password
  const signUpWithEmail = async (email, password, desiredRole, name, phone, city) => {
    if (isLiveFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const newProfile = {
        role: desiredRole,
        name: name || 'FixNear User',
        email,
        phone: phone || '',
        city: city || 'Mumbai',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', uid), newProfile);
      setUserProfile(newProfile);
      setRole(desiredRole);

      // If registered as provider, initialize provider profile
      if (desiredRole === 'provider') {
        const initialProvider = {
          userId: uid,
          name: name || 'Technician',
          phone: phone || '',
          city: city || 'Mumbai',
          skills: [],
          experienceYears: 1,
          serviceArea: city || 'Mumbai',
          bio: '',
          status: 'test_pending', // "test_pending" | "test_failed" | "under_review" | "approved" | "suspended"
          verifiedSkills: [],
          testScore: 0,
          ratingAvg: 0,
          ratingCount: 0,
          jobsDone: 0,
          isOnline: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'providers', uid), initialProvider);
        setProviderProfile(initialProvider);
      }

      return { user: cred.user, profile: newProfile };
    } else {
      // Offline / Demo registration simulation
      const mockUid = `demo-${Date.now()}`;
      const mockUser = { uid: mockUid, email, displayName: name };
      const newProfile = {
        role: desiredRole,
        name: name || 'FixNear User',
        email,
        phone: phone || '',
        city: city || 'Mumbai',
        createdAt: new Date().toISOString()
      };

      let initialProvider = null;
      if (desiredRole === 'provider') {
        initialProvider = {
          userId: mockUid,
          name: name || 'Technician',
          phone: phone || '',
          city: city || 'Mumbai',
          skills: [],
          experienceYears: 1,
          serviceArea: city || 'Mumbai',
          bio: '',
          status: 'test_pending',
          verifiedSkills: [],
          testScore: 0,
          ratingAvg: 0,
          ratingCount: 0,
          jobsDone: 0,
          isOnline: false,
          createdAt: new Date().toISOString()
        };
      }

      setCurrentUser(mockUser);
      setUserProfile(newProfile);
      setRole(desiredRole);
      setProviderProfile(initialProvider);

      localStorage.setItem('fixnear_demo_session', JSON.stringify({
        user: mockUser,
        profile: newProfile,
        provider: initialProvider
      }));

      return { user: mockUser, profile: newProfile };
    }
  };

  // Sign In with Email and Password
  const signInWithEmail = async (email, password) => {
    // Check if matching one of the 3 instant demo evaluation credentials
    if (email.toLowerCase().includes('admin@fixnear.com')) {
      setDemoAccount('admin');
      return { success: true, role: 'admin' };
    }
    if (email.toLowerCase().includes('provider@fixnear.com')) {
      setDemoAccount('provider');
      return { success: true, role: 'provider' };
    }
    if (email.toLowerCase().includes('customer@fixnear.com')) {
      setDemoAccount('customer');
      return { success: true, role: 'customer' };
    }

    if (isLiveFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', cred.user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserProfile(data);
        setRole(data.role || 'customer');
        return { success: true, role: data.role || 'customer' };
      }
      return { success: true, role: 'customer' };
    } else {
      // Local fallback
      setDemoAccount('customer');
      return { success: true, role: 'customer' };
    }
  };

  // Sign In with Google
  const signInWithGoogle = async (defaultRole = 'customer') => {
    if (isLiveFirebaseConfigured && auth && googleProvider) {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserProfile(data);
        setRole(data.role || 'customer');
        return { user: result.user, role: data.role || 'customer' };
      } else {
        const newProfile = {
          role: defaultRole,
          name: result.user.displayName || 'FixNear Customer',
          email: result.user.email,
          phone: result.user.phoneNumber || '',
          city: 'Mumbai',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        setRole(defaultRole);
        return { user: result.user, role: defaultRole };
      }
    } else {
      // Demo Google login fallback
      setDemoAccount(defaultRole);
      return { user: currentUser, role: defaultRole };
    }
  };

  // Sign Out
  const logOut = async () => {
    localStorage.removeItem('fixnear_demo_session');
    if (isLiveFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setProviderProfile(null);
    setRole('customer');
  };

  // Update profile
  const updateUserProfileData = async (updates) => {
    if (currentUser?.uid && isLiveFirebaseConfigured && db) {
      await updateDoc(doc(db, 'users', currentUser.uid), updates);
    }
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  // Update provider profile
  const updateProviderProfileData = async (updates) => {
    if (currentUser?.uid && isLiveFirebaseConfigured && db) {
      await updateDoc(doc(db, 'providers', currentUser.uid), updates);
    }
    setProviderProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        providerProfile,
        role,
        setRole,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        logOut,
        quickDemoLogin: setDemoAccount,
        updateUserProfile: updateUserProfileData,
        updateProviderProfile: updateProviderProfileData,
        isLiveFirebaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
