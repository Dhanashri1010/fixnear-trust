// ===================================================================
// FixNear Trust - Admin Bookings Operations Desk (Phase D)
// Real MongoDB Data | Filter by Status, City, Search
// Full Customer Details (Phone, Address) | Cancel with Reason | Reassign
// ===================================================================

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  X, 
  User, 
  Wrench, 
  Receipt, 
  RefreshCw,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminBookingsDesk() {
  const { showToast } = useToast();
  const { t, formatCurrency, formatDate } = useLanguage();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  // Inspection Drawer
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Cancelled by Central Operations following customer verification check.');
  const [processing, setProcessing] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (cityFilter !== 'all') params.city = cityFilter;

      const res = await adminAPI.getBookings(params);
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      showToast('Failed to load bookings: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, cityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleInspectBooking = async (id) => {
    setDetailLoading(true);
    try {
      const res = await adminAPI.getBookingDetails(id);
      if (res.success) {
        setSelectedBooking(res.booking);
      }
    } catch (err) {
      showToast('Failed to load booking details: ' + err.message, 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking || !cancelReason.trim()) return;
    setProcessing(true);
    try {
      const res = await adminAPI.cancelBooking(selectedBooking._id, cancelReason.trim());
      showToast(res.message || 'Booking cancelled and customer/provider notified.', 'warning');
      setCancelModalOpen(false);
      setSelectedBooking(res.booking || selectedBooking);
      fetchBookings();
    } catch (err) {
      showToast('Cancellation failed: ' + err.message, 'error');
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
            <ShoppingBag size={20} color="var(--forest-700)" />
            <span>{t('admin.deskBookingsTitle')}</span>
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('admin.deskBookingsDesc')}
          </div>
        </div>

        <button type="button" onClick={fetchBookings} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} />
          <span>{t('admin.refresh')}</span>
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
              placeholder={t('admin.search') + '...'}
              className="form-control"
              style={{ width: '100%', paddingLeft: '36px', fontSize: '13px', height: '38px', borderRadius: '8px' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '38px', padding: '0 16px' }}>
            {t('admin.search')}
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-control"
          style={{ fontSize: '13px', height: '38px', borderRadius: '8px', padding: '0 12px' }}
        >
          <option value="all">{t('admin.allStatuses')}</option>
          <option value="REQUESTED">{t('status.REQUESTED')}</option>
          <option value="ACCEPTED">{t('status.ACCEPTED')}</option>
          <option value="ON_THE_WAY">{t('status.ON_THE_WAY')}</option>
          <option value="WORKING">{t('status.WORKING')}</option>
          <option value="COMPLETED">{t('status.COMPLETED')}</option>
          <option value="CANCELLED">{t('status.CANCELLED')}</option>
          <option value="NO_PROVIDER_FOUND">{t('status.NO_PROVIDER_FOUND')}</option>
        </select>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="form-control"
          style={{ fontSize: '13px', height: '38px', borderRadius: '8px', padding: '0 12px' }}
        >
          <option value="all">{t('admin.city')}</option>
          <option value="Mumbai">{'Mumbai'}</option>
          <option value="Delhi">{'Delhi'}</option>
          <option value="Bangalore">{'Bangalore'}</option>
          <option value="Hyderabad">{'Hyderabad'}</option>
          <option value="Pune">{'Pune'}</option>
        </select>
      </div>

      {/* Bookings Table */}
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
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('admin.aggregatingOps')}</span>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <ShoppingBag size={36} color="var(--forest-300)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', margin: '0 0 6px 0' }}>{t('admin.noBookingsFound')}</h4>
            <p style={{ fontSize: '13px', margin: 0 }}>{t('admin.noBookingsFound')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-warm)', borderBottom: '1.5px solid var(--border-light)', fontSize: '12px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>{t('admin.booking')}</th>
                  <th style={{ padding: '14px 18px' }}>{t('admin.customerDetails')}</th>
                  <th style={{ padding: '14px 18px' }}>{t('admin.assignedProvider')}</th>
                  <th style={{ padding: '14px 18px' }}>{t('admin.date')}</th>
                  <th style={{ padding: '14px 18px' }}>{t('admin.amount')}</th>
                  <th style={{ padding: '14px 18px' }}>{t('admin.status')}</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>{t('admin.details')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  return (
                    <tr 
                      key={b._id}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: '#FFFFFF',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--forest-900)' }}>
                          #{b.bookingId}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {b.serviceTitle}
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px', fontSize: '13px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--forest-900)' }}>
                          {b.customerName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <MapPin size={12} /> {b.city}
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px', fontSize: '13px' }}>
                        {b.providerName ? (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--forest-900)' }}>{b.providerName}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{b.providerPhone}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            {b.status === 'REQUESTED' ? t('status.REQUESTED') : t('admin.unassignedSuffix')}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px 18px', fontSize: '12.5px', color: 'var(--text-main)' }}>
                        <div>{b.scheduledDate}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.timeSlot}</div>
                      </td>

                      <td style={{ padding: '16px 18px', fontWeight: 800, fontSize: '13.5px', color: 'var(--forest-900)' }}>
                        ₹{(b.invoice?.totalAmount || b.basePrice || 0).toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <span className={`badge ${
                          b.status === 'COMPLETED' ? 'badge-success' :
                          b.status === 'CANCELLED' || b.status === 'NO_PROVIDER_FOUND' ? 'badge-danger' :
                          b.status === 'REQUESTED' ? 'badge-primary' : 'badge-warning'
                        }`} style={{ fontSize: '11px', fontWeight: 800 }}>
                          {t('status.' + b.status, b.status)}
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleInspectBooking(b._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={13} />
                          <span>{t('admin.view')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Drawer / Modal */}
      {selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            width: '100%',
            maxWidth: '560px',
            height: '100%',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <div>
                <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 800 }}>
                  {t('admin.details')}
                </span>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--forest-900)', margin: '4px 0 0 0' }}>
                  #{selectedBooking.bookingId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Service & Status */}
            <div style={{ backgroundColor: 'var(--bg-warm)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--forest-900)' }}>
                  {selectedBooking.serviceTitle}
                </span>
                <span className={`badge ${
                  selectedBooking.status === 'COMPLETED' ? 'badge-success' :
                  selectedBooking.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                }`} style={{ fontSize: '11px', fontWeight: 800 }}>
                  {t('status.' + selectedBooking.status, selectedBooking.status)}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('admin.date')}: {selectedBooking.scheduledDate} • {selectedBooking.timeSlot}
              </div>
            </div>

            {/* Full Customer Details (Phone & Address Visible to Admin) */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase', marginBottom: '10px' }}>
                {t('admin.customerDetails')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div><strong>{t('common.name', 'Name')}:</strong> {selectedBooking.customerName}</div>
                <div><strong>{t('admin.phone')}:</strong> {selectedBooking.customerPhone}</div>
                <div><strong>{t('admin.address')}:</strong> {selectedBooking.address}, {selectedBooking.city}</div>
                {selectedBooking.problemNote && (
                  <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                    <strong>{t('providerDashboard.problemDescLabel')}:</strong> "{selectedBooking.problemNote}"
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Partner Details */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase', marginBottom: '10px' }}>
                {t('admin.assignedProvider')}
              </h4>
              {selectedBooking.providerId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div><strong>{t('common.name', 'Name')}:</strong> {selectedBooking.providerName}</div>
                  <div><strong>{t('admin.phone')}:</strong> {selectedBooking.providerPhone}</div>
                  <div><strong>{t('common.id', 'ID')}:</strong> {selectedBooking.providerId}</div>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {selectedBooking.status === 'REQUESTED' ? t('status.REQUESTED') : t('admin.noProvidersFound')}
                </div>
              )}
            </div>

            {/* Financial Invoice Breakdown */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase', marginBottom: '10px' }}>
                {t('admin.pricingBreakdown')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('booking.baseService')}:</span>
                  <span>₹{selectedBooking.basePrice || selectedBooking.invoice?.baseAmount || 0}</span>
                </div>
                {selectedBooking.invoice?.extraAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                    <span>{t('providerDashboard.sparePartsQuoteLabel')}</span>
                    <span>+₹{selectedBooking.invoice.extraAmount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid var(--border-light)', paddingTop: '6px', fontSize: '14px' }}>
                  <span>{t('admin.total')}:</span>
                  <span>₹{selectedBooking.invoice?.totalAmount || selectedBooking.basePrice || 0}</span>
                </div>
              </div>
            </div>

            {/* Admin Cancellation Action */}
            {selectedBooking.status !== 'COMPLETED' && selectedBooking.status !== 'CANCELLED' && (
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="btn btn-outline"
                  style={{ width: '100%', color: '#DC2626', borderColor: '#FCA5A5' }}
                >
                  <XCircle size={16} />
                  <span>{t('admin.cancelBookingBtn')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && (
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
          zIndex: 1200,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#DC2626', marginBottom: '8px' }}>
              {t('admin.cancelBookingBtn')} #{selectedBooking?.bookingId}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              {t('admin.cancelBookingPrompt')}
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="form-control"
              style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}
              placeholder={t('admin.reason')}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="btn btn-outline btn-sm"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={processing || cancelReason.trim().length < 5}
                onClick={handleConfirmCancel}
                className="btn btn-danger btn-sm"
              >
                {processing ? t('common.loading') : t('admin.cancelBookingBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

