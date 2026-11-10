import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authAPI } from '../../services/api';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { t, getErrorMessage } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Password rules validation
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasMinLength && hasLetter && hasNumber && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await authAPI.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setSuccess(t('changePassword.successMsg', 'Your password has been updated successfully! Other browser sessions have been signed out.'));
        
        // Update user state if mustChangePassword was active
        if (user && user.mustChangePassword) {
          setUser({ ...user, mustChangePassword: false });
        }

        // Clear fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Redirect to portal home after a short delay
        setTimeout(() => {
          if (user?.role === 'admin') navigate('/admin');
          else if (user?.role === 'provider') navigate('/provider/dashboard');
          else navigate('/bookings');
        }, 2000);
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError(getErrorMessage(err, t('errors.INVALID_CURRENT_PASSWORD', 'Failed to update password. Please check your current password.')));
    } finally {
      setLoading(false);
    }
  };

  const getBackPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'provider') return '/provider/dashboard';
    return '/';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        
        {/* Back Link (if not forced to change password) */}
        {(!user || !user.mustChangePassword) && (
          <button
            type="button"
            onClick={() => navigate(getBackPath())}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('common.back', 'Back')}
          </button>
        )}

        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {t('changePassword.title', 'Change Your Password')}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {t('changePassword.subtitle', 'Keep your account secure. Updating your password logs out all other devices.')}
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="flex items-start gap-2.5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t('changePassword.currentPassword', 'Current Password')}
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 min-w-[44px] justify-center"
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t('changePassword.newPassword', 'New Password')}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 min-w-[44px] justify-center"
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Validation Checklist */}
            <div className="mt-2 space-y-1 text-[11px] text-slate-500">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>{t('auth.min8Chars', '8+ characters')}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? 'text-emerald-600 font-semibold' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasLetter && hasNumber ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>{t('auth.lettersAndNumbers', 'Letters & numbers')}</span>
              </div>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t('changePassword.confirmPassword', 'Confirm New Password')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 text-base sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 min-w-[44px] justify-center"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-[11px] text-red-500 mt-1">{t('auth.passwordsDoNotMatch', 'Passwords do not match.')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors min-h-[44px]"
          >
            {loading ? (
              <span>{t('common.saving', 'Updating Password...')}</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{t('changePassword.submitBtn', 'Update Password')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
