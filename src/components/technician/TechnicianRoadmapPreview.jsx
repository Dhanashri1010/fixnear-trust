import React from 'react';
import { Wrench, CheckCircle2, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TechnicianRoadmapPreview({ onBackToCustomer }) {
  const plannedModules = [
    { title: "Partner Onboarding & KYC Upload", desc: "Aadhaar / Govt ID, trade certificates, bank details for escrow payouts." },
    { title: "Online / Offline Availability Toggle", desc: "Real-time dispatch status and radius configuration." },
    { title: "Incoming Job Offer Hub", desc: "Map preview, problem description, payout estimate, 60-second acceptance countdown." },
    { title: "Active Job Console & Extra Quotation", desc: "Itemized extra parts request with customer digital sign-off and before/after photos." },
    { title: "Service Completion & OTP Verification", desc: "Secure OTP confirmation triggering escrow fund release." }
  ];

  return (
    <div className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <button 
          className="btn btn-outline btn-sm" 
          onClick={onBackToCustomer}
          style={{ marginBottom: '24px' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Customer Homepage</span>
        </button>

        <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-sage">
              Stage 3 Implementation Roadmap
            </span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '10px' }}>
            Technician / Service Partner Portal
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
            This portal is scheduled for <strong>Stage 3</strong> following the review and approval of the Customer Experience. Here is the architectural specification:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {plannedModules.map((m, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-warm)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--forest-100)',
                  color: 'var(--forest-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{m.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--forest-50)',
            border: '1px solid var(--forest-100)',
            fontSize: '13px',
            color: 'var(--forest-800)'
          }}>
            ✓ Scheduled to be built in Stage 3 using the shared design tokens established in Stage 1.
          </div>
        </div>

      </div>
    </div>
  );
}
