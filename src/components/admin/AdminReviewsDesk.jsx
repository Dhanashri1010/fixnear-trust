// ===================================================================
// FixNear Trust - Admin Reviews Moderation Desk
// List of customer reviews, Hide / Unhide moderation action
// Hidden reviews are excluded from customer views and rating averages
// ===================================================================

import React, { useState } from 'react';
import { 
  Star, 
  EyeOff, 
  Eye, 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function AdminReviewsDesk() {
  const { reviews, toggleReviewVisibility, technicians } = useStore();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'VISIBLE' | 'HIDDEN' | 'LOW_RATING'

  const filteredReviews = reviews.filter(rev => {
    // Search
    const searchMatch = !search.trim() || 
      (rev.customerName && rev.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (rev.technicianName && rev.technicianName.toLowerCase().includes(search.toLowerCase())) ||
      (rev.comment && rev.comment.toLowerCase().includes(search.toLowerCase()));

    // Filter
    if (filter === 'HIDDEN') return searchMatch && rev.isHidden;
    if (filter === 'VISIBLE') return searchMatch && !rev.isHidden;
    if (filter === 'LOW_RATING') return searchMatch && rev.rating <= 3;
    return searchMatch;
  });

  const handleToggle = async (rev) => {
    await toggleReviewVisibility(rev.id);
    const willHide = !rev.isHidden;
    showToast(
      willHide 
        ? `Review by ${rev.customerName || 'Customer'} is now hidden from customers and excluded from rating average.` 
        : `Review unhidden and restored to public customer profile.`, 
      willHide ? 'warning' : 'success'
    );
  };

  const hiddenCount = reviews.filter(r => r.isHidden).length;
  const visibleCount = reviews.filter(r => !r.isHidden).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Desk Title Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1.5px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={22} color="#F59E0B" fill="#F59E0B" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
              Customer Reviews & Feedback Moderation Desk
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Audit ratings and reviews. Hiding abusive or non-compliant reviews instantly purges them from customer view and recalculates the technician's rating average.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-forest" style={{ fontSize: '12px' }}>
            {visibleCount} Visible to Public
          </span>
          {hiddenCount > 0 && (
            <span className="badge badge-red" style={{ fontSize: '12px' }}>
              {hiddenCount} Moderated / Hidden
            </span>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        border: '1.5px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Reviews (${reviews.length})` },
            { id: 'VISIBLE', label: `Public Visible (${visibleCount})` },
            { id: 'HIDDEN', label: `Hidden / Censored (${hiddenCount})` },
            { id: 'LOW_RATING', label: `Low Ratings (≤ 3★)` }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`btn btn-xs ${filter === f.id ? 'btn-primary' : 'btn-outline'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search review comments..."
            style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-light)', fontSize: '12.5px' }}
          />
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredReviews.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 20px',
            textAlign: 'center',
            border: '1.5px solid var(--border-light)'
          }}>
            <CheckCircle2 size={36} color="#16A34A" style={{ margin: '0 auto 8px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)' }}>
              No Reviews Found Matching Filter
            </h3>
          </div>
        ) : (
          filteredReviews.map(rev => {
            const isHidden = Boolean(rev.isHidden);

            return (
              <div
                key={rev.id}
                style={{
                  backgroundColor: isHidden ? '#F9FAFB' : '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  border: isHidden ? '1.5px dashed #EF4444' : '1.5px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                  opacity: isHidden ? 0.75 : 1
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star 
                          key={st} 
                          size={15} 
                          fill={st <= rev.rating ? "#F59E0B" : "none"} 
                          color={st <= rev.rating ? "#F59E0B" : "#D1D5DB"} 
                        />
                      ))}
                    </div>

                    <strong style={{ fontSize: '14.5px', color: 'var(--forest-900)' }}>
                      {rev.customerName || 'Verified Customer'}
                    </strong>

                    <span className="badge badge-forest" style={{ fontSize: '10.5px' }}>
                      Verified Job
                    </span>

                    {isHidden && (
                      <span className="badge badge-red" style={{ fontSize: '10.5px' }}>
                        HIDDEN FROM PUBLIC
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5, margin: '8px 0' }}>
                    "{rev.comment || rev.text || 'High quality service executed professionally.'}"
                  </p>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Technician: <strong>{rev.technicianName || 'Specialist'}</strong> • Service: {rev.service || rev.serviceTitle || 'Home Service'} • {rev.date || 'Recent'}
                  </div>
                </div>

                {/* Hide / Unhide Action Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleToggle(rev)}
                    className={`btn btn-sm ${isHidden ? 'btn-outline' : 'btn-outline'}`}
                    style={{
                      color: isHidden ? '#16A34A' : '#DC2626',
                      borderColor: isHidden ? '#86EFAC' : '#FCA5A5',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12.5px'
                    }}
                  >
                    {isHidden ? (
                      <>
                        <Eye size={14} />
                        <span>Unhide Review</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} />
                        <span>Hide / Moderate Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
