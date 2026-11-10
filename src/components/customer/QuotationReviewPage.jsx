import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  Home, 
  Receipt,
  Clock
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { bookingsAPI, getSocket } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function QuotationReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { t, formatCurrency } = useLanguage();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchBooking = async () => {
    if (!id) return;
    try {
      setError('');
      const res = await bookingsAPI.getBookingById(id);
      if (res.success && res.booking) {
        setBooking(res.booking);
      } else {
        setError(t('quotation.noQuoteFound', 'Booking not found.'));
      }
    } catch (err) {
      setError(err.message || t('quotation.loadingQuote', 'Could not fetch quotation details.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    fetchBooking();

    const socket = getSocket();
    socket.emit('join_booking', id);
    socket.on('quotation_decision', fetchBooking);
    socket.on('booking_updated', fetchBooking);

    return () => {
      socket.off('quotation_decision', fetchBooking);
      socket.off('booking_updated', fetchBooking);
    };
  }, [id, currentUser, navigate]);

  const quote = booking?.quotation;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await bookingsAPI.approveQuotation(booking._id || booking.bookingId);
      showToast(t('quotation.quoteApprovedNotice', 'Spare parts quotation approved successfully!'), 'success');
      setFeedbackMessage({
        type: 'success',
        text: `${t('quotation.quoteApprovedNotice')} ${formatCurrency(quote?.total || 0)}`
      });
      fetchBooking();
    } catch (err) {
      showToast(err.message || t('common.errorGeneral', 'Failed to approve quotation.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await bookingsAPI.declineQuotation(booking._id || booking.bookingId);
      showToast(t('quotation.quoteDeclinedNotice', 'Quotation declined. Technician will proceed with baseline scope only.'), 'info');
      setFeedbackMessage({
        type: 'danger',
        text: t('quotation.quoteDeclinedNotice')
      });
      fetchBooking();
    } catch (err) {
      showToast(err.message || t('common.errorGeneral', 'Failed to decline quotation.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={32} style={{ margin: '0 auto 12px auto', animation: 'spin 1.5s linear infinite' }} />
          <div>{t('quotation.loadingQuote')}</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh', padding: '60px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <h2>{error || t('quotation.noQuoteFound')}</h2>
          <div style={{ marginTop: '20px' }}>
            <Link to="/bookings" className="btn btn-primary">
              {t('invoice.returnToBookingsBtn')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPending = quote?.status === 'PENDING_CUSTOMER_APPROVAL';
  const isApproved = quote?.status === 'APPROVED';
  const isRejected = quote?.status === 'REJECTED';

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        
        {/* Breadcrumb Navigation */}
        <nav 
          aria-label="Breadcrumbs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '24px'
          }}
        >
          <Link 
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--forest-700)', fontWeight: 600, textDecoration: 'none' }}
          >
            <Home size={14} />
            <span>{t('nav.home')}</span>
          </Link>
          <ChevronRight size={13} />
          <Link 
            to={`/track/${booking._id}`}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            {t('tracking.title')} #{booking.bookingId}
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>{t('quotation.title')}</span>
        </nav>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: feedbackMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1.5px solid ${feedbackMessage.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
            color: feedbackMessage.type === 'success' ? '#166534' : '#991B1B'
          }}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Header Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-forest">
                  <ShieldCheck size={13} />
                  {t('quotation.doorstepTransparency')}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: isApproved ? 'var(--forest-100)' : isRejected ? '#FEE2E2' : 'var(--yellow-100)',
                  color: isApproved ? 'var(--forest-800)' : isRejected ? '#991B1B' : 'var(--yellow-800)'
                }}>
                  {t('common.status')}: {quote?.status || 'NONE'}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
                {t('quotation.sparePartsTitle')}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                {t('common.service')}: <strong>{booking.serviceTitle}</strong> · {t('common.verifiedTechnician')}: <strong>{booking.providerName}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('quotation.additionalCostLabel')}</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--forest-900)' }}>
                {formatCurrency(quote?.total || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Reason & Scope */}
        <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px' }}>
            {t('quotation.technicianNotesHeading')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '14px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            {quote?.reason || t('quotation.defaultReason')}
          </p>

          {/* Items Table */}
          {quote?.items && quote.items.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>{t('quotation.requiredItemsHeading')}</h3>
              <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {quote.items.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: idx < quote.items.length - 1 ? '1px solid var(--border-light)' : 'none',
                    fontSize: '13.5px'
                  }}>
                    <div>
                      <strong>{item.desc || t('quotation.replacementPartDefault')}</strong>
                      {item.partNo && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('common.reference')} #{item.partNo}</div>}
                    </div>
                    <strong style={{ color: 'var(--forest-800)' }}>{formatCurrency(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Approval Buttons */}
          {isPending && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleReject}
                disabled={submitting}
                style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
              >
                <XCircle size={15} />
                <span>{t('quotation.declineQuotationBtn')}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApprove}
                disabled={submitting}
              >
                <CheckCircle2 size={15} />
                <span>{t('quotation.approveExtraWorkBtn')} ({formatCurrency(quote?.total || 0)})</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
