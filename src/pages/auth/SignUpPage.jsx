import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Globe
} from 'lucide-react';

const CITIES = [
  'Mumbai',
  'Bengaluru',
  'Delhi NCR',
  'Pune',
  'Hyderabad',
  'Kolkata',
  'Chennai',
  'Ahmedabad',
  'Jaipur',
  'Chandigarh',
];

export default function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, role, signUpWithEmail } = useAuth();
  const { showToast } = useToast();
  const { lang, changeLanguage, t, getErrorMessage } = useLanguage();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const roleParam = searchParams.get('role');

  const [desiredRole, setDesiredRole] = useState(roleParam === 'provider' ? 'provider' : 'customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle logged-in user navigating back to signup page
  useEffect(() => {
    if (currentUser) {
      if (redirectParam) {
        navigate(redirectParam, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [currentUser, role, redirectParam, navigate]);

  // Password strength checks
  const isLengthValid = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = isLengthValid && hasLetter && hasNumber;

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      setErrorMessage(t('common.errorGeneral', 'Please fill in all required fields.'));
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage(t('auth.passwordReq', 'Password must be at least 8 characters long and include both letters and numbers.'));
      return;
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '').trim();
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage(t('common.errorGeneral', 'Please enter a valid 10-digit mobile number.'));
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await signUpWithEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: desiredRole,
        phone: cleanPhone,
        city,
        preferredLanguage: lang,
      });

      showToast(t('common.successGeneral', 'Account created successfully!'), 'success');
      
      if (desiredRole === 'provider') {
        navigate('/provider/register');
      } else if (redirectParam) {
        navigate(redirectParam, { replace: true });
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      const message = getErrorMessage(err, t('common.errorGeneral', 'Could not create account. Please try again.'));
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
        maxWidth: '520px',
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

        {/* Header */}
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
            {t('auth.signupTitle', 'Create Your Account')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('auth.signupSubtitle', 'Join thousands who trust FixNear for verified home care')}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-warm-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => setDesiredRole('customer')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13.5px',
              fontWeight: desiredRole === 'customer' ? 700 : 500,
              backgroundColor: desiredRole === 'customer' ? '#FFFFFF' : 'transparent',
              color: desiredRole === 'customer' ? 'var(--forest-900)' : 'var(--text-secondary)',
              boxShadow: desiredRole === 'customer' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition-fast)'
            }}
          >
            {t('roles.customer', 'Customer')}
          </button>
          <button
            type="button"
            onClick={() => setDesiredRole('provider')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13.5px',
              fontWeight: desiredRole === 'provider' ? 700 : 500,
              backgroundColor: desiredRole === 'provider' ? '#FFFFFF' : 'transparent',
              color: desiredRole === 'provider' ? 'var(--forest-900)' : 'var(--text-secondary)',
              boxShadow: desiredRole === 'provider' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition-fast)'
            }}
          >
            {t('roles.provider', 'Service Partner (Technician)')}
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
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            fontSize: '13.5px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {t('auth.fullNameLabel', 'Full Name')}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="text"
                placeholder={t('auth.fullNameLabel', 'Full Name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-light)',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  fontSize: '14.5px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
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
                  fontSize: '14.5px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t('auth.phoneLabel', 'Phone Number')}
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border-light)',
                    paddingLeft: '40px',
                    paddingRight: '12px',
                    fontSize: '14.5px',
                    outline: 'none',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t('auth.cityLabel', 'City')}
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border-light)',
                    paddingLeft: '40px',
                    paddingRight: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('auth.passwordLabel', 'Password')}
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {t('auth.passwordRules', 'Min. 8 chars (letters & numbers)')}
              </span>
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
                  border: `1.5px solid ${password ? (isPasswordValid ? '#10B981' : '#F59E0B') : 'var(--border-light)'}`,
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
            {password && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11.5px' }}>
                <span style={{ color: isLengthValid ? '#059669' : '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {isLengthValid ? '✓' : '•'} {t('auth.min8Chars', '8+ characters')}
                </span>
                <span style={{ color: hasLetter && hasNumber ? '#059669' : '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {hasLetter && hasNumber ? '✓' : '•'} {t('auth.lettersAndNumbers', 'Letters & numbers')}
                </span>
              </div>
            )}
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
              marginTop: '10px'
            }}
          >
            <span>
              {submitting
                ? t('common.saving', 'Creating account...')
                : `${t('nav.signup', 'Sign Up')} as ${desiredRole === 'provider' ? t('roles.provider', 'Technician') : t('roles.customer', 'Customer')}`}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Existing account footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          {t('auth.alreadyAccount', 'Already have an account?')}{' '}
          <Link to="/login" style={{ color: 'var(--forest-700)', fontWeight: 700, textDecoration: 'underline' }}>
            {t('nav.login', 'Log In')}
          </Link>
        </div>
      </div>
    </div>
  );
}
