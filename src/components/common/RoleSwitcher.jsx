// ===================================================================
// FixNear Trust - Academic Evaluation Dev Toolbar (Behind Dev Flag)
// Only visible when VITE_ENABLE_DEV_DEMO_SWITCHER is true
// Allows 1-click role switching and 1-click Firestore database seeding
// ===================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, Shield, Sparkles, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function RoleSwitcher() {
  const isEnabled = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_ENABLE_DEV_DEMO_SWITCHER === 'true';
  const { role, quickDemoLogin } = useAuth();
  const { triggerDatabaseSeed } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [seeding, setSeeding] = useState(false);

  if (!isEnabled) return null;

  const handleRoleSwitch = (targetRole, targetPath) => {
    quickDemoLogin(targetRole);
    showToast(`Switched active portal to: ${targetRole.toUpperCase()}`, 'info');
    navigate(targetPath);
  };

  const handleSeed = async () => {
    if (role !== 'admin') {
      showToast('Database seeding requires Admin privileges. Please switch to Admin role first.', 'error');
      return;
    }
    setSeeding(true);
    try {
      const stats = await triggerDatabaseSeed();
      showToast('Database successfully seeded with 6 categories, 10 services & 90 questions!', 'success');
    } catch (err) {
      showToast(`Seed failed: ${err.message}`, 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <aside 
      aria-label="Development role and seed switcher"
      style={{
        position: 'fixed',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '6px 12px',
        boxShadow: 'var(--shadow-lg)',
        border: '1.5px solid var(--forest-700)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 9999,
        maxWidth: '96vw',
        fontSize: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        
        {/* Academic Dev Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 6px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--yellow-100)',
          border: '1px solid var(--yellow-200)',
          fontSize: '10.5px',
          fontWeight: 800,
          color: 'var(--yellow-800)'
        }}>
          <Sparkles size={11} color="var(--yellow-800)" />
          <span>EVALUATOR DEMO BAR</span>
        </div>

        {!collapsed && (
          <>
            {/* Role 1: Customer */}
            <button
              type="button"
              onClick={() => handleRoleSwitch('customer', '/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11.5px',
                fontWeight: 700,
                backgroundColor: role === 'customer' ? 'var(--forest-700)' : 'var(--bg-warm)',
                color: role === 'customer' ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              <Users size={12} />
              <span>Customer</span>
            </button>

            {/* Role 2: Provider */}
            <button
              type="button"
              onClick={() => handleRoleSwitch('provider', '/provider')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11.5px',
                fontWeight: 700,
                backgroundColor: role === 'provider' ? 'var(--forest-700)' : 'var(--bg-warm)',
                color: role === 'provider' ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              <Wrench size={12} />
              <span>Provider</span>
            </button>

            {/* Role 3: Admin */}
            <button
              type="button"
              onClick={() => handleRoleSwitch('admin', '/admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11.5px',
                fontWeight: 700,
                backgroundColor: role === 'admin' ? 'var(--forest-700)' : 'var(--bg-warm)',
                color: role === 'admin' ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              <Shield size={12} />
              <span>Admin</span>
            </button>

            {/* 1-Click Database Seeder */}
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              title="Seeds Firestore with 6 categories, 10 catalog items, and 90 test questions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11.5px',
                fontWeight: 700,
                backgroundColor: '#F0FDF4',
                color: '#166534',
                border: '1px solid #86EFAC',
                cursor: 'pointer'
              }}
            >
              <Database size={12} />
              <span>{seeding ? 'Seeding...' : 'Seed DB'}</span>
            </button>
          </>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            color: 'var(--text-muted)'
          }}
          title={collapsed ? "Expand Dev Toolbar" : "Collapse Dev Toolbar"}
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

      </div>
    </aside>
  );
}
