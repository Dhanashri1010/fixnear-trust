import React from 'react';
import { 
  Star, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';
import { FEATURED_SERVICES } from '../../data/sampleData';

export default function FeaturedServices({ selectedCategoryId, onOpenBookingModal }) {
  const filtered = selectedCategoryId
    ? FEATURED_SERVICES.filter(s => s.categoryId === selectedCategoryId)
    : FEATURED_SERVICES;

  return (
    <section className="section-spacing" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '10px' }}>
              <span className="badge badge-yellow">
                ⭐ Most Requested in Your Area
              </span>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Standardized Rate Services
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Explore itemized details and test booking without creating an account.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-sage">
              30-Day Workmanship Warranty Included
            </span>
          </div>
        </div>

        {/* Services Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '28px'
        }}>
          {filtered.map((service) => (
            <div 
              key={service.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              {/* Image & Badges */}
              <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
                <img 
                  src={service.image} 
                  alt={service.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: 'var(--forest-800)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {service.category}
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(30, 58, 47, 0.9)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={12} />
                  <span>{service.duration}</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* Rating & Reviews */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Star size={15} color="#F59E0B" fill="#F59E0B" />
                  <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{service.rating}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    ({service.reviewsCount} verified reviews)
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', lineHeight: 1.35 }}>
                  {service.title}
                </h3>

                {/* Feature Bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', flex: 1 }}>
                  {service.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} color="var(--forest-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing & CTA */}
                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-800)' }}>
                        ₹{service.startingPrice}
                      </span>
                      <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        ₹{service.originalPrice}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--forest-600)', fontWeight: 600 }}>
                      Fixed Base Rate
                    </span>
                  </div>

                  {/* Booking Action Prominence */}
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => onOpenBookingModal(service)}
                  >
                    <span>Book Service</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
