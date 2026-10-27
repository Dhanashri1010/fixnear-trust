import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  ArrowLeft, 
  ChevronRight, 
  Home, 
  Receipt,
  Info
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function QuotationReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    bookings, 
    activeBookingId, 
    activeBooking, 
    updateQuotationStatus
  } = useStore();
  const { showToast } = useToast();

  const booking = (id ? bookings.find(b => b.id === id) : null) || activeBooking || bookings[0];
  const quote = booking?.additionalQuotation || booking?.quotation;

  const [changeNotes, setChangeNotes] = useState('');
  const [showChangeBox, setShowChangeBox] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  if (!booking || !quote) {
    return (
      <div className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)', textAlign: 'center' }}>
        <div className="container">
          <h2>No pending quotation found for this booking</h2>
          <button className="btn btn-primary" onClick={() => navigate(booking?.id ? `/track/${booking.id}` : '/bookings')}>
            Return to Appointment Tracker
          </button>
        </div>
      </div>
    );
  }

  const isPending = quote.status === 'PENDING_CUSTOMER_APPROVAL';
  const isApproved = quote.status === 'APPROVED';
  const isRejected = quote.status === 'REJECTED';
  const isChangesRequested = quote.status === 'CHANGES_REQUESTED';

  const handleApprove = () => {
    if (isRejected) {
      alert("Security safeguard: A rejected quotation cannot be approved. The technician must submit a revised quote.");
      return;
    }
    if (quote.isExpired) {
      alert("Security safeguard: This quotation has expired. Please request a refreshed quote.");
      return;
    }

    updateQuotationStatus(booking.id, 'APPROVED');
    setFeedbackMessage({
      type: 'success',
      text: `Quotation #${quote.id} Approved! Authorization for ₹${quote.totalExtra} extra work has been granted to ${booking.technicianName}.`
    });
  };

  const handleReject = () => {
    updateQuotationStatus(booking.id, 'REJECTED');
    setFeedbackMessage({
      type: 'danger',
      text: `Quotation #${quote.id} Rejected. Additional work is cancelled; the technician will only charge for the baseline inspection/service (₹${booking.basePrice}).`
    });
  };

  const handleRequestChanges = (e) => {
    e.preventDefault();
    if (!changeNotes.trim()) return;

    updateQuotationStatus(booking.id, 'CHANGES_REQUESTED', changeNotes);
    setShowChangeBox(false);
    setFeedbackMessage({
      type: 'warning',
      text: `Changes requested on Quotation #${quote.id}. Note logged for ${booking.technicianName}: "${changeNotes}"`
    });
  };

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
          <button 
            type="button"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--forest-700)', fontWeight: 600, background: 'none' }}
          >
            <Home size={14} />
            <span>Home</span>
          </button>
          <ChevronRight size={13} />
          <button 
            type="button"
            onClick={() => navigate(`/track/${booking.id}`)}
            style={{ color: 'var(--text-secondary)', background: 'none' }}
          >
            Booking #{booking.id}
          </button>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Digital Quotation Review</span>
        </nav>

        {/* Feedback Alert if Action Taken */}
        {feedbackMessage && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            backgroundColor: feedbackMessage.type === 'success' ? 'var(--forest-100)' : feedbackMessage.type === 'danger' ? '#FEE2E2' : 'var(--yellow-100)',
            color: feedbackMessage.type === 'success' ? 'var(--forest-900)' : feedbackMessage.type === 'danger' ? '#991B1B' : 'var(--yellow-800)',
            border: `1px solid ${feedbackMessage.type === 'success' ? 'var(--forest-700)' : feedbackMessage.type === 'danger' ? '#F87171' : 'var(--yellow-400)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 size={18} /> : feedbackMessage.type === 'danger' ? <XCircle size={18} /> : <AlertCircle size={18} />}
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-forest" style={{ fontSize: '11.5px' }}>
                  Quotation #{quote.id}
                </span>
                <span className={`badge ${isApproved ? 'badge-forest' : isRejected ? 'badge-demo' : 'badge-yellow'}`} style={{ fontSize: '11.5px' }}>
                  Status: {quote.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Digital Additional-Parts Quotation</h1>
              <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Issued by: <strong>{booking.technicianName}</strong> · Service: <strong>{booking.serviceTitle}</strong>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: 'var(--yellow-50)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--yellow-200)',
              fontSize: '12.5px',
              color: 'var(--yellow-800)',
              fontWeight: 600
            }}>
              <Clock size={14} />
              <span>{quote.validUntil}</span>
            </div>
          </div>

          {/* Diagnostic Reason Box */}
          <div style={{
            backgroundColor: 'var(--bg-warm)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            border: '1px solid var(--border-light)',
            marginTop: '16px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              On-Site Diagnostic Findings
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '6px' }}>
              "{quote.reason}"
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {quote.diagnosticReport}
            </div>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '18px' }}>
            Itemized Cost Breakdown
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Baseline Service */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>1. {booking.serviceTitle}</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Baseline service & diagnostic labor (Already committed in booking)</div>
              </div>
              <span style={{ fontWeight: 700 }}>₹{quote.baselineService}</span>
            </div>

            {/* Additional Parts */}
            {quote.parts.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>2.{idx + 1} {p.name}</strong>
                    {p.oemCertified && <span className="badge badge-sage" style={{ fontSize: '10px', padding: '1px 6px' }}>OEM Certified</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Includes 180-day manufacturer parts warranty</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700 }}>₹{p.cost}</span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+ ₹{p.tax} GST</div>
                </div>
              </div>
            ))}

            {/* Additional Labor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>3. Specialized Component Fitting & Calibration Labor</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Standard rate card tariff for electrical component installation</div>
              </div>
              <span style={{ fontWeight: 700 }}>₹{quote.laborAddon}</span>
            </div>

            {/* Subtotal Extra Work */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', backgroundColor: 'var(--forest-50)', borderRadius: 'var(--radius-sm)', paddingLeft: '14px', paddingRight: '14px', fontSize: '14px' }}>
              <span style={{ fontWeight: 700, color: 'var(--forest-900)' }}>Total Additional Work & Spares:</span>
              <span style={{ fontWeight: 800, color: 'var(--forest-800)' }}>+ ₹{quote.totalExtra}</span>
            </div>

            {/* Final Grand Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: '16px',
              borderTop: '2px solid var(--forest-700)',
              fontSize: '16px'
            }}>
              <div>
                <strong style={{ fontSize: '18px', color: 'var(--forest-900)' }}>Total Revised Payable Estimate:</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Baseline service (₹{quote.baselineService}) + Extra authorized work (₹{quote.totalExtra})</div>
              </div>
              <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-800)' }}>
                ₹{quote.finalTotalEstimate}
              </span>
            </div>

          </div>
        </div>

        {/* Change Request Box (if toggled) */}
        {showChangeBox && (
          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', marginBottom: '28px', border: '1.5px solid var(--yellow-400)' }}>
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '6px' }}>
              Submit Change Request to Specialist
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Explain what you would like modified (e.g., provide your own parts, request a different brand, or ask for labor clarification).
            </p>

            <form onSubmit={handleRequestChanges}>
              <textarea
                rows={3}
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder="Type your notes for the technician here..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  fontSize: '13.5px',
                  marginBottom: '14px'
                }}
                required
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Send Change Request to {booking.technicianName}
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowChangeBox(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/track/${booking.id}`)}
          >
            <ArrowLeft size={15} />
            <span>Back to Tracker</span>
          </button>

          {isPending && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowChangeBox(!showChangeBox)}
              >
                <MessageSquare size={15} />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleReject}
                style={{ color: '#B91C1C', borderColor: '#FCA5A5' }}
              >
                <XCircle size={15} color="#B91C1C" />
                <span>Decline Extra Work</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApprove}
                style={{ padding: '12px 24px', fontSize: '15px' }}
              >
                <CheckCircle2 size={16} />
                <span>Approve Quotation (₹{quote.totalExtra})</span>
              </button>
            </div>
          )}

          {isApproved && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="badge badge-forest">
                ✓ Quotation Approved
              </span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/invoice/${booking.id}`)}
              >
                <span>Proceed to Final Invoice Comparison</span>
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          {isRejected && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="badge badge-demo" style={{ color: '#991B1B' }}>
                Extra Work Declined
              </span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(`/track/${booking.id}`)}
              >
                Return to Appointment
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
