import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  Trash2,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { notificationsAPI, authAPI, getSocket } from '../../services/api';
import InitialsAvatar from './InitialsAvatar';

export default function UserActionModal({ activeAction, onClose }) {
  if (!activeAction) return null;

  const navigate = useNavigate();
  const { currentUser, userProfile, logOut } = useAuth();
  const { t, getErrorMessage, formatDate, formatTime } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleDownloadData = async () => {
    try {
      setDownloading(true);
      const res = await authAPI.downloadMyData();
      const dataStr = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fixnear-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setDeleteError(getErrorMessage(err, t('common.errorGeneral', 'Failed to download data.')));
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError(t('userActions.enterPasswordToDelete', 'Please enter your password to confirm deletion.'));
      return;
    }
    try {
      setDeleting(true);
      setDeleteError('');
      await authAPI.deleteMyAccount(deletePassword);
      setDeleteSuccess(true);
      setTimeout(async () => {
        await logOut();
        navigate('/login');
        onClose();
      }, 1500);
    } catch (err) {
      setDeleteError(getErrorMessage(err, t('common.errorGeneral', 'Failed to delete account.')));
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (activeAction === 'Notifications' && currentUser) {
      setLoadingNotifs(true);
      notificationsAPI.getNotifications()
        .then((res) => {
          if (res.success && res.notifications) {
            setNotifications(res.notifications);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingNotifs(false));

      const socket = getSocket();
      const handleNewNotif = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
      };
      socket.on('notification', handleNewNotif);
      return () => {
        socket.off('notification', handleNewNotif);
      };
    }
  }, [activeAction, currentUser]);

  const handleSignOutConfirm = async () => {
    await logOut();
    onClose();
    navigate('/login');
  };

  const displayName = userProfile?.name || currentUser?.name || 'Customer';
  const displayEmail = userProfile?.email || currentUser?.email || '';
  const displayPhone = userProfile?.phone || currentUser?.phone || 'Not provided';
  const displayCity = userProfile?.city || currentUser?.city || 'Mumbai';

  const getActionHeading = () => {
    if (activeAction === 'DownloadData') return t('userActions.downloadTitle', 'Download My Data');
    if (activeAction === 'DeleteAccount') return t('userActions.deleteTitle', 'Delete My Account');
    if (activeAction === 'Notifications') return t('notifications.title', 'Notifications');
    if (activeAction === 'Profile') return t('accountMenu.profile', 'Profile');
    if (activeAction === 'Settings') return t('admin.navSettings', 'Settings');
    if (activeAction === 'Sign out') return t('accountMenu.signOut', 'Sign Out');
    return activeAction;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(14, 27, 21, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
          animation: 'fadeInSlide 180ms ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-forest" style={{ fontSize: '12px' }}>
              FixNear
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
              {getActionHeading()}
            </h3>
          </div>

          <button 
            type="button"
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Content based on selected menu item */}
        <div style={{ padding: '24px' }}>
          
          {activeAction === 'Profile' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <InitialsAvatar
                  name={displayName}
                  avatarUrl={userProfile?.avatar || currentUser?.avatar}
                  size={64}
                />
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{displayName}</h4>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{displayEmail}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{displayPhone} · {displayCity}</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {t('common.city', 'City')} & {t('common.address', 'Address')}
                </label>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-warm)',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '6px',
                  fontSize: '13.5px',
                  border: '1px solid var(--border-light)'
                }}>
                  {displayCity}
                </div>
              </div>

              <div style={{
                padding: '14px',
                backgroundColor: 'var(--forest-50)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--forest-100)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ShieldCheck size={20} color="var(--forest-700)" />
                <span style={{ fontSize: '13px', color: 'var(--forest-800)', fontWeight: 600 }}>
                  {t('common.warrantyBadge', '30-Day FixNear Warranty')} · {t('common.verifiedBadge', 'Verified Skill')}
                </span>
              </div>
            </div>
          )}

          {activeAction === 'Notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loadingNotifs && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  {t('common.loading', 'Loading...')}
                </div>
              )}

              {!loadingNotifs && notifications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  <Bell size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <div>{t('notifications.emptyNotifications', 'No new notifications right now.')}</div>
                </div>
              )}

              {!loadingNotifs && notifications.map((notif) => (
                <div
                  key={notif._id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: notif.isRead ? 'var(--bg-warm)' : 'var(--forest-50)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--forest-900)' }}>
                    {notif.code ? t(`notifications.type${notif.type ? notif.type.charAt(0).toUpperCase() + notif.type.slice(1) : 'System'}`, notif.title) : notif.title}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {formatTime(notif.createdAt)} · {formatDate(notif.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeAction === 'Settings' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    {t('tracking.title', 'Live Job Tracking')}
                  </label>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t('tracking.subtitle', 'Monitor technician dispatch, status updates, and verify completion securely')}
                  </div>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    {t('tracking.finishCodeTitle', 'Private Job Finish Code')}
                  </label>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t('tracking.finishCodeDesc', 'Give this 4-digit code to the specialist ONLY when you have inspected and accepted the completed work.')}
                  </div>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    {t('legal.privacyTitle', 'Privacy & Data Protection Policy')}
                  </label>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {t('userActions.downloadDesc', 'Request a complete JSON archive of your personal profile, booking history, submitted reviews, and support tickets.')}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleDownloadData}
                      disabled={downloading}
                      style={{ fontSize: '12.5px', padding: '6px 12px' }}
                    >
                      <Download size={14} style={{ marginRight: '6px' }} />
                      {downloading ? t('common.loading', 'Loading...') : t('userActions.downloadBtn', 'Download JSON Data Export')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeAction === 'DownloadData' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--forest-50)',
                color: 'var(--forest-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Download size={26} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                {t('userActions.downloadTitle', 'Download My Data')}
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                {t('userActions.downloadDesc', 'Request a complete JSON archive of your personal profile, booking history, submitted reviews, and support tickets.')}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadData}
                disabled={downloading}
                style={{ width: '100%', padding: '10px', justifyContent: 'center' }}
              >
                {downloading ? t('common.loading', 'Loading...') : t('userActions.downloadBtn', 'Download JSON Data Export')}
              </button>
            </div>
          )}

          {activeAction === 'DeleteAccount' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Trash2 size={26} />
              </div>

              <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>
                {t('userActions.deleteTitle', 'Delete My Account')}
              </h4>

              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '12.5px',
                color: '#991B1B',
                lineHeight: 1.45
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                  <AlertTriangle size={15} /> {t('userActions.deleteTitle', 'Delete Account')}
                </div>
                {t('userActions.deleteWarning', 'Account deletion is irreversible. Your personal contact details and KYC documents will be permanently anonymized. Accounting records are retained for compliance.')}
              </div>

              {deleteError && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #EF4444',
                  borderRadius: 'var(--radius-sm)',
                  color: '#B91C1C',
                  fontSize: '12.5px',
                  marginBottom: '14px'
                }}>
                  {deleteError}
                </div>
              )}

              {deleteSuccess ? (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #10B981',
                  borderRadius: 'var(--radius-sm)',
                  color: '#065F46',
                  textAlign: 'center',
                  fontSize: '13.5px',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={24} style={{ margin: '0 auto 8px auto' }} />
                  {t('common.successGeneral', 'Account successfully deleted.')}
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    {t('userActions.enterPasswordToDelete', 'Enter your password to confirm deletion:')}
                  </label>
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <input
                      type="password"
                      className="input"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', paddingLeft: '36px' }}
                    />
                    <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={onClose}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleting || !deletePassword}
                      style={{
                        flex: 1,
                        backgroundColor: '#DC2626',
                        color: '#FFF',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 16px',
                        cursor: deleting || !deletePassword ? 'not-allowed' : 'pointer',
                        opacity: deleting || !deletePassword ? 0.6 : 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      {deleting ? t('common.loading', 'Deleting...') : t('userActions.deleteBtn', 'Permanently Delete Account')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeAction === 'Sign out' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <LogOut size={26} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                {t('accountMenu.signOut', 'Sign Out')}
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t('auth.loginSubtitle', 'Are you sure you want to sign out?')}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={handleSignOutConfirm}
                  style={{ flex: 1, backgroundColor: '#B91C1C', justifyContent: 'center' }}
                >
                  {t('accountMenu.signOut', 'Sign Out')}
                </button>
              </div>
            </div>
          )}

          {activeAction !== 'Sign out' && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', textAlign: 'right' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                {t('common.close', 'Close')}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
