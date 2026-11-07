// ===================================================================
// FixNear Trust - Post-Completion Verified Customer Review Modal
// 1-5 Star Rating + Written Feedback
// ===================================================================

import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ReviewModal({ isOpen, onClose, booking, onReviewSubmitted }) {
  const { showToast } = useToast();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !booking) return null;

  const proName = booking.providerName || booking.technicianName || "Specialist";
  const serviceName = booking.serviceTitle || "Home Service";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!comment.trim()) {
      setErrorMsg('Please write a brief feedback sentence about your service.');
      return;
    }

    setSubmitting(true);
    try {
      const bookingId = booking._id || booking.id || booking.bookingId;
      await bookingsAPI.submitReview(bookingId, {
        rating,
        comment: comment.trim(),
        photos: [],
      });

      showToast('Thank you! Your verified rating & review has been published.', 'success');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error('Review submit error:', err);
      const msg = err.message || 'Failed to submit review. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
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
              Verified Service Review
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Rate Your Experience</h3>
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
                Technician: <strong>{proName}</strong>
              </div>
            </div>
            <span className="badge badge-forest" style={{ fontSize: '11px' }}>
              Job Completed
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
              How satisfied were you with the quality of repair?
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
              {rating === 5 ? 'Excellent Workmanship' : rating === 4 ? 'Very Good Service' : rating === 3 ? 'Average' : 'Needs Improvement'}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              Written Feedback:
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other customers about punctuality, transparency of pricing, and workmanship quality..."
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
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 1.5 }}
            >
              {submitting ? 'Publishing...' : 'Submit Verified Review'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
