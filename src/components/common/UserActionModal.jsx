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
  AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI, getSocket } from '../../services/api';
import InitialsAvatar from './InitialsAvatar';

export default function UserActionModal({ activeAction, onClose }) {
  if (!activeAction) return null;

  const navigate = useNavigate();
  const { currentUser, userProfile, logOut } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

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
              Account Center
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
              {activeAction}
            </h3>
          </div>

          <button 
            type="button"
            onClick={onClose}
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
                  Registered City & Region
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
                  Customer Account Active · Workmanship Protected
                </span>
              </div>
            </div>
          )}

          {activeAction === 'Notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loadingNotifs && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  Loading notifications...
                </div>
              )}

              {!loadingNotifs && notifications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  <Bell size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <div>No new notifications right now.</div>
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
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.createdAt).toLocaleDateString()}
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
                    Live Appointment Alerts
                  </label>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Receive real-time technician dispatch milestones and arrival notifications.
                  </div>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    4-Digit Finish Code Security
                  </label>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Your completion finish code is generated exclusively on the server for each booking to prevent premature payment release.
                  </div>
                </div>
              </div>
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
                Sign Out
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Are you sure you want to sign out of your FixNear Trust account?
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={handleSignOutConfirm}
                  style={{ flex: 1, backgroundColor: '#B91C1C' }}
                >
                  Confirm Sign Out
                </button>
              </div>
            </div>
          )}

          {activeAction !== 'Sign out' && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', textAlign: 'right' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
