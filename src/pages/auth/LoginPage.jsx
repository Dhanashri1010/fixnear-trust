// ===================================================================
// FixNear Trust - Modern, High-Simplicity Login Page
// Email/Password + Google Auth + 1-Click Academic Demo Buttons
// ===================================================================

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  User, 
  Wrench, 
  Shield, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signInWithGoogle, quickDemoLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination after login
  const from = location.state?.from?.pathname || null;

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await signInWithEmail(email, password);
      showToast('Welcome back! Successfully logged in.', 'success');
      
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (res.role === 'admin') navigate('/admin');
        else if (res.role === 'provider') navigate('/provider');
        else navigate('/');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Invalid email or password. Please try again or use a demo login below.');
      showToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await signInWithGoogle('customer');
      showToast('Logged in with Google successfully!', 'success');
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (res.role === 'admin') navigate('/admin');
        else if (res.role === 'provider') navigate('/provider');
        else navigate('/');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Google authentication could not be completed. Please try email login.');
      showToast('Google sign-in was interrupted.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = (role) => {
    quickDemoLogin(role);
    showToast(`Switched to Demo ${role.toUpperCase()} account!`, 'info');
    if (role === 'admin') navigate('/admin');
    else if (role === 'provider') navigate('/provider');
    else navigate('/');
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
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            Welcome to FixNear
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Verified Home Services Marketplace
          </p>
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

        {/* Google One-Click Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border-light)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '22px 0',
          color: 'var(--text-muted)',
          fontSize: '12.5px',
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
          <span>or log in with email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="email"
                placeholder="name@example.com"
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Sign up prompt */}
        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--forest-700)', fontWeight: 700, textDecoration: 'underline' }}>
            Create one here
          </Link>
        </div>

        {/* 1-Click Academic Demo Section */}
        <div style={{
          marginTop: '28px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-warm)',
          border: '1px dashed var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Sparkles size={14} color="var(--yellow-800)" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase' }}>
              One-Click Demo Accounts (For Evaluators)
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Instantly preview and test any of the 3 portals with full access:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              style={{
                padding: '8px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--forest-800)'
              }}
            >
              <User size={16} color="var(--forest-700)" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('provider')}
              style={{
                padding: '8px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--forest-800)'
              }}
            >
              <Wrench size={16} color="var(--forest-700)" />
              <span>Provider</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              style={{
                padding: '8px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--forest-800)'
              }}
            >
              <Shield size={16} color="var(--forest-700)" />
              <span>Admin</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
