import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Shield,
  Clock,
  User,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Terminal,
  Activity
} from 'lucide-react';

export default function AdminAuditLogDesk() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [actionFilter, setActionFilter] = useState('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  // Detail Modal
  const [activeLog, setActiveLog] = useState(null);

  const fetchLogs = async (targetPage = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getAuditLogs({
        action: actionFilter !== 'all' ? actionFilter : undefined,
        targetType: targetTypeFilter !== 'all' ? targetTypeFilter : undefined,
        search: search.trim() || undefined,
        page: targetPage,
        limit: 30,
      });

      if (res.data?.success) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
        setPage(res.data.page || 1);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.response?.data?.message || 'Failed to retrieve immutable audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, targetTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const getActionBadgeClass = (act) => {
    if (!act) return 'bg-slate-100 text-slate-700';
    if (act.includes('APPROVE') || act.includes('UNBLOCK') || act.includes('CREATE')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (act.includes('REJECT') || act.includes('BLOCK') || act.includes('SUSPEND') || act.includes('DELETE') || act.includes('DEACTIVATE')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (act.includes('UPDATE') || act.includes('SETTINGS') || act.includes('RESOLVE')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-slate-800" />
            {t('admin.deskAuditLogTitle')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.deskAuditLogDesc')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-mono font-medium">
            {total} {t('admin.totalAuditRecords')}
          </span>
          <button
            onClick={() => fetchLogs(page)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('admin.refresh')}</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-white p-4 border border-slate-200 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('admin.search') + '...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-slate-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            {t('admin.search')}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-slate-500 bg-white"
          >
            <option value="all">{t('admin.allActions')}</option>
            <option value="APPROVE_PROVIDER">{t('admin.approveBtn')}</option>
            <option value="REJECT_PROVIDER">{t('admin.rejectBtn')}</option>
            <option value="REQUEST_PROVIDER_INFO">{t('admin.requestMoreInfo')}</option>
            <option value="SUSPEND_PROVIDER">{t('admin.suspendBtn')}</option>
            <option value="REINSTATE_PROVIDER">{t('admin.reinstateBtn')}</option>
            <option value="BLOCK_CUSTOMER">{t('admin.blockBtn')}</option>
            <option value="UNBLOCK_CUSTOMER">{t('admin.unblockBtn')}</option>
            <option value="CANCEL_BOOKING">{t('admin.cancelBookingBtn')}</option>
            <option value="UPDATE_SETTINGS">{t('admin.saveSettingsBtn')}</option>
            <option value="RESOLVE_DISPUTE">{t('admin.recordDecision')}</option>
            <option value="TOGGLE_REVIEW_VISIBILITY">{t('admin.hideReview')}</option>
            <option value="CREATE_ADMIN">{t('admin.addNewAdmin')}</option>
            <option value="DEACTIVATE_ADMIN">{t('admin.delete')}</option>
          </select>

          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-slate-500 bg-white"
          >
            <option value="all">{t('admin.allActions')}</option>
            <option value="Provider">{t('admin.provider')}</option>
            <option value="Customer">{t('admin.customer')}</option>
            <option value="Booking">{t('admin.booking')}</option>
            <option value="Setting">{t('admin.settings')}</option>
            <option value="Dispute">{t('admin.disputes')}</option>
            <option value="Review">{t('admin.reviews')}</option>
            <option value="Service">{t('admin.services')}</option>
            <option value="Category">{t('admin.category')}</option>
            <option value="Question">{t('admin.questions')}</option>
            <option value="Admin">{t('admin.administrator')}</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-sans font-bold uppercase tracking-wider">
                <th className="py-3 px-4">{t('admin.timestamp')}</th>
                <th className="py-3 px-4">{t('admin.administrator')}</th>
                <th className="py-3 px-4">{t('admin.action')}</th>
                <th className="py-3 px-4">{t('admin.target')}</th>
                <th className="py-3 px-4">{t('admin.details')}</th>
                <th className="py-3 px-4 text-right">{t('admin.view')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-600" />
                    <span>{t('admin.aggregatingOps')}</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-sans">
                    <span>{t('admin.noAuditLogs')}</span>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      <div className="font-semibold text-slate-900">{log.adminEmail}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.ipAddress || 'internal'}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{log.targetType}</span>
                      {log.targetId && (
                        <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                          {String(log.targetId)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-sans text-slate-600">
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setActiveLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-sans font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('admin.details')}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs font-sans text-slate-600">
            <div>
              {`${page} / ${pages} (${total})`}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{'←'}</span>
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= pages || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                <span>{'→'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Log Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setActiveLog(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${getActionBadgeClass(activeLog.action)}`}>
                {activeLog.action}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                #{activeLog._id}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-4">
              {t('admin.details')}
            </h3>

            <div className="space-y-3 text-xs mb-4">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-sans">{t('admin.timestamp')}:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {new Date(activeLog.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">{t('admin.administrator')}:</span>
                  <span className="font-semibold text-slate-800 font-mono">{activeLog.adminEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">{t('admin.target')}:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {activeLog.targetType} ({String(activeLog.targetId)})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">{'IP:'}</span>
                  <span className="font-mono text-slate-800">
                    {activeLog.ipAddress || '127.0.0.1'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1 font-sans">
                  {t('admin.auditDetails')}
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-60">
                  {JSON.stringify(activeLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

