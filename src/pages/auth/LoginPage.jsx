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
  Globe,
  User,
  Wrench,
  Shield
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, role, signInWithEmail } = useAuth();
  const { showToast } = useToast();
  const { lang, changeLanguage, t, getErrorMessage } = useLanguage();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || location.state?.from?.pathname || null;

  // Unified Role Tab: 'customer' or 'provider'
  const [loginRole, setLoginRole] = useState(() => {
    return searchParams.get('role') === 'provider' ? 'provider' : 'customer';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleRoleTabChange = (newRole) => {
    setLoginRole(newRole);
    setErrorMessage('');
    setEmail('');
    setPassword('');
  };

  const handleAutoFillDemo = () => {
    if (loginRole === 'provider') {
      setEmail('somnath@gmail.com');
      setPassword('Password@123');
    } else {
      setEmail('customer@fixnear.com');
      setPassword('Password@123');
    }
    setErrorMessage('');
  };

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
        if (res?.role === 'provider' || loginRole === 'provider') {
          navigate('/provider/dashboard');
        } else if (res?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
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
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px',
        boxShadow: 'var(--shadow-lg)',
        border: '1.5px solid var(--border-light)'
      }}>
        {/* Language Selector Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '18px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <Globe size={14} color="var(--forest-700)" />
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
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11.5px',
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

        {/* Segmented Role Switcher: Customer vs Service Provider */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          padding: '4px',
          backgroundColor: 'var(--forest-50)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          border: '1px solid var(--forest-100)'
        }}>
          <button
            type="button"
            onClick={() => handleRoleTabChange('customer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              fontSize: '13px',
              fontWeight: loginRole === 'customer' ? 700 : 500,
              backgroundColor: loginRole === 'customer' ? '#FFFFFF' : 'transparent',
              color: loginRole === 'customer' ? 'var(--forest-900)' : 'var(--text-secondary)',
              boxShadow: loginRole === 'customer' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={15} color={loginRole === 'customer' ? 'var(--forest-700)' : 'var(--text-muted)'} />
            <span>{t('auth.customerChoice', 'Customer')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('provider')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              fontSize: '13px',
              fontWeight: loginRole === 'provider' ? 700 : 500,
              backgroundColor: loginRole === 'provider' ? '#FFFFFF' : 'transparent',
              color: loginRole === 'provider' ? 'var(--forest-900)' : 'var(--text-secondary)',
              boxShadow: loginRole === 'provider' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Wrench size={15} color={loginRole === 'provider' ? 'var(--forest-700)' : 'var(--text-muted)'} />
            <span>{t('providerDashboard.partnerDesk', 'Service Provider')}</span>
          </button>
        </div>

        {/* Dynamic Header based on selected tab */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: loginRole === 'provider' ? 'var(--forest-800)' : 'var(--forest-700)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {loginRole === 'provider' ? <Wrench size={24} /> : <ShieldCheck size={26} />}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-900)', letterSpacing: '-0.02em' }}>
            {loginRole === 'provider'
              ? t('auth.providerLoginTitle', 'Service Partner Sign In')
              : t('auth.customerLoginTitle', 'Customer Sign In')}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px' }}>
            {loginRole === 'provider'
              ? t('auth.providerLoginSubtitle', 'Manage jobs, active dispatches & earnings')
              : t('auth.customerLoginSubtitle', 'Sign in to book home repairs and track orders')}
          </p>
        </div>

        {/* Dynamic Demo Credentials Auto-Fill Box */}
        <div style={{
          backgroundColor: loginRole === 'provider' ? 'var(--forest-50)' : 'var(--forest-50)',
          border: '1px dashed var(--forest-300)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-800)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {loginRole === 'provider' ? t('providerAuth.demoAccountHeader', 'Demo Partner Account') : t('auth.demoCustomerTitle', 'Demo Customer Account')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>
              {loginRole === 'provider' 
                ? t('providerAuth.demoCredentials', 'somnath@gmail.com · Password@123')
                : t('auth.demoCustomerCreds', 'customer@fixnear.com · Password@123')}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoFillDemo}
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

        {/* Error message alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FEE2E2',
            color: '#B91C1C',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '18px',
            fontSize: '13px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              {t('auth.emailLabel', 'Email Address')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="email"
                placeholder={loginRole === 'provider' ? 'somnath@gmail.com' : t('auth.emailPlaceholder', 'name@example.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-light)',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {t('auth.passwordLabel', 'Password')}
              </label>
              <Link to="/reset-password" style={{ fontSize: '12px', color: 'var(--forest-700)', textDecoration: 'none', fontWeight: 600 }}>
                {t('auth.forgotPasswordLink', 'Forgot password?')}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-light)',
                  paddingLeft: '38px',
                  paddingRight: '38px',
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
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              height: '46px',
              fontSize: '15px',
              justifyContent: 'center',
              marginTop: '6px'
            }}
          >
            <span>{submitting ? t('common.loading', 'Signing in...') : (loginRole === 'provider' ? t('providerAuth.signInPartner', 'Sign In to Partner Desk') : t('nav.login', 'Sign In'))}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Sign up prompt */}
        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link 
            to={loginRole === 'provider' ? "/provider/register" : "/signup"} 
            style={{ color: 'var(--forest-700)', fontWeight: 700, textDecoration: 'underline' }}
          >
            {loginRole === 'provider' ? t('nav.joinPartner', 'Join as Service Partner') : t('nav.signup', 'Sign Up')}
          </Link>
        </div>

        {/* Dedicated Admin Login Gateway (Restricted Console) */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-light)'
        }}>
          <Link
            to="/admin/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: 600,
              border: '1px solid #FECACA'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={15} color="#DC2626" />
              <span>{t('auth.adminPortalLink', 'Platform Staff? Administrator Console')}</span>
            </div>
            <ArrowRight size={14} color="#DC2626" />
          </Link>
        </div>

      </div>
    </div>
  );
}
