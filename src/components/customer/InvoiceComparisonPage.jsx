import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  KeyRound, 
  ChevronRight, 
  Home, 
  FileText, 
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { bookingsAPI, getSocket } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ReviewModal from './ReviewModal';
import DisputeModal from './DisputeModal';

export default function InvoiceComparisonPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const fetchBooking = async () => {
    if (!id) return;
    try {
      setError('');
      const res = await bookingsAPI.getBookingById(id);
      if (res.success && res.booking) {
        setBooking(res.booking);
      } else {
        setError('Booking not found.');
      }
    } catch (err) {
      setError(err.message || 'Could not fetch invoice details.');
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
    socket.on('booking_updated', fetchBooking);
    socket.on('booking_status_updated', fetchBooking);

    return () => {
      socket.off('booking_updated', fetchBooking);
      socket.off('booking_status_updated', fetchBooking);
    };
  }, [id, currentUser, navigate]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={32} style={{ margin: '0 auto 12px auto', animation: 'spin 1.5s linear infinite' }} />
          <div>Loading warranty receipt...</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh', padding: '60px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <h2>{error || 'No invoice available for this appointment'}</h2>
          <div style={{ marginTop: '20px' }}>
            <Link to="/bookings" className="btn btn-primary">
              Return to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const invoice = booking.invoice || {
    invoiceNo: `INV-${booking.bookingId}`,
    baseAmount: booking.basePrice,
    extraAmount: booking.quotation?.total || 0,
    totalAmount: booking.basePrice + (booking.quotation?.total || 0),
    status: booking.status === 'COMPLETED' ? 'PAID' : 'UNPAID',
    issuedAt: booking.createdAt,
  };

  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        
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
            <span>Home</span>
          </Link>
          <ChevronRight size={13} />
          <Link 
            to={`/track/${booking._id}`}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            Tracking #{booking.bookingId}
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Warranty Receipt</span>
        </nav>

        {/* Invoice Header Card */}
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
                  30-Day Workmanship Warranty Active
                </span>
                <span className="badge badge-yellow" style={{ fontSize: '11px' }}>
                  {invoice.status}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
                Official Service Invoice #{invoice.invoiceNo}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Booking Ref: <strong>#{booking.bookingId}</strong> · Specialist: <strong>{booking.providerName}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Amount:</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--forest-900)' }}>
                ₹{invoice.totalAmount}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Breakdown Card */}
        <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '16px' }}>
            Itemized Charge Breakdown
          </h2>

          <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-light)',
              fontSize: '13.5px'
            }}>
              <div>
                <strong>{booking.serviceTitle}</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Standard inspection & labor fee</div>
              </div>
              <strong>₹{invoice.baseAmount}</strong>
            </div>

            {invoice.extraAmount > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-light)',
                fontSize: '13.5px'
              }}>
                <div>
                  <strong>Approved Additional Spare Parts & Extra Work</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer verified in-app quotation</div>
                </div>
                <strong>₹{invoice.extraAmount}</strong>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-light)',
              fontSize: '13px',
              color: 'var(--forest-700)'
            }}>
              <span>30-Day Workmanship Warranty</span>
              <strong>INCLUDED (₹0)</strong>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'var(--bg-warm)',
              fontSize: '16px',
              fontWeight: 800
            }}>
              <span>Total Billed</span>
              <span style={{ color: 'var(--forest-800)' }}>₹{invoice.totalAmount}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsDisputeModalOpen(true)}
              className="btn btn-outline btn-sm"
              style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
            >
              <ShieldAlert size={14} />
              <span>Raise Dispute</span>
            </button>

            {isCompleted && (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                Rate Specialist Experience
              </button>
            )}
          </div>
        </div>

      </div>

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          booking={booking}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={fetchBooking}
        />
      )}

      {isDisputeModalOpen && (
        <DisputeModal
          isOpen={isDisputeModalOpen}
          booking={booking}
          onClose={() => setIsDisputeModalOpen(false)}
          onDisputeCreated={fetchBooking}
        />
      )}
    </div>
  );
}
