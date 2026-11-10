import React from 'react';
import { Lock, ChevronRight, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function PrivacyPage() {
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
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>{t('legal.privacyTitle', 'Privacy Policy')}</span>
        </nav>

        {/* Header Card */}
        <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              <Lock size={13} />
              {t('legal.privacyTitle', 'Privacy Policy')}
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--forest-900)' }}>
            {t('legal.privacyTitle', 'Privacy Policy')}
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t('legal.privacySubtitle', 'How FixNear Trust protects, encrypts, and handles your personal information')}
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
            {t('legal.section1Privacy', '1. Data Collection: We collect only information required for booking fulfillment, security verification, and accounting.')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('userActions.downloadDesc', 'Request a complete JSON archive of your personal profile, booking history, submitted reviews, and support tickets.')}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            {t('legal.section2Privacy', '2. Privacy Safeguards: Customers phone numbers and full addresses are shielded until a technician accepts the booking.')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('tracking.finishCodeDesc', 'Give this 4-digit code to the specialist ONLY when you have inspected and accepted the completed work.')}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            {t('userActions.deleteTitle', 'Delete My Account')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('userActions.deleteWarning', 'Account deletion is irreversible. Your personal contact details and KYC documents will be permanently anonymized.')}
          </p>
        </div>

      </div>
    </div>
  );
}
