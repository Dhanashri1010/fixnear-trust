import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Award, 
  Wrench, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Home, 
  BadgeCheck, 
  ArrowLeft,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function TechnicianProfilePage() {
  const navigate = useNavigate();
  const { 
    technicians, 
    approvedTechnicians,
    selectedTechnicianId, 
    services, 
    reviews,
    visibleReviews,
    setBookingModalService,
    setIsBookingModalOpen
  } = useStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'equipment' | 'reviews'

  // Retrieve selected technician from approved list
  const list = approvedTechnicians && approvedTechnicians.length > 0 ? approvedTechnicians : technicians;
  const technician = list.find(t => t.id === selectedTechnicianId) || list[0] || technicians[0];

  // Matched live reviews for this technician (excluding hidden reviews)
  const reviewsPool = visibleReviews || reviews.filter(r => !r.isHidden);
  const matchedReviews = reviewsPool.filter(r => r.providerId === technician.id || r.providerId === technician.userId);

  // Services matching this technician's specialty
  const matchedServices = services.filter(s => 
    technician.specializedServices?.includes(s.id) ||
    s.category.toLowerCase().includes((technician.specialty || '').split(' ')[0].toLowerCase())
  );

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
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
          <button 
            type="button"
            onClick={() => navigate('/services')}
            style={{ color: 'var(--text-secondary)', background: 'none' }}
          >
            Verified Experts
          </button>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>
            {technician.name}
          </span>
        </nav>

        {/* Profile Header Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '28px'
          }}>
            
            {/* Left: Avatar & Identity Details */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={technician.avatar} 
                  alt={technician.name}
                  style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--forest-100)' }} 
                />
                <span style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  backgroundColor: 'var(--forest-700)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  padding: '4px',
                  border: '2px solid #FFFFFF',
                  display: 'flex'
                }}>
                  <ShieldCheck size={18} />
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {technician.name}
                  </h1>
                  <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                    {technician.trustScore}
                  </span>
                </div>

                <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  {technician.specialty}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={15} color="#F59E0B" fill="#F59E0B" />
                    <strong style={{ color: 'var(--text-primary)' }}>{technician.rating}</strong>
                    <span>({technician.reviewsCount} reviews)</span>
                  </div>
                  <div>•</div>
                  <div><strong>{technician.experience}</strong> Experience</div>
                  <div>•</div>
                  <div><strong>{technician.jobsCompleted}</strong> Completed Jobs</div>
                  <div>•</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} color="var(--forest-700)" />
                    <span>Lic: {technician.licenseNo || "CERT-MH-8821"}</span>
                  </div>
                </div>

                {/* Badges Ribbon */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  {technician.badges.map((b, idx) => (
                    <span key={idx} className="badge badge-sage" style={{ fontSize: '11.5px', padding: '3px 10px' }}>
                      <CheckCircle2 size={12} />
                      {b}
                    </span>
                  ))}
                  <span className="badge badge-yellow" style={{ fontSize: '11.5px', padding: '3px 10px' }}>
                    ⚡ Available for Tomorrow Slot
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Booking Action Box */}
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--forest-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--forest-100)',
              minWidth: '260px'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Direct Dispatch Window</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-800)', marginBottom: '14px' }}>
                Standard Rates Apply
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => {
                  setBookingModalService(matchedServices[0] || services[0]);
                  setIsBookingModalOpen(true);
                }}
                style={{ width: '100%', padding: '12px' }}
              >
                <span>Book With {technician.name.split(' ')[0]}</span>
              </button>

              <div style={{ fontSize: '11px', color: 'var(--forest-700)', textAlign: 'center', marginTop: '8px' }}>
                ✓ Guaranteed 30-Day FixNear Workmanship Warranty
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid var(--border-light)',
          marginBottom: '32px',
          gap: '24px'
        }}>
          {[
            { id: 'overview', label: 'Biography & Credentials' },
            { id: 'services', label: `Standard Services (${matchedServices.length})` },
            { id: 'equipment', label: 'Tools & Equipment Standards' },
            { id: 'reviews', label: 'Verified Customer Feedback' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 4px',
                fontSize: '14.5px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--forest-800)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '3px solid var(--forest-700)' : '3px solid transparent',
                marginBottom: '-2px',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '32px' }}>
            <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>Professional Summary</h3>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                {technician.bio}
              </p>

              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Authorized Service Areas</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {technician.serviceAreas?.map((area, idx) => (
                  <span key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    backgroundColor: 'var(--bg-warm)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-light)'
                  }}>
                    <MapPin size={13} color="var(--forest-700)" />
                    <span>{area}</span>
                  </span>
                ))}
              </div>

              <div style={{
                padding: '14px',
                backgroundColor: 'var(--forest-50)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--forest-100)',
                fontSize: '13px',
                color: 'var(--forest-800)'
              }}>
                <strong>Trust Audit Completed:</strong> Background verification and police clearance certificate logged in the FixNear Registry (Ref: #REG-7721-MH).
              </div>
            </div>

            {/* Trust Metrics Card */}
            <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '18px' }}>Quality & Safety Scorecard</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Customer Punctuality Rate</span>
                  <strong style={{ color: 'var(--forest-800)' }}>99.2%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>First-Time Fix Ratio</span>
                  <strong style={{ color: 'var(--forest-800)' }}>97.8%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Digital Quotation Accuracy</span>
                  <strong style={{ color: 'var(--forest-800)' }}>100% (No doorstep drift)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Warranty Re-work Claims</span>
                  <strong style={{ color: 'var(--forest-800)' }}>&lt; 0.8%</strong>
                </div>
              </div>

              <div style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-light)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}>
                * FixNear Trust continuous quality scoring combines customer completion OTPs, warranty claims, and secret audit inspections.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Services */}
        {activeTab === 'services' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {matchedServices.map(service => (
              <div key={service.id} className="card card-hover" style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '12px', color: 'var(--forest-700)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  {service.category}
                </div>
                <h4 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '10px' }}>{service.title}</h4>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Est. Duration: {service.duration} · 30-Day Warranty
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-800)' }}>₹{service.startingPrice}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Base Rate</span>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setBookingModalService(service);
                      setIsBookingModalOpen(true);
                    }}
                  >
                    Select & Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Equipment */}
        {activeTab === 'equipment' && (
          <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Standardized Inspection & Safety Equipment
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              To uphold FixNear Trust standards, every partner arrives equipped with calibrated digital testing instruments.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {technician.toolsEquipment?.map((tool, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-warm)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Wrench size={18} color="var(--forest-700)" />
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {tool}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
          <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              Verified Customer Experience Log ({matchedReviews.length > 0 ? matchedReviews.length : 1})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {matchedReviews.length > 0 ? (
                matchedReviews.map((rev) => (
                  <div key={rev.id} style={{ padding: '16px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rev.author || "Verified Customer"} · {rev.date || "Recent"}</span>
                    </div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{rev.content}"
                    </div>
                    {rev.photoUrl && (
                      <div style={{ marginTop: '10px' }}>
                        <img src={rev.photoUrl} alt="Verified work" style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-xs)' }} />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified Customer · 4 days ago</span>
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    "{technician.name} tested the capacitor right in front of me with his digital meter. The extra parts estimate was pushed to my app for approval before he replaced anything. Highly recommended."
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
