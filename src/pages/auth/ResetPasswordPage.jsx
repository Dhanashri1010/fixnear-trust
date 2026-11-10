import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, CheckCircle2, AlertCircle, ArrowRight, Globe } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { lang, changeLanguage, t, getErrorMessage } = useLanguage();

  // Forgot password state (when token is absent)
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Reset password state (when token is present)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError(t('common.errorGeneral', 'Please enter your email address.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotSent(true);
      showToast(t('resetPassword.emailSentDesc', 'If an account exists with that email, we have sent instructions.'), 'success');
    } catch (err) {
      console.error(err);
      const msg = getErrorMessage(err, t('common.errorGeneral', 'Failed to send reset link. Please try again.'));
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError(t('auth.passwordReq', 'Password must be at least 8 characters long and contain both letters and numbers.'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('common.errorGeneral', 'Passwords do not match.'));
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      showToast(t('resetPassword.resetSuccess', 'Password updated successfully! You can now sign in.'), 'success');
    } catch (err) {
      console.error(err);
      const msg = getErrorMessage(err, t('errors.RESET_TOKEN_INVALID', 'Failed to reset password. Link may have expired.'));
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', backgroundColor: 'var(--bg-warm)' }}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)',
        }}
      >
        {/* Language selector toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
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
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11.5px',
                  fontWeight: lang === item.code ? 700 : 500,
                  backgroundColor: lang === item.code ? 'var(--forest-700)' : 'var(--forest-50)',
                  color: lang === item.code ? '#FFFFFF' : 'var(--forest-800)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'var(--forest-50)',
              color: 'var(--forest-700)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '6px' }}>
            {token ? t('resetPassword.resetTitle', 'Set New Password') : t('resetPassword.forgotTitle', 'Forgot Your Password?')}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            {token
              ? t('resetPassword.resetSubtitle', 'Choose a secure password for your FixNear account')
              : t('resetPassword.forgotSubtitle', 'Enter your registered email address to receive a secure reset link.')}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#991B1B',
              fontSize: '13px',
              marginBottom: '18px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* FORGOT PASSWORD FORM (NO TOKEN) */}
        {!token && (
          forgotSent ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <CheckCircle2 size={44} color="var(--forest-700)" style={{ margin: '0 auto 14px auto' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
                {t('resetPassword.emailSentTitle', 'Reset Link Dispatched')}
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                {t('resetPassword.emailSentDesc', 'If an account exists with that email, we have sent instructions. Please check your inbox.')}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                onClick={() => navigate('/login')}
              >
                {t('auth.backToLogin', 'Back to Log In')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  {t('auth.emailLabel', 'Email Address')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="email"
                    placeholder={t('auth.emailPlaceholder', 'name@example.com')}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-light)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '4px' }}
              >
                {loading ? t('common.loading', 'Sending...') : t('resetPassword.sendResetLinkBtn', 'Send Password Reset Link')}
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                <Link to="/login" style={{ color: 'var(--forest-700)', fontWeight: 700, textDecoration: 'none' }}>
                  {t('auth.backToLogin', 'Back to Log In')}
                </Link>
              </div>
            </form>
          )
        )}

        {/* RESET PASSWORD FORM (TOKEN PRESENT) */}
        {token && (
          success ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <CheckCircle2 size={44} color="var(--forest-700)" style={{ margin: '0 auto 14px auto' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
                {t('resetPassword.resetSuccess', 'Password reset complete!')}
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t('changePassword.successMsg', 'Your password has been changed. You can now log in.')}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                onClick={() => navigate('/login')}
              >
                {t('auth.backToLogin', 'Back to Log In')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  {t('changePassword.newPassword', 'New Password')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-light)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  {t('changePassword.confirmPassword', 'Confirm New Password')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-light)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '4px' }}
              >
                {loading ? t('common.loading', 'Updating Password...') : t('resetPassword.resetBtn', 'Reset Password')}
              </button>

              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                <Link to="/login" style={{ color: 'var(--forest-700)', fontWeight: 700, textDecoration: 'none' }}>
                  {t('auth.backToLogin', 'Back to Log In')}
                </Link>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}
