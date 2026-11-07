import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  const { user, logOut } = useAuth();

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
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {user?.name || 'Administrator Console'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                  Central Ops
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Central Operations & Trust Mediation Desk • FixNear Trust Platform Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button 
              type="button" 
              onClick={logOut} 
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 12-Desk Sub-Navigation */}
        <AdminNavbar />

        {/* Dynamic Desk Workspace */}
        <div className="mt-6">
          {renderActiveDesk()}
        </div>

      </div>
    </div>
  );
}
