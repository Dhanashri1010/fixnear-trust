import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  BadgeCheck, 
  Clock, 
  Star, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function HeroSection({ onSearch, onSelectCategory, onOpenBookingModal }) {
  const [searchTerm, setSearchTerm] = useState('');

  const quickPills = [
    { label: "AC Jet Service", category: "ac-cooling" },
    { label: "Tap & Pipe Leak", category: "plumbing" },
    { label: "MCB Tripping Fix", category: "electrical" },
    { label: "RO Water Filter", category: "appliances" }
  ];

  return (
    <section style={{ 
      backgroundColor: 'var(--bg-warm)', 
      padding: '56px 0 64px 0',
      borderBottom: '1px solid var(--border-light)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.95fr)',
          gap: '48px',
          alignItems: 'center'
        }}>
          
          {/* Left Column: Value Proposition & Search */}
          <div>
            {/* Trust Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span className="badge badge-forest" style={{ padding: '6px 14px', fontSize: '13px' }}>
                <ShieldCheck size={16} />
                FixNear Trust Standard
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                3-Layer Vetting & Escrow Quotations
              </span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: '44px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '18px'
            }}>
              Intelligent, Honest Home Services.{' '}
              <span style={{ color: 'var(--forest-700)' }}>
                Fixed Right the First Time.
              </span>
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: '17px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '540px'
            }}>
              Explore transparent service rates, certified local specialists, and a 30-day workmanship guarantee. Zero hidden callout fees, zero surprise pricing.
            </p>

            {/* Interactive Search Bar Box */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '8px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '560px',
              marginBottom: '20px'
            }}>
              <div style={{ paddingLeft: '12px', color: 'var(--forest-700)', display: 'flex' }}>
                <Search size={22} />
              </div>
              <input 
                type="text"
                placeholder="What needs repair? (e.g., Split AC, Pipe leak, MCB tripping)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(searchTerm)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent'
                }}
              />
              <button 
                className="btn btn-primary"
                onClick={() => onSearch(searchTerm)}
              >
                <span>Find Service</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick Keyword Suggestions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Trending:
              </span>
              {quickPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCategory(pill.category)}
                  style={{
                    backgroundColor: 'var(--bg-warm-secondary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 12px',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--forest-100)';
                    e.currentTarget.style.color = 'var(--forest-800)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-warm-secondary)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Core Trust Indicators */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginTop: '36px',
              paddingTop: '28px',
              borderTop: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--forest-700)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Upfront Rate Card
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BadgeCheck size={18} color="var(--forest-700)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Police & KYC Vetted
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="var(--forest-700)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  30-Day Warranty
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Trust Visual Experience Card */}
          <div style={{ position: 'relative' }}>
            
            {/* Primary Visual Showcase Card */}
            <div className="card" style={{
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981'
                  }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-800)' }}>
                    Instant Dispatch Available
                  </span>
                </div>
                <span className="badge badge-yellow">
                  ⭐ 4.91 / 5 Average Rating
                </span>
              </div>

              {/* Sample Technician Spotlight Card in Hero */}
              <div style={{
                backgroundColor: 'var(--forest-50)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: '1px solid var(--forest-100)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80" 
                    alt="Ramesh S." 
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '16px' }}>Ramesh Sharma</span>
                      <ShieldCheck size={16} color="var(--forest-700)" />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Senior Cooling & HVAC Specialist
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span className="badge badge-forest" style={{ fontSize: '11px', padding: '1px 6px' }}>
                        98% Trust Index
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        1,420+ jobs completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Quotation Preview Box */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Sample Transparent Quotation
                  </span>
                  <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                    Fixed Standard Tier
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Deep Foam Jet Service (Split AC)</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹599</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Comprehensive Diagnostics & Pressure Test</span>
                    <span style={{ color: 'var(--forest-700)', fontWeight: 600 }}>Included (₹0)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>30-Day Free Rework Protection</span>
                    <span style={{ color: 'var(--forest-700)', fontWeight: 600 }}>Included (₹0)</span>
                  </div>
                  <div style={{
                    marginTop: '6px',
                    paddingTop: '8px',
                    borderTop: '1px dashed var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}>
                    <span>Total Est. Upfront</span>
                    <span style={{ color: 'var(--forest-800)' }}>₹599</span>
                  </div>
                </div>
              </div>

              {/* Primary Call to Action on Card */}
              <button 
                className="btn btn-primary"
                onClick={() => onOpenBookingModal(null)}
                style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              >
                <span>Book This Service (Demo Preview)</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                * Visitors can freely test the booking steps without creating an account
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
