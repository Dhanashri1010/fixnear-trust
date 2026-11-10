// ===================================================================
// FixNear Trust - Customer Dispute Resolution Modal
// Creates a formal dispute record via REST API
// ===================================================================

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function DisputeModal({ isOpen, onClose, booking, onDisputeCreated }) {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [reasonCategory, setReasonCategory] = useState("Workmanship defect / recurring fault");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!details.trim() || details.length < 15) {
      setErrorMsg(t('disputes.minCharsRequired', 'Please provide at least 15 characters describing the issue.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingId = booking._id || booking.id || booking.bookingId;
      await bookingsAPI.submitComplaint(bookingId, {
        reason: reasonCategory,
        notes: details.trim(),
        claimAmount: booking.basePrice || booking.price || 499,
      });

      showToast(t('disputes.complaintSuccess', 'Complaint registered. Trust & Safety team will review within 24 hours.'), "success");
      if (onDisputeCreated) onDisputeCreated();
      onClose();
    } catch (err) {
      console.error("Dispute submission error:", err);
      const msg = err.message || t('disputes.submitFailed', 'Failed to submit complaint. Please try again.');
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(14, 27, 21, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
          animation: 'fadeInSlide 180ms ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{t('disputes.modalTitle')}</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {t('disputes.bookingRefLabel')} #{booking.bookingId || booking.id}
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          
          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-sm)',
              color: '#991B1B',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              {t('disputes.reasonHeading')}
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontSize: '13.5px',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="Workmanship defect / recurring fault">{t('disputes.optDefect')}</option>
              <option value="Technician did not complete agreed scope">{t('disputes.optIncomplete')}</option>
              <option value="Damage caused to property during repair">{t('disputes.optDamage')}</option>
              <option value="Disagreement on extra quotation or parts">{t('disputes.optQuoteDisagreement')}</option>
              <option value="Unprofessional conduct">{t('disputes.optConduct')}</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              {t('disputes.explanationHeading')}
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('disputes.explanationPlaceholder')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontSize: '13.5px',
                resize: 'none'
              }}
              required
            />
          </div>

          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--forest-50)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--forest-100)',
            fontSize: '12px',
            color: 'var(--forest-900)',
            marginBottom: '20px',
            lineHeight: 1.5
          }}>
            🛡️ <strong>{t('disputes.guaranteeNoticeHeading')}</strong> {t('disputes.guaranteeNoticeText')}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ flex: 1.5, backgroundColor: '#B91C1C' }}
            >
              {isSubmitting ? t('disputes.filingComplaintBtn') : t('disputes.submitOfficialBtn')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
