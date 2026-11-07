import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Percent, 
  IndianRupee, 
  Clock, 
  Award, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

export default function AdminSettingsDesk() {
  const [settings, setSettings] = useState({
    platformFee: 49,
    commissionRate: 15,
    testPassPercentage: 80,
    testDurationMinutes: 15,
    cooldownHours: 24,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getSettings();
      if (res.data?.success && res.data?.data) {
        setSettings({
          platformFee: res.data.data.platformFee ?? 49,
          commissionRate: res.data.data.commissionRate ?? 15,
          testPassPercentage: res.data.data.testPassPercentage ?? 80,
          testDurationMinutes: res.data.data.testDurationMinutes ?? 15,
          cooldownHours: res.data.data.cooldownHours ?? 24,
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err.response?.data?.message || 'Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: Number(value) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    // Frontend sanity checks
    if (settings.platformFee < 0 || settings.platformFee > 500) {
      setError('Platform fee must be between ₹0 and ₹500');
      setSaving(false);
      return;
    }
    if (settings.commissionRate < 0 || settings.commissionRate > 40) {
      setError('Commission rate must be between 0% and 40%');
      setSaving(false);
      return;
    }
    if (settings.testPassPercentage < 50 || settings.testPassPercentage > 100) {
      setError('Pass percentage must be between 50% and 100%');
      setSaving(false);
      return;
    }
    if (settings.testDurationMinutes < 5 || settings.testDurationMinutes > 60) {
      setError('Test duration must be between 5 and 60 minutes');
      setSaving(false);
      return;
    }
    if (settings.cooldownHours < 1 || settings.cooldownHours > 168) {
      setError('Cooldown hours must be between 1 and 168 hours (7 days)');
      setSaving(false);
      return;
    }

    try {
      const res = await adminAPI.updateSettings(settings);
      if (res.data?.success) {
        setMessage('Settings successfully updated and applied in real-time across the platform.');
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="font-medium text-sm">Loading platform operational settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Global Platform Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure financial parameters, technician qualification thresholds, and operational rules.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSettings}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial & Fee Architecture */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              Financial & Fee Parameters
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These values calculate booking receipts for customers and platform commissions for providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Customer Platform Convenience Fee (₹)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={settings.platformFee}
                  onChange={(e) => handleChange('platformFee', e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-slate-800"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Allowed range: ₹0 to ₹500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Platform Commission Rate (%)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={settings.commissionRate}
                  onChange={(e) => handleChange('commissionRate', e.target.value)}
                  className="w-full pl-4 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-slate-800"
                  required
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Deducted from technician payout (0% to 40%)</p>
            </div>
          </div>
        </div>

        {/* Skill Certification & Qualification Exam Parameters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Technician Skill Assessment & Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Governs qualification difficulty, timing constraints, and retake frequency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pass Mark Threshold (%)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="number"
                  min="50"
                  max="100"
                  step="1"
                  value={settings.testPassPercentage}
                  onChange={(e) => handleChange('testPassPercentage', e.target.value)}
                  className="w-full pl-4 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-slate-800"
                  required
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Minimum score to qualify (50% - 100%)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Exam Time Limit (Minutes)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="number"
                  min="5"
                  max="60"
                  step="1"
                  value={settings.testDurationMinutes}
                  onChange={(e) => handleChange('testDurationMinutes', e.target.value)}
                  className="w-full pl-4 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-slate-800"
                  required
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Allowed duration (5 - 60 minutes)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Retake Cooldown (Hours)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="number"
                  min="1"
                  max="168"
                  step="1"
                  value={settings.cooldownHours}
                  onChange={(e) => handleChange('cooldownHours', e.target.value)}
                  className="w-full pl-4 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-slate-800"
                  required
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <RotateCcw className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Wait time after failing (1 - 168 hours)</p>
            </div>
          </div>
        </div>

        {/* Audit Notice */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <ShieldAlert className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Audit Logging Notice:</strong> Any adjustment to global parameters will be recorded in the system audit log with your administrative user credentials, timestamp, and IP address for compliance and governance tracking.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Apply Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

