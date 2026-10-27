// ===================================================================
// FixNear Trust - Customer Dispute Resolution Modal
// Allows raising a formal dispute with photo attachment & escrow hold
// ===================================================================

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Upload, X, CheckCircle2, FileText } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function DisputeModal({ isOpen, onClose, booking }) {
  const { createDispute } = useStore();
  const { showToast } = useToast();

  const [reasonCategory, setReasonCategory] = useState("Workmanship defect / recurring fault");
  const [details, setDetails] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Photo exceeds 5 MB limit.", "error");
      return;
    }

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setPhotoUrl(loadEvt.target.result);
      showToast("Evidence photo attached!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim() || details.length < 15) {
      showToast("Please provide at least 15 characters describing the issue.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createDispute({
        bookingId: booking.id,
        customerId: booking.customerId || "customer-demo-1",
        customerName: booking.customerName || "Aarav Patel",
        customerPhone: booking.customerPhone || "+91 98201 54321",
        providerId: booking.providerId || "provider-demo-1",
        providerName: booking.providerName || booking.technicianName || "Ramesh Sharma",
        providerPhone: booking.providerPhone || "+91 98200 11223",
        serviceTitle: booking.serviceTitle,
        reason: reasonCategory,
        details: details,
        photoUrl: photoUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80",
        escrowAmount: booking.invoice?.actualBilledTotal || booking.price || 599,
        requestedResolution: "Investigation & Refund",
        status: "OPEN"
      });

      showToast("Dispute escalated to FixNear Trust & Safety Desk! Escrow funds placed on hold.", "warning");
      onClose();
    } catch (err) {
      console.error("Dispute error:", err);
      showToast("Could not submit dispute. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      zIndex: 10000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '540px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
        border: '1.5px solid var(--border-light)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FEF2F2',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                Report an Issue / Raise Dispute
              </h2>
              <div style={{ fontSize: '12px', color: '#B91C1C' }}>
                Booking #{booking.id} • FixNear Safe Escrow Guarantee
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Guarantee Note */}
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--forest-50)',
              border: '1px solid var(--forest-200)',
              fontSize: '12.5px',
              color: 'var(--forest-800)',
              lineHeight: 1.5
            }}>
              🛡️ <strong>FixNear 100% Escrow Protection:</strong> Once raised, payout is held until the Admin Mediation Desk inspects the work timeline, quotation, and photo proof.
            </div>

            {/* Category Select */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                Dispute Reason Category *
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '13.5px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="Workmanship defect / recurring fault">Workmanship defect / recurring fault</option>
                <option value="Unauthorized part price / overcharging">Unauthorized part price / overcharging</option>
                <option value="Incomplete job or non-functional repair">Incomplete job or non-functional repair</option>
                <option value="Property damage during service">Property damage during service</option>
                <option value="Technician conduct / no-show">Technician conduct / no-show</option>
              </select>
            </div>

            {/* Detailed Description */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                Describe what happened *
              </label>
              <textarea
                rows={4}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain the issue clearly (e.g., water leakage started 2 hours after capacitor service, or technician did not clean the drain pipe as invoiced)..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '13px',
                  lineHeight: 1.5
                }}
              />
            </div>

            {/* Photo Attachment (Optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                Upload Photo Evidence (Optional but recommended)
              </label>
              
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--border-light)',
                backgroundColor: 'var(--bg-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Evidence preview" 
                      style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }} 
                    />
                  ) : (
                    <Upload size={22} color="var(--text-muted)" />
                  )}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-900)' }}>
                      {photoName ? photoName : "Attach photo of equipment or damage"}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      JPG, PNG (Max 5 MB)
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dispute-photo-upload"
                    className="btn btn-outline btn-sm"
                    style={{ cursor: 'pointer', backgroundColor: '#FFFFFF', fontSize: '12px' }}
                  >
                    <span>{photoName ? 'Replace Photo' : 'Select Photo'}</span>
                  </label>
                  <input
                    id="dispute-photo-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                style={{ padding: '10px 18px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ backgroundColor: '#DC2626', borderColor: '#B91C1C', padding: '10px 22px' }}
              >
                {isSubmitting ? 'Escalating...' : 'Submit Formal Dispute'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
