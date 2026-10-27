// ===================================================================
// FixNear Trust - Post-Completion Verified Customer Review Modal
// 1-5 Star Rating + Short Written Feedback + Optional Photo Upload
// ===================================================================

import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  X, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  Image as ImageIcon 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ReviewModal({ isOpen, onClose, booking }) {
  const { submitReview } = useStore();
  const { userProfile, currentUser } = useAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const proName = booking.technicianName || booking.providerName || "Technician";
  const serviceName = booking.serviceTitle || "Home Service";

  const samplePhotoUploads = [
    { label: "Serviced AC Unit", url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80" },
    { label: "Clean Work Area", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please write a brief feedback sentence about your service.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await submitReview({
        bookingId: booking.id,
        providerId: booking.providerId || booking.technicianId || "provider-demo-1",
        rating,
        comment,
        photoUrl,
        authorName: userProfile?.name || currentUser?.displayName || "Aarav Patel",
        serviceTitle: serviceName
      });

      showToast('Thank you! Your verified rating & review has been published.', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to submit review. Try again.', 'error');
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
      zIndex: 2000,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
        animation: 'fadeInSlide 180ms ease'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-warm)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                Verified Escrow Completed
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
              Rate Your Experience
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Specialist Summary */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-warm)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Specialist
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--forest-900)' }}>
                {proName}
              </strong>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {serviceName}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: 'var(--forest-100)',
              color: 'var(--forest-700)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '11.5px',
              fontWeight: 700
            }}>
              <ShieldCheck size={14} />
              <span>Skill Verified</span>
            </div>
          </div>

          {/* 1-5 Star Interactive Selector */}
          <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              How satisfied are you with the workmanship?
            </label>
            <div style={{ display: 'inline-flex', gap: '8px', cursor: 'pointer' }}>
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
                    padding: '4px',
                    transition: 'transform 100ms ease'
                  }}
                  title={`${star} Star`}
                >
                  <Star
                    size={32}
                    color={(hoverRating || rating) >= star ? '#F59E0B' : 'var(--border-light)'}
                    fill={(hoverRating || rating) >= star ? '#F59E0B' : 'transparent'}
                  />
                </button>
              ))}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#B88E07', marginTop: '4px' }}>
              {rating === 5 ? 'Exceptional Workmanship (5/5)' :
               rating === 4 ? 'Very Good Service (4/5)' :
               rating === 3 ? 'Average Service (3/5)' :
               rating === 2 ? 'Needs Improvement (2/5)' : 'Unsatisfactory (1/5)'}
            </div>
          </div>

          {/* Written Feedback Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Share Your Feedback (Help fellow homeowners)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Arrived on time, tested the AC temperature thoroughly, and transparently explained the capacitor replacement."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border-light)',
                fontSize: '14px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Optional Photo Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Add a Service Photo (Optional)
            </label>
            
            {photoUrl ? (
              <div style={{ position: 'relative', display: 'inline-block', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img src={photoUrl} alt="Service verification" style={{ width: '120px', height: '80px', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {samplePhotoUploads.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(sample.url)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--bg-warm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <ImageIcon size={14} color="var(--forest-700)" />
                    <span>+ {sample.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', height: '46px', fontSize: '15px', justifyContent: 'center' }}
          >
            <span>{submitting ? 'Submitting Review...' : 'Publish Verified Review'}</span>
            <CheckCircle2 size={16} />
          </button>

        </form>

      </div>
    </div>
  );
}
