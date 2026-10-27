// ===================================================================
// FixNear Trust - Main Admin Portal Console
// Complete Multi-Desk Console: Overview, Approvals, Providers, Disputes,
// Services & Pricing, Question Bank, and Reviews Moderation
// ===================================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Shield, LogOut } from 'lucide-react';

// Admin Sub-Components
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminOverviewTab from '../../components/admin/AdminOverviewTab';
import AdminApprovalsDesk from '../../components/admin/AdminApprovalsDesk';
import AdminProvidersDesk from '../../components/admin/AdminProvidersDesk';
import AdminDisputesDesk from '../../components/admin/AdminDisputesDesk';
import AdminServicesDesk from '../../components/admin/AdminServicesDesk';
import AdminQuestionsDesk from '../../components/admin/AdminQuestionsDesk';
import AdminReviewsDesk from '../../components/admin/AdminReviewsDesk';

export default function AdminDashboardPage() {
  const location = useLocation();
  const { userProfile, logOut, isLiveFirebaseConfigured } = useAuth();
  const { isDemoMode } = useStore();

  const pathname = location.pathname.replace(/\/$/, '');

  const renderActiveDesk = () => {
    switch (pathname) {
      case '/admin/approvals':
        return <AdminApprovalsDesk />;
      case '/admin/providers':
        return <AdminProvidersDesk />;
      case '/admin/disputes':
        return <AdminDisputesDesk />;
      case '/admin/services':
        return <AdminServicesDesk />;
      case '/admin/questions':
        return <AdminQuestionsDesk />;
      case '/admin/reviews':
        return <AdminReviewsDesk />;
      case '/admin':
      case '/admin/dashboard':
      default:
        return <AdminOverviewTab />;
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 16px 80px 16px' }}>
      <div className="container" style={{ maxWidth: '1060px' }}>
        
        {/* Top Header Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid var(--border-light)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--forest-100)',
              color: 'var(--forest-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={30} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                  {userProfile?.name || "FixNear Super Admin"}
                </h1>
                <span className="badge badge-yellow" style={{ fontSize: '11px', fontWeight: 800 }}>
                  CENTRAL OPS
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Central Operations & Trust Mediation Desk • {isLiveFirebaseConfigured ? 'Firebase Live Connected' : 'Local Sandbox Mode'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/" className="btn btn-secondary btn-sm">
              <span>View Customer App</span>
            </Link>
            <button 
              type="button" 
              onClick={logOut} 
              className="btn btn-outline btn-sm"
              style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <AdminNavbar />

        {/* Dynamic Desk View */}
        {renderActiveDesk()}

      </div>
    </div>
  );
}
