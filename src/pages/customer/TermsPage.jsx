import React from 'react';
import { FileText, ChevronRight, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function TermsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '36px 0 72px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Breadcrumb */}
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
            <span>{t('nav.home', 'Home')}</span>
          </button>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>{t('legal.termsTitle', 'Terms of Service')}</span>
        </nav>

        {/* Header Card */}
        <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              <FileText size={13} />
              {t('legal.termsTitle', 'Terms of Service')}
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--forest-900)' }}>
            {t('legal.termsTitle', 'Terms of Service')}
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t('legal.termsSubtitle', 'Legal framework governing customer and technician participation on FixNear Trust')}
          </p>

          <div style={{
            marginTop: '18px',
            padding: '12px 16px',
            backgroundColor: '#FFFBEB',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#92400E', fontWeight: 600 }}>
              {t('legal.draftNotice', 'Notice: This legal document is a draft version for demonstration and reference purposes only.')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', lineHeight: 1.8, fontSize: '14.5px', color: 'var(--text-secondary)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            {t('legal.section1Terms', '1. Acceptance of Terms: By accessing or using FixNear, you agree to comply with our verified service guidelines.')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('home.heroDesc', 'Explore transparent service rates, certified local specialists, and a 30-day workmanship guarantee. Zero hidden callout fees, zero surprise pricing.')}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            {t('legal.section2Terms', '2. Finish Code Escrow: Work is deemed accepted only when the customer provides their private 4-digit finish code.')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('tracking.finishCodeDesc', 'Give this 4-digit code to the specialist ONLY when you have inspected and accepted the completed work.')}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            {t('legal.section3Terms', '3. Quotations: Any additional parts require explicit written digital approval from the customer.')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('quotation.warningNotice', 'Work on extra parts will begin only after your approval. All approved parts are backed by the FixNear warranty.')}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            {t('legal.refundTitle', 'Refund & Satisfaction Warranty Policy')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('legal.section1Refund', '1. 30-Day Workmanship Warranty: Any defective workmanship within 30 days is re-inspected and rectified at zero extra labor cost.')}
          </p>
        </div>

      </div>
    </div>
  );
}
