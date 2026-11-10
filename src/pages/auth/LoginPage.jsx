import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, role, signInWithEmail } = useAuth();
  const { showToast } = useToast();
  const { lang, changeLanguage, t, getErrorMessage } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination after login
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || location.state?.from?.pathname || null;

  // Handle logged-in user navigating back to login page
  useEffect(() => {
    if (currentUser) {
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [currentUser, role, from, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage(t('common.errorGeneral', 'Please enter both your email address and password.'));
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await signInWithEmail(email.trim().toLowerCase(), password);
      showToast(t('common.successGeneral', 'Welcome back! Successfully logged in.'), 'success');
      
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (res?.role === 'provider') navigate('/provider/dashboard');
        else if (res?.role === 'admin') navigate('/admin');
        else navigate('/');
      }
    } catch (err) {
      console.error(err);
      const message = getErrorMessage(err, t('errors.INVALID_CREDENTIALS', 'Invalid email or password.'));
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      backgroundColor: 'var(--bg-warm)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)'
      }}>
        {/* Language Selector Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <Globe size={15} color="var(--forest-700)" />
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिन्दी' },
              { code: 'mr', label: 'मराठी' },
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => changeLanguage(item.code)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: lang === item.code ? 700 : 500,
                  backgroundColor: lang === item.code ? 'var(--forest-700)' : 'var(--forest-50)',
                  color: lang === item.code ? '#FFFFFF' : 'var(--forest-800)',
                  transition: 'var(--transition-fast)'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: 'var(--forest-700)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: 'var(--shadow-md)'
          }}>
            <ShieldCheck size={30} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)', letterSpacing: '-0.02em' }}>
            {t('auth.loginTitle', 'Welcome to FixNear')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('brand.subtitle', 'Verified Home Services Marketplace')}
          </p>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FEE2E2',
            color: '#B91C1C',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            fontSize: '13.5px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {t('auth.emailLabel', 'Email Address')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="email"
                placeholder={t('auth.emailPlaceholder', 'name@example.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-light)',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {t('auth.passwordLabel', 'Password')}
              </label>
              <Link to="/reset-password" style={{ fontSize: '12px', color: 'var(--forest-700)', textDecoration: 'none', fontWeight: 600 }}>
                {t('auth.forgotPasswordLink', 'Forgot password?')}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-light)',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  fontSize: '15px',
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
                  top: '13px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '48px',
              fontSize: '16px',
              justifyContent: 'center',
              marginTop: '8px'
            }}
          >
            <span>{submitting ? t('common.loading', 'Signing in...') : t('nav.login', 'Sign In')}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Sign up prompt */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link to="/signup" style={{ color: 'var(--forest-700)', fontWeight: 700, textDecoration: 'underline' }}>
            {t('nav.signup', 'Sign Up')}
          </Link>
        </div>

        {/* Provider Sign-up link */}
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link to="/signup?role=provider" style={{ color: 'var(--forest-700)', fontWeight: 600 }}>
            {t('nav.joinPartner', 'Join as Service Partner')}
          </Link>
        </div>

      </div>
    </div>
  );
}
