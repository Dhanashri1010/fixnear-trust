import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  IndianRupee,
  Clock,
  User,
  Wrench,
  Search,
  Filter,
  RefreshCw,
  Scale,
  X,
  Eye,
  Send,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

export default function AdminDisputesDesk() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Detail Modal / Inspection
  const [selectedDisputeId, setSelectedDisputeId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [disputeDetail, setDisputeDetail] = useState(null);

  // Ruling Modal State
  const [rulingModalOpen, setRulingModalOpen] = useState(false);
  const [decision, setDecision] = useState('REFUND_CUSTOMER');
  const [adminNote, setAdminNote] = useState('');
  const [customRefund, setCustomRefund] = useState(0);
  const [customPayout, setCustomPayout] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const [rulingError, setRulingError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getDisputes({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      if (res.data?.success) {
        setDisputes(res.data.disputes || []);
      }
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
      setError(err.response?.data?.message || 'Failed to load dispute tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDisputes();
  };

  const handleOpenDetail = async (id) => {
    setSelectedDisputeId(id);
    setDetailLoading(true);
    setRulingError(null);
    try {
      const res = await adminAPI.getDisputeDetails(id);
      if (res.data?.success) {
        setDisputeDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load dispute details:', err);
      setError('Failed to load full dispute details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenRulingModal = (disp) => {
    const claim = disp.claimAmount || 1000;
    setCustomRefund(Math.round(claim * 0.5));
    setCustomPayout(Math.round(claim * 0.5));
    setDecision('REFUND_CUSTOMER');
    setAdminNote('');
    setRulingError(null);
    setRulingModalOpen(true);
  };

  const handleConfirmRuling = async (e) => {
    e.preventDefault();
    if (!adminNote.trim() || adminNote.trim().length < 5) {
      setRulingError('Please provide an administrative ruling note with at least 5 characters.');
      return;
    }

    setIsResolving(true);
    setRulingError(null);

    const claim = disputeDetail?.dispute?.claimAmount || 0;
    let finalRefund = 0;
    let finalPayout = 0;

    if (decision === 'REFUND_CUSTOMER') {
      finalRefund = claim;
      finalPayout = 0;
    } else if (decision === 'PAY_PROVIDER') {
      finalRefund = 0;
      finalPayout = claim;
    } else if (decision === 'PARTIAL_SPLIT') {
      finalRefund = Number(customRefund) || 0;
      finalPayout = Number(customPayout) || 0;
    } else if (decision === 'REJECT_COMPLAINT') {
      finalRefund = 0;
      finalPayout = 0;
    }

    try {
      const res = await adminAPI.resolveDispute(selectedDisputeId, {
        decision,
        note: adminNote.trim(),
        refundAmount: finalRefund,
        providerPayout: finalPayout,
      });

      if (res.data?.success) {
        setActionSuccess(`Ruling successfully recorded for dispute ticket.`);
        setRulingModalOpen(false);
        // Refresh details and list
        handleOpenDetail(selectedDisputeId);
        fetchDisputes();
        setTimeout(() => setActionSuccess(null), 6000);
      }
    } catch (err) {
      console.error('Failed to submit ruling:', err);
      setRulingError(err.response?.data?.message || 'Failed to submit ruling');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-purple-600" />
            Complaints & Dispute Mediation Desk
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Impartial adjudication desk for service defects, customer disputes, and escrow funds reconciliation.
          </p>
        </div>
        <button
          onClick={fetchDisputes}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 border border-slate-200 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket #, customer, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-purple-500"
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-purple-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="OPEN">Open (Requires Action)</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Ticket / Booking</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Claim Reason</th>
                <th className="py-3 px-4">Disputed Amt</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    Loading dispute cases...
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No dispute tickets found. All completed jobs are healthy!
                  </td>
                </tr>
              ) : (
                disputes.map((disp) => {
                  const isOpen = disp.status === 'OPEN';
                  return (
                    <tr key={disp._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 font-mono text-xs">
                          {disp.disputeId}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          Booking #{disp.bookingNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{disp.customerName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{disp.providerName}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-xs text-slate-700 truncate font-medium">
                          {disp.reason}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {disp.notes}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        ₹{disp.claimAmount?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="py-3 px-4">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            OPEN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            RESOLVED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(disp._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect & Rule
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details Modal */}
      {selectedDisputeId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8 border border-slate-200">
            <button
              onClick={() => {
                setSelectedDisputeId(null);
                setDisputeDetail(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {detailLoading || !disputeDetail ? (
              <div className="py-16 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                <p className="text-sm font-medium">Loading dispute dossier and booking timeline...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-800">
                      {disputeDetail.dispute?.disputeId}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      disputeDetail.dispute?.status === 'OPEN'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {disputeDetail.dispute?.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Dispute: {disputeDetail.dispute?.reason}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Filed on {new Date(disputeDetail.dispute?.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Complaint Statement */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Customer Grievance Statement
                  </h4>
                  <p className="text-sm text-amber-950 font-medium">
                    "{disputeDetail.dispute?.notes}"
                  </p>
                  <div className="mt-2 text-xs text-amber-800 font-semibold">
                    Claim Amount: ₹{disputeDetail.dispute?.claimAmount?.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Booking & Counterparty Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Complainant (Customer)
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{disputeDetail.customer?.name || disputeDetail.dispute?.customerName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {disputeDetail.customer?.email}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {disputeDetail.customer?.phone}
                    </div>
                  </div>

                  {/* Provider Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-2">
                      <Wrench className="w-4 h-4 text-emerald-600" />
                      Assigned Technician
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{disputeDetail.provider?.name || disputeDetail.dispute?.providerName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {disputeDetail.provider?.email}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {disputeDetail.provider?.phone}
                    </div>
                  </div>
                </div>

                {/* Booking Context */}
                {disputeDetail.booking && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-slate-500" />
                      Associated Booking #{disputeDetail.booking.bookingId}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">Service:</span>
                        <span className="font-semibold text-slate-800">{disputeDetail.booking.serviceTitle}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Job Status:</span>
                        <span className="font-semibold text-slate-800">{disputeDetail.booking.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Price Billed:</span>
                        <span className="font-semibold text-slate-800">
                          ₹{(disputeDetail.booking.invoice?.totalAmount || disputeDetail.booking.basePrice || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Scheduled Date:</span>
                        <span className="font-semibold text-slate-800">{disputeDetail.booking.scheduledDate}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resolution Status if already resolved */}
                {disputeDetail.dispute?.status === 'RESOLVED' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Adjudication Decision: {disputeDetail.dispute.decision}
                    </div>
                    <p className="text-sm text-emerald-950 font-medium">
                      Admin Note: "{disputeDetail.dispute.adminNote}"
                    </p>
                    <div className="flex gap-4 text-xs font-semibold text-emerald-800 pt-1">
                      <span>Refund to Customer: ₹{disputeDetail.dispute.refundAmount || 0}</span>
                      <span>Technician Payout: ₹{disputeDetail.dispute.providerPayout || 0}</span>
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setSelectedDisputeId(null);
                      setDisputeDetail(null);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                  >
                    Close
                  </button>
                  {disputeDetail.dispute?.status === 'OPEN' && (
                    <button
                      onClick={() => handleOpenRulingModal(disputeDetail.dispute)}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
                    >
                      <Scale className="w-4 h-4" />
                      Adjudicate & Issue Ruling
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ruling Decision Modal */}
      {rulingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setRulingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Scale className="w-5 h-5 text-purple-600" />
              Administrative Mediation Ruling
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Decide on fund disbursement between customer and technician.
            </p>

            {rulingError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {rulingError}
              </div>
            )}

            <form onSubmit={handleConfirmRuling} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Ruling Decision
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'REFUND_CUSTOMER', label: '100% Refund Customer', desc: 'Fault lies with technician' },
                    { id: 'PAY_PROVIDER', label: '100% Pay Technician', desc: 'Service completed properly' },
                    { id: 'PARTIAL_SPLIT', label: 'Split Disputed Amount', desc: 'Compromise settlement' },
                    { id: 'REJECT_COMPLAINT', label: 'Reject Grievance', desc: 'Invalid or frivolous claim' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setDecision(opt.id)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all ${
                        decision === opt.id
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {decision === 'PARTIAL_SPLIT' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer Refund (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customRefund}
                      onChange={(e) => setCustomRefund(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Technician Payout (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customPayout}
                      onChange={(e) => setCustomPayout(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ruling Justification Note (Sent to both parties)
                </label>
                <textarea
                  rows="3"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Explain why this decision was reached (minimum 5 characters)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRulingModalOpen(false)}
                  disabled={isResolving}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg shadow-sm"
                >
                  {isResolving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Recording Ruling...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Confirm & Issue Ruling
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
