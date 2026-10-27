// ===================================================================
// FixNear Trust - Live Appointment & Milestone Tracking Page
// Live status pipeline: Requested -> Provider Accepted -> On the Way -> Working -> Completed
// Quotation Alerts, Completion OTP Display, and Post-Completion Review Modal
// ===================================================================

import React, { useState } from 'react';
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
  ArrowRight,
  Star,
  Sparkles,
  Play,
  ShieldAlert
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import ReviewModal from './ReviewModal';
import DisputeModal from './DisputeModal';

export default function BookingTrackingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    bookings, 
    activeBookingId, 
    setActiveBookingId, 
    activeBooking, 
    advanceBookingStage,
    submitExtraQuotation
  } = useStore();
  const { showToast } = useToast();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Match current booking from URL or store
  const booking = (id ? bookings.find(b => b.id === id) : null) || activeBooking || bookings[0];

  if (!booking) {
    return (
      <div className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)', textAlign: 'center', padding: '60px 20px' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <h2>No active appointments found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            Book a verified repair or check your booking history.
          </p>
          <Link to="/services" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Explore Services
          </Link>
        </div>
      </div>
    );
  }

  const quote = booking.additionalQuotation || booking.quotation;
  const hasPendingQuotation = quote && quote.status === 'PENDING_CUSTOMER_APPROVAL';
  const isCompleted = booking.status === 'COMPLETED';

  // Live Simulation Trigger (Allows testing all 5 stages in Phase 2)
  const handleSimulateStage = async (targetStatus) => {
    setSimulating(true);
    await advanceBookingStage(booking.id, targetStatus);
    showToast(`Live status updated: ${targetStatus.replace('_', ' ')}`, 'info');
    setSimulating(false);
  };

  const handleSimulateQuote = async () => {
    setSimulating(true);
    await submitExtraQuotation(booking.id, {
      reason: "Outdoor compressor fan run-capacitor degraded (tested 18uF vs rated 45uF), causing thermal cutoffs.",
      diagnosticReport: "Motor running at 4.2A. Replacing capacitor restores full 14°C cooling.",
      totalExtra: 808
    });
    showToast('Technician submitted an extra-parts quotation!', 'warning');
    setSimulating(false);
  };

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
          <Link to="/bookings" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            My Bookings
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Ref: {booking.id}</span>
        </nav>

        {/* Top Summary Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-forest" style={{ fontSize: '11.5px' }}>
                Ref #{booking.id}
              </span>
              <span className={`badge ${isCompleted ? 'badge-forest' : 'badge-yellow'}`} style={{ fontSize: '11.5px', fontWeight: 800 }}>
                Status: {booking.status}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
              {booking.serviceTitle}
            </h1>
            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Scheduled for <strong>{booking.scheduledDate || "Today"}</strong> · Arrival window: <strong>{booking.slot || booking.timeSlot || "Morning"}</strong>
            </div>
          </div>

          {/* Quick Booking Switcher if multiple exist */}
          {bookings.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Switch Appointment:</span>
              <select
                value={booking.id}
                onChange={(e) => {
                  setActiveBookingId(e.target.value);
                  navigate(`/track/${e.target.value}`);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-light)',
                  fontSize: '13px'
                }}
              >
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.serviceTitle.slice(0, 24)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Real-time Dispatch Pipeline Testing Simulator Bar */}
        <div style={{
          padding: '12px 18px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1.5px dashed var(--forest-500)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--forest-700)" />
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--forest-900)' }}>
              Real-time Pipeline Simulator (Phase 2 Testing):
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={simulating}
              onClick={() => handleSimulateStage('ACCEPTED')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              1. Accept
            </button>
            <button
              type="button"
              disabled={simulating}
              onClick={() => handleSimulateStage('ON_THE_WAY')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              2. On Way
            </button>
            <button
              type="button"
              disabled={simulating}
              onClick={() => handleSimulateStage('WORKING')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              3. Working
            </button>
            <button
              type="button"
              disabled={simulating}
              onClick={handleSimulateQuote}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px', color: '#B45309', borderColor: '#FDE68A' }}
            >
              4. Send Quote
            </button>
            <button
              type="button"
              disabled={simulating}
              onClick={() => navigate(`/invoice/${booking.id}`)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              5. Enter OTP & Release Escrow
            </button>
          </div>
        </div>

        {/* Action Required Alert: Pending Additional Quotation */}
        {hasPendingQuotation && (
          <div style={{
            backgroundColor: 'var(--yellow-100)',
            border: '2px solid var(--yellow-400)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '28px',
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
                  Action Required: Technician Submitted Extra Parts Quotation
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--yellow-800)', marginTop: '4px' }}>
                  {booking.technicianName} diagnosed additional required parts (Total Extra: <strong>₹{quote.totalExtra}</strong>).
                </p>
              </div>
            </div>

            <Link 
              to={`/quote/${booking.id}`}
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--forest-800)', padding: '10px 18px', whiteSpace: 'nowrap', textDecoration: 'none' }}
            >
              <FileText size={15} />
              <span>Review Quotation (Approve / Reject)</span>
            </Link>
          </div>
        )}

        {/* Active Dispute Status Banner */}
        {booking.isDisputed && (
          <div style={{
            backgroundColor: booking.disputeResolution ? '#F0FDF4' : '#FEF2F2',
            border: `2px solid ${booking.disputeResolution ? '#86EFAC' : '#FCA5A5'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <ShieldAlert size={24} color={booking.disputeResolution ? '#16A34A' : '#DC2626'} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: booking.disputeResolution ? '#166534' : '#991B1B' }}>
                    {booking.disputeResolution ? 'Dispute Resolved by Admin Mediation Desk' : 'Formal Dispute In Progress (Escrow Payout On Hold)'}
                  </h3>
                  <span className={`badge ${booking.disputeResolution ? 'badge-forest' : 'badge-red'}`} style={{ fontSize: '11px' }}>
                    {booking.disputeResolution ? 'RESOLVED' : 'UNDER REVIEW'}
                  </span>
                </div>
                <p style={{ fontSize: '13.5px', color: booking.disputeResolution ? '#166534' : '#B91C1C', marginTop: '4px' }}>
                  {booking.disputeResolution
                    ? `Admin Ruling: ${booking.disputeResolution.decision.replace(/_/g, ' ')}. Note: "${booking.disputeResolution.adminNote}". (Refund: ₹${booking.disputeResolution.refundAmount || 0}, Provider: ₹${booking.disputeResolution.providerPayout || 0})`
                    : `Your complaint is with FixNear Trust & Safety. Our supervisor is reviewing the before/after diagnostics. Both you and the technician will be notified upon ruling.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Post-Completion Rating Callout */}
        {isCompleted && (
          <div style={{
            backgroundColor: '#F0FDF4',
            border: '2px solid #86EFAC',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#166534' }}>
                  Service Completed & Escrow Released
                </h3>
                <p style={{ fontSize: '13.5px', color: '#166534', marginTop: '4px' }}>
                  {booking.isReviewed 
                    ? `Thank you! Your verified review is published.` 
                    : `Your 30-Day FixNear Warranty is activated. Please rate ${booking.technicianName}'s workmanship.`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {!booking.isReviewed && (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#15803D', padding: '10px 18px' }}
                >
                  <Star size={15} />
                  <span>Rate & Review Specialist</span>
                </button>
              )}
              <Link to={`/invoice/${booking.id}`} className="btn btn-secondary">
                <Receipt size={15} />
                <span>View Receipt</span>
              </Link>
            </div>
          </div>
        )}

        {/* Main Grid: Live Timeline + Specialist & OTP Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.1fr)',
          gap: '28px',
          alignItems: 'flex-start'
        }}>
          
          {/* Column 1: Milestone Progress Stepper */}
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              Service Execution Timeline
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
              {booking.timeline.map((step, idx) => {
                const isStepCompleted = step.done;
                const isCurrent = step.current;

                return (
                  <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isStepCompleted ? 'var(--forest-700)' : isCurrent ? 'var(--yellow-400)' : 'var(--bg-warm)',
                      color: isStepCompleted ? '#FFFFFF' : isCurrent ? 'var(--yellow-800)' : 'var(--text-muted)',
                      border: isCurrent ? '2px solid var(--yellow-600)' : '1px solid var(--border-light)',
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
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--yellow-100)',
                          fontSize: '11px',
                          color: 'var(--yellow-800)',
                          fontWeight: 700
                        }}>
                          Active Stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Navigation Strip */}
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
              {quote && (
                <Link
                  to={`/quote/${booking.id}`}
                  style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-700)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                >
                  <FileText size={15} />
                  <span>View Quotation Details →</span>
                </Link>
              )}

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link
                  to={`/invoice/${booking.id}`}
                  style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-700)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                >
                  <Receipt size={15} />
                  <span>Inspect Final Invoice & Escrow →</span>
                </Link>

                {!booking.isDisputed && (
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
                    <span>Report Issue / Raise Dispute</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Specialist Details & Escrow OTP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Specialist Profile Card */}
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

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80" 
                  alt={booking.technicianName} 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: 'var(--forest-900)' }}>
                    {booking.technicianName}
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Certified Service Partner
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--forest-700)', fontWeight: 600, marginTop: '2px' }}>
                    ETA: {booking.technicianEta || "35 mins away"}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <a
                  href={`tel:${booking.technicianPhone || "+919820011223"}`}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Phone size={14} color="var(--forest-700)" />
                  <span>Call Partner</span>
                </a>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => showToast(`Connecting to ${booking.technicianName}...`, 'info')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <MessageSquare size={14} color="var(--forest-700)" />
                  <span>Message</span>
                </button>
              </div>
            </div>

            {/* Completion OTP Card (Requirement: 4-digit OTP shared with provider) */}
            <div className="card" style={{
              padding: '24px',
              backgroundColor: 'var(--forest-50)',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid var(--forest-100)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <KeyRound size={18} color="var(--forest-700)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-900)' }}>
                  Work Completion OTP
                </h3>
              </div>

              <div style={{
                fontSize: '36px',
                fontWeight: 900,
                letterSpacing: '0.25em',
                color: 'var(--forest-800)',
                fontFamily: 'monospace',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                textAlign: 'center',
                border: '1.5px solid var(--forest-200)',
                marginBottom: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {booking.completionOtp || booking.otp || "4821"}
              </div>

              <p style={{ fontSize: '12px', color: 'var(--forest-700)', lineHeight: 1.5 }}>
                <strong>4-Digit Security Code:</strong> Share this OTP with {booking.technicianName} only after work is fully completed, tested, and you inspect the final result.
              </p>
            </div>

            {/* Address Summary */}
            <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                <MapPin size={14} color="var(--forest-700)" />
                <span>Service Location</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {booking.address}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Post-Completion Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        booking={booking}
      />

      {/* Formal Customer Dispute Modal */}
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        booking={booking}
      />
    </div>
  );
}
