import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function FeaturedServices({ selectedCategoryId, onOpenBookingModal }) {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await servicesAPI.getServices(selectedCategoryId ? { categoryId: selectedCategoryId } : {});
        if (isMounted) {
          setServices(data.services || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load services at this time.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchServices();
    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId]);

  const handleBook = (service) => {
    if (onOpenBookingModal) {
      onOpenBookingModal(service);
    } else {
      navigate(`/book?serviceId=${service.serviceId || service._id}`);
    }
  };

  return (
    <section className="section-spacing" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '10px' }}>
              <span className="badge badge-yellow">
                {t('home.popularServices', '⭐ Most Requested in Your Area')}
              </span>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {t('catalog.standardRates', 'Standardized Rate Services')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              {t('catalog.subtitle', 'Explore itemized details with transparent pricing and verified technicians.')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-sage">
              {t('common.warrantyBadge', '30-Day Workmanship Warranty Included')}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            <p style={{ fontSize: '14.5px' }}>{t('catalog.loadingServices', 'Loading verified standard-rate services...')}</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-lg)', border: '1px solid #FECACA' }}>
            <AlertCircle size={32} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#991B1B', marginBottom: '6px' }}>{t('catalog.couldNotLoad', 'Could not load services')}</h4>
            <p style={{ fontSize: '13.5px', color: '#B91C1C' }}>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-medium)' }}>
            <Wrench size={36} color="var(--forest-600)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{t('catalog.noServices', 'No services available in this category yet')}</h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{t('catalog.checkBackSoon', 'Check back soon as we onboard certified technicians.')}</p>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && services.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px'
          }}>
            {services.map((service) => {
              const serviceKey = service.serviceId || service._id;
              return (
                <div 
                  key={serviceKey}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  {/* Image & Badges */}
                  <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--forest-50)' }}>
                    {service.image ? (
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--forest-100)' }}>
                        <Wrench size={40} color="var(--forest-700)" />
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: 'var(--forest-800)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {t(`categories.${service.category}`, service.category)}
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(30, 58, 47, 0.92)',
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
                      <span>{service.duration || '45 - 60 mins'}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    
                    {/* Rating & Reviews */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Star size={15} color="#F59E0B" fill="#F59E0B" />
                      <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{service.rating || '4.9'}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        ({service.reviewsCount || 120} {t('catalog.verifiedRatings', 'verified ratings')})
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', lineHeight: 1.35 }}>
                      {service.title}
                    </h3>

                    {/* Feature Bullets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', flex: 1 }}>
                      {(service.features || []).slice(0, 3).map((feat, idx) => (
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
                          {service.originalPrice > service.startingPrice && (
                            <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                              ₹{service.originalPrice}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--forest-600)', fontWeight: 600 }}>
                          {t('catalog.standardBaseRate', 'Standard Base Rate')}
                        </span>
                      </div>

                      {/* Booking Action */}
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleBook(service)}
                      >
                        <span>{t('catalog.bookService', 'Book Service')}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
