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
        const payload = res.data || res;
        if (isMounted && payload?.success) {
          setStats(payload.stats);
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
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #DCE4DF',
        padding: '10px 12px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
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
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              backgroundColor: isActive ? 'var(--forest-800, #162C23)' : '#F8FAFC',
              color: isActive ? '#FFFFFF' : '#475569',
              border: isActive ? '1px solid var(--forest-900, #0E1B15)' : '1px solid #E2E8F0',
              boxShadow: isActive ? '0 2px 6px rgba(22, 44, 35, 0.2)' : 'none',
            }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            <span>{item.label}</span>

            {item.badge && (
              <span 
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  color: '#FFFFFF',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (item.badgeColor || '#DC2626'),
                  lineHeight: '1',
                  marginLeft: '2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
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
