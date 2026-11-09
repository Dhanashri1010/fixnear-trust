// ===================================================================
// FixNear Trust - Modern, High-Simplicity Sign Up Page
// Role Selection (Customer vs Service Provider) + Account Registration
// ===================================================================

import React, { useState } from 'react';
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
  ArrowRight, 
  Wrench, 
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2
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
  const { signUpWithEmail } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

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
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await signUpWithEmail(email.trim().toLowerCase(), password, desiredRole, name.trim(), cleanPhone, city);
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
      const message = err.message || 'Could not create account. Please try again.';
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
            {t('auth.signupSubtitle', 'Join FixNear for verified, transparent home maintenance')}
          </p>
        </div>

        {/* Role Selector Tabs (Customer vs Provider) */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t('auth.roleSelectLabel', 'I want to join FixNear as:')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setDesiredRole('customer')}
              style={{
                padding: '14px 12px',
                borderRadius: 'var(--radius-md)',
                border: desiredRole === 'customer' ? '2px solid var(--forest-700)' : '1.5px solid var(--border-light)',
                backgroundColor: desiredRole === 'customer' ? 'var(--forest-50)' : '#FFFFFF',
                color: desiredRole === 'customer' ? 'var(--forest-900)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              <User size={22} color={desiredRole === 'customer' ? 'var(--forest-700)' : 'var(--text-muted)'} />
              <span>{t('roles.customer', 'Customer')}</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', textAlign: 'center' }}>
                {t('auth.customerChoice', 'Need home repair services')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDesiredRole('provider')}
              style={{
                padding: '14px 12px',
                borderRadius: 'var(--radius-md)',
                border: desiredRole === 'provider' ? '2px solid var(--forest-700)' : '1.5px solid var(--border-light)',
                backgroundColor: desiredRole === 'provider' ? 'var(--forest-50)' : '#FFFFFF',
                color: desiredRole === 'provider' ? 'var(--forest-900)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              <Wrench size={22} color={desiredRole === 'provider' ? 'var(--forest-700)' : 'var(--text-muted)'} />
              <span>{t('roles.provider', 'Service Provider')}</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', textAlign: 'center' }}>
                {t('auth.providerChoice', 'Skilled technician')}
              </span>
            </button>
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#991B1B',
            fontSize: '13.5px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {t('auth.fullNameLabel', 'Full Name')}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="text"
                placeholder="e.g. Ramesh Sharma"
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
                  fontSize: '15px',
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
                  fontSize: '15px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t('auth.phoneLabel', 'Phone Number')}
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="tel"
                  placeholder="9820012345"
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
                    fontSize: '14px',
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
                Min. 8 chars (letters & numbers)
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
                  {isLengthValid ? '✓' : '•'} 8+ characters
                </span>
                <span style={{ color: hasLetter && hasNumber ? '#059669' : '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {hasLetter && hasNumber ? '✓' : '•'} Letters & numbers
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
            <span>{submitting ? t('common.saving', 'Creating account...') : `${t('nav.signup', 'Sign Up')} as ${desiredRole === 'provider' ? t('roles.provider', 'Technician') : t('roles.customer', 'Customer')}`}</span>
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
