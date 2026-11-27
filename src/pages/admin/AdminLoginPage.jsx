// ===================================================================
// FixNear Trust - Dedicated Admin Sign-in Portal (/admin/login)
// Isolated administrative authentication
// ===================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { signInWithEmail } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fillDemoAdmin = () => {
    setEmail('admin@fixnear.com');
    setPassword('Password@123');
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage(t('common.errorGeneral', 'Please enter administrative email and password.'));
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await signInWithEmail(email, password);
      if (res?.role !== 'admin' && res?.user?.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      showToast(t('admin.sessionVerified', 'Admin session verified. Access granted.'), 'success');
      navigate('/admin');
    } catch (err) {
      console.error(err);
      const msg = err.message || t('admin.invalidCredentials', 'Invalid administrator credentials.');
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      backgroundColor: 'var(--bg-warm, #F7F9F7)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl, 24px)',
        padding: '36px 32px',
        border: '1.5px solid var(--border-light, #E6EBE7)',
        boxShadow: 'var(--shadow-lg, 0 10px 28px rgba(32, 43, 36, 0.08))'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
          }}>
            <Shield size={30} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-900, #13271F)', letterSpacing: '-0.02em' }}>
            {t('admin.brandTitle', 'FixNear Administrator')}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #718078)', marginTop: '4px' }}>
            {t('admin.staffSignIn', 'Central Operations & Platform Governance')}
          </p>
        </div>

        {/* Demo Admin Auto Fill */}
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px dashed #FCA5A5',
          borderRadius: 'var(--radius-sm, 10px)',
          padding: '10px 14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('admin.demoAdminTitle', 'Demo Admin Account')}
            </div>
            <div style={{ fontSize: '12px', color: '#7F1D1D', fontFamily: 'monospace', marginTop: '2px' }}>
              {t('admin.demoAdminCreds', 'admin@fixnear.com · Password@123')}
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#DC2626',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FECACA',
              padding: '3px 10px',
              borderRadius: '9999px',
              cursor: 'pointer'
            }}
          >
            {t('providerAuth.fillDemo', 'Auto Fill')}
          </button>
        </div>

        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm, 10px)',
            marginBottom: '20px',
            fontSize: '13.5px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary, #718078)', marginBottom: '6px' }}>
              {t('admin.emailLabel', 'Administrator Email')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted, #8E9B94)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="email"
                placeholder="admin@fixnear.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: 'var(--radius-sm, 10px)',
                  border: '1.5px solid var(--border-light, #E6EBE7)',
                  backgroundColor: '#FFFFFF',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  fontSize: '14px',
                  color: 'var(--text-primary, #202B24)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary, #718078)', marginBottom: '6px' }}>
              {t('admin.passwordLabel', 'Password')}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted, #8E9B94)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: 'var(--radius-sm, 10px)',
                  border: '1.5px solid var(--border-light, #E6EBE7)',
                  backgroundColor: '#FFFFFF',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  fontSize: '14px',
                  color: 'var(--text-primary, #202B24)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm, 10px)',
              fontSize: '15px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginTop: '8px',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)'
            }}
          >
            <span>{submitting ? t('common.loading', 'Verifying...') : t('admin.adminLoginTitle', 'Sign in to Central Ops')}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted, #8E9B94)' }}>
          {t('admin.securityNotice', 'Restricted platform area. Privileged access is audited.')}
        </div>

        {/* Portal Switching Gateways */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-light, #E6EBE7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <Link
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm, 10px)',
              backgroundColor: 'var(--forest-50, #F2F7F4)',
              color: 'var(--forest-900, #13271F)',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: 600
            }}
          >
            <span>{t('auth.customerPortalLink', 'Customer? Return to Customer Marketplace')}</span>
            <ArrowRight size={14} color="var(--forest-700, #244A3A)" />
          </Link>

          <Link
            to="/provider/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm, 10px)',
              backgroundColor: '#F8FAFC',
              color: '#334155',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: 600,
              border: '1px solid #E2E8F0'
            }}
          >
            <span>{t('auth.servicePartnerPortalLink', 'Service Specialist? Partner Desk Sign In')}</span>
            <ArrowRight size={14} color="#64748B" />
          </Link>
        </div>
      </div>
    </div>
  );
}
