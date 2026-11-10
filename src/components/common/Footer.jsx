import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--border-light)',
      padding: '56px 0 32px 0'
    }}>
      <div className="container">

        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--forest-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <ShieldCheck size={20} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                {t('brand.name', 'FixNear')} <span style={{ fontSize: '12px', color: 'var(--forest-600)' }}>{t('brand.tagline', 'TRUST')}</span>
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              {t('footer.tagline', 'Verified local home repairs and maintenance with upfront pricing, certified technicians, and a 30-day warranty.')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                <CheckCircle2 size={12} />
                {t('common.warrantyBadge', '30-Day FixNear Warranty')}
              </span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              {t('footer.servicesCol', 'Popular Services')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <Link to="/services?category=ac-cooling">{t('categories.ac-cooling', 'Air Conditioner')}</Link>
              <Link to="/services?category=plumbing">{t('categories.plumbing', 'Plumbing Repairs')}</Link>
              <Link to="/services?category=electrical">{t('categories.electrical', 'Electrical Safety')}</Link>
              <Link to="/services?category=appliances">{t('categories.appliances', 'Home Appliances')}</Link>
              <Link to="/services">{t('catalog.title', 'Complete Catalog')}</Link>
            </div>
          </div>

          {/* Col 3: Support & Help */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              {t('nav.help', 'Help & Support')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <Link to="/support">{t('support.title', 'Support Desk')}</Link>
              <Link to="/bookings">{t('nav.myBookings', 'My Bookings')}</Link>
              <Link to="/refund-policy">{t('footer.refundPolicy', 'Refund Policy')}</Link>
              <Link to="/terms">{t('footer.terms', 'Terms of Service')}</Link>
              <Link to="/privacy">{t('footer.privacy', 'Privacy Policy')}</Link>
            </div>
          </div>

          {/* Col 4: Trust Standard */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              {t('home.howItWorks', 'How FixNear Works')}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              {t('home.heroDesc', 'Explore transparent service rates, certified local specialists, and a 30-day workmanship guarantee. Zero hidden callout fees.')}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--forest-50)',
              border: '1px solid var(--forest-100)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11.5px',
              color: 'var(--forest-800)',
              fontWeight: 600
            }}>
              <ShieldCheck size={14} color="var(--forest-700)" />
              <span>{t('common.verifiedTechnician', 'Background-Verified Specialist')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12.5px',
          color: 'var(--text-muted)'
        }}>
          <div>
            {t('footer.copyright', '© 2026 FixNear Trust. All rights reserved.')}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/terms" style={{ color: 'var(--text-muted)' }}>{t('footer.terms', 'Terms of Service')}</Link>
            <Link to="/privacy" style={{ color: 'var(--text-muted)' }}>{t('footer.privacy', 'Privacy Policy')}</Link>
            <Link to="/refund-policy" style={{ color: 'var(--text-muted)' }}>{t('footer.refundPolicy', 'Refund Policy')}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
