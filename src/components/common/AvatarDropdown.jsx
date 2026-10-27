// ===================================================================
// FixNear Trust - Avatar Dropdown Menu
// Connected to AuthContext with dynamic user details and sign out
// ===================================================================

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  CalendarDays, 
  History, 
  Bell, 
  Settings, 
  LogOut, 
  ShieldCheck,
  ChevronRight,
  Shield,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export default function AvatarDropdown({ isOpen, onClose, onSelectOption }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, userProfile, role, logOut } = useAuth();
  const { bookings } = useStore();

  const displayName = userProfile?.name || currentUser?.displayName || "FixNear User";
  const displayEmail = userProfile?.email || currentUser?.email || "user@example.com";
  const displayAvatar = userProfile?.avatar || currentUser?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

  const activeBookingsCount = bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await logOut();
    onClose();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div 
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: 0,
        width: '280px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
        padding: '8px 0',
        zIndex: 1000,
        animation: 'fadeInSlide 180ms ease'
      }}
    >
      {/* User Header Summary */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={displayAvatar} 
            alt={displayName}
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </span>
              <ShieldCheck size={14} color="#1E3A2F" style={{ flexShrink: 0 }} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {displayEmail}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px' }}>
          <span className="badge badge-sage" style={{ fontSize: '11px', padding: '2px 8px', textTransform: 'capitalize' }}>
            {role === 'admin' ? '🛡️ Administrator' : role === 'provider' ? '🔧 Service Partner' : '👤 Customer Account'}
          </span>
        </div>
      </div>



      {role === 'provider' && (
        <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-light)' }}>
          <button
            type="button"
            onClick={() => handleNavigate('/provider')}
            style={{
              ...menuItemStyle,
              backgroundColor: 'var(--forest-50)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              color: 'var(--forest-900)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wrench size={16} color="var(--forest-700)" />
              <span>Provider Console</span>
            </div>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {role === 'customer' && (
        <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-light)' }}>
          <button
            type="button"
            onClick={() => handleNavigate('/provider/register')}
            style={{
              ...menuItemStyle,
              backgroundColor: 'var(--yellow-50)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              color: 'var(--yellow-900)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wrench size={16} color="var(--yellow-800)" />
              <span>Become a Service Partner</span>
            </div>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Primary User Navigation Menu */}
      <div style={{ padding: '6px 0' }}>
        <button 
          className="menu-item"
          onClick={() => handleNavigate('/bookings')}
          style={menuItemStyle}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarDays size={16} color="var(--forest-700)" />
            <span>My Bookings</span>
          </div>
          {activeBookingsCount > 0 && (
            <span className="badge badge-yellow" style={{ fontSize: '11px', padding: '1px 6px' }}>
              {activeBookingsCount} Active
            </span>
          )}
        </button>

        <button 
          className="menu-item"
          onClick={() => { onSelectOption('Profile'); onClose(); }}
          style={menuItemStyle}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={16} color="var(--forest-700)" />
            <span>Profile Details</span>
          </div>
          <ChevronRight size={14} color="var(--text-muted)" />
        </button>

        <button 
          className="menu-item"
          onClick={() => { onSelectOption('Notifications'); onClose(); }}
          style={menuItemStyle}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={16} color="var(--forest-700)" />
            <span>Notifications</span>
          </div>
          <span className="badge badge-forest" style={{ fontSize: '11px', padding: '1px 6px' }}>3</span>
        </button>

        <button 
          className="menu-item"
          onClick={() => { onSelectOption('Settings'); onClose(); }}
          style={menuItemStyle}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={16} color="var(--forest-700)" />
            <span>Settings</span>
          </div>
          <ChevronRight size={14} color="var(--text-muted)" />
        </button>
      </div>

      {/* Mandatory Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '4px 0' }} />

      {/* Sign Out */}
      <div style={{ padding: '4px 0' }}>
        <button 
          className="menu-item menu-item-danger"
          onClick={handleSignOut}
          style={{
            ...menuItemStyle,
            color: '#B91C1C'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LogOut size={16} color="#B91C1C" />
            <span style={{ fontWeight: 600 }}>Sign out</span>
          </div>
        </button>
      </div>
    </div>
  );
}

const menuItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  fontSize: '13.5px',
  color: 'var(--text-primary)',
  textAlign: 'left',
  transition: 'background-color 150ms ease',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer'
};
