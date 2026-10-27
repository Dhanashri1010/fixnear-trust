// ===================================================================
// FixNear Trust - Customer Reviews & Ratings Display
// Shows live verified reviews submitted post-completion with OTP
// ===================================================================

import React from 'react';
import { Star, ShieldCheck, Quote, Camera } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function CustomerReviews() {
  const { reviews, visibleReviews } = useStore();
  const displayReviews = visibleReviews || reviews.filter(r => !r.isHidden);

  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-yellow">
              ⭐ Real Verified Reviews
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            What Homeowners Say
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15.5px' }}>
            Customer ratings submitted after completion OTP and invoice inspection.
          </p>
        </div>

        {/* Reviews Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {displayReviews.map((t) => (
            <div 
              key={t.id}
              className="card"
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} color="#F59E0B" fill="#F59E0B" />
                    ))}
                  </div>
                  <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                    {t.service}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>
                  "{t.content}"
                </p>

                {t.photoUrl && (
                  <div style={{ marginBottom: '16px' }}>
                    <img 
                      src={t.photoUrl} 
                      alt="Customer verification" 
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t.author}</span>
                    <ShieldCheck size={14} color="var(--forest-700)" />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t.locality || "Mumbai"}
                  </div>
                </div>

                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t.date || "Recent"}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
