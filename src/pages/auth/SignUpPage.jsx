// ===================================================================
// FixNear Trust - Modern, High-Simplicity Sign Up Page
// Role Selection (Customer vs Service Provider) + Firebase Registration
// ===================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Wrench, 
  AlertCircle 
} from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuth();
  const { showToast } = useToast();

  const [desiredRole, setDesiredRole] = useState('customer'); // 'customer' | 'provider'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await signUpWithEmail(email, password, desiredRole, name, phone, city);
      showToast(`Account created successfully as ${desiredRole}!`, 'success');
      
      if (desiredRole === 'provider') {
        navigate('/provider/register');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message?.includes('email-already-in-use') 
        ? 'This email is already registered. Please log in instead.' 
        : 'Could not create account. Please try again.');
      showToast('Registration failed.', 'error');
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
            Create Your Account
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Join FixNear for verified, transparent home maintenance
          </p>
        </div>

        {/* Role Selector Tabs (Customer vs Provider) */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            I want to join FixNear as:
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
              <span>Customer</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', textAlign: 'center' }}>
                Need home repairs
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
              <span>Service Provider</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', textAlign: 'center' }}>
                Skilled technician
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
              Full Name
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="tel"
                  placeholder="+91 98200 00000"
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
                City
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
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
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Create Password (min 6 chars)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="password"
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
              marginTop: '10px'
            }}
          >
            <span>{submitting ? 'Creating account...' : `Sign Up as ${desiredRole === 'provider' ? 'Technician' : 'Customer'}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Existing account footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--forest-700)', fontWeight: 700, textDecoration: 'underline' }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
