// ===================================================================
// FixNear Trust - Customer Service Review Modal
// Collects rating & comments, sends to REST API
// ===================================================================

import React, { useState } from 'react';
import { Star, X, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ReviewModal({ isOpen, onClose, booking, onReviewSubmitted }) {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!comment.trim() || comment.length < 10) {
      setErrorMsg(t('reviews.minCharsPrompt', "Please share at least 10 characters describing your experience."));
      return;
    }

    setSubmitting(true);
    try {
      const bookingId = booking._id || booking.id || booking.bookingId;
      await bookingsAPI.submitReview(bookingId, {
        rating,
        comment: comment.trim(),
      });

      showToast(t('reviews.thankYouToast', "Thank you! Your verified review has been published."), "success");
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error("Review submission error:", err);
      const msg = err.message || t('reviews.submitFailed', "Failed to submit review. Please try again.");
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const proName = booking.providerName || booking.provider?.name || t('technician.certifiedBadge');
  const serviceName = booking.serviceTitle || booking.service?.title || t('brand.name');

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
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
          animation: 'fadeInSlide 180ms ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span className="badge badge-forest" style={{ fontSize: '11px', marginBottom: '4px' }}>
              <ShieldCheck size={12} />
              {t('reviews.verifiedBadge')}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{t('reviews.rateExperienceHeading')}</h3>
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
          
          <div style={{
            backgroundColor: 'var(--bg-warm)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{serviceName}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {t('reviews.technicianLabel')} <strong>{proName}</strong>
              </div>
            </div>
            <span className="badge badge-forest" style={{ fontSize: '11px' }}>
              {t('reviews.jobCompletedBadge')}
            </span>
          </div>

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

          {/* Star Rating Selector */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
              {t('reviews.satisfactionQuestion')}
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  aria-label={`${star} Stars`}
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? '#F59E0B' : 'transparent'}
                    color={(hoverRating || rating) >= star ? '#F59E0B' : 'var(--text-muted)'}
                  />
                </button>
              ))}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {rating === 5 ? t('reviews.rating5Text') : rating === 4 ? t('reviews.rating4Text') : rating === 3 ? t('reviews.rating3Text') : t('reviews.ratingLowerText')}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              {t('reviews.feedbackHeading')}
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('reviews.feedbackPlaceholder')}
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 1.5 }}
            >
              {submitting ? t('reviews.publishingReviewBtn') : t('reviews.submitReviewBtn')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
