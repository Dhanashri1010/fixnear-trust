import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  UserX,
  CalendarCheck,
  ShieldAlert, 
  Wrench, 
  HelpCircle, 
  Star,
  Settings,
  Shield,
  FileText
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminNavbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    adminAPI.getStats()
      .then((res) => {
        if (isMounted && res.data?.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => {
        console.error('Failed to load navigation badges:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [currentPath]);

  // Real-time badge counts from stats
  const pendingApprovalsCount = stats?.needsAction?.waitingApprovals?.length || stats?.kpis?.waitingApprovals || 0;
  const openDisputesCount = stats?.needsAction?.openComplaints?.length || stats?.kpis?.openComplaints || 0;
  const flaggedProvidersCount = stats?.needsAction?.flaggedProviders?.length || 0;

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      path: '/admin',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'approvals',
      label: 'Approvals',
      path: '/admin/approvals',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      badgeColor: '#2563EB',
    },
    {
      id: 'providers',
      label: 'Providers',
      path: '/admin/providers',
      icon: Users,
      badge: flaggedProvidersCount > 0 ? `${flaggedProvidersCount} Alert` : null,
      badgeColor: '#DC2626',
    },
    {
      id: 'customers',
      label: 'Customers',
      path: '/admin/customers',
      icon: UserX,
      badge: null,
    },
    {
      id: 'bookings',
      label: 'Bookings Ops',
      path: '/admin/bookings',
      icon: CalendarCheck,
      badge: null,
    },
    {
      id: 'services',
      label: 'Services & Pricing',
      path: '/admin/services',
      icon: Wrench,
      badge: null,
    },
    {
      id: 'questions',
      label: 'Question Bank',
      path: '/admin/questions',
      icon: HelpCircle,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/admin/settings',
      icon: Settings,
      badge: null,
    },
    {
      id: 'disputes',
      label: 'Disputes',
      path: '/admin/disputes',
      icon: ShieldAlert,
      badge: openDisputesCount > 0 ? openDisputesCount : null,
      badgeColor: '#DC2626',
    },
    {
      id: 'reviews',
      label: 'Reviews',
      path: '/admin/reviews',
      icon: Star,
      badge: null,
    },
    {
      id: 'admins',
      label: 'Admin Users',
      path: '/admin/admins',
      icon: Shield,
      badge: null,
    },
    {
      id: 'audit-logs',
      label: 'Audit Trail',
      path: '/admin/audit-logs',
      icon: FileText,
      badge: null,
    },
  ];

  return (
    <nav 
      aria-label="Admin console navigation"
      className="bg-white rounded-2xl border border-slate-200 p-1.5 mb-6 flex gap-1.5 overflow-x-auto shadow-sm no-scrollbar"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.path === '/admin' 
          ? (currentPath === '/admin' || currentPath === '/admin/')
          : currentPath.startsWith(item.path);

        return (
          <Link
            key={item.id}
            to={item.path}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>

            {item.badge && (
              <span 
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none"
                style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : item.badgeColor }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
