import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  BadgeCheck, 
  Clock, 
  Star, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Wrench
} from 'lucide-react';
import { providersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import InitialsAvatar from '../common/InitialsAvatar';

export default function HeroSection({ onSearch, onSelectCategory, onOpenBookingModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [topProvider, setTopProvider] = useState(null);
  const { selectedCity } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    providersAPI.getProviders({ city: selectedCity || 'Mumbai' })
      .then((res) => {
        if (isMounted && res.success && res.providers && res.providers.length > 0) {
          setTopProvider(res.providers[0]);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  const quickPills = [
    { labelKey: "ac-cooling", defaultLabel: "AC Jet Service", category: "ac-cooling" },
    { labelKey: "plumbing", defaultLabel: "Tap & Pipe Leak", category: "plumbing" },
    { labelKey: "electrical", defaultLabel: "MCB Tripping Fix", category: "electrical" },
    { labelKey: "appliances", defaultLabel: "RO Water Filter", category: "appliances" }
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
                {t('common.verifiedBadge', 'FixNear Trust Standard')}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {t('common.warrantyBadge', '30-Day FixNear Warranty')}
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
              {t('home.heroTitle', 'Intelligent, Honest Home Services.')}{' '}
              <span style={{ color: 'var(--forest-700)' }}>
                {t('home.heroSubtitle', 'Fixed Right the First Time.')}
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
              {t('home.heroDesc', 'Explore transparent service rates, certified local specialists, and a 30-day workmanship guarantee. Zero hidden callout fees, zero surprise pricing.')}
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
                placeholder={t('home.searchPlaceholder', 'What needs repair? (e.g., Split AC, Pipe leak, MCB tripping)')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(searchTerm)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  color: 'var(--text-primary)'
                }}
              />
              <button 
                className="btn btn-primary btn-md"
                onClick={() => onSearch(searchTerm)}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {t('home.searchBtn', 'Find Specialist')}
              </button>
            </div>

            {/* Quick Search Shortcut Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('home.popularLabel', 'Popular:')}</span>
              {quickPills.map((pill, i) => (
                <button
                  key={i}
                  onClick={() => onSelectCategory(pill.category)}
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 12px',
                    backgroundColor: 'var(--bg-warm-secondary)',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    transition: 'all 150ms ease',
                    cursor: 'pointer'
                  }}
                >
                  {t(`categories.${pill.labelKey}`, pill.defaultLabel)}
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
                  {t('home.upfrontRateCard', 'Upfront Rate Card')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BadgeCheck size={18} color="var(--forest-700)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('home.kycVerified', 'KYC Verified')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="var(--forest-700)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('home.warrantyBadgeHero', '30-Day Warranty')}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Experience Card */}
          <div style={{ position: 'relative' }}>
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
                    {t('home.specialistsAvailable', 'Verified Specialists Available')}
                  </span>
                </div>
                <span className="badge badge-forest">
                  {t('home.trustRatingBadge', '⭐ 4.95 / 5 Trust Rating')}
                </span>
              </div>

              {/* Verified Provider Showcase or Neutral Illustration */}
              {topProvider ? (
                <div style={{
                  backgroundColor: 'var(--forest-50)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid var(--forest-100)',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <InitialsAvatar name={topProvider.name} size={56} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px' }}>{topProvider.name}</span>
                        <ShieldCheck size={16} color="var(--forest-700)" />
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {topProvider.specialty || t('home.certifiedSpecialist', 'Certified Specialist')} · {topProvider.city}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <span className="badge badge-forest" style={{ fontSize: '11px', padding: '1px 6px' }}>
                          ★ {topProvider.ratingAvg} {t('home.ratingLabel', 'Rating')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {topProvider.jobsDone || 42} {t('home.jobsCompleted', '+ jobs completed')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  backgroundColor: 'var(--forest-50)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  border: '1px solid var(--forest-100)',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <ShieldCheck size={36} color="var(--forest-700)" style={{ margin: '0 auto 8px auto' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)' }}>
                    {t('home.tradeSpecialists', 'Certified Trade Specialists')}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {t('home.tradeCategoriesSub', 'Air Conditioning, Plumbing, Electrical & Home Care')}
                  </p>
                </div>
              )}

              {/* Transparent Rate Card Preview */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t('home.transparentRateTitle', 'Transparent Standard Rate Card')}
                  </span>
                  <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                    {t('home.fixedStandard', 'Fixed Standard')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>{t('home.inspectionRepair', 'Standard Inspection & Repair')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('home.startingFrom299', 'Starting ₹299')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>{t('home.doorstepEvaluation', 'Doorstep Visit & Evaluation')}</span>
                    <span style={{ color: 'var(--forest-700)', fontWeight: 600 }}>{t('home.includedFree', 'Included (₹0)')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>{t('home.workmanshipWarranty', '30-Day Workmanship Warranty')}</span>
                    <span style={{ color: 'var(--forest-700)', fontWeight: 600 }}>{t('home.includedFree', 'Included (₹0)')}</span>
                  </div>
                </div>
              </div>

              {/* Primary Call to Action on Card */}
              <button 
                className="btn btn-primary"
                onClick={() => onOpenBookingModal()}
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700
                }}
              >
                <span>{t('home.bookVerifiedSpecialist', 'Book a Verified Specialist')}</span>
                <ArrowRight size={16} />
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
