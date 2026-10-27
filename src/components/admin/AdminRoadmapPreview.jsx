import React from 'react';
import { Shield, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function AdminRoadmapPreview({ onBackToCustomer }) {
  const plannedModules = [
    { title: "Executive Operations Dashboard", desc: "Live service counters, GMV, dispute logs, active coverage heatmaps." },
    { title: "Technician KYC Verification Desk", desc: "Side-by-side inspection of Aadhaar, police certificates, and license approvals." },
    { title: "Service Catalog & Dynamic Pricing", desc: "Base rate configuration, seasonal surge parameters, and warranty rules." },
    { title: "Dispute & Claims Resolution Room", desc: "Customer damage claims, technician appeals, and escrow arbitration." }
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
            <span className="badge badge-yellow">
              Stage 4 Implementation Roadmap
            </span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '10px' }}>
            Administrator & Operations Control Room
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
            This portal is scheduled for <strong>Stage 4</strong>. Here is the operational specification:
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
                  backgroundColor: 'var(--yellow-100)',
                  color: 'var(--yellow-800)',
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
            ✓ Scheduled to be built in Stage 4 following Stage 3 Technician portal completion.
          </div>
        </div>

      </div>
    </div>
  );
}
