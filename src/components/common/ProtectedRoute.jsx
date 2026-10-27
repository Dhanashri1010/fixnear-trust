// ===================================================================
// FixNear Trust - Role-Based Protected Route Guard
// Ensures customers, providers and admins only access authorized areas
// ===================================================================

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Checking portal security clearance...</p>
      </div>
    );
  }

  // If not logged in at all, redirect to login page with return url
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '600px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 28px',
          boxShadow: 'var(--shadow-md)',
          border: '1.5px solid var(--border-light)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#DC2626'
          }}>
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: 'var(--forest-900)' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.5 }}>
            This portal is reserved for <strong>{allowedRoles.join(' or ')}</strong> accounts. You are currently logged in as a <strong>{role}</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <ArrowLeft size={16} />
              <span>Return to Home</span>
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              <LogIn size={16} />
              <span>Sign in with Authorized Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
