import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Star,
  EyeOff,
  Eye,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react';

export default function AdminReviewsDesk() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Moderation Modal
  const [activeReview, setActiveReview] = useState(null);
  const [hideReason, setHideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getReviews({
        isHidden: visibilityFilter !== 'all' ? (visibilityFilter === 'hidden') : undefined,
        search: search.trim() || undefined,
      });
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [visibilityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleToggleClick = (review) => {
    if (review.isHidden) {
      // Direct unhide
      executeToggle(review, false, '');
    } else {
      // Prompt for reason to hide
      setActiveReview(review);
      setHideReason('');
    }
  };

  const executeToggle = async (review, targetHidden, reasonText) => {
    setSubmitting(true);
    try {
      const res = await adminAPI.toggleReviewVisibility(review._id, {
        isHidden: targetHidden,
        reason: reasonText.trim() || undefined,
      });

      if (res.data?.success) {
        setActionSuccess(
          targetHidden
            ? `Review by ${review.authorName} hidden and removed from provider's public rating.`
            : `Review by ${review.authorName} restored to public view.`
        );
        setActiveReview(null);
        fetchReviews();
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Failed to toggle review visibility:', err);
      setError(err.response?.data?.message || 'Failed to update review visibility');
    } finally {
      setSubmitting(false);
    }
  };

  const hiddenCount = reviews.filter((r) => r.isHidden).length;
  const visibleCount = reviews.filter((r) => !r.isHidden).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Customer Reviews & Ratings Moderation Desk
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Audit public feedback. Moderating or hiding offensive reviews instantly recalculates the technician's rating score.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
            {visibleCount} Visible
          </span>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
            {hiddenCount} Moderated
          </span>
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 ml-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 border border-slate-200 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviewer, comment, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500 bg-white"
          >
            <option value="all">All Feedback</option>
            <option value="visible">Public Only</option>
            <option value="hidden">Hidden / Moderated Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Customer & Service</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading verified reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No reviews matching the criteria.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr
                    key={rev._id}
                    className={`transition-colors ${rev.isHidden ? 'bg-slate-50/70 text-slate-400' : 'hover:bg-slate-50/80 text-slate-800'
                      }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900">{rev.rating}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{rev.authorName}</div>
                      <div className="text-xs text-slate-500">{rev.serviceTitle || 'Home Service'}</div>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <p className="text-sm line-clamp-2">"{rev.comment}"</p>
                      {rev.isHidden && rev.hiddenReason && (
                        <div className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                          Moderation note: {rev.hiddenReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {rev.isHidden ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Eye className="w-3 h-3" />
                          Public
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleClick(rev)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${rev.isHidden
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                      >
                        {rev.isHidden ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Unhide Review
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Hide / Moderate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hide Modal */}
      {activeReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setActiveReview(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <EyeOff className="w-5 h-5 text-rose-600" />
              Hide Review from Public View
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This review will be immediately hidden from customer apps and excluded from the technician's average rating calculation.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs">
              <div className="font-semibold text-slate-800 mb-1">Review by {activeReview.authorName}:</div>
              <p className="text-slate-600 italic">"{activeReview.comment}"</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeToggle(activeReview, true, hideReason);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason for Moderation (Audit Logged)
                </label>
                <textarea
                  rows="3"
                  value={hideReason}
                  onChange={(e) => setHideReason(e.target.value)}
                  placeholder="e.g. Abusive language, false claims, promotional spam..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReview(null)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-lg shadow-sm"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Hiding...
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Confirm Hide
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
