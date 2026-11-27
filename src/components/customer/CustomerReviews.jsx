// ===================================================================
// FixNear Trust - Customer Reviews & Ratings Display (Phase 6 Upgrade)
// Compact cards | 3-line clamping with Read More | Sorting | Pagination
// ===================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Star, ShieldCheck, ArrowUpDown, ChevronDown, CheckCircle2 } from 'lucide-react';
import { servicesAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import InitialsAvatar from '../common/InitialsAvatar';

function ClampedReviewText({ text }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const isLong = text && text.length > 140;

  return (
    <div style={{ marginBottom: '14px' }}>
      <p
        style={{
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          fontStyle: 'italic',
          display: expanded ? 'block' : '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical',
          overflow: expanded ? 'visible' : 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        "{text}"
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--forest-700)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            marginTop: '4px',
            textDecoration: 'underline',
          }}
        >
          {expanded ? t('common.showLess', 'Show Less') : t('common.readMore', 'Read More')}
        </button>
      )}
    </div>
  );
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest' | 'lowest'
  const [visibleCount, setVisibleCount] = useState(6);
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

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === 'highest') {
      return list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }
    if (sortBy === 'lowest') {
      return list.sort((a, b) => (a.rating || 5) - (b.rating || 5));
    }
    // 'newest' default
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [reviews, sortBy]);

  const displayedReviews = sortedReviews.slice(0, visibleCount);

  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container">
        
        {/* Header with Sort Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '8px' }}>
              <span className="badge badge-yellow">
                {t('home.verifiedReviewsBadge', '⭐ Real Verified Reviews')}
              </span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--forest-900)' }}>
              {t('home.whatHomeownersSay', 'What Homeowners Say')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginTop: '4px' }}>
              {t('home.whatHomeownersSaySub', 'Customer ratings submitted only after verified job completion.')}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
              {t('common.sortBy', 'Sort by:')}
            </span>
            <div style={{ position: 'relative' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 28px 6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--forest-800)',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                }}
              >
                <option value="newest">{t('common.newestFirst', 'Newest First')}</option>
                <option value="highest">{t('common.highestRating', 'Highest Rating')}</option>
                <option value="lowest">{t('common.lowestRating', 'Lowest Rating')}</option>
              </select>
              <ChevronDown size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
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

        {/* Reviews Grid — Compact Clean Cards */}
        {!loading && !error && displayedReviews.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {displayedReviews.map((rev) => {
                const author = rev.authorName || rev.author || t('home.homeownerDefault', 'Homeowner');
                return (
                  <div 
                    key={rev._id || rev.id}
                    className="card"
                    style={{
                      padding: '20px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 180ms ease, box-shadow 180ms ease'
                    }}
                  >
                    <div>
                      {/* Top Row: Stars + Service Tag */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              color={i < (rev.rating || 5) ? '#F59E0B' : '#E5E7EB'} 
                              fill={i < (rev.rating || 5) ? '#F59E0B' : 'transparent'} 
                            />
                          ))}
                        </div>
                        <span className="badge badge-sage" style={{ fontSize: '11px', padding: '2px 8px' }}>
                          {rev.serviceTitle || rev.service || t('common.verifiedBadge', 'Verified Service')}
                        </span>
                      </div>

                      {/* Clamped Comment with Read More */}
                      <ClampedReviewText text={rev.comment || rev.content || 'Excellent service completed on time.'} />

                      {rev.photos && rev.photos.length > 0 && (
                        <div style={{ marginBottom: '14px', display: 'flex', gap: '8px' }}>
                          {rev.photos.map((p, idx) => (
                            <img 
                              key={idx}
                              src={p} 
                              alt="Customer verification" 
                              style={{ width: '70px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }} 
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer: User Details + Verified Check */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <InitialsAvatar name={author} size={30} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--forest-900)' }}>
                            <span>{author}</span>
                            <ShieldCheck size={13} color="var(--forest-700)" />
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {rev.createdAt ? formatDate(rev.createdAt) : t('home.verifiedCustomer', 'Verified Customer')}
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: '11px', color: 'var(--forest-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={12} /> {t('common.verified', 'Verified')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Load More Button */}
            {sortedReviews.length > visibleCount && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 24px', fontSize: '13.5px', fontWeight: 600 }}
                >
                  {t('home.loadMoreReviews', 'Load More Reviews')} ({sortedReviews.length - visibleCount} {t('common.remaining', 'remaining')})
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
