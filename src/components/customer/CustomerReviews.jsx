// ===================================================================
// FixNear Trust - Customer Reviews & Ratings Display
// Shows live verified reviews submitted post-completion with OTP
// ===================================================================

import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Quote, Camera, AlertCircle } from 'lucide-react';
import { servicesAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import InitialsAvatar from '../common/InitialsAvatar';

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t, formatDate } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await servicesAPI.getReviews();
        if (isMounted) {
          setReviews(data.reviews || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || t('common.errorGeneral', 'Unable to load reviews.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-yellow">
              {t('home.verifiedReviewsBadge', '⭐ Real Verified Reviews')}
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            {t('home.whatHomeownersSay', 'What Homeowners Say')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15.5px' }}>
            {t('home.whatHomeownersSaySub', 'Customer ratings submitted only after verified job completion.')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '14px' }}>{t('home.loadingFeedback', 'Loading verified customer feedback...')}</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-lg)', border: '1px solid #FECACA' }}>
            <p style={{ fontSize: '13.5px', color: '#B91C1C' }}>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && reviews.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-medium)', maxWidth: '500px', margin: '0 auto' }}>
            <ShieldCheck size={36} color="var(--forest-600)" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{t('home.noReviewsYet', 'No reviews submitted yet')}</h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              {t('home.noReviewsYetSub', 'Once you complete a service and enter the finish code, your honest review will appear here!')}
            </p>
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && !error && reviews.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {reviews.map((rev) => {
              const author = rev.authorName || rev.author || t('home.homeownerDefault', 'Homeowner');
              return (
                <div 
                  key={rev._id || rev.id}
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
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={15} color="#F59E0B" fill="#F59E0B" />
                        ))}
                      </div>
                      <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                        {rev.serviceTitle || rev.service || t('common.verifiedBadge', 'Verified Service')}
                      </span>
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>
                      "{rev.comment || rev.content}"
                    </p>

                    {rev.photos && rev.photos.length > 0 && (
                      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                        {rev.photos.map((p, idx) => (
                          <img 
                            key={idx}
                            src={p} 
                            alt="Customer verification" 
                            style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }} 
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <InitialsAvatar name={author} size={34} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{author}</span>
                          <ShieldCheck size={14} color="var(--forest-700)" />
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {t('home.verifiedCustomer', 'Verified Customer')}
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {rev.createdAt ? formatDate(rev.createdAt) : t('home.recentTime', 'Recent')}
                    </span>
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
