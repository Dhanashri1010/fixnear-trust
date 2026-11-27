// ===================================================================
// FixNear Trust - Dedicated Service Provider Sign-in Portal (/provider/login)
// Professional Partner Desk Authentication
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Wrench, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function ProviderLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, role, signInWithEmail } = useAuth();
  const { showToast } = useToast();
  const { t, getErrorMessage } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('redirect') || location.state?.from?.pathname || '/provider/dashboard';

  // If already logged in as a provider, redirect to provider dashboard
  useEffect(() => {
    if (currentUser) {
      if (role === 'provider') {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [currentUser, role, from, navigate]);

  const handleProviderLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage(t('common.errorGeneral', 'Please enter your registered partner email and password.'));
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await signInWithEmail(email.trim().toLowerCase(), password);
      
      // Enforce role check: must be a provider or admin
      if (res?.role !== 'provider' && res?.user?.role !== 'provider' && res?.role !== 'admin' && res?.user?.role !== 'admin') {
        throw new Error(t('errors.NOT_A_PROVIDER', 'This account is registered as a customer. Please use the Customer Sign-In portal or register as a service partner.'));
      }

      showToast(t('common.successGeneral', 'Welcome to FixNear Partner Desk!'), 'success');
      navigate('/provider/dashboard', { replace: true });
    } catch (err) {
      console.error('Provider sign-in error:', err);
      const message = getErrorMessage(err, t('errors.INVALID_CREDENTIALS', 'Invalid email or password.'));
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('somnath@gmail.com');
    setPassword('Password@123');
    setErrorMessage('');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      backgroundColor: 'var(--bg-warm)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)',
        border: '1.5px solid var(--border-light)'
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--forest-100)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--forest-800)',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(36, 74, 58, 0.12)'
          }}>
            <Wrench size={28} color="var(--forest-700)" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span className="badge badge-forest" style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('roles.provider', 'SERVICE PARTNER PORTAL')}
            </span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {t('providerAuth.signInTitle', 'Partner Desk Sign-In')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {t('providerAuth.signInSubtitle', 'Access your active jobs, extra quotation submissions, ratings & weekly payouts.')}
          </p>
        </div>

        {/* Demo Helper Box */}
        <div style={{
          backgroundColor: 'var(--forest-50)',
          border: '1px solid var(--forest-100)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          marginBottom: '24px',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontWeight: 700, color: 'var(--forest-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="var(--forest-700)" />
              {t('providerAuth.demoCredentialsTitle', 'Demo Verified Partner')}
            </span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--forest-700)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--forest-200)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer'
              }}
            >
              {t('providerAuth.fillDemo', 'Auto Fill')}
            </button>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12.5px', fontFamily: 'monospace' }}>
            {t('providerAuth.demoCredentials', 'somnath@gmail.com · Password@123')}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            marginBottom: '20px',
            color: '#991B1B',
            fontSize: '13.5px'
          }}>
            <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleProviderLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {t('auth.email', 'Partner Registered Email')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="somnath@gmail.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('auth.password', 'Account Password')}
              </label>
              <Link to="/reset-password" style={{ fontSize: '12.5px', color: 'var(--forest-700)', textDecoration: 'none', fontWeight: 600 }}>
                {t('auth.forgotPassword', 'Forgot?')}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14.5px',
              fontWeight: 700,
              justifyContent: 'center',
              marginTop: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {submitting ? (
              <span>{t('common.processing', 'Verifying Partner Credentials...')}</span>
            ) : (
              <>
                <span>{t('providerAuth.enterPartnerDesk', 'Sign In to Partner Desk')}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Portal Switching Links */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', textAlign: 'center' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>{t('providerAuth.notRegisteredPartner', 'New professional?')} </span>
            <Link to="/provider/register" style={{ color: 'var(--forest-700)', fontWeight: 700, textDecoration: 'none' }}>
              {t('providerAuth.registerAsPartner', 'Join & Register as Service Partner →')}
            </Link>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>{t('providerAuth.customerLookingForService', 'Looking to book services as customer?')} </span>
            <Link to="/login" style={{ color: 'var(--forest-800)', fontWeight: 600, textDecoration: 'underline' }}>
              {t('providerAuth.customerSignInLink', 'Customer Sign In')}
            </Link>
          </div>

          <div style={{ marginTop: '4px' }}>
            <Link to="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none' }}>
              {t('providerAuth.adminStaffAccess', 'Operations Staff & Admin Console')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
