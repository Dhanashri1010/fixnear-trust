import React from 'react';
import { RotateCcw, ChevronRight, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function RefundPolicyPage() {
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
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>{t('legal.refundTitle', 'Refund & Cancellation Policy')}</span>
        </nav>

        {/* Header Card */}
        <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              <RotateCcw size={13} />
              {t('legal.refundTitle', 'Refund & Cancellation Policy')}
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--forest-900)' }}>
            {t('legal.refundTitle', 'Refund & Cancellation Policy')}
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t('legal.refundSubtitle', '30-day workmanship guarantee and consumer reimbursement standards')}
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
            {t('legal.section1Refund', '1. 30-Day Workmanship Warranty: Any defective workmanship within 30 days is re-inspected and rectified at zero extra labor cost.')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('support.faq2A', 'Every completed booking includes a 30-day workmanship warranty. If the exact same problem recurs within 30 days, we assign a specialist to fix it at no labor charge.')}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            {t('legal.section2Refund', '2. Direct Reimbursement: In disputed cases evaluated by administration, refunds are credited back to the customer.')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('invoice.warrantyNote', 'If any issue arises from this repair within 30 days, FixNear will re-inspect and fix it at zero additional labor cost.')}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '10px' }}>
            {t('booking.cancelBookingTitle', 'Cancel Booking')}
          </h2>
          <p style={{ marginBottom: '20px' }}>
            {t('home.step4Desc', 'Every booking includes complete warranty and dedicated customer resolution support.')}
          </p>
        </div>

      </div>
    </div>
  );
}
