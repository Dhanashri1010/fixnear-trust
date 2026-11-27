// ===================================================================
// FixNear Trust - Role-Based Protected Route Guard
// Ensures customers, providers and admins only access authorized areas
// ===================================================================

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, role, loading } = useAuth();
  const { t } = useLanguage();
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
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{t('common.checkingAuth', 'Checking portal security clearance...')}</p>
      </div>
    );
  }

  // If not logged in at all, redirect to appropriate login page with return url
  if (!currentUser) {
    let loginTarget = '/login';
    if (allowedRoles?.includes('admin')) {
      loginTarget = '/admin/login';
    } else if (allowedRoles?.includes('provider')) {
      loginTarget = '/provider/login';
    }
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(role)) {
    const isAdminRoute = allowedRoles.includes('admin');
    const isProviderRoute = allowedRoles.includes('provider');

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
            {t('common.accessRestricted', 'Access Restricted')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.5 }}>
            {isAdminRoute 
              ? t('admin.adminAccessOnly', 'Access to Central Operations is strictly restricted to administrator accounts.')
              : isProviderRoute
              ? t('providerAuth.accessRestrictedMsg', 'This portal is reserved for verified Service Providers.')
              : t('common.portalReservedFor', 'This portal is reserved for authorized accounts.')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isAdminRoute ? (
              <Link to="/admin/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <LogIn size={16} />
                <span>{t('admin.staffSignIn', 'Sign in as Administrator')}</span>
              </Link>
            ) : isProviderRoute ? (
              <Link to="/provider/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <LogIn size={16} />
                <span>{t('providerAuth.signInPartner', 'Sign in to Partner Desk')}</span>
              </Link>
            ) : (
              <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                <LogIn size={16} />
                <span>{t('common.signInAuthorized', 'Sign in with Authorized Account')}</span>
              </Link>
            )}

            {role === 'provider' ? (
              <Link to="/provider/dashboard" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <ArrowLeft size={16} />
                <span>{t('providerDashboard.backToDashboard', 'Return to Partner Desk')}</span>
              </Link>
            ) : (
              <Link to="/" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <ArrowLeft size={16} />
                <span>{t('common.backToHome', 'Return to Home')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
}
