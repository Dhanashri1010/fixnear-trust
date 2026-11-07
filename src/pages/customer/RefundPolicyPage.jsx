import React from 'react';
import { ShieldCheck, RotateCcw, ChevronRight, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RefundPolicyPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '36px 0 72px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Breadcrumb */}
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
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Refund & Cancellation Policy</span>
        </nav>

        {/* Header Card */}
        <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              <RotateCcw size={13} />
              Fair Consumer Protection
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--forest-900)' }}>
            Refund & Cancellation Policy
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Transparent guidelines on booking cancellation, rescheduling, and 30-day workmanship warranty coverage.
          </p>

          <div style={{
            marginTop: '18px',
            padding: '12px 16px',
            backgroundColor: '#FFFBEB',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#92400E', fontWeight: 600 }}>
              Draft notice: This document is a plain-language draft to be reviewed by a qualified lawyer.
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', lineHeight: 1.8, fontSize: '14.5px', color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            1. Free Cancellation
          </h2>
          <p style={{ marginBottom: '20px' }}>
            You can cancel or reschedule any booking without penalty while its status is <strong>Requested</strong> or <strong>Accepted</strong> (before the technician is marked On The Way). You can execute cancellation directly from your "My Bookings" page.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            2. Late Cancellation Fee
          </h2>
          <p style={{ marginBottom: '20px' }}>
            If you cancel after a technician is already <em>On The Way</em> or has arrived at your doorstep, a nominal travel dispatch fee may apply to compensate the specialist for fuel and travel time.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            3. 30-Day Workmanship Warranty
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Every completed service carries a 30-day warranty on workmanship. If the identical issue re-occurs within 30 days of completion, you can raise a complaint via the portal. FixNear will re-dispatch a technician to inspect and rectify the issue without diagnostic re-charge.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            4. Dispute Resolution & Refunds
          </h2>
          <p style={{ marginBottom: '20px' }}>
            If a job cannot be resolved to your satisfaction or if unauthorized damage occurs, you can raise an immediate complaint from your booking details. Our support resolution team reviews the timeline, notes, and photos to issue full or partial refunds where appropriate.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            5. Processing Time
          </h2>
          <p>
            Approved refunds are credited back to your original payment method within 5–7 business days depending on your bank's settlement cycle.
          </p>
        </div>

      </div>
    </div>
  );
}

