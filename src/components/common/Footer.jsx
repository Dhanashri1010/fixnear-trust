import React from 'react';
import { ShieldCheck, Heart, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--border-light)',
      padding: '56px 0 32px 0'
    }}>
      <div className="container">

        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--forest-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <ShieldCheck size={20} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                FixNear <span style={{ fontSize: '12px', color: 'var(--forest-600)' }}>TRUST</span>
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Home service booking built on transparent itemized pricing, verified specialists, and guaranteed payment protection.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                <CheckCircle2 size={12} />
                30-Day Workmanship Warranty Included
              </span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              Popular Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <Link to="/services?category=air-conditioning">Air Conditioning Servicing</Link>
              <Link to="/services?category=plumbing">Plumbing & Leak Repairs</Link>
              <Link to="/services?category=electrical">Electrical Safety & Wiring</Link>
              <Link to="/services?category=appliances">Appliance Repairs</Link>
              <Link to="/services">View Complete Catalog</Link>
            </div>
          </div>

          {/* Col 3: Support & Help */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              Help & Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <Link to="/support">Support Desk & Tickets</Link>
              <Link to="/my-bookings">Track Your Booking</Link>
              <Link to="/refund-policy">Refund & Cancellation Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>

          {/* Col 4: Trust Standard */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              FixNear Trust Promise
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              Every partner is police-verified and tested for skill certification. With digital finish codes, money is released only after your personal satisfaction.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--forest-50)',
              border: '1px solid var(--forest-100)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11.5px',
              color: 'var(--forest-800)',
              fontWeight: 600
            }}>
              <ShieldCheck size={14} color="var(--forest-700)" />
              <span>100% Verified Partners</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12.5px',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} FixNear Trust Technologies Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
            <Link to="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
            <Link to="/refund-policy" style={{ color: 'var(--text-muted)' }}>Refund Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
