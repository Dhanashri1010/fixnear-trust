// ===================================================================
// FixNear Trust - Admin Customers Management Desk (Phase D)
// Real MongoDB Data | Search, Block & Unblock with Reason
// Immediate Socket & Session Invalidation on Block
// ===================================================================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Ban, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import InitialsAvatar from '../common/InitialsAvatar';

export default function AdminCustomersDesk() {
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [blockReason, setBlockReason] = useState('Violation of FixNear Trust Safety Policy (abusive conduct or fraudulent chargebacks).');
  const [processing, setProcessing] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await adminAPI.getCustomers(params);
      if (res.success) {
        setCustomers(res.customers || []);
      }
    } catch (err) {
      showToast('Failed to load customers: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleConfirmBlock = async () => {
    if (!selectedCustomer || !blockReason.trim()) return;
    setProcessing(true);
    try {
      const res = await adminAPI.blockCustomer(selectedCustomer._id, blockReason.trim());
      showToast(res.message || 'Customer blocked and live sessions invalidated.', 'warning');
      setBlockModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      showToast('Block failed: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmUnblock = async (cust) => {
    setProcessing(true);
    try {
      const res = await adminAPI.unblockCustomer(cust._id);
      showToast(res.message || 'Customer unblocked successfully.', 'success');
      fetchCustomers();
    } catch (err) {
      showToast('Unblock failed: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
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
            <span>Customer Accounts & Trust Governance</span>
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Search registered customers, monitor booking history, and enforce platform trust restrictions.
          </div>
        </div>

        <button type="button" onClick={fetchCustomers} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filters */}
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
              placeholder="Search by customer name, email, or phone..."
              className="form-control"
              style={{ width: '100%', paddingLeft: '36px', fontSize: '13px', height: '38px', borderRadius: '8px' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '38px', padding: '0 16px' }}>
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-control"
          style={{ fontSize: '13px', height: '38px', borderRadius: '8px', padding: '0 12px' }}
        >
          <option value="all">All Accounts</option>
          <option value="active">Active Accounts</option>
          <option value="blocked">Suspended / Blocked</option>
        </select>
      </div>

      {/* Customers Table */}
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
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Querying customer database...</span>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Users size={36} color="var(--forest-300)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', margin: '0 0 6px 0' }}>No Customers Found</h4>
            <p style={{ fontSize: '13px', margin: 0 }}>No customer accounts matched your search criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-warm)', borderBottom: '1.5px solid var(--border-light)', fontSize: '12px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Customer</th>
                  <th style={{ padding: '14px 18px' }}>City</th>
                  <th style={{ padding: '14px 18px' }}>Joined Date</th>
                  <th style={{ padding: '14px 18px' }}>Bookings</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => {
                  const isBlocked = cust.isBlocked;

                  return (
                    <tr 
                      key={cust._id}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: isBlocked ? '#FEF2F2' : '#FFFFFF',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <InitialsAvatar name={cust.name} size={38} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-900)' }}>
                              {cust.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {cust.email} • {cust.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px', fontSize: '13px', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="var(--text-muted)" />
                          <span>{cust.city || 'Mumbai'}</span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {new Date(cust.createdAt).toLocaleDateString()}
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShoppingBag size={12} />
                          <span>{cust.bookingsCount || 0}</span>
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        {isBlocked ? (
                          <div>
                            <span className="badge badge-danger" style={{ fontSize: '11px', fontWeight: 800 }}>
                              SUSPENDED
                            </span>
                            {cust.blockedReason && (
                              <div style={{ fontSize: '11px', color: '#991B1B', marginTop: '2px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cust.blockedReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '11px', fontWeight: 800 }}>
                            ACTIVE
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        {isBlocked ? (
                          <button
                            type="button"
                            disabled={processing}
                            onClick={() => handleConfirmUnblock(cust)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#16A34A', borderColor: '#86EFAC', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <RotateCcw size={13} />
                            <span>Unblock</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={processing}
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setBlockModalOpen(true);
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#DC2626', borderColor: '#FCA5A5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Ban size={13} />
                            <span>Block User</span>
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

      {/* Block Customer Modal */}
      {blockModalOpen && (
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
              Suspend Customer Account: {selectedCustomer?.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Suspending this customer immediately terminates all active web socket connections and invalidates subsequent authentication requests. They will not be able to sign in.
            </p>

            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={4}
              className="form-control"
              style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}
              placeholder="State the reason for blocking this customer..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setBlockModalOpen(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing || blockReason.trim().length < 5}
                onClick={handleConfirmBlock}
                className="btn btn-danger btn-sm"
              >
                {processing ? 'Suspending...' : 'Confirm Account Block'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
