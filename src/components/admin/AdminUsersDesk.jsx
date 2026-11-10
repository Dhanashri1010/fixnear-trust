import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Ban
} from 'lucide-react';

export default function AdminUsersDesk() {
  const { user: currentAdmin } = useAuth();
  const { t } = useLanguage();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Create Admin Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Deactivate confirmation
  const [deactivatingId, setDeactivatingId] = useState(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getAdmins();
      if (res.data?.success) {
        setAdmins(res.data.admins || []);
      }
    } catch (err) {
      console.error('Failed to load admins:', err);
      setError(err.response?.data?.message || 'Failed to load administrator accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    if (formData.password.length < 8 || !/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setCreateError('Password must be at least 8 characters long and contain both letters and numbers.');
      setCreating(false);
      return;
    }

    try {
      const res = await adminAPI.createAdmin(formData);
      if (res.data?.success) {
        setSuccess(`Administrator account created for ${formData.name}. First-login password change enforced.`);
        setCreateModalOpen(false);
        setFormData({ name: '', email: '', password: '' });
        fetchAdmins();
        setTimeout(() => setSuccess(null), 6000);
      }
    } catch (err) {
      console.error('Failed to create admin:', err);
      setCreateError(err.response?.data?.message || 'Failed to create administrator account');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to revoke administrative access for ${adminName}?`)) {
      return;
    }

    setDeactivatingId(adminId);
    setError(null);
    try {
      const res = await adminAPI.deactivateAdmin(adminId);
      if (res.data?.success) {
        setSuccess(`Administrative access revoked for ${adminName}.`);
        fetchAdmins();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Failed to deactivate admin:', err);
      setError(err.response?.data?.message || 'Failed to deactivate administrator');
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>{t('admin.adminAccessGovernance')}</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.adminAccessDesc')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('admin.addNewAdmin')}</span>
          </button>
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('admin.refresh')}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">{t('admin.administrator')}</th>
                <th className="py-3 px-4">{t('admin.emailAddress')}</th>
                <th className="py-3 px-4">{t('admin.roleAndStatus')}</th>
                <th className="py-3 px-4">{t('admin.provisionedDate')}</th>
                <th className="py-3 px-4">{t('admin.securityPolicy')}</th>
                <th className="py-3 px-4 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>{t('admin.loadingApprovals', 'Loading...')}</span>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <span>{t('admin.noAdminsFound')}</span>
                  </td>
                </tr>
              ) : (
                admins.map((adm) => {
                  const isCurrent = currentAdmin?._id === adm._id || currentAdmin?.email === adm.email;
                  const isActive = !adm.isBlocked;

                  return (
                    <tr key={adm._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {adm.name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {adm.name}
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                                  {t('admin.youLabel')}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{t('common.id', 'ID')}: {adm._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700">
                        {adm.email}
                      </td>
                      <td className="py-3 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{t('admin.activeAdmin')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                            <Ban className="w-3 h-3" />
                            <span>{t('admin.deactivated')}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(adm.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {adm.mustChangePassword ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                            <KeyRound className="w-3 h-3" />
                            <span>{t('admin.changeRequired')}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">{t('admin.standardPolicy')}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isActive && !isCurrent ? (
                          <button
                            onClick={() => handleDeactivate(adm._id, adm.name)}
                            disabled={deactivatingId === adm._id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <Ban className="w-3 h-3" />
                            <span>{deactivatingId === adm._id ? t('common.loading') : t('admin.delete', 'Deactivate')}</span>
                          </button>
                        ) : isCurrent ? (
                          <span className="text-xs text-slate-400 italic">{t('admin.selfAccount')}</span>
                        ) : (
                          <span className="text-xs text-rose-500 font-medium">{t('admin.revoked')}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span>{t('admin.provisionNewAdmin')}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t('admin.provisionAdminDesc')}
            </p>

            {createError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('common.name', 'Full Name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('common.details', 'Name')}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('admin.corporateEmail')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('admin.emailLabel', 'Email')}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('admin.temporaryPassword')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t('admin.passwordLabel', 'Password')}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('admin.tempPasswordHint')}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-sm"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('admin.creating')}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('admin.createAdminAccount')}</span>
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

