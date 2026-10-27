// ===================================================================
// FixNear Trust - Admin Providers Directory & Quality Watchdog
// Search & filter by status, skill, city, rating; Suspend/Reinstate actions;
// Auto-flags providers with rating < 3.5 (after >= 5 reviews) with "Needs attention" badge
// ===================================================================

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  ShieldAlert, 
  CheckCircle2, 
  Ban, 
  RotateCcw, 
  MapPin, 
  Award, 
  AlertTriangle,
  ArrowRight,
  Phone,
  Briefcase
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function AdminProvidersDesk() {
  const { technicians, suspendProvider, reinstateProvider, categories } = useStore();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'under_review' | 'suspended' | 'flagged'
  const [skillFilter, setSkillFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  // Suspend modal state
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [providerToSuspend, setProviderToSuspend] = useState(null);
  const [suspendReason, setSuspendReason] = useState('Average customer rating dropped below 3.5 threshold with repeated complaints on workmanship.');

  // Filtered list
  const filteredProviders = technicians.filter(tech => {
    // Search match
    const searchMatch = !search.trim() || 
      tech.name.toLowerCase().includes(search.toLowerCase()) ||
      (tech.phone && tech.phone.includes(search)) ||
      (tech.city && tech.city.toLowerCase().includes(search.toLowerCase()));

    // Skill match
    const skillMatch = skillFilter === 'all' || 
      (tech.skills && tech.skills.includes(skillFilter));

    // City match
    const cityMatch = cityFilter === 'all' || tech.city === cityFilter;

    // Status / Quality Watchdog match
    const isFlagged = (tech.ratingCount >= 5 && tech.ratingAvg < 3.5);
    let statusMatch = true;
    if (statusFilter === 'flagged') {
      statusMatch = isFlagged;
    } else if (statusFilter !== 'all') {
      statusMatch = tech.status === statusFilter;
    }

    return searchMatch && skillMatch && cityMatch && statusMatch;
  });

  const handleOpenSuspend = (tech) => {
    setProviderToSuspend(tech);
    setSuspendModalOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!providerToSuspend || !suspendReason.trim()) return;
    try {
      await suspendProvider(providerToSuspend.id || providerToSuspend.userId, suspendReason);
      showToast(`${providerToSuspend.name} has been suspended. Dispatches disabled.`, 'warning');
      setSuspendModalOpen(false);
      setProviderToSuspend(null);
    } catch (err) {
      showToast(`Suspend error: ${err.message}`, 'error');
    }
  };

  const handleReinstate = async (tech) => {
    try {
      await reinstateProvider(tech.id || tech.userId);
      showToast(`${tech.name} has been reinstated and is now active.`, 'success');
    } catch (err) {
      showToast(`Reinstate error: ${err.message}`, 'error');
    }
  };

  const uniqueCities = Array.from(new Set(technicians.map(t => t.city).filter(Boolean)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Desk Info */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1.5px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={22} color="var(--forest-700)" />
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
            Service Providers Directory & Quality Watchdog
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Monitor verified technician ratings, audit field records, and apply governance actions (Suspension / Reinstatement).
        </p>

        {/* Filter Controls Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '20px'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, city..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-light)',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-light)',
              fontSize: '13px',
              backgroundColor: '#FFFFFF'
            }}
          >
            <option value="all">All Statuses ({technicians.length})</option>
            <option value="approved">Approved & Active</option>
            <option value="under_review">Under Review</option>
            <option value="flagged">Needs Attention (Rating &lt; 3.5)</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Skill Filter */}
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-light)',
              fontSize: '13px',
              backgroundColor: '#FFFFFF'
            }}
          >
            <option value="all">All Trade Crafts</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-light)',
              fontSize: '13px',
              backgroundColor: '#FFFFFF'
            }}
          >
            <option value="all">All Cities</option>
            {uniqueCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Providers Table / Cards List */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border-light)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-warm)', borderBottom: '1px solid var(--border-light)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px', fontWeight: 800 }}>Specialist</th>
                <th style={{ padding: '14px 20px', fontWeight: 800 }}>Craft & Area</th>
                <th style={{ padding: '14px 20px', fontWeight: 800 }}>Rating & Jobs</th>
                <th style={{ padding: '14px 20px', fontWeight: 800 }}>Status / Quality Flag</th>
                <th style={{ padding: '14px 20px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No service providers matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProviders.map(tech => {
                  // Requirement: Auto-flag providers with rating below 3.5 (after at least 5 reviews) with red "Needs attention" badge
                  const isFlagged = (tech.ratingCount >= 5 && tech.ratingAvg < 3.5);
                  const isSuspended = tech.status === 'suspended';

                  return (
                    <tr 
                      key={tech.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: isFlagged ? '#FEF2F2' : isSuspended ? '#F9FAFB' : '#FFFFFF',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Specialist Name & Phone */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={tech.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80"}
                            alt={tech.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ fontSize: '14px', color: 'var(--forest-900)' }}>
                              {tech.name}
                            </strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {tech.phone || '+91 98200 00000'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Craft & Area */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-900)' }}>
                          {tech.skills?.[0] || 'Air Conditioning'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {tech.city} • {tech.serviceArea || 'Metro'}
                        </div>
                      </td>

                      {/* Rating & Jobs */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13.5px', fontWeight: 800, color: tech.ratingAvg < 3.5 && tech.ratingCount >= 5 ? '#DC2626' : '#B45309' }}>
                          <Star size={15} fill={tech.ratingAvg < 3.5 && tech.ratingCount >= 5 ? '#DC2626' : '#F59E0B'} color={tech.ratingAvg < 3.5 && tech.ratingCount >= 5 ? '#DC2626' : '#F59E0B'} />
                          <span>{tech.ratingAvg || 0}</span>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>
                            ({tech.ratingCount || 0} reviews)
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tech.jobsDone || 0} jobs completed
                        </div>
                      </td>

                      {/* Status / Auto-flag Badge */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <span className={`badge ${
                            tech.status === 'approved' ? 'badge-forest' : 
                            tech.status === 'under_review' ? 'badge-yellow' : 
                            tech.status === 'suspended' ? 'badge-red' : 'badge-sage'
                          }`} style={{ fontSize: '11px' }}>
                            {tech.status ? tech.status.toUpperCase().replace('_', ' ') : 'APPROVED'}
                          </span>

                          {/* Mandatory Auto-Flag Rule */}
                          {isFlagged && (
                            <span 
                              className="badge" 
                              style={{ 
                                backgroundColor: '#DC2626', 
                                color: '#FFFFFF', 
                                fontSize: '11px', 
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <AlertTriangle size={11} />
                              <span>Needs attention (&lt; 3.5)</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {isSuspended ? (
                          <button
                            type="button"
                            onClick={() => handleReinstate(tech)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#16A34A', borderColor: '#86EFAC', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <RotateCcw size={13} />
                            <span>Reinstate</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenSuspend(tech)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#DC2626', borderColor: '#FCA5A5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Ban size={13} />
                            <span>Suspend</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Provider Modal */}
      {suspendModalOpen && providerToSuspend && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#991B1B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ban size={20} color="#DC2626" />
              <span>Suspend Provider ({providerToSuspend.name})</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Suspending this technician immediately sets their dispatch status to Offline and prevents them from accepting new customer service bookings.
            </p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
              Suspension Reason (Required) *
            </label>
            <textarea
              rows={4}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Specify the reason for account suspension..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-light)',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSuspendModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                className="btn btn-primary"
                style={{ backgroundColor: '#DC2626', borderColor: '#B91C1C' }}
              >
                Confirm Account Suspension
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
