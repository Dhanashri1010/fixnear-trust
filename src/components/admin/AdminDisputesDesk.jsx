// ===================================================================
// FixNear Trust - Admin Disputes Mediation Desk
// Customer vs Technician details, Booking timeline, Quote & Invoice inspection,
// Ruling actions: Refund Customer | Pay Technician | Partial Split + Admin Note
// ===================================================================

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Receipt, 
  DollarSign, 
  ArrowRight, 
  Clock, 
  User, 
  Wrench, 
  Eye, 
  X,
  Scale
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function AdminDisputesDesk() {
  const { disputes, bookings, resolveDispute } = useStore();
  const { showToast } = useToast();

  const [selectedDisputeId, setSelectedDisputeId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'OPEN' | 'RESOLVED'
  const [photoPreview, setPhotoPreview] = useState(null);

  // Ruling Modal State
  const [rulingModalOpen, setRulingModalOpen] = useState(false);
  const [decision, setDecision] = useState('REFUND_CUSTOMER'); // 'REFUND_CUSTOMER' | 'PAY_PROVIDER' | 'PARTIAL_SPLIT'
  const [adminNote, setAdminNote] = useState('Diagnostic photo confirms water leakage from internal casing drain pan. Customer granted 100% refund from escrow.');
  const [customRefund, setCustomRefund] = useState(0);
  const [customPayout, setCustomPayout] = useState(0);
  const [isResolving, setIsResolving] = useState(false);

  // Filter disputes
  const filteredDisputes = disputes.filter(d => {
    if (filterStatus === 'ALL') return true;
    return d.status === filterStatus;
  });

  const activeDispute = disputes.find(d => d.id === selectedDisputeId) || filteredDisputes[0] || null;
  const associatedBooking = activeDispute ? bookings.find(b => b.id === activeDispute.bookingId) : null;

  const handleOpenRuling = (dispute) => {
    const totalAmount = dispute.escrowAmount || associatedBooking?.invoice?.actualBilledTotal || 1407;
    setCustomRefund(Math.round(totalAmount * 0.5));
    setCustomPayout(Math.round(totalAmount * 0.5));
    setRulingModalOpen(true);
  };

  const handleConfirmRuling = async () => {
    if (!activeDispute || !adminNote.trim()) return;

    setIsResolving(true);
    try {
      const totalAmount = activeDispute.escrowAmount || associatedBooking?.invoice?.actualBilledTotal || 1407;
      let finalRefund = 0;
      let finalPayout = 0;

      if (decision === 'REFUND_CUSTOMER') {
        finalRefund = totalAmount;
        finalPayout = 0;
      } else if (decision === 'PAY_PROVIDER') {
        finalRefund = 0;
        finalPayout = totalAmount;
      } else if (decision === 'PARTIAL_SPLIT') {
        finalRefund = customRefund;
        finalPayout = customPayout;
      }

      await resolveDispute(activeDispute.id, {
        decision,
        adminNote,
        refundAmount: finalRefund,
        providerPayout: finalPayout
      });

      showToast(`Dispute #${activeDispute.id} ruling recorded! Both customer and technician consoles updated live.`, 'success');
      setRulingModalOpen(false);
    } catch (err) {
      showToast(`Resolution error: ${err.message}`, 'error');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Info */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1.5px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={22} color="#DC2626" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
              Dispute Resolution & Escrow Mediation Desk
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Mediate conflicting claims between customers and service providers. Review timelines, diagnostic quotations, and authorize escrow refunds or payouts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'OPEN', 'RESOLVED'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '12px' }}
            >
              {st} ({disputes.filter(d => st === 'ALL' ? true : d.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {filteredDisputes.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 20px',
          textAlign: 'center',
          border: '1.5px solid var(--border-light)'
        }}>
          <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
            Zero Pending Disputes
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '6px auto 0 auto' }}>
            There are no active disputes matching this filter. Any complaint raised by customers will instantly queue here for mediation.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '20px',
          alignItems: 'start'
        }}>
          
          {/* Disputes Sidebar List */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-light)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-warm)' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--forest-900)' }}>
                Disputes Registry ({filteredDisputes.length})
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredDisputes.map(disp => {
                const isSelected = activeDispute?.id === disp.id;
                return (
                  <div
                    key={disp.id}
                    onClick={() => setSelectedDisputeId(disp.id)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                      borderLeft: isSelected ? '4px solid var(--forest-700)' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--forest-900)' }}>
                        #{disp.id}
                      </strong>
                      <span className={`badge ${disp.status === 'OPEN' ? 'badge-red' : 'badge-forest'}`} style={{ fontSize: '10.5px' }}>
                        {disp.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginTop: '4px' }}>
                      {disp.reason}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Booking: #{disp.bookingId} • ₹{disp.escrowAmount || 1407} Escrow
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Dispute Detailed Dossier */}
          {activeDispute && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              border: '1.5px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Header Dossier */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-red" style={{ fontSize: '12px', fontWeight: 800 }}>
                      CASE #{activeDispute.id}
                    </span>
                    <span className={`badge ${activeDispute.status === 'OPEN' ? 'badge-yellow' : 'badge-forest'}`}>
                      {activeDispute.status}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '8px', marginBottom: '4px' }}>
                    {activeDispute.reason}
                  </h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Service: <strong>{activeDispute.serviceTitle || 'Air Conditioning Service'}</strong> • Escalated on: {new Date(activeDispute.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>DISPUTED ESCROW</div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--forest-900)' }}>
                    ₹{activeDispute.escrowAmount || 1407}
                  </div>
                </div>
              </div>

              {/* Parties Overview Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {/* Customer Box */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} />
                    <span>Customer Details</span>
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--forest-900)', marginTop: '6px' }}>
                    {activeDispute.customerName || "Aarav Patel"}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Phone: {activeDispute.customerPhone || "+91 98201 54321"}
                  </div>
                  <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
                    Escrow Payer • 100% Protected
                  </div>
                </div>

                {/* Technician Box */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wrench size={14} />
                    <span>Assigned Technician</span>
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--forest-900)', marginTop: '6px' }}>
                    {activeDispute.providerName || "Ramesh Sharma"}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Phone: {activeDispute.providerPhone || "+91 98200 11223"}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--forest-700)', fontWeight: 600, marginTop: '4px' }}>
                    Service Partner • Awaiting Payout
                  </div>
                </div>
              </div>

              {/* Customer's Complaint Description */}
              <div style={{ marginBottom: '24px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--forest-900)', display: 'block', marginBottom: '6px' }}>
                  Customer's Statement & Evidence:
                </strong>
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FEF2F2',
                  border: '1.5px solid #FCA5A5',
                  fontSize: '13px',
                  color: '#991B1B',
                  lineHeight: 1.6
                }}>
                  "{activeDispute.details}"
                </div>

                {/* Evidence Photo */}
                {activeDispute.photoUrl && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={activeDispute.photoUrl} 
                      alt="Dispute evidence" 
                      style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1.5px solid var(--border-light)' }} 
                    />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)' }}>
                        Customer Uploaded Photo Evidence
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotoPreview(activeDispute.photoUrl)}
                        className="btn btn-outline btn-sm"
                        style={{ marginTop: '4px', fontSize: '11.5px', padding: '3px 8px' }}
                      >
                        <Eye size={12} />
                        <span>Inspect Evidence Photo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quotation & Invoice Audit Info */}
              {associatedBooking && (
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-warm)',
                  border: '1px solid var(--border-light)',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Booking Diagnostics & Rate Audit
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Base Fee: <strong>₹{associatedBooking.basePrice || 599}</strong> • Extra Quotation: <strong>₹{associatedBooking.quotation?.totalExtra || 808}</strong> • Total Billed: <strong>₹{activeDispute.escrowAmount || 1407}</strong>
                  </div>
                  {associatedBooking.quotation && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Diagnostic Note: "{associatedBooking.quotation.reason}"
                    </div>
                  )}
                </div>
              )}

              {/* Status / Ruling Display if Already Resolved */}
              {activeDispute.status === 'RESOLVED' && (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#166534' }}>
                    ✓ Case Closed: {activeDispute.decision?.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                    <strong>Admin Ruling Note:</strong> "{activeDispute.adminNote}"
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803D', marginTop: '6px' }}>
                    Settlement Breakdown: Customer Refund: ₹{activeDispute.refundAmount || 0} | Provider Payout: ₹{activeDispute.providerPayout || 0}
                  </div>
                </div>
              )}

              {/* Action Button: Open Ruling Modal */}
              {activeDispute.status === 'OPEN' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenRuling(activeDispute)}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', backgroundColor: '#DC2626', borderColor: '#B91C1C' }}
                  >
                    <Scale size={16} />
                    <span>Issue Official Admin Ruling</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Ruling Modal */}
      {rulingModalOpen && activeDispute && (
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
          zIndex: 10002,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={20} color="var(--forest-700)" />
              <span>Mediate Case #{activeDispute.id}</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Select the escrow settlement ruling. Payouts and refunds will process automatically and update both consoles live.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Option 1: Refund Customer */}
              <label style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: decision === 'REFUND_CUSTOMER' ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                backgroundColor: decision === 'REFUND_CUSTOMER' ? 'var(--forest-50)' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <input
                  type="radio"
                  name="decision"
                  checked={decision === 'REFUND_CUSTOMER'}
                  onChange={() => setDecision('REFUND_CUSTOMER')}
                />
                <div>
                  <strong style={{ fontSize: '13.5px', color: 'var(--forest-900)' }}>
                    Full Refund to Customer (₹{activeDispute.escrowAmount || 1407})
                  </strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Workmanship fault proven. 100% escrow returned to customer; ₹0 provider payout.
                  </div>
                </div>
              </label>

              {/* Option 2: Pay Technician */}
              <label style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: decision === 'PAY_PROVIDER' ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                backgroundColor: decision === 'PAY_PROVIDER' ? 'var(--forest-50)' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <input
                  type="radio"
                  name="decision"
                  checked={decision === 'PAY_PROVIDER'}
                  onChange={() => setDecision('PAY_PROVIDER')}
                />
                <div>
                  <strong style={{ fontSize: '13.5px', color: 'var(--forest-900)' }}>
                    Release Full Payout to Technician (₹{activeDispute.escrowAmount || 1407})
                  </strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Customer claim unverified. Work declared compliant; technician receives full payout.
                  </div>
                </div>
              </label>

              {/* Option 3: Partial Split */}
              <label style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: decision === 'PARTIAL_SPLIT' ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                backgroundColor: decision === 'PARTIAL_SPLIT' ? 'var(--forest-50)' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <input
                  type="radio"
                  name="decision"
                  checked={decision === 'PARTIAL_SPLIT'}
                  onChange={() => setDecision('PARTIAL_SPLIT')}
                />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '13.5px', color: 'var(--forest-900)' }}>
                    Partial Split Settlement
                  </strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Fair compromise between customer refund and technician compensation.
                  </div>

                  {decision === 'PARTIAL_SPLIT' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Customer Refund (₹)</label>
                        <input
                          type="number"
                          value={customRefund}
                          onChange={(e) => setCustomRefund(Number(e.target.value))}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Provider Payout (₹)</label>
                        <input
                          type="number"
                          value={customPayout}
                          onChange={(e) => setCustomPayout(Number(e.target.value))}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Admin Explanation Note */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                  Official Admin Mediation Note (Visible to both parties) *
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Explain rationale for this mediation decision..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-light)',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setRulingModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isResolving}
                  onClick={handleConfirmRuling}
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--forest-800)' }}
                >
                  {isResolving ? 'Executing...' : 'Enforce Binding Ruling'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {photoPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10003,
          padding: '20px'
        }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', maxWidth: '640px', width: '100%', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '14px', color: 'var(--forest-900)' }}>Customer Dispute Evidence Photo</strong>
              <button 
                type="button"
                onClick={() => setPhotoPreview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <img 
              src={photoPreview} 
              alt="Dispute evidence" 
              style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} 
            />
          </div>
        </div>
      )}

    </div>
  );
}
