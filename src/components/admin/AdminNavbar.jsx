// ===================================================================
// FixNear Trust - Admin Portal Navigation Sub-Navbar
// Tabs with real-time badges for pending approvals, disputes & flagged pros
// ===================================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  ShieldAlert, 
  Wrench, 
  HelpCircle, 
  Star
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function AdminNavbar() {
  const location = useLocation();
  const { technicians, disputes, reviews } = useStore();

  const currentPath = location.pathname;

  // Real-time badge counts
  const pendingApprovalsCount = technicians.filter(t => t.status === 'under_review').length;
  const openDisputesCount = disputes.filter(d => d.status === 'OPEN').length;
  const flaggedProvidersCount = technicians.filter(t => t.ratingCount >= 5 && t.ratingAvg < 3.5).length;

  const navItems = [
    {
      id: 'overview',
      label: 'Console Overview',
      path: '/admin',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'approvals',
      label: 'Approval Desk',
      path: '/admin/approvals',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      badgeColor: '#2563EB'
    },
    {
      id: 'providers',
      label: 'Providers Directory',
      path: '/admin/providers',
      icon: Users,
      badge: flaggedProvidersCount > 0 ? `${flaggedProvidersCount} Alert` : null,
      badgeColor: '#DC2626'
    },
    {
      id: 'disputes',
      label: 'Disputes Mediation',
      path: '/admin/disputes',
      icon: ShieldAlert,
      badge: openDisputesCount > 0 ? openDisputesCount : null,
      badgeColor: '#DC2626'
    },
    {
      id: 'services',
      label: 'Services & Pricing',
      path: '/admin/services',
      icon: Wrench,
      badge: null
    },
    {
      id: 'questions',
      label: 'Question Bank',
      path: '/admin/questions',
      icon: HelpCircle,
      badge: null
    },
    {
      id: 'reviews',
      label: 'Reviews Moderation',
      path: '/admin/reviews',
      icon: Star,
      badge: null
    }
  ];

  return (
    <nav 
      aria-label="Admin console navigation"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border-light)',
        padding: '6px',
        marginBottom: '24px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        boxShadow: 'var(--shadow-sm)'
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
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: isActive ? 800 : 600,
              color: isActive ? '#FFFFFF' : 'var(--forest-900)',
              backgroundColor: isActive ? 'var(--forest-700)' : 'transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon size={16} />
            <span>{item.label}</span>

            {item.badge && (
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : item.badgeColor,
                color: '#FFFFFF'
              }}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
