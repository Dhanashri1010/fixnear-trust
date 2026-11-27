// ===================================================================
// FixNear Trust - Avatar Dropdown Menu (Phase 4 Redesign)
// Role-isolated: Customer, Provider, and Admin menus
// Note: Sign Out moved into Settings panel with confirmation
// ===================================================================

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  CalendarDays, 
  Bell, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  Wrench,
  Download,
  Trash2,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Globe,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import InitialsAvatar from './InitialsAvatar';

export default function AvatarDropdown({ isOpen, onClose, onSelectOption = () => {} }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, userProfile, role, logOut } = useAuth();
  const { t } = useLanguage();

  const handleAdminSignOut = async () => {
    onClose();
    await logOut();
    navigate('/admin/login');
  };

  const displayName = userProfile?.name || currentUser?.name || "FixNear User";
  const displayEmail = userProfile?.email || currentUser?.email || "user@example.com";
  const displayAvatar = userProfile?.avatar || currentUser?.avatar || "";

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

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const getRoleBadge = () => {
    if (role === 'admin') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: '#DC2626',
          color: '#FFFFFF',
          padding: '2px 8px',
          borderRadius: '4px',
          letterSpacing: '0.04em'
        }}>
          {`🛡️ ${t('roles.admin', 'ADMINISTRATOR')}`}
        </span>
      );
    }
    if (role === 'provider') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: 'var(--forest-100)',
          color: 'var(--forest-800)',
          padding: '2px 8px',
          borderRadius: '4px',
          letterSpacing: '0.04em'
        }}>
          {`🔧 ${t('roles.provider', 'SERVICE PARTNER')}`}
        </span>
      );
    }
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: '#F0F3F0',
        color: 'var(--text-secondary)',
        padding: '2px 8px',
        borderRadius: '4px'
      }}>
        {`👤 ${t('roles.customer', 'CUSTOMER ACCOUNT')}`}
      </span>
    );
  };

  return (
    <div 
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: 0,
        width: '290px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 8px 30px rgba(32, 43, 36, 0.12)',
        border: '1.5px solid var(--border-light)',
        padding: '8px 0',
        zIndex: 1000,
        animation: 'fadeInSlide 180ms ease'
      }}
    >
      {/* User Header Summary */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <InitialsAvatar
            name={displayName}
            avatarUrl={displayAvatar}
            size={42}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </span>
              <ShieldCheck size={14} color="var(--forest-700)" style={{ flexShrink: 0 }} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {displayEmail}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '8px' }}>
          {getRoleBadge()}
        </div>
      </div>

      {/* Role-Specific Menu Items */}
      <div style={{ padding: '6px 0' }}>
        
        {/* ===================== CUSTOMER ROLE MENU ===================== */}
        {role === 'customer' && (
          <>
            <button 
              className="menu-item"
              onClick={() => { onSelectOption('Profile'); onClose(); }}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={16} color="var(--forest-700)" />
                <span>{t('accountMenu.profile', 'Profile')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => handleNavigate('/bookings')}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarDays size={16} color="var(--forest-700)" />
                <span>{t('nav.myBookings', 'My Bookings')}</span>
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
                <span>{t('notifications.title', 'Notifications')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => { onSelectOption('Settings'); onClose(); }}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings size={16} color="var(--forest-700)" />
                <span>{t('admin.navSettings', 'Settings')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => { onSelectOption('DownloadData'); onClose(); }}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Download size={16} color="var(--forest-700)" />
                <span>{t('userActions.downloadTitle', 'Download My Data')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '6px 0' }} />

            <button 
              className="menu-item"
              onClick={() => { onSelectOption('DeleteAccount'); onClose(); }}
              style={{
                ...menuItemStyle,
                color: '#DC2626'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trash2 size={16} color="#DC2626" />
                <span style={{ fontWeight: 600 }}>{t('userActions.deleteTitle', 'Delete My Account')}</span>
              </div>
              <ChevronRight size={14} color="#DC2626" />
            </button>
          </>
        )}

        {/* ===================== PROVIDER ROLE MENU ===================== */}
        {role === 'provider' && (
          <>
            <button 
              className="menu-item"
              onClick={() => handleNavigate('/provider/dashboard')}
              style={{
                ...menuItemStyle,
                backgroundColor: 'var(--forest-50)',
                color: 'var(--forest-900)',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LayoutDashboard size={16} color="var(--forest-700)" />
                <span>{t('providerDashboard.title', 'Provider Dashboard')}</span>
              </div>
              <ChevronRight size={14} color="var(--forest-700)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => handleNavigate('/provider/dashboard?tab=active')}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={16} color="var(--forest-700)" />
                <span>{t('providerDashboard.tabActiveJobs', 'My Jobs')}</span>
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
                <span>{t('notifications.title', 'Notifications')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => { onSelectOption('Profile'); onClose(); }}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={16} color="var(--forest-700)" />
                <span>{t('accountMenu.profile', 'Profile')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => { onSelectOption('Settings'); onClose(); }}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings size={16} color="var(--forest-700)" />
                <span>{t('admin.navSettings', 'Settings')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => { onSelectOption('DownloadData'); onClose(); }}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Download size={16} color="var(--forest-700)" />
                <span>{t('userActions.downloadTitle', 'Download My Data')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '6px 0' }} />

            <button 
              className="menu-item"
              onClick={() => { onSelectOption('DeleteAccount'); onClose(); }}
              style={{
                ...menuItemStyle,
                color: '#DC2626'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trash2 size={16} color="#DC2626" />
                <span style={{ fontWeight: 600 }}>{t('userActions.deleteTitle', 'Delete My Account')}</span>
              </div>
              <ChevronRight size={14} color="#DC2626" />
            </button>
          </>
        )}

        {/* ===================== ADMIN ROLE MENU ===================== */}
        {role === 'admin' && (
          <>
            <button 
              className="menu-item"
              onClick={() => handleNavigate('/admin')}
              style={{
                ...menuItemStyle,
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                fontWeight: 700
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={16} color="#DC2626" />
                <span>{t('admin.deskTitle', 'Central Operations Desk')}</span>
              </div>
              <ChevronRight size={14} color="#DC2626" />
            </button>

            <button 
              className="menu-item"
              onClick={() => handleNavigate('/services')}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={16} color="var(--forest-700)" />
                <span>{t('nav.catalog', 'Browse Marketplace & Services')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => handleNavigate('/admin/settings')}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings size={16} color="var(--forest-700)" />
                <span>{t('admin.navSettings', 'Platform Settings Desk')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => handleNavigate('/admin/audit-logs')}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={16} color="var(--forest-700)" />
                <span>{t('admin.navAudit', 'Audit Trail & Logs')}</span>
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
                <span>{t('notifications.title', 'Notifications')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="menu-item"
              onClick={() => { onSelectOption('Profile'); onClose(); }}
              style={menuItemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={16} color="var(--forest-700)" />
                <span>{t('accountMenu.profile', 'Administrator Profile')}</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>

            <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '6px 0' }} />

            <button 
              className="menu-item"
              onClick={handleAdminSignOut}
              style={{
                ...menuItemStyle,
                color: '#DC2626',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LogOut size={16} color="#DC2626" />
                <span>{t('accountMenu.signOut', 'Sign Out')}</span>
              </div>
              <ChevronRight size={14} color="#DC2626" />
            </button>
          </>
        )}

      </div>
    </div>
  );
}

const menuItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '9px 16px',
  fontSize: '13.5px',
  color: 'var(--text-primary)',
  textAlign: 'left',
  transition: 'background-color 150ms ease',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer'
};
