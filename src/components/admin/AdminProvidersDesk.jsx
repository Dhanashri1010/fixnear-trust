// ===================================================================
// FixNear Trust - Admin Providers Directory & Quality Watchdog (Phase D)
// Real MongoDB Data | Filter by Status, Skill, City, Rating
// Suspend / Reinstate with Reason | Quality Watchdog Alert Badge
// ===================================================================

import React, { useState, useEffect } from 'react';
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
  Briefcase,
  RefreshCw,
  X
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import InitialsAvatar from '../common/InitialsAvatar';

export default function AdminProvidersDesk() {
  const { showToast } = useToast();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  // Modals state
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [suspendReason, setSuspendReason] = useState('Customer complaints regarding substandard workmanship and repeated no-shows.');

  const [reinstateModalOpen, setReinstateModalOpen] = useState(false);
  const [reinstateReason, setReinstateReason] = useState('Partner completed retraining and verified compliance with FixNear Trust safety standards.');

  const [processing, setProcessing] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (cityFilter !== 'all') params.city = cityFilter;

      const res = await adminAPI.getProviders(params);
      if (res.success) {
        setProviders(res.providers || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load providers.');
      showToast('Error loading providers: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [statusFilter, cityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleConfirmSuspend = async () => {
    if (!selectedProvider || !suspendReason.trim()) return;
    setProcessing(true);
    try {
      const res = await adminAPI.suspendProvider(selectedProvider._id, suspendReason.trim());
      showToast(res.message || 'Provider suspended and pending offers cancelled.', 'warning');
      setSuspendModalOpen(false);
      setSelectedProvider(null);
      fetchProviders();
    } catch (err) {
      showToast('Suspension failed: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReinstate = async () => {
    if (!selectedProvider) return;
    setProcessing(true);
    try {
      const res = await adminAPI.reinstateProvider(selectedProvider._id, reinstateReason.trim());
      showToast(res.message || 'Provider reinstated to approved status.', 'success');
      setReinstateModalOpen(false);
      setSelectedProvider(null);
      fetchProviders();
    } catch (err) {
      showToast('Reinstate failed: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Quality Watchdog Summary */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        border: '1.5px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--forest-700)" />
            <span>Service Specialists & Partner Quality Watchdog</span>
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Track certified technician quality, ratings, active status, and perform binding suspension or reinstatement rulings.
          </div>
        </div>

        <button type="button" onClick={fetchProviders} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        border: '1.5px solid var(--border-light)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 240px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or specialty..."
              className="form-control"
              style={{ width: '100%', paddingLeft: '36px', fontSize: '13px', height: '38px', borderRadius: '8px' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '38px', padding: '0 16px' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ fontSize: '13px', height: '38px', borderRadius: '8px', padding: '0 12px' }}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved & Active</option>
            <option value="waiting_for_approval">Waiting Approval</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Quality Watchdog (Rating &lt; 3.5)</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="form-control"
            style={{ fontSize: '13px', height: '38px', borderRadius: '8px', padding: '0 12px' }}
          >
            <option value="all">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
          </select>
        </div>
      </div>

      {/* Providers Table & Responsive Card Grid */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border-light)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Querying specialist directory...</span>
          </div>
        ) : providers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Users size={36} color="var(--forest-300)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', margin: '0 0 6px 0' }}>No Providers Found</h4>
            <p style={{ fontSize: '13px', margin: 0 }}>No specialist profiles matched your search and filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-warm)', borderBottom: '1.5px solid var(--border-light)', fontSize: '12px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Technician</th>
                  <th style={{ padding: '14px 18px' }}>City & Area</th>
                  <th style={{ padding: '14px 18px' }}>Specialty</th>
                  <th style={{ padding: '14px 18px' }}>Rating & Jobs</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((tech) => {
                  const isFlagged = (tech.ratingCount >= 5 && tech.ratingAvg < 3.5);
                  const isSuspended = tech.status === 'suspended';
                  const isApproved = tech.status === 'approved';

                  return (
                    <tr 
                      key={tech._id}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: isFlagged ? '#FFFBEB' : '#FFFFFF',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <InitialsAvatar name={tech.name} size={38} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-900)' }}>
                              {tech.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {tech.phone || tech.userId?.phone || tech.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px', fontSize: '13px', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="var(--text-muted)" />
                          <span>{tech.city}</span>
                        </div>
                        {tech.serviceArea && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {tech.serviceArea}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px 18px', fontSize: '13px', color: 'var(--text-main)' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
                          {tech.specialty || 'General Service'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '13.5px', color: '#B45309' }}>
                          <Star size={14} fill="#F59E0B" color="#F59E0B" />
                          <span>{tech.ratingAvg ? tech.ratingAvg.toFixed(1) : '5.0'}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            ({tech.ratingCount || 0})
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tech.jobsDone || 0} jobs completed
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {isSuspended ? (
                            <span className="badge badge-danger" style={{ fontSize: '11px', fontWeight: 800, alignSelf: 'flex-start' }}>
                              SUSPENDED
                            </span>
                          ) : isApproved ? (
                            <span className="badge badge-success" style={{ fontSize: '11px', fontWeight: 800, alignSelf: 'flex-start' }}>
                              APPROVED
                            </span>
                          ) : (
                            <span className="badge badge-warning" style={{ fontSize: '11px', fontWeight: 800, alignSelf: 'flex-start' }}>
                              {tech.status?.toUpperCase() || 'IN PROGRESS'}
                            </span>
                          )}

                          {isFlagged && (
                            <span className="badge" style={{ backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, alignSelf: 'flex-start' }}>
                              NEEDS ATTENTION
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        {isSuspended ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProvider(tech);
                              setReinstateModalOpen(true);
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#16A34A', borderColor: '#86EFAC', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <RotateCcw size={13} />
                            <span>Reinstate</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProvider(tech);
                              setSuspendModalOpen(true);
                            }}
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {suspendModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#DC2626', marginBottom: '8px' }}>
              Suspend Specialist: {selectedProvider?.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Suspending this specialist immediately forces them offline and cancels any open job offers so they are immediately re-dispatched to the next eligible partner.
            </p>

            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={4}
              className="form-control"
              style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}
              placeholder="State the formal reason for suspending this specialist..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSuspendModalOpen(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing || suspendReason.trim().length < 5}
                onClick={handleConfirmSuspend}
                className="btn btn-danger btn-sm"
              >
                {processing ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reinstate Modal */}
      {reinstateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#16A34A', marginBottom: '8px' }}>
              Reinstate Specialist: {selectedProvider?.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Restore this partner to approved status so they can toggle online and receive customer job dispatches again.
            </p>

            <textarea
              value={reinstateReason}
              onChange={(e) => setReinstateReason(e.target.value)}
              rows={3}
              className="form-control"
              style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}
              placeholder="State resolution rationale (optional)..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setReinstateModalOpen(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleConfirmReinstate}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#16A34A', borderColor: '#16A34A' }}
              >
                {processing ? 'Reinstating...' : 'Confirm Reinstatement'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
