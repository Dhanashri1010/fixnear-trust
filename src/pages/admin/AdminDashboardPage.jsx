import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shield, LogOut } from 'lucide-react';

// Admin Sub-Components (12 Complete Real MongoDB Desks)
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminOverviewTab from '../../components/admin/AdminOverviewTab';
import AdminApprovalsDesk from '../../components/admin/AdminApprovalsDesk';
import AdminProvidersDesk from '../../components/admin/AdminProvidersDesk';
import AdminCustomersDesk from '../../components/admin/AdminCustomersDesk';
import AdminBookingsDesk from '../../components/admin/AdminBookingsDesk';
import AdminServicesDesk from '../../components/admin/AdminServicesDesk';
import AdminQuestionsDesk from '../../components/admin/AdminQuestionsDesk';
import AdminSettingsDesk from '../../components/admin/AdminSettingsDesk';
import AdminDisputesDesk from '../../components/admin/AdminDisputesDesk';
import AdminReviewsDesk from '../../components/admin/AdminReviewsDesk';
import AdminUsersDesk from '../../components/admin/AdminUsersDesk';
import AdminAuditLogDesk from '../../components/admin/AdminAuditLogDesk';

export default function AdminDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const { t } = useLanguage();

  const pathname = location.pathname.replace(/\/$/, '');

  const renderActiveDesk = () => {
    switch (pathname) {
      case '/admin/approvals':
        return <AdminApprovalsDesk />;
      case '/admin/providers':
        return <AdminProvidersDesk />;
      case '/admin/customers':
        return <AdminCustomersDesk />;
      case '/admin/bookings':
        return <AdminBookingsDesk />;
      case '/admin/services':
        return <AdminServicesDesk />;
      case '/admin/questions':
        return <AdminQuestionsDesk />;
      case '/admin/settings':
        return <AdminSettingsDesk />;
      case '/admin/disputes':
        return <AdminDisputesDesk />;
      case '/admin/reviews':
        return <AdminReviewsDesk />;
      case '/admin/admins':
        return <AdminUsersDesk />;
      case '/admin/audit-logs':
        return <AdminAuditLogDesk />;
      case '/admin':
      case '/admin/dashboard':
      default:
        return <AdminOverviewTab />;
    }
  };

  return (
    <div style={{ backgroundColor: '#F0F4F2', minHeight: '100vh', padding: '32px 20px 80px 20px' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        
        {/* Top Header Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          padding: '22px 28px',
          boxShadow: '0 1px 4px rgba(22, 44, 35, 0.05)',
          border: '1px solid #DCE4DF',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'var(--forest-900, #0E1B15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              flexShrink: 0,
            }}>
              <Shield size={26} color="#60A5FA" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-900, #0E1B15)', margin: 0 }}>
                  {user?.name || t('admin.deskTitle')}
                </h1>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #FDE68A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {t('admin.centralOps')}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted, #73827A)', marginTop: '4px', margin: 0 }}>
                {t('admin.governanceTitle')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="button" 
              onClick={async () => {
                await logOut();
                navigate('/admin/login');
              }} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid #FECDD3',
                color: '#E11D48',
                backgroundColor: '#FFF1F2',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFE4E6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFF1F2'; }}
            >
              <LogOut size={15} />
              <span>{t('admin.signOut')}</span>
            </button>
          </div>
        </div>

        {/* 12-Desk Sub-Navigation */}
        <AdminNavbar />

        {/* Dynamic Desk Workspace */}
        <div style={{ marginTop: '20px' }}>
          {renderActiveDesk()}
        </div>

      </div>
    </div>
  );
}
