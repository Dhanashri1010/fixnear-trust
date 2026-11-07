// ===================================================================
// FixNear Trust - Admin Overview Tab (Phase D)
// Live MongoDB KPIs, Needs-Action Desk, 7-Day Bookings Chart, Top 5 Specialists
// ===================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Wrench, 
  CheckCircle2, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOverviewTab() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError(err.message || 'Unable to load real-time metrics.');
      showToast('Failed to load dashboard metrics: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)' }}>Aggregating Live Platform Operations...</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Querying MongoDB bookings, verification queues, and dispute escrow balances.</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ padding: '40px 24px', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '16px', textAlign: 'center' }}>
        <AlertCircle size={32} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#991B1B' }}>Failed to Load Central Operations</h3>
        <p style={{ fontSize: '13.5px', color: '#B91C1C', margin: '4px 0 16px 0' }}>{error || 'Unable to retrieve statistics from server.'}</p>
        <button type="button" onClick={fetchStats} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={14} /> Retry Operations Sync
        </button>
      </div>
    );
  }

  const {
    totalBookings = 0,
    activeJobs = 0,
    providersOnline = 0,
    providersWaiting = 0,
    openComplaints = 0,
    totalCustomers = 0,
    totalProviders = 0,
    grossRevenue = 0,
    totalPlatformFees = 0,
    averageRating = 5.0,
    bookingsPerDay = [],
    topProviders = [],
    needsAction = { waitingApprovals: [], openComplaints: [], flaggedProviders: [], noProviderBookings: [] }
  } = stats;

  const hasUrgentActions = 
    (needsAction.waitingApprovals?.length > 0) ||
    (needsAction.openComplaints?.length > 0) ||
    (needsAction.flaggedProviders?.length > 0) ||
    (needsAction.noProviderBookings?.length > 0);

  const maxDayCount = Math.max(...bookingsPerDay.map(d => d.count || 0), 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 8 Core Live System Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px'
      }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Bookings</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>{totalBookings}</div>
          <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginTop: '2px' }}>✓ Live database sync</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Jobs</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{activeJobs}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>In progress right now</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Pros Online</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>{providersOnline}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Of {totalProviders} registered</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Waiting Approvals</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: providersWaiting > 0 ? '#2563EB' : 'var(--forest-900)', marginTop: '4px' }}>
            {providersWaiting}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>KYC review ready</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Open Disputes</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: openComplaints > 0 ? '#DC2626' : '#16A34A', marginTop: '4px' }}>
            {openComplaints}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
            {openComplaints > 0 ? 'Requires mediation' : 'Zero disputes'}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gross Volume</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
            ₹{grossRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginTop: '2px' }}>Escrow protected</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Platform Fees</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-800)', marginTop: '4px' }}>
            ₹{totalPlatformFees.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>FixNear commission & fee</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Average Rating</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#B45309', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={22} fill="#F59E0B" color="#F59E0B" />
            <span>{averageRating}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Across approved specialists</div>
        </div>
      </div>

      {/* Needs Your Action Desk Box */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: hasUrgentActions ? '2px solid #FCA5A5' : '1.5px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={22} color={hasUrgentActions ? '#DC2626' : '#16A34A'} />
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                Needs Your Action Desk
              </h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Operational items requiring administrator review or intervention
              </div>
            </div>
          </div>
          <button type="button" onClick={fetchStats} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          
          {/* Action 1: Pending Approvals */}
          <Link 
            to="/admin/approvals"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: needsAction.waitingApprovals?.length > 0 ? '#EFF6FF' : 'var(--bg-warm)',
              border: needsAction.waitingApprovals?.length > 0 ? '1.5px solid #93C5FD' : '1px solid var(--border-light)',
              textDecoration: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: needsAction.waitingApprovals?.length > 0 ? '#1D4ED8' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                Provider Approvals
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
                {needsAction.waitingApprovals?.length || 0} Waiting
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                KYC and skill test ready for review
              </div>
            </div>
            <ArrowRight size={18} color="var(--forest-700)" />
          </Link>

          {/* Action 2: Open Disputes */}
          <Link 
            to="/admin/disputes"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: needsAction.openComplaints?.length > 0 ? '#FEF2F2' : 'var(--bg-warm)',
              border: needsAction.openComplaints?.length > 0 ? '1.5px solid #FCA5A5' : '1px solid var(--border-light)',
              textDecoration: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: needsAction.openComplaints?.length > 0 ? '#B91C1C' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                Complaints & Disputes
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
                {needsAction.openComplaints?.length || 0} Open Disputes
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Customer / Provider escrow arbitration
              </div>
            </div>
            <ArrowRight size={18} color="var(--forest-700)" />
          </Link>

          {/* Action 3: Flagged Providers */}
          <Link 
            to="/admin/providers?status=flagged"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: needsAction.flaggedProviders?.length > 0 ? '#FFFBEB' : 'var(--bg-warm)',
              border: needsAction.flaggedProviders?.length > 0 ? '1.5px solid #FCD34D' : '1px solid var(--border-light)',
              textDecoration: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: needsAction.flaggedProviders?.length > 0 ? '#B45309' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                Quality Watchdog
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
                {needsAction.flaggedProviders?.length || 0} Needs Attention
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Rating &lt; 3.5 with &ge; 5 completed jobs
              </div>
            </div>
            <ArrowRight size={18} color="var(--forest-700)" />
          </Link>

          {/* Action 4: Unmatched Bookings */}
          <Link 
            to="/admin/bookings?status=NO_PROVIDER_FOUND"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: needsAction.noProviderBookings?.length > 0 ? '#FDF2F8' : 'var(--bg-warm)',
              border: needsAction.noProviderBookings?.length > 0 ? '1.5px solid #F472B6' : '1px solid var(--border-light)',
              textDecoration: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: needsAction.noProviderBookings?.length > 0 ? '#BE185D' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                Dispatch Fallbacks
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
                {needsAction.noProviderBookings?.length || 0} Unassigned
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                No technician found in time window
              </div>
            </div>
            <ArrowRight size={18} color="var(--forest-700)" />
          </Link>

        </div>
      </div>

      {/* Row: 7-Day Bookings Trend & Top Specialists */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        
        {/* 7-Day Bookings Trend Chart */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          border: '1.5px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                7-Day Booking Volume
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Customer demand trend over the last 7 calendar days
              </div>
            </div>
            <span className="badge badge-success" style={{ fontSize: '11px', fontWeight: 800 }}>
              Live Aggregate
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '140px',
            paddingTop: '16px',
            borderBottom: '1px solid var(--border-light)',
            gap: '8px'
          }}>
            {bookingsPerDay.map((day, idx) => {
              const heightPct = maxDayCount > 0 ? Math.max((day.count / maxDayCount) * 100, 6) : 6;
              const isToday = idx === bookingsPerDay.length - 1;

              return (
                <div 
                  key={day.date || idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isToday ? 'var(--forest-900)' : 'var(--text-muted)' }}>
                    {day.count}
                  </span>
                  <div 
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPct}%`,
                      backgroundColor: isToday ? 'var(--forest-700)' : 'var(--forest-200)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <span style={{ fontSize: '11.5px', fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--forest-900)' : 'var(--text-muted)' }}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Weekly Total: <strong>{bookingsPerDay.reduce((sum, d) => sum + (d.count || 0), 0)} services</strong></span>
            <span>Customers Registered: <strong>{totalCustomers}</strong></span>
          </div>
        </div>

        {/* Top 5 Providers by Rating */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          border: '1.5px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                Top 5 Certified Specialists
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Ranked by rating average & completed jobs
              </div>
            </div>
            <Link to="/admin/providers" style={{ fontSize: '12.5px', color: 'var(--forest-700)', fontWeight: 700, textDecoration: 'none' }}>
              Directory →
            </Link>
          </div>

          {topProviders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No rated specialists yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topProviders.map((tech, idx) => (
                <div 
                  key={tech._id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-warm)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: idx === 0 ? '#FEF08A' : idx === 1 ? '#E2E8F0' : 'var(--forest-100)',
                      color: 'var(--forest-900)',
                      fontWeight: 800,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--forest-900)' }}>
                        {tech.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {tech.specialty || tech.city} • {tech.jobsDone || 0} jobs done
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '13.5px', color: '#B45309' }}>
                    <Star size={15} fill="#F59E0B" color="#F59E0B" />
                    <span>{tech.ratingAvg ? tech.ratingAvg.toFixed(1) : '5.0'}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ({tech.ratingCount || 0})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
