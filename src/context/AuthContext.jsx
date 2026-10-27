// ===================================================================
// FixNear Trust - Production Authentication Context
// REST API JWT in httpOnly Cookie + Role-Based Access Control
// ===================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getSocket } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [role, setRole] = useState('customer'); // 'customer' | 'provider' | 'admin'
  const [loading, setLoading] = useState(true);

  // Initialize and check active session on app mount
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const res = await authAPI.getMe();
        if (isMounted && res.success && res.user) {
          setCurrentUser(res.user);
          setUserProfile(res.user);
          setRole(res.user.role || 'customer');
          if (res.provider) {
            setProviderProfile(res.provider);
          }

          // Connect to real-time socket room
          const socket = getSocket();
          socket.emit('join_user', res.user.id);
          if (res.user.role === 'provider') {
            socket.emit('join_providers', res.user.city || 'mumbai');
          }
        }
      } catch (err) {
        // Not logged in or offline; remain in clean guest state
        if (isMounted) {
          setCurrentUser(null);
          setUserProfile(null);
          setProviderProfile(null);
          setRole('customer');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Email/Password Sign In
  const signInWithEmail = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setUserProfile(res.user);
        setRole(res.user.role || 'customer');

        // Connect socket
        const socket = getSocket();
        socket.emit('join_user', res.user.id);
        if (res.user.role === 'provider') {
          socket.emit('join_providers', res.user.city || 'mumbai');
        }

        return { success: true, user: res.user, role: res.user.role };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  // Email/Password Sign Up (accepts object or positional args)
  const signUpWithEmail = async (param1, password, role = 'customer', name, phone, city) => {
    try {
      const payload = typeof param1 === 'object' 
        ? param1 
        : { email: param1, password, role, name, phone, city };

      const res = await authAPI.register(payload);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setUserProfile(res.user);
        setRole(res.user.role || 'customer');

        const socket = getSocket();
        socket.emit('join_user', res.user.id);

        return { success: true, user: res.user, role: res.user.role };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
    }
  };

  // Sign Out
  const logOut = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setCurrentUser(null);
      setUserProfile(null);
      setProviderProfile(null);
      setRole('customer');
    }
  };

  // Update User Profile
  const updateUserProfileData = (updates) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  // Update Provider Profile
  const updateProviderProfileData = (updates) => {
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
        logOut,
        updateUserProfile: updateUserProfileData,
        updateProviderProfile: updateProviderProfileData,
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
export default AuthContext;
