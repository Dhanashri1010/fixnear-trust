import React from 'react';
import { ShieldCheck, FileText, ChevronRight, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
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
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Terms of Service</span>
        </nav>

        {/* Header Card */}
        <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              <FileText size={13} />
              Legal Agreement
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--forest-900)' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Last updated: February 2026. Please read these terms carefully before booking any home repair services on FixNear Trust.
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
            1. Overview of Platform Services
          </h2>
          <p style={{ marginBottom: '20px' }}>
            FixNear Trust connects homeowners with verified independent service providers for appliance repair, plumbing, electrical, and maintenance needs. FixNear establishes standardized base pricing, enforces safety verifications, and facilitates payment protection.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            2. Verified Booking & Quoting Standards
          </h2>
          <p style={{ marginBottom: '20px' }}>
            All bookings placed on FixNear Trust start at the published base diagnostic and service rate. If additional replacement components or extra labour are required, the provider must submit a digital quotation through the app. Work cannot proceed without explicit customer approval via the platform.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            3. Job Completion & 4-Digit Finish Code
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Every confirmed booking is assigned a confidential 4-digit finish code visible solely in the customer's portal. You must provide this finish code to the technician only after you have inspected and confirmed the work is satisfactorily completed.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            4. User Responsibilities
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Customers must provide accurate address details, reasonable access to the service premises, and a safe work environment for the assigned service technician.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            5. Contact Us
          </h2>
          <p>
            For questions regarding these terms, contact our support desk directly through the Help section or email us at support@fixnear.com.
          </p>
        </div>

      </div>
    </div>
  );
}

