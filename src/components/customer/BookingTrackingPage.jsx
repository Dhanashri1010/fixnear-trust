// ===================================================================
// FixNear Trust - Live Appointment & Milestone Tracking Page
// Live status pipeline via Socket.io:
// REQUESTED -> ACCEPTED -> ON_THE_WAY -> WORKING -> COMPLETED
// Real Provider info shown only after ACCEPTED. No fake ETA/simulate buttons.
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Phone, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Home, 
  FileText, 
  Receipt, 
  KeyRound,
  Star,
  ShieldAlert,
  CreditCard,
  Banknote
} from 'lucide-react';
import { bookingsAPI, paymentsAPI, getSocket } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loadRazorpayScript } from '../../utils/razorpay';
import ReviewModal from './ReviewModal';
import DisputeModal from './DisputeModal';
import InitialsAvatar from '../common/InitialsAvatar';

export default function BookingTrackingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const [razorpayConfig, setRazorpayConfig] = useState({ razorpayEnabled: false, keyId: '' });
  const [payingOnline, setPayingOnline] = useState(false);

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
      console.warn('Failed to load tracking data:', err.message);
      setError(err.message || 'Unable to retrieve booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!id) {
      // If no ID provided in path, redirect to my bookings
      navigate('/bookings');
      return;
    }

    fetchBooking();

    // Fetch Razorpay config
    paymentsAPI.getConfig().then((res) => {
      if (res.success) {
        setRazorpayConfig({
          razorpayEnabled: Boolean(res.razorpayEnabled),
          keyId: res.keyId || '',
        });
      }
    }).catch((err) => {
      console.warn('Failed to load payment config:', err.message);
    });

    // Socket.io real-time live updates
    const socket = getSocket();
    socket.emit('join_booking', id);

    const handleStatusUpdate = (data) => {
      console.log('[Socket.io] Booking status updated:', data);
      fetchBooking();
    };

    const handleBookingUpdate = (updatedBooking) => {
      console.log('[Socket.io] Booking record refreshed:', updatedBooking);
      fetchBooking();
    };

    socket.on('booking_status_updated', handleStatusUpdate);
    socket.on('booking_updated', handleBookingUpdate);
    socket.on('quotation_decision', handleBookingUpdate);

    return () => {
      socket.off('booking_status_updated', handleStatusUpdate);
      socket.off('booking_updated', handleBookingUpdate);
      socket.off('quotation_decision', handleBookingUpdate);
    };
  }, [id, currentUser, navigate]);

  // Loading State
  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={36} style={{ margin: '0 auto 12px auto', animation: 'spin 1.5s linear infinite' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-900)' }}>Connecting to Live Tracking...</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Syncing status with server</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !booking) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh', padding: '60px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            {error || 'Booking Not Found'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            We could not locate this appointment. It may have been removed or you do not have permission to view it.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/bookings" className="btn btn-outline">
              My Bookings
            </Link>
            <Link to="/services" className="btn btn-primary">
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAccepted = ['ACCEPTED', 'ON_THE_WAY', 'WORKING', 'COMPLETED'].includes(booking.status);
  const isCompleted = booking.status === 'COMPLETED';
  const isCancelled = booking.status === 'CANCELLED';
  const isDisputed = booking.status === 'DISPUTED';
  const hasPendingQuotation = booking.quotation?.status === 'PENDING_CUSTOMER_APPROVAL';

  const basePrice = booking.basePrice || 0;
  const approvedExtra = booking.quotation?.status === 'APPROVED' ? (booking.quotation.total || 0) : 0;
  const platformFee = booking.platformFeeSnapshot ?? 20;
  const totalAmount = booking.invoice?.totalAmount || (basePrice + approvedExtra + platformFee);
  const isPaid = booking.paymentStatus === 'PAID';
  const invoiceNumber = booking.invoiceNumber || booking.invoice?.invoiceNo || `INV-${booking.bookingId}`;

  const handlePayOnline = async () => {
    if (!booking) return;
    setPayingOnline(true);
    try {
      const orderRes = await paymentsAPI.createOrder(booking.bookingId);
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Unable to create payment order.');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load payment gateway. Please check your internet connection or choose cash payment.');
      }

      const options = {
        key: orderRes.keyId || razorpayConfig.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'FixNear Trust',
        description: `Service Payment #${booking.bookingId}`,
        order_id: orderRes.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await paymentsAPI.verifyPayment({
              bookingId: booking.bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              showToast('Payment successful! Your warranty tax invoice has been generated.', 'success');
              await fetchBooking();
            }
          } catch (verifyErr) {
            showToast(verifyErr.message || 'Payment verification failed. Please contact support.', 'error');
          }
        },
        prefill: {
          name: booking.customerName || currentUser?.name || '',
          email: currentUser?.email || '',
          contact: booking.customerPhone || currentUser?.phone || '',
        },
        theme: {
          color: '#15803D',
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (failure) {
        showToast(failure.error?.description || 'Payment was declined or cancelled.', 'error');
      });
      razorpayInstance.open();
    } catch (err) {
      showToast(err.message || 'Failed to initiate online checkout.', 'error');
    } finally {
      setPayingOnline(false);
    }
  };

  // 5 Steps Pipeline
  const timelineSteps = booking.timeline && booking.timeline.length === 5 ? booking.timeline : [
    { step: 'Booking Requested', time: 'Completed', done: true, current: booking.status === 'REQUESTED' },
    { step: 'Technician Assigned', time: 'Pending', done: isAccepted, current: booking.status === 'ACCEPTED' },
    { step: 'On The Way', time: 'Pending', done: ['ON_THE_WAY', 'WORKING', 'COMPLETED'].includes(booking.status), current: booking.status === 'ON_THE_WAY' },
    { step: 'Service in Progress', time: 'Pending', done: ['WORKING', 'COMPLETED'].includes(booking.status), current: booking.status === 'WORKING' },
    { step: 'Completed', time: 'Pending', done: isCompleted, current: isCompleted },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        
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
            to="/bookings"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            My Bookings
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>
            Live Tracking #{booking.bookingId}
          </span>
        </nav>

        {/* Live Tracking Header Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-forest" style={{ fontSize: '12px' }}>
                <ShieldCheck size={13} />
                Live Socket Connection Active
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Ref: <strong>#{booking.bookingId}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
              {booking.serviceTitle}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)' }}>
              ₹{booking.invoice?.totalAmount || booking.basePrice}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Payment Protection Active
            </div>
          </div>
        </div>

        {/* Pending Quotation Alert Banner */}
        {hasPendingQuotation && (
          <div style={{
            backgroundColor: 'var(--yellow-100)',
            border: '2px solid var(--yellow-400)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <AlertCircle size={24} color="var(--yellow-800)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--yellow-800)' }}>
                  Action Required: Specialist Submitted Extra Parts Quotation
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--yellow-800)', marginTop: '4px' }}>
                  Additional required parts total: <strong>₹{booking.quotation.total}</strong>. Your approval is required before work continues.
                </p>
              </div>
            </div>

            <Link 
              to={`/quote/${booking._id}`}
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--forest-800)', padding: '10px 18px', whiteSpace: 'nowrap', textDecoration: 'none' }}
            >
              <FileText size={15} />
              <span>Review Quotation</span>
            </Link>
          </div>
        )}

        {/* Dispute Alert Banner */}
        {isDisputed && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '2px solid #FCA5A5',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 22px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <ShieldAlert size={24} color="#DC2626" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#991B1B' }}>
                Service Dispute Registered
              </h3>
              <p style={{ fontSize: '13px', color: '#991B1B', marginTop: '2px' }}>
                Payment settlement is placed on protective hold while our customer trust desk reviews your report.
              </p>
            </div>
          </div>
        )}

        {/* Post-Completion & Payment Card */}
        {isCompleted && (
          <div style={{ marginBottom: '24px' }}>
            {!isPaid ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--forest-300)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px 28px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-yellow" style={{ fontSize: '11px', fontWeight: 800 }}>
                        PAYMENT DUE
                      </span>
                      <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                        30-Day Warranty Active
                      </span>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)' }}>
                      Service Completed — Final Settlement
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Specialist verified your completion code. Please choose your payment method below:
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Final Amount:</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--forest-900)' }}>
                      ₹{totalAmount}
                    </div>
                  </div>
                </div>

                {/* Bill Breakdown Mini Summary */}
                <div style={{
                  backgroundColor: 'var(--bg-warm)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Standard inspection & labor fee:</span>
                    <strong>₹{basePrice}</strong>
                  </div>
                  {approvedExtra > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Approved extra spare parts & work:</span>
                      <strong>₹{approvedExtra}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Platform convenience fee:</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-light)', fontWeight: 800 }}>
                    <span>Total Billed:</span>
                    <span style={{ color: 'var(--forest-900)' }}>₹{totalAmount}</span>
                  </div>
                </div>

                {/* Two Payment Choices */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: razorpayConfig.razorpayEnabled ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  {razorpayConfig.razorpayEnabled && (
                    <div style={{
                      border: '1.5px solid var(--forest-200)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px',
                      backgroundColor: '#F0FDF4',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '15px' }}>
                          <CreditCard size={18} />
                          <span>Pay Online</span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#15803D', marginTop: '6px', lineHeight: 1.4 }}>
                          Instant checkout via UPI, Google Pay, PhonePe, Cards, or NetBanking.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={payingOnline}
                        onClick={handlePayOnline}
                        className="btn btn-primary"
                        style={{ marginTop: '14px', width: '100%', padding: '10px 16px', backgroundColor: '#15803D', fontWeight: 700 }}
                      >
                        {payingOnline ? 'Opening Checkout...' : `Pay Online ₹${totalAmount}`}
                      </button>
                    </div>
                  )}

                  <div style={{
                    border: '1.5px solid #CBD5E1',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 800, fontSize: '15px' }}>
                        <Banknote size={18} />
                        <span>Pay in Cash</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                        Hand ₹{totalAmount} in cash directly to your specialist. The specialist will confirm receipt in their app.
                      </p>
                    </div>
                    <div style={{
                      marginTop: '14px',
                      padding: '8px 12px',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#475569',
                      textAlign: 'center',
                      fontWeight: 600
                    }}>
                      Specialist will confirm in app
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Link to={`/invoice/${booking._id}`} className="btn btn-outline btn-sm">
                    <Receipt size={14} />
                    <span>View Full Itemized Tax Invoice</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '2px solid #86EFAC',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#166534' }}>
                        Service Completed & Paid
                      </h3>
                      <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                        {booking.paymentMethod === 'CASH' ? 'Cash Confirmed' : 'Paid Online'}
                      </span>
                    </div>
                    <p style={{ fontSize: '13.5px', color: '#166534', marginTop: '2px' }}>
                      Invoice #{invoiceNumber} settled in full. Your 30-Day FixNear Workmanship Warranty is active.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#15803D', padding: '10px 18px' }}
                  >
                    <Star size={15} />
                    <span>Rate & Review</span>
                  </button>
                  <Link to={`/invoice/${booking._id}`} className="btn btn-secondary">
                    <Receipt size={15} />
                    <span>View & Print Receipt</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Grid: 5-Step Timeline + Specialist Card & Finish Code */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.1fr)',
          gap: '24px',
          alignItems: 'flex-start'
        }}>
          
          {/* Column 1: Live 5-Step Stepper */}
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
              Live Service Progress
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {timelineSteps.map((step, idx) => {
                const isStepCompleted = step.done;
                const isCurrent = step.current;

                return (
                  <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: isStepCompleted ? 'var(--forest-700)' : isCurrent ? 'var(--forest-100)' : 'var(--bg-warm)',
                      color: isStepCompleted ? '#FFFFFF' : isCurrent ? 'var(--forest-900)' : 'var(--text-muted)',
                      border: isCurrent ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                      flexShrink: 0
                    }}>
                      {isStepCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{
                          fontWeight: isCurrent || isStepCompleted ? 700 : 500,
                          fontSize: '14.5px',
                          color: isCurrent ? 'var(--forest-900)' : isStepCompleted ? 'var(--text-primary)' : 'var(--text-muted)'
                        }}>
                          {step.step}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{step.time}</span>
                      </div>

                      {isCurrent && (
                        <div style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--forest-100)',
                          fontSize: '11px',
                          color: 'var(--forest-800)',
                          fontWeight: 700
                        }}>
                          Live Step
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div style={{
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <Link
                to={`/invoice/${booking._id}`}
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-700)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <Receipt size={15} />
                <span>Inspect Invoice & Protection Breakdown →</span>
              </Link>

              {!isDisputed && (
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#DC2626',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldAlert size={15} color="#DC2626" />
                  <span>Report Issue</span>
                </button>
              )}
            </div>
          </div>

          {/* Column 2: Assigned Specialist & 4-Digit Finish Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Specialist Card - Name and Phone shown ONLY after ACCEPTED */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Assigned Specialist
                </span>
                <span className="badge badge-forest" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={12} />
                  <span>Skill Verified</span>
                </span>
              </div>

              {isAccepted ? (
                <>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                    <InitialsAvatar
                      name={booking.providerName || 'Specialist'}
                      size={54}
                    />
                    <div>
                      <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: 'var(--forest-900)' }}>
                        {booking.providerName || 'Assigned Specialist'}
                      </h3>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Verified FixNear Partner
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--forest-700)', fontWeight: 600, marginTop: '2px' }}>
                        City: {booking.city}
                      </div>
                    </div>
                  </div>

                  {booking.providerPhone && (
                    <a
                      href={`tel:${booking.providerPhone}`}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', textDecoration: 'none' }}
                    >
                      <Phone size={14} color="var(--forest-700)" />
                      <span>Call {booking.providerPhone}</span>
                    </a>
                  )}
                </>
              ) : (
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <Clock size={28} color="var(--forest-700)" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Finding Certified Specialist</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    We are pairing your request with an available technician in {booking.city}. Details will appear as soon as accepted.
                  </div>
                </div>
              )}
            </div>

            {/* Finish Code Card (Shown only to customer) */}
            {booking.completionOtp && (
              <div className="card" style={{
                padding: '24px',
                backgroundColor: 'var(--forest-50)',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid var(--forest-100)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <KeyRound size={18} color="var(--forest-700)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-900)' }}>
                    4-Digit Work Finish Code
                  </h3>
                </div>

                <div style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  letterSpacing: '0.25em',
                  color: isCompleted ? 'var(--text-muted)' : 'var(--forest-800)',
                  fontFamily: 'monospace',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  textAlign: 'center',
                  border: '1.5px solid var(--forest-200)',
                  marginBottom: '12px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {isCompleted ? 'VERIFIED' : booking.completionOtp}
                </div>

                <p style={{ fontSize: '12px', color: 'var(--forest-800)', lineHeight: 1.5 }}>
                  {isCompleted ? (
                    <span>This code was verified by the specialist upon completion. 30-Day Warranty is now running.</span>
                  ) : (
                    <span><strong>Security Protection:</strong> Share this 4-digit code with your technician ONLY after the service is completely finished to your satisfaction.</span>
                  )}
                </p>
              </div>
            )}

            {/* Service Address Card */}
            <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                <MapPin size={14} color="var(--forest-700)" />
                <span>Service Address</span>
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {booking.address} ({booking.city})
              </div>
              {booking.notes && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <strong>Notes:</strong> {booking.notes}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        booking={booking}
        onReviewSubmitted={fetchBooking}
      />

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        booking={booking}
        onDisputeCreated={fetchBooking}
      />
    </div>
  );
}
