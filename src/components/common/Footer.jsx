import React from 'react';
import { ShieldCheck, Heart, Lock, CheckCircle2 } from 'lucide-react';

export default function Footer({ onSwitchRole }) {
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
              Intelligent home-service booking built upon transparent rate cards, certified specialists, and escrow protection.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                <CheckCircle2 size={12} />
                30-Day Workmanship Warranty
              </span>
            </div>
          </div>

          {/* Col 2: Customer Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              Customer Journeys
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <a href="#services">Air Conditioning Servicing</a>
              <a href="#services">Plumbing & Leak Triage</a>
              <a href="#services">Electrical Safety & MCB</a>
              <a href="#services">Appliance Repairs</a>
              <a href="#trust-guarantee">FixNear Trust Standard</a>
            </div>
          </div>

          {/* Col 3: Role Previews (Stage 2-4 Roadmap) */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              Platform Roles
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <button 
                onClick={() => onSwitchRole('customer')}
                style={{ textAlign: 'left', color: 'var(--forest-700)', fontWeight: 600, background: 'none' }}
              >
                Customer Portal (Active Stage 1 & 2)
              </button>
              <button 
                onClick={() => onSwitchRole('technician')}
                style={{ textAlign: 'left', color: 'var(--text-secondary)', background: 'none' }}
              >
                Technician Dispatch Portal (Stage 3)
              </button>
              <button 
                onClick={() => onSwitchRole('admin')}
                style={{ textAlign: 'left', color: 'var(--text-secondary)', background: 'none' }}
              >
                Admin Operations Console (Stage 4)
              </button>
            </div>
          </div>

          {/* Col 4: Academic Project Transparency */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              Project Demonstration
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
              FixNear Trust is an academic final-year major project prototype. All profiles, booking steps, and technician ratings currently reflect simulated test data.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-warm)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11.5px',
              color: 'var(--text-secondary)'
            }}>
              <Lock size={12} color="var(--forest-700)" />
              <span>Simulated Frontend Demo</span>
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
            © 2026 FixNear Trust. Final-Year Major Project UI/UX Prototype.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Trust Standard Document</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
