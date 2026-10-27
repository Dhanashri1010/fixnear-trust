import React from 'react';
import { 
  ShieldCheck, 
  ReceiptText, 
  ClockAlert, 
  BadgeCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
const TRUST_PILLARS = [
  {
    icon: "ShieldCheck",
    title: "Vetted & Certified Technicians",
    description: "Every partner passes identity checks, rigorous practical skill assessments, and customer satisfaction audits."
  },
  {
    icon: "ReceiptText",
    title: "Payment Protection & Clear Quotes",
    description: "No verbal estimates. Review itemized labor and spare parts on your screen before authorizing any repair."
  },
  {
    icon: "ClockAlert",
    title: "Guaranteed Punctuality",
    description: "Your time matters. Strict arrival windows with dedicated technician communication."
  },
  {
    icon: "BadgeCheck",
    title: "30-Day Workmanship Warranty",
    description: "Free re-inspection and resolution if the repaired problem resurfaces within 30 days."
  }
];

const ICON_MAP = {
  ShieldCheck: ShieldCheck,
  ReceiptText: ReceiptText,
  ClockAlert: ClockAlert,
  BadgeCheck: BadgeCheck
};

export default function TrustBanner() {
  return (
    <section id="trust-guarantee" className="section-spacing" style={{ backgroundColor: 'var(--forest-50)' }}>
      <div className="container">
        
        {/* Banner Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              <ShieldCheck size={14} />
              The FixNear Trust Commitment
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Why Homeowners Rely on FixNear Trust
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            We redesigned the home-service experience around absolute pricing transparency, vetted skill standards, and post-repair peace of mind.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {TRUST_PILLARS.map((pillar, idx) => {
            const IconComponent = ICON_MAP[pillar.icon] || ShieldCheck;
            return (
              <div 
                key={idx}
                className="card"
                style={{
                  padding: '28px 24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--forest-100)',
                  color: 'var(--forest-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}>
                  <IconComponent size={24} />
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {pillar.title}
                </h3>

                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Guarantee Callout Box */}
        <div style={{
          marginTop: '40px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--yellow-100)',
              color: 'var(--yellow-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>
                FixNear Escrow Protection
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Funds are only released to the technician after you inspect the work and verify with your completion OTP.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-sage">
              ✓ 100% Satisfaction or Free Re-visit
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
