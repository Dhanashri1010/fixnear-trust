import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Droplets, 
  Zap, 
  Tv, 
  Hammer, 
  Sparkles, 
  ArrowUpRight,
  Wrench
} from 'lucide-react';
import { servicesAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const ICON_MAP = {
  Wind: Wind,
  Droplets: Droplets,
  Zap: Zap,
  Tv: Tv,
  Hammer: Hammer,
  Sparkles: Sparkles,
  Wrench: Wrench,
};

export default function ServiceCategories({ selectedCategoryId, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    servicesAPI.getCategories()
      .then((res) => {
        if (isMounted && res.success && res.categories) {
          setCategories(res.categories);
        }
      })
      .catch((err) => {
        console.warn('Failed to load categories:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="services" className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              {t('common.verifiedBadge', 'Verified Service Catalog')}
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
            {t('home.browseCategories', 'Browse Essential Home Services')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            {t('home.browseSubtitle', 'All services feature upfront rate cards, OEM-compliant spares, and certified technicians. No doorstep surprises.')}
          </p>
        </div>

        {/* Categories Grid */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            {t('catalog.loadingCategories', 'Loading categories from server...')}
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            {t('catalog.noActiveCategories', 'No active categories found.')}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Wrench;
            const isSelected = selectedCategoryId === cat.categoryId;

            return (
              <div 
                key={cat.categoryId || cat._id}
                className="card"
                onClick={() => onSelectCategory(cat.categoryId)}
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                  backgroundColor: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: cat.accentBg || 'var(--forest-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cat.accentText || 'var(--forest-800)'
                  }}>
                    <IconComponent size={24} />
                  </div>

                  {cat.badge && (
                    <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                      {cat.badge}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-900)' }}>
                    {t(`categories.${cat.categoryId}`, cat.name)}
                  </h3>
                  <ArrowUpRight size={18} color="var(--forest-700)" />
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px', minHeight: '40px' }}>
                  {cat.tagline}
                </p>

                <div style={{
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('catalog.startingFrom', 'Starting from')}</span>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--forest-800)' }}>
                    ₹{cat.startingPrice}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
