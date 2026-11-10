// ===================================================================
// FixNear Trust - Customer "My Bookings" Page
// Tabs: Upcoming / Done / Cancelled
// Powered by MongoDB REST API & Real-time Socket.io updates
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingsAPI, getSocket } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Wrench, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw, 
  Navigation, 
  AlertCircle,
  FileText,
  Star,
  ShieldAlert,
  Calendar,
  XCircle
} from 'lucide-react';
import ReviewModal from '../../components/customer/ReviewModal';
import DisputeModal from '../../components/customer/DisputeModal';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate, formatCurrency, getStatusLabel } = useLanguage();

  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'done' | 'cancelled'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState(null);

  // Cancel & Reschedule Inline State
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [reschedulingBookingId, setReschedulingBookingId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');

  const fetchBookings = async () => {
    try {
      setError('');
      const res = await bookingsAPI.getMyBookings();
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.warn('Failed to fetch bookings:', err.message);
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login?redirect=/bookings');
      return;
    }

    fetchBookings();

    // Socket.io real-time updates
    const socket = getSocket();
    const handleUpdate = () => {
      fetchBookings();
    };

    socket.on('booking_updated', handleUpdate);
    socket.on('booking_status_updated', handleUpdate);
    socket.on('booking_created', handleUpdate);

    return () => {
      socket.off('booking_updated', handleUpdate);
      socket.off('booking_status_updated', handleUpdate);
      socket.off('booking_created', handleUpdate);
    };
  }, [currentUser, navigate]);

  const handleCancelBooking = async (id) => {
    try {
      await bookingsAPI.cancelBooking(id, cancelReason || 'Cancelled by customer');
      showToast(t('booking.cancelSuccess', 'Booking cancelled.'), 'info');
      setCancellingBookingId(null);
      setCancelReason('');
      fetchBookings();
    } catch (err) {
      showToast(err.message || t('common.error'), 'error');
    }
  };

  const handleRescheduleBooking = async (id) => {
    if (!newDate || !newSlot) {
      showToast(t('booking.selectDateSlotPrompt', 'Please select both a new date and time slot.'), 'error');
      return;
    }
    try {
      await bookingsAPI.rescheduleBooking(id, { scheduledDate: newDate, timeSlot: newSlot });
      showToast(t('booking.rescheduleSuccess', 'Booking rescheduled successfully!'), 'success');
      setReschedulingBookingId(null);
      fetchBookings();
    } catch (err) {
      showToast(err.message || t('common.error'), 'error');
    }
  };

  // Plain-Language Status Formatter
  const getPlainStatus = (status) => {
    return {
      label: getStatusLabel(status),
      badgeColor: status === 'COMPLETED' ? '#16A34A' : status === 'CANCELLED' ? '#6B7280' : status === 'DISPUTED' ? '#DC2626' : '#10B981'
    };
  };

  // Filter tabs
  const upcomingBookings = bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const doneBookings = bookings.filter(b => b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  const displayed = 
    tab === 'upcoming' ? upcomingBookings :
    tab === 'done' ? doneBookings :
    cancelledBookings;

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '840px' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)' }}>
          {t('myBookings.title')}
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {t('myBookings.subtitle')}
        </p>
      </div>

      {/* Tabs: Upcoming / Done / Cancelled */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border-light)',
        marginBottom: '24px',
        gap: '24px'
      }}>
        <button
          type="button"
          onClick={() => setTab('upcoming')}
          style={{
            padding: '12px 4px',
            fontSize: '15px',
            fontWeight: 700,
            color: tab === 'upcoming' ? 'var(--forest-700)' : 'var(--text-muted)',
            borderBottom: tab === 'upcoming' ? '3px solid var(--forest-700)' : '3px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <Clock size={16} />
          <span>{t('myBookings.tabUpcoming')} ({upcomingBookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('done')}
          style={{
            padding: '12px 4px',
            fontSize: '15px',
            fontWeight: 700,
            color: tab === 'done' ? 'var(--forest-700)' : 'var(--text-muted)',
            borderBottom: tab === 'done' ? '3px solid var(--forest-700)' : '3px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{t('myBookings.tabCompleted')} ({doneBookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('cancelled')}
          style={{
            padding: '12px 4px',
            fontSize: '15px',
            fontWeight: 700,
            color: tab === 'cancelled' ? 'var(--forest-700)' : 'var(--text-muted)',
            borderBottom: tab === 'cancelled' ? '3px solid var(--forest-700)' : '3px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <XCircle size={16} />
          <span>{t('myBookings.tabCancelled')} ({cancelledBookings.length})</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={32} style={{ margin: '0 auto 12px auto', animation: 'spin 1.5s linear infinite' }} />
          <div>{t('common.loading')}</div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div style={{
          padding: '18px',
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: 'var(--radius-md)',
          color: '#991B1B',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && displayed.length === 0 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-warm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: 'var(--text-muted)'
          }}>
            <CalendarDays size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '8px' }}>
            {t('myBookings.noBookingsTitle')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            {t('myBookings.noBookingsDesc')}
          </p>
          <Link to="/book" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <Wrench size={16} />
            <span>{t('myBookings.bookServiceBtn')}</span>
          </Link>
        </div>
      )}

      {/* Booking Cards */}
      {!loading && displayed.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayed.map((booking) => {
            const statusInfo = getPlainStatus(booking.status);
            const isCompleted = booking.status === 'COMPLETED';
            const isCancelled = booking.status === 'CANCELLED';
            const canModify = booking.status === 'REQUESTED' || booking.status === 'ACCEPTED';
            const hasPendingQuotation = booking.quotation?.status === 'PENDING_CUSTOMER_APPROVAL';

            return (
              <div
                key={booking._id || booking.bookingId}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  border: '1.5px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--forest-800)', backgroundColor: 'var(--forest-50)', padding: '2px 8px', borderRadius: '4px' }}>
                        #{booking.bookingId}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: statusInfo.badgeColor,
                        backgroundColor: 'var(--bg-warm)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-light)'
                      }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '8px' }}>
                      {booking.serviceTitle}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                      {formatCurrency(booking.invoice?.totalAmount || booking.basePrice)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {isCompleted ? t('tracking.paymentVerified') : t('booking.paymentProtection')}
                    </div>
                  </div>
                </div>

                {/* Details Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-warm)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  fontSize: '13.5px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('tracking.assignedSpecialist')}
                    </span>
                    <strong style={{ color: 'var(--forest-900)' }}>
                      {booking.status === 'REQUESTED' 
                        ? t('tracking.searchingTechnician') 
                        : (booking.providerName || t('technician.certifiedBadge'))}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('booking.summaryTime')}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {booking.scheduledDate}, {booking.timeSlot}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('myBookings.completionOtpLabel')}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      letterSpacing: '2px',
                      color: isCompleted ? 'var(--text-muted)' : 'var(--forest-800)',
                      fontFamily: 'monospace'
                    }}>
                      {isCompleted ? t('tracking.paymentVerified') : (booking.completionOtp || '****')}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  <strong>{t('booking.addressLabel')}:</strong> {booking.address} ({booking.city})
                </div>

                {/* Inline Cancel / Reschedule Forms if active */}
                {cancellingBookingId === booking._id && (
                  <div style={{ padding: '14px', backgroundColor: '#FEF2F2', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FCA5A5' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B', marginBottom: '8px' }}>{t('myBookings.cancelBtn')}:</div>
                    <input
                      type="text"
                      placeholder={t('myBookings.cancelBtn')}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #FCA5A5', marginBottom: '10px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setCancellingBookingId(null)}>{t('common.cancel')}</button>
                      <button className="btn btn-primary btn-sm" style={{ backgroundColor: '#DC2626' }} onClick={() => handleCancelBooking(booking._id)}>{t('myBookings.cancelBtn')}</button>
                    </div>
                  </div>
                )}

                {reschedulingBookingId === booking._id && (
                  <div style={{ padding: '14px', backgroundColor: 'var(--forest-50)', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--forest-200)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '8px' }}>{t('myBookings.rescheduleBtn')}:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        style={{ padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border-light)' }}
                      />
                      <select
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value)}
                        style={{ padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border-light)' }}
                      >
                        <option value="">{t('booking.summaryTime')}</option>
                        <option value="Morning (09:00 AM - 12:00 PM)">09:00 AM - 12:00 PM</option>
                        <option value="Afternoon (12:00 PM - 03:00 PM)">12:00 PM - 03:00 PM</option>
                        <option value="Evening (03:00 PM - 06:00 PM)">03:00 PM - 06:00 PM</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setReschedulingBookingId(null)}>{t('common.cancel')}</button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleRescheduleBooking(booking._id)}>{t('common.save')}</button>
                    </div>
                  </div>
                )}

                {/* Primary Next-Step Action Controls */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                  
                  {/* Secondary modifications (cancel/reschedule) */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {canModify && !cancellingBookingId && !reschedulingBookingId && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingBookingId(booking._id);
                            setReschedulingBookingId(null);
                          }}
                          style={{ fontSize: '12px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {t('myBookings.cancelBtn')}
                        </button>
                        <span style={{ color: 'var(--border-light)' }}>·</span>
                        <button
                          type="button"
                          onClick={() => {
                            setReschedulingBookingId(booking._id);
                            setCancellingBookingId(null);
                          }}
                          style={{ fontSize: '12px', color: 'var(--forest-700)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {t('myBookings.rescheduleBtn')}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Single Main Next-Step Button */}
                  <div>
                    {hasPendingQuotation && (
                      <button
                        type="button"
                        onClick={() => navigate(`/quote/${booking._id}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: '8px' }}
                      >
                        <FileText size={14} />
                        <span>{t('quotation.title')} ({formatCurrency(booking.quotation.total)})</span>
                      </button>
                    )}

                    {!isCompleted && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => navigate(`/track/${booking._id}`)}
                        className="btn btn-primary btn-sm"
                      >
                        <Navigation size={14} />
                        <span>{t('myBookings.trackBtn')} →</span>
                      </button>
                    )}

                    {isCompleted && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForReview(booking)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Star size={14} color="#F59E0B" />
                          <span>{t('myBookings.reviewBtn')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedBookingForDispute(booking)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                        >
                          <ShieldAlert size={14} />
                          <span>{t('myBookings.disputeBtn')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/invoice/${booking._id}`)}
                          className="btn btn-primary btn-sm"
                        >
                          <FileText size={14} />
                          <span>{t('myBookings.viewInvoiceBtn')}</span>
                        </button>
                      </div>
                    )}

                    {isCancelled && (
                      <button
                        type="button"
                        onClick={() => navigate('/book')}
                        className="btn btn-primary btn-sm"
                      >
                        <RotateCcw size={14} />
                        <span>{t('myBookings.bookServiceBtn')}</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <ReviewModal
          isOpen={Boolean(selectedBookingForReview)}
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onReviewSubmitted={fetchBookings}
        />
      )}

      {/* Dispute Modal */}
      {selectedBookingForDispute && (
        <DisputeModal
          isOpen={Boolean(selectedBookingForDispute)}
          booking={selectedBookingForDispute}
          onClose={() => setSelectedBookingForDispute(null)}
          onDisputeCreated={fetchBookings}
        />
      )}

    </div>
  );
}
