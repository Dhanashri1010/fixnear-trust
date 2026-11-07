import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Home, 
  FileText, 
  Clock,
  ShieldAlert,
  Printer,
  CreditCard,
  Banknote,
  Star
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { bookingsAPI, paymentsAPI, getSocket } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loadRazorpayScript } from '../../utils/razorpay';
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

    // Fetch Razorpay configuration
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

    const socket = getSocket();
    socket.emit('join_booking', id);
    socket.on('booking_updated', fetchBooking);
    socket.on('booking_status_updated', fetchBooking);

    return () => {
      socket.off('booking_updated', fetchBooking);
      socket.off('booking_status_updated', fetchBooking);
    };
  }, [id, currentUser, navigate]);

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

  const basePrice = booking.basePrice || 0;
  const approvedExtra = booking.quotation?.status === 'APPROVED' ? (booking.quotation.total || 0) : 0;
  const platformFee = booking.platformFeeSnapshot ?? 20;
  const totalAmount = booking.invoice?.totalAmount || (basePrice + approvedExtra + platformFee);
  const isPaid = booking.paymentStatus === 'PAID';
  const invoiceNumber = booking.invoiceNumber || booking.invoice?.invoiceNo || `INV-${booking.bookingId}`;
  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className="invoice-page" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        
        {/* Breadcrumb Navigation - hidden on print */}
        <nav 
          aria-label="Breadcrumbs"
          className="no-print"
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
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Warranty Tax Invoice</span>
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
                <span className={`badge ${isPaid ? 'badge-forest' : 'badge-yellow'}`} style={{ fontSize: '11px', fontWeight: 800 }}>
                  {isPaid ? `PAID (${booking.paymentMethod || 'VERIFIED'})` : 'PAYMENT DUE'}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
                Official Service Invoice #{invoiceNumber}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Booking Ref: <strong>#{booking.bookingId}</strong> · Specialist: <strong>{booking.providerName || 'Certified Partner'}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Amount:</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--forest-900)' }}>
                ₹{totalAmount}
              </div>
              {isPaid && (
                <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
                  ✓ Settled in Full
                </div>
              )}
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
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-light)',
              fontSize: '14px'
            }}>
              <div>
                <strong>{booking.serviceTitle}</strong>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Standard inspection & labor fee</div>
              </div>
              <strong>₹{basePrice}</strong>
            </div>

            {approvedExtra > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-light)',
                fontSize: '14px',
                backgroundColor: '#FAF5FF'
              }}>
                <div>
                  <strong>Approved Additional Spare Parts & Work</strong>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Customer pre-approved quotation
                    {booking.quotation?.items?.length > 0 && (
                      <span style={{ display: 'block', marginTop: '4px', fontSize: '12px', color: '#6B21A8' }}>
                        {booking.quotation.items.map(i => `${i.desc} (₹${i.amount})`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <strong>₹{approvedExtra}</strong>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderBottom: '1px solid var(--border-light)',
              fontSize: '13.5px'
            }}>
              <div>
                <span>Platform Convenience Fee</span>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Secure match, background check, digital warranty protection</div>
              </div>
              <span>₹{platformFee}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 18px',
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
              padding: '16px 18px',
              backgroundColor: 'var(--bg-warm)',
              fontSize: '17px',
              fontWeight: 800
            }}>
              <span>Total Billed</span>
              <span style={{ color: 'var(--forest-900)' }}>₹{totalAmount}</span>
            </div>
          </div>

          {/* Payment Section - When Not Paid Yet */}
          {!isPaid && (
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '2px solid #E2E8F0',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
                Select Your Payment Method
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Please choose how you would like to settle the final balance of <strong>₹{totalAmount}</strong>:
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: razorpayConfig.razorpayEnabled ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
                gap: '16px'
              }}>
                {/* Option 1: Pay Online */}
                {razorpayConfig.razorpayEnabled ? (
                  <div style={{
                    border: '1.5px solid var(--forest-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-800)', fontWeight: 700, fontSize: '15px' }}>
                        <CreditCard size={18} />
                        <span>Pay Online</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                        Instant & contactless via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, or NetBanking.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={payingOnline}
                      onClick={handlePayOnline}
                      className="btn btn-primary"
                      style={{ marginTop: '16px', width: '100%', padding: '10px 16px', fontWeight: 700 }}
                    >
                      {payingOnline ? 'Opening Checkout...' : `Pay Online ₹${totalAmount}`}
                    </button>
                  </div>
                ) : null}

                {/* Option 2: Pay Cash */}
                <div style={{
                  border: '1.5px solid #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 700, fontSize: '15px' }}>
                      <Banknote size={18} />
                      <span>Pay in Cash</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                      Hand ₹{totalAmount} directly to your specialist. The specialist will confirm receipt in their app, immediately updating your status to Paid.
                    </p>
                  </div>
                  <div style={{
                    marginTop: '16px',
                    padding: '10px 14px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#475569',
                    textAlign: 'center',
                    fontWeight: 600
                  }}>
                    Cash on service available
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} />
                <span>Print Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDisputeModalOpen(true)}
                className="btn btn-outline btn-sm"
                style={{ color: '#DC2626', borderColor: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldAlert size={14} />
                <span>Report Issue</span>
              </button>
            </div>

            {isCompleted && (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Star size={14} />
                <span>Rate Specialist Experience</span>
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

      {/* Embedded print stylesheet */}
      <style>{`
        @media print {
          .no-print, header, nav, footer, button {
            display: none !important;
          }
          body, .invoice-page {
            background-color: #ffffff !important;
            padding: 0 !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
