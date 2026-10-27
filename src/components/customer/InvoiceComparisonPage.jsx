import React, { useState } from 'react';
import { 
  Receipt, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  KeyRound, 
  Lock, 
  ChevronRight, 
  Home, 
  FileText, 
  Download,
  Upload,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import ReviewModal from './ReviewModal';

export default function InvoiceComparisonPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    bookings, 
    activeBookingId, 
    activeBooking, 
    releaseInvoiceEscrow, 
    submitInvoiceDispute
  } = useStore();
  const { showToast } = useToast();

  const booking = (id ? bookings.find(b => b.id === id) : null) || activeBooking || bookings[0];
  const invoice = booking?.invoice;

  const [enteredOtp, setEnteredOtp] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Unauthorized Doorstep Charge Discrepancy');
  const [claimAmount, setClaimAmount] = useState('350');
  const [disputeNotes, setDisputeNotes] = useState('Technician attempted to bill an extra miscellaneous inspection fee that was not in the approved quotation.');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (!booking || !invoice) {
    return (
      <div className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)', textAlign: 'center' }}>
        <div className="container">
          <h2>No invoice available for this booking</h2>
          <button className="btn btn-primary" onClick={() => navigate(booking?.id ? `/track/${booking.id}` : '/bookings')}>
            Return to Appointment
          </button>
        </div>
      </div>
    );
  }

  const isEscrowReleased = invoice.status === 'ESCROW_RELEASED';
  const isDisputed = invoice.status === 'DISPUTED';
  const isUnpaid = invoice.status === 'UNPAID';

  const handleReleasePayment = async (e) => {
    e.preventDefault();
    const result = await releaseInvoiceEscrow(booking.id, enteredOtp);
    if (result.success) {
      setActionFeedback({ type: 'success', text: result.message });
      showToast(result.message, 'success');
      setIsReviewModalOpen(true);
    } else {
      setActionFeedback({ type: 'error', text: result.message });
      showToast(result.message, 'error');
    }
  };

  const handleDisputeSubmit = (e) => {
    e.preventDefault();
    submitInvoiceDispute(booking.id, {
      reason: disputeReason,
      claimAmount,
      notes: disputeNotes
    });
    setShowDisputeForm(false);
    setActionFeedback({
      type: 'warning',
      text: `Escrow Payment Frozen! Dispute ticket #${invoice.disputeTicket || 'DISP-8821'} submitted to FixNear Operations. Funds will remain locked until administrative arbitration.`
    });
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
            onClick={() => navigate('/track/' + booking.id)}
            style={{ color: 'var(--text-secondary)', background: 'none' }}
          >
            Booking #{booking.id}
          </button>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Final Invoice & Payment Protection Audit</span>
        </nav>

        {/* Feedback Alert if action occurred */}
        {actionFeedback && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            backgroundColor: actionFeedback.type === 'success' ? 'var(--forest-100)' : actionFeedback.type === 'error' ? '#FEE2E2' : 'var(--yellow-100)',
            color: actionFeedback.type === 'success' ? 'var(--forest-900)' : actionFeedback.type === 'error' ? '#991B1B' : 'var(--yellow-800)',
            border: `1.5px solid ${actionFeedback.type === 'success' ? 'var(--forest-700)' : actionFeedback.type === 'error' ? '#F87171' : 'var(--yellow-400)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {actionFeedback.type === 'success' ? <CheckCircle2 size={20} /> : actionFeedback.type === 'error' ? <AlertTriangle size={20} /> : <Lock size={20} />}
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{actionFeedback.text}</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-forest" style={{ fontSize: '11.5px' }}>
                  Invoice #{invoice.invoiceNo}
                </span>
                <span className={`badge ${isEscrowReleased ? 'badge-forest' : isDisputed ? 'badge-demo' : 'badge-yellow'}`} style={{ fontSize: '11.5px' }}>
                  {isEscrowReleased ? '✓ Payment Released (Warranted)' : isDisputed ? '🔒 Escrow Locked (Disputed)' : 'Pending Inspection & OTP Approval'}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Approved Quotation vs. Actual Invoice Audit</h1>
              <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Service: <strong>{booking.serviceTitle}</strong> · Specialist: <strong>{booking.technicianName}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Final Billed Total</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-800)' }}>
                ₹{invoice.actualBilledTotal}
              </div>
            </div>
          </div>

          {/* Audit Rule Explanation */}
          <div style={{
            marginTop: '20px',
            padding: '14px 18px',
            backgroundColor: 'var(--forest-50)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--forest-100)',
            fontSize: '13px',
            color: 'var(--forest-800)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldCheck size={20} color="var(--forest-700)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Zero Hidden Charges Safeguard:</strong> FixNear automatically verifies the technician's bill against your digitally approved quote. Opening this page does not approve payment.
            </span>
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
        <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
            Line-by-Line Variance Comparison
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-warm)', borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700 }}>Line Item Description</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700 }}>Approved Quote</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700 }}>Final Actual Billed</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700 }}>Variance</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItemsActual.map((item, idx) => {
                  const approvedMatch = invoice.lineItemsApproved[idx] || { amount: 0 };
                  const variance = item.amount - approvedMatch.amount;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>{item.desc}</td>
                      <td style={{ textAlign: 'right', padding: '14px 16px', color: 'var(--text-secondary)' }}>₹{approvedMatch.amount}</td>
                      <td style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{item.amount}</td>
                      <td style={{ textAlign: 'right', padding: '14px 16px' }}>
                        {variance === 0 ? (
                          <span style={{ color: 'var(--forest-700)', fontWeight: 600 }}>₹0 (Exact Match)</span>
                        ) : variance > 0 ? (
                          <span style={{ color: '#B91C1C', fontWeight: 700 }}>+₹{variance} (Unapproved Drift)</span>
                        ) : (
                          <span style={{ color: 'var(--forest-700)', fontWeight: 600 }}>-₹{Math.abs(variance)} (Discount)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Total Summary Row */}
                <tr style={{ backgroundColor: 'var(--forest-50)', fontWeight: 800, fontSize: '15px' }}>
                  <td style={{ padding: '16px' }}>Final Total Payable</td>
                  <td style={{ textAlign: 'right', padding: '16px' }}>₹{invoice.approvedQuotationTotal}</td>
                  <td style={{ textAlign: 'right', padding: '16px', color: 'var(--forest-900)' }}>₹{invoice.actualBilledTotal}</td>
                  <td style={{ textAlign: 'right', padding: '16px', color: invoice.hasVariance ? '#B91C1C' : 'var(--forest-700)' }}>
                    {invoice.hasVariance ? `+₹${invoice.varianceAmount}` : "₹0 (Zero Drift)"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Audit Status:</strong> {invoice.varianceExplanation}
          </div>
        </div>

        {/* Action Panel: Escrow Payment Release OR Raise Dispute */}
        {isUnpaid && !showDisputeForm && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: '24px',
            marginBottom: '32px'
          }}>
            
            {/* Release Payment via OTP */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                Confirm Satisfaction & Release Escrow
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
                Enter your 4-digit completion OTP (<strong>{booking.completionOtp}</strong>) to authorize escrow release and activate your 30-Day FixNear Workmanship Warranty.
              </p>

              <form onSubmit={handleReleasePayment} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--forest-700)',
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '0.2em',
                    width: '160px',
                    textAlign: 'center'
                  }}
                  required
                />

                <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px', flex: 1 }}>
                  <CheckCircle2 size={16} />
                  <span>Release Payment (₹{invoice.actualBilledTotal})</span>
                </button>
              </form>
            </div>

            {/* Dispute Shortcut */}
            <div className="card" style={{
              padding: '24px',
              backgroundColor: 'var(--yellow-50)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--yellow-200)'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--yellow-800)', marginBottom: '8px' }}>
                Have a Billing Discrepancy?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--yellow-800)', marginBottom: '18px', lineHeight: 1.5 }}>
                If the technician added unapproved charges or the repair was unsatisfactory, freeze escrow immediately.
              </p>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowDisputeForm(true)}
                style={{ width: '100%', borderColor: 'var(--yellow-400)', color: 'var(--yellow-800)', backgroundColor: '#FFFFFF' }}
              >
                <AlertTriangle size={15} color="var(--yellow-800)" />
                <span>Raise Dispute / Freeze Escrow</span>
              </button>
            </div>

          </div>
        )}

        {/* Dispute Submission Form (if opened) */}
        {showDisputeForm && (
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', marginBottom: '32px', border: '2px solid #FCA5A5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertTriangle size={24} color="#B91C1C" />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#B91C1C' }}>
                Escrow Dispute & Arbitration Filing
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Submitting this dispute locks payment release and forwards your ticket directly to the Main Admin arbitration desk.
            </p>

            <form onSubmit={handleDisputeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Dispute Reason:
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13.5px'
                  }}
                >
                  <option value="Unauthorized Doorstep Charge Discrepancy">Unauthorized Doorstep Charge Discrepancy</option>
                  <option value="Incomplete Work or Substandard Repair">Incomplete Work or Substandard Repair</option>
                  <option value="Damaged Fixtures or Missing Spare Parts">Damaged Fixtures or Missing Spare Parts</option>
                  <option value="Technician Misconduct">Technician Misconduct</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Disputed Claim / Refund Amount (₹):
                </label>
                <input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13.5px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Specific Explanation of Issue:
                </label>
                <textarea
                  rows={3}
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13.5px'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#B91C1C', padding: '12px 24px' }}>
                  <Lock size={15} />
                  <span>Lock Escrow & File Formal Dispute</span>
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowDisputeForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Post-Resolution State Banners */}
        {isEscrowReleased && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            border: '1.5px solid var(--forest-700)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-800)', fontWeight: 700 }}>
                <CheckCircle2 size={18} color="var(--forest-700)" />
                <span>Payment Completed via Escrow Release</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Your 30-Day FixNear Workmanship Warranty is active until {booking.warrantyDaysLeft} days from today.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsReviewModalOpen(true)}
              >
                <span>Rate & Review Specialist</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => alert(`Simulated PDF receipt for Invoice #${invoice.invoiceNo}`)}
              >
                <Download size={14} />
                <span>Download Tax Invoice (PDF)</span>
              </button>
            </div>
          </div>
        )}

        {isDisputed && (
          <div style={{
            backgroundColor: '#FFF1F2',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            border: '1.5px solid #F43F5E',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9F1239', fontWeight: 800, fontSize: '16px' }}>
              <Lock size={18} />
              <span>Escrow Freeze Active: Dispute Ticket #{invoice.disputeTicket || 'DISP-8821'}</span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#9F1239', marginTop: '6px' }}>
              Payment has been locked. The Main Admin arbitration panel is reviewing the discrepancy ({invoice.disputeReason}). A decision will be published within 2 hours.
            </p>
          </div>
        )}

        {/* Back Link */}
        <div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/track/${booking.id}`)}
          >
            <ArrowLeft size={14} />
            <span>Return to Appointment Tracker</span>
          </button>
        </div>

      </div>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        booking={booking}
      />
    </div>
  );
}
