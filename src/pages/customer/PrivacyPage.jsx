import React from 'react';
import { ShieldCheck, Lock, ChevronRight, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPage() {
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
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Privacy Policy</span>
        </nav>

        {/* Header Card */}
        <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              <Lock size={13} />
              Data Protection
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--forest-900)' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your privacy and data safety are fundamental to FixNear Trust. Here is how we collect, use, and protect your information.
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
            1. Information We Collect
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We collect the information you provide when creating an account (name, email, phone number) and when booking a service (service address, preferred appointment time slot, issue notes, and optional repair photos).
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            2. How We Use Your Information
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Your details are used solely to match you with a verified technician in your city, coordinate your appointment, transmit digital quotations and invoices, and update booking status in real-time. We never sell your personal information to third-party marketers.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            3. Sharing With Assigned Technicians
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Technicians only receive your service address and contact telephone number after they have formally accepted your booking request. Your confidential 4-digit finish code is never disclosed to technicians.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            4. Cookies & Security
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We authenticate user sessions exclusively via secure, httpOnly cookies. Sensitive credentials and passwords are cryptographic hashes stored on secure database clusters.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            5. Your Rights
          </h2>
          <p>
            You have the right to inspect, update, or request deletion of your account and personal history at any time by contacting support@fixnear.com.
          </p>
        </div>

      </div>
    </div>
  );
}

