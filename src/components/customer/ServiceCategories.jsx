import React from 'react';
import { 
  Wind, 
  Droplets, 
  Zap, 
  Tv, 
  Hammer, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const ICON_MAP = {
  Wind: Wind,
  Droplets: Droplets,
  Zap: Zap,
  Tv: Tv,
  Hammer: Hammer,
  Sparkles: Sparkles
};

export default function ServiceCategories({ selectedCategoryId, onSelectCategory }) {
  const { categories } = useStore();
  const displayCategories = categories && categories.length > 0 ? categories : [];
  return (
    <section id="services" className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-sage">
              Verified Service Catalog
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Browse Essential Home Services
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            All services feature upfront rate cards, OEM-compliant spares, and certified technicians. No doorstep surprises.
          </p>
        </div>

        {/* Categories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {displayCategories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Sparkles;
            const isSelected = selectedCategoryId === cat.id;

            return (
              <div 
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="card card-hover"
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                  backgroundColor: '#FFFFFF',
                  position: 'relative'
                }}
              >
                {/* Top Badge & Count */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: cat.accentBg,
                    color: cat.accentText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={24} />
                  </div>
                  <span className="badge badge-forest" style={{ fontSize: '11.5px' }}>
                    {cat.badge}
                  </span>
                </div>

                {/* Title & Tagline */}
                <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px', minHeight: '40px' }}>
                  {cat.tagline}
                </p>

                {/* Footer Pricing & CTA */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Starts from</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-800)' }}>
                      ₹{cat.startingPrice}
                    </span>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--forest-700)'
                  }}>
                    <span>View Rates</span>
                    <ArrowUpRight size={16} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
