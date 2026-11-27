// ===================================================================
// FixNear Trust - Full Service Provider (Technician) Dashboard
// Connected to MongoDB REST API & Socket.io
// Online/Offline Switch | 60s Incoming Job Radar | Active Job Pipeline
// Extra Quotation Modal | Completion Code Verify | Live Earnings
// ===================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Wrench, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  LogOut, 
  Radio, 
  Briefcase, 
  DollarSign, 
  AlertTriangle, 
  Send, 
  Check, 
  X, 
  KeyRound, 
  Phone, 
  Calendar, 
  FileText, 
  Star, 
  Plus, 
  Sparkles,
  TrendingUp,
  CreditCard,
  RefreshCw,
  ExternalLink,
  FileCheck,
  Bell,
  Settings as SettingsIcon,
  Download,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { providersAPI, bookingsAPI, paymentsAPI, servicesAPI, notificationsAPI, authAPI, getSocket } from '../../services/api';

export default function ProviderDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile, logOut } = useAuth();
  const { showToast } = useToast();
  const { t, formatCurrency, formatDate, formatTime } = useLanguage();

  const [provider, setProvider] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, lifetime: 0, totalJobs: 0 });
  const [settings, setSettings] = useState({ commissionPercent: 10, platformFee: 20 });
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab synchronization with URL query parameter
  const tabFromQuery = searchParams.get('tab');
  const getValidTab = (tab) => {
    if (!tab) return 'active-jobs';
    if (tab === 'active' || tab === 'active-jobs' || tab === 'jobs') return 'active-jobs';
    if (tab === 'history') return 'history';
    if (tab === 'earnings' || tab === 'payouts') return 'earnings';
    if (tab === 'profile' || tab === 'skills' || tab === 'credentials') return 'profile';
    if (tab === 'reviews' || tab === 'ratings') return 'reviews';
    if (tab === 'notifications') return 'notifications';
    if (tab === 'settings') return 'settings';
    return 'active-jobs';
  };

  const [activeTab, setActiveTab] = useState(() => getValidTab(tabFromQuery));

  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(getValidTab(tabFromQuery));
    }
  }, [tabFromQuery]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const [isOnline, setIsOnline] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Notifications & Account Governance State
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [downloadingData, setDownloadingData] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Incoming Job Countdown (60 seconds)
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [incomingCountdown, setIncomingCountdown] = useState(60);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Extra Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedJobForQuote, setSelectedJobForQuote] = useState(null);
  const [quoteReason, setQuoteReason] = useState('');
  const [quotePartName, setQuotePartName] = useState('');
  const [quotePartCost, setQuotePartCost] = useState('');
  const [quoteLaborCost, setQuoteLaborCost] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Completion Code Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedJobForOtp, setSelectedJobForOtp] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'escrow'
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  // Document preview state
  const [documentLoading, setDocumentLoading] = useState(null);

  // Add another service state
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [selectedNewSkill, setSelectedNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);

  // Fetch Dashboard Data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      const [profileRes, bookingsRes, catsRes] = await Promise.allSettled([
        providersAPI.getMyProfile(),
        bookingsAPI.getMyBookings(),
        servicesAPI.getCategories(),
      ]);

      if (catsRes.status === 'fulfilled' && catsRes.value?.categories) {
        setAvailableCategories(catsRes.value.categories);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
        setProvider(profileRes.value.provider);
        setIsOnline(Boolean(profileRes.value.provider?.isOnline));
        if (profileRes.value.earnings) setEarnings(profileRes.value.earnings);
        if (profileRes.value.settings) setSettings(profileRes.value.settings);
        if (profileRes.value.reviews) setReviews(profileRes.value.reviews);
      }

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.success && Array.isArray(bookingsRes.value.bookings)) {
        setBookings(bookingsRes.value.bookings);

        // Check if there is an unexpired incoming offer for this provider
        const pendingOffer = bookingsRes.value.bookings.find(
          (b) => b.status === 'REQUESTED' && (!b.currentOfferExpiresAt || new Date(b.currentOfferExpiresAt) > new Date())
        );

        if (pendingOffer && !incomingOffer) {
          const diffMs = pendingOffer.currentOfferExpiresAt ? new Date(pendingOffer.currentOfferExpiresAt).getTime() - Date.now() : 60000;
          const secondsRemaining = Math.max(1, Math.min(60, Math.floor(diffMs / 1000)));
          setIncomingOffer({
            bookingId: pendingOffer._id || pendingOffer.bookingId,
            displayBookingId: pendingOffer.bookingId,
            serviceTitle: pendingOffer.serviceTitle,
            city: pendingOffer.city,
            area: pendingOffer.address || pendingOffer.city,
            scheduledDate: pendingOffer.scheduledDate,
            timeSlot: pendingOffer.timeSlot,
            price: pendingOffer.basePrice,
          });
          setIncomingCountdown(secondsRemaining);
        }
      }
    } catch (err) {
      console.error('Failed to load provider dashboard:', err);
      showToast(err.message || 'Failed to refresh dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [incomingOffer, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifs(true);
      const res = await notificationsAPI.getNotifications();
      if (res?.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab, fetchNotifications]);

  const handleDownloadMyData = async () => {
    try {
      setDownloadingData(true);
      const res = await authAPI.downloadMyData();
      const dataStr = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fixnear-provider-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(t('userActions.downloadSuccess', 'Data export downloaded successfully!'), 'success');
    } catch (err) {
      showToast(err.message || t('common.errorGeneral', 'Failed to download data.'), 'error');
    } finally {
      setDownloadingData(false);
    }
  };

  const handleDeleteMyAccount = async () => {
    if (!deletePassword) {
      setDeleteError(t('userActions.enterPasswordToDelete', 'Please enter your password to confirm deletion.'));
      return;
    }
    try {
      setDeletingAccount(true);
      setDeleteError('');
      await authAPI.deleteMyAccount(deletePassword);
      setDeleteSuccess(true);
      showToast(t('common.successGeneral', 'Account successfully deleted.'), 'success');
      setTimeout(async () => {
        await logOut();
        navigate('/login');
      }, 1500);
    } catch (err) {
      setDeleteError(err.message || t('common.errorGeneral', 'Failed to delete account.'));
    } finally {
      setDeletingAccount(false);
    }
  };

  // Socket.io Real-Time Dispatch and Booking Status Listeners
  useEffect(() => {
    const socket = getSocket();

    const handleNewOffer = (offer) => {
      setIncomingOffer({
        bookingId: offer.bookingId,
        displayBookingId: offer.bookingId,
        serviceTitle: offer.serviceTitle,
        city: offer.city,
        area: offer.area || offer.city,
        scheduledDate: offer.scheduledDate,
        timeSlot: offer.timeSlot,
        price: offer.price,
      });
      setIncomingCountdown(offer.expiresInSeconds || 60);
      showToast(`⚡ New job dispatch offered in ${offer.area || offer.city}!`, 'info');
    };

    const handleBookingUpdate = () => {
      fetchDashboardData();
    };

    socket.on('new_job_offered', handleNewOffer);
    socket.on('booking_updated', handleBookingUpdate);
    socket.on('booking_status_updated', handleBookingUpdate);

    return () => {
      socket.off('new_job_offered', handleNewOffer);
      socket.off('booking_updated', handleBookingUpdate);
      socket.off('booking_status_updated', handleBookingUpdate);
    };
  }, [fetchDashboardData, showToast]);

  // 60-second timer for incoming job radar
  useEffect(() => {
    if (!incomingOffer) return;

    const timer = setInterval(() => {
      setIncomingCountdown((prev) => {
        if (prev <= 1) {
          setIncomingOffer(null);
          showToast('Job offer window expired.', 'info');
          fetchDashboardData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingOffer, fetchDashboardData, showToast]);

  // Online / Offline Switch
  const handleToggleOnline = async () => {
    if (statusUpdating) return;
    setStatusUpdating(true);
    const targetState = !isOnline;

    try {
      const res = await providersAPI.updateOnlineStatus(targetState);
      if (res.success) {
        setIsOnline(targetState);
        showToast(
          targetState
            ? 'You are now ONLINE. Ready to receive dispatch requests.'
            : 'You are now OFFLINE. No dispatches will be sent.',
          targetState ? 'success' : 'info'
        );
      }
    } catch (err) {
      showToast(err.message || 'Could not update online status.', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Accept Incoming Offer
  const handleAcceptJob = async (jobId) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      const res = await bookingsAPI.updateStatus(jobId, 'ACCEPTED');
      if (res.success) {
        showToast('Job Accepted! Heading to your Active Jobs queue.', 'success');
        setIncomingOffer(null);
        setActiveTab('active-jobs');
        await fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to accept job. It may have expired.', 'error');
      setIncomingOffer(null);
      await fetchDashboardData();
    } finally {
      setActionInProgress(false);
    }
  };

  // Decline Incoming Offer
  const handleDeclineJob = async (jobId) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      await bookingsAPI.declineBooking(jobId);
      showToast('Job offer declined.', 'info');
      setIncomingOffer(null);
      await fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to decline job.', 'error');
      setIncomingOffer(null);
    } finally {
      setActionInProgress(false);
    }
  };

  // Pipeline Step Advance (e.g. ON_THE_WAY, WORKING)
  const handleAdvanceStep = async (bookingId, targetStatus) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      const res = await bookingsAPI.updateStatus(bookingId, targetStatus);
      if (res.success) {
        const messages = {
          ON_THE_WAY: "Status updated: You are on the way! Customer notified with live GPS.",
          WORKING: "Status updated: Diagnostic and triage work underway at doorstep.",
        };
        showToast(messages[targetStatus] || 'Status updated.', 'success');
        await fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update job status.', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  // Send Extra Quotation Modal Handler
  const handleOpenQuoteModal = (job) => {
    setSelectedJobForQuote(job);
    setQuoteReason('');
    setQuotePartName('');
    setQuotePartCost('');
    setQuoteLaborCost('');
    setIsQuoteModalOpen(true);
  };

  const handleSendExtraQuotation = async (e) => {
    e.preventDefault();
    if (!selectedJobForQuote) return;

    setQuoteSubmitting(true);
    try {
      const items = [
        {
          desc: quotePartName.trim(),
          amount: Math.round(Number(quotePartCost) + Number(quoteLaborCost || 0)),
        },
      ];

      const res = await bookingsAPI.createQuotation(selectedJobForQuote._id, {
        items,
        reason: quoteReason.trim(),
      });

      if (res.success) {
        setIsQuoteModalOpen(false);
        showToast('Itemized quotation submitted! Awaiting customer authorization.', 'success');
        await fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit quotation.', 'error');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // Complete Job with Customer 4-digit code
  const handleOpenOtpModal = (job) => {
    setSelectedJobForOtp(job);
    setEnteredOtp('');
    setPaymentMethod('cash');
    setIsOtpModalOpen(true);
  };

  const handleVerifyOtpAndComplete = async (e) => {
    e.preventDefault();
    if (!selectedJobForOtp) return;

    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      showToast('Please enter the 4-digit completion code provided by the customer.', 'error');
      return;
    }

    setOtpSubmitting(true);
    try {
      const res = await bookingsAPI.updateStatus(selectedJobForOtp._id, 'COMPLETED', enteredOtp.trim());
      if (res.success) {
        setIsOtpModalOpen(false);
        showToast('Completion code verified! Job marked COMPLETED and earnings credited.', 'success');
        setActiveTab('history');
        await fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Invalid completion code.', 'error');
    } finally {
      setOtpSubmitting(false);
    }
  };

  const [cashSubmittingId, setCashSubmittingId] = useState(null);

  const handleConfirmCash = async (bookingId) => {
    setCashSubmittingId(bookingId);
    try {
      const res = await paymentsAPI.confirmCash(bookingId);
      if (res.success) {
        showToast(`Cash payment of ₹${res.totalAmount} confirmed! Receipt #${res.invoiceNumber} issued.`, 'success');
        await fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to confirm cash receipt.', 'error');
    } finally {
      setCashSubmittingId(null);
    }
  };

  // Add another trade service handler
  const handleAddSkillSubmit = async () => {
    if (!selectedNewSkill) {
      showToast(t('providerDashboard.selectServiceFirst', 'Please choose a service to add.'), 'error');
      return;
    }
    setAddingSkill(true);
    try {
      const res = await providersAPI.addSkill(selectedNewSkill);
      if (res.success) {
        showToast(res.message || 'Service added! Take the skill test to verify.', 'success');
        if (res.provider) setProvider(res.provider);
        setShowAddSkillModal(false);
        const targetCat = selectedNewSkill;
        setSelectedNewSkill('');
        navigate(`/provider/test/${targetCat}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add service.', 'error');
    } finally {
      setAddingSkill(false);
    }
  };

  const resolveDocumentUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Safe document view handler
  const handleViewDocument = async (type) => {
    setDocumentLoading(type);
    try {
      const res = await providersAPI.getPrivateDocumentSignedUrl(type);
      const targetUrl = res.signedUrl || res.url || `/api/providers/documents/${type}/file`;
      window.open(resolveDocumentUrl(targetUrl), '_blank', 'noopener,noreferrer');
    } catch (err) {
      window.open(resolveDocumentUrl(`/api/providers/documents/${type}/file`), '_blank', 'noopener,noreferrer');
    } finally {
      setDocumentLoading(null);
    }
  };

  // Filter Bookings
  const activeJobs = bookings.filter((b) => ['ACCEPTED', 'ON_THE_WAY', 'WORKING'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  const providerName = provider?.name || userProfile?.name || currentUser?.name || 'Technician Partner';
  const providerStatus = provider?.status || 'take_skill_test';
  const hasProviderRating = provider?.ratingAvg !== null && provider?.ratingAvg !== undefined && (provider?.ratingCount || 0) > 0;
  const providerRating = hasProviderRating ? Number(provider.ratingAvg).toFixed(1) : t('technician.newBadge', 'New');
  const providerJobsCount = provider?.jobsDone || completedJobs.length;

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--forest-800)' }}>
          <RefreshCw className="spinner" size={32} style={{ margin: '0 auto 12px auto' }} />
          <p style={{ fontWeight: 600 }}>{t('providerDashboard.portalLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 16px 80px 16px' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        
        {/* Top Header Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid var(--border-light)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--forest-100)',
              color: 'var(--forest-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '22px'
            }}>
              <Wrench size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {providerName}
                </h1>
                <span className={`badge ${providerStatus === 'approved' ? 'badge-forest' : providerStatus === 'waiting_for_approval' ? 'badge-yellow' : 'badge-slate'}`} style={{ fontSize: '11px' }}>
                  {providerStatus === 'approved' ? t('providerDashboard.verifiedPartner') : providerStatus === 'waiting_for_approval' ? t('providerDashboard.underReview') : providerStatus === 'needs_info' ? t('providerDashboard.moreInfoNeeded') : providerStatus === 'rejected' ? t('providerDashboard.kycRejected') : t('providerDashboard.testRequired')}
                </span>
                {provider?.skills?.some(s => s.passed) && (
                  <span className="badge badge-forest" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={12} />
                    <span>{t('providerDashboard.skillCertified')}</span>
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('providerDashboard.partnerConsole')} • {t('provider.city')}: <strong>{provider?.city || t('providerDashboard.citywide')}</strong> • {t('providerDashboard.ratingPrefix')} <strong>{'⭐'} {providerRating}</strong> ({providerJobsCount} {t('providerDashboard.jobsCompletedSuffix')})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Online / Offline Toggle Switch */}
            <div
              onClick={handleToggleOnline}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isOnline ? '#DCFCE7' : '#F3F4F6',
                border: `1.5px solid ${isOnline ? '#22C55E' : '#D1D5DB'}`,
                cursor: statusUpdating ? 'not-allowed' : 'pointer',
                opacity: statusUpdating ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
              title={providerStatus !== 'approved' ? t('providerDashboard.onlyApprovedTooltip') : t('providerDashboard.toggleOnlineTooltip')}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#16A34A' : '#9CA3AF',
                boxShadow: isOnline ? '0 0 8px #22C55E' : 'none'
              }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: isOnline ? '#15803D' : '#4B5563' }}>
                {isOnline ? t('providerDashboard.onlineActive') : t('providerDashboard.offline')}
              </span>
            </div>

            <button 
              type="button" 
              onClick={logOut} 
              className="btn btn-outline btn-sm"
              style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
            >
              <LogOut size={14} />
              <span>{t('providerDashboard.signOut')}</span>
            </button>
          </div>
        </div>

        {/* Status Pipeline Banner if not yet approved */}
        {providerStatus === 'take_skill_test' && (
          <div style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#FEF3C7',
            border: '1.5px solid #F59E0B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#92400E' }}>
                {t('providerDashboard.testRequiredBanner')}
              </div>
              <div style={{ fontSize: '13px', color: '#78350F', marginTop: '2px' }}>
                {t('providerDashboard.testRequiredDesc')}
              </div>
            </div>
            <Link to="/provider/test" className="btn btn-primary" style={{ backgroundColor: '#D97706', borderColor: '#B45309' }}>
              <span>{t('providerDashboard.startTestBtn')}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {providerStatus === 'waiting_for_approval' && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--forest-50)',
            border: '1.5px solid var(--forest-200)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <Clock size={20} color="var(--forest-700)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '13.5px', color: 'var(--forest-900)' }}>
              <strong>{t('providerDashboard.underVerificationBanner')}</strong>
            </div>
          </div>
        )}

        {providerStatus === 'rejected' && (
          <div style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #EF4444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertTriangle size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#991B1B' }}>
                  {t('providerDashboard.kycUnsuccessful')}
                </div>
                <div style={{ fontSize: '13.5px', color: '#B91C1C', marginTop: '2px' }}>
                  <strong>{t('providerDashboard.adminReason')}</strong> {provider.rejectionReason || t('providerDashboard.defaultRejectionReason')}
                </div>
              </div>
            </div>
            <Link to="/provider/register" className="btn btn-primary" style={{ backgroundColor: '#DC2626', borderColor: '#B91C1C' }}>
              <span>{t('providerDashboard.fixResubmitKyc')}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {providerStatus === 'needs_info' && (
          <div style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#FFFBEB',
            border: '1.5px solid #F59E0B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Clock size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#92400E' }}>
                  {t('providerDashboard.moreInfoRequested')}
                </div>
                <div style={{ fontSize: '13.5px', color: '#B45309', marginTop: '2px' }}>
                  <strong>{t('providerDashboard.adminMessage')}</strong> {provider.adminMessage || t('providerDashboard.defaultAdminMessage')}
                </div>
              </div>
            </div>
            <Link to="/provider/register" className="btn btn-primary" style={{ backgroundColor: '#D97706', borderColor: '#B45309' }}>
              <span>{t('providerDashboard.updateDocs')}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {providerStatus === 'suspended' && (
          <div style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#FEF2F2',
            border: '2px solid #DC2626',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '20px'
          }}>
            <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#991B1B' }}>
                {t('providerDashboard.accountSuspended')}
              </div>
              <div style={{ fontSize: '13.5px', color: '#7F1D1D', marginTop: '2px' }}>
                {t('providerDashboard.reasonPrefix')} {provider.suspensionReason || t('providerDashboard.defaultSuspensionReason')}
              </div>
            </div>
          </div>
        )}

        {/* Incoming Job Radar Banner (Live Offer with 60s Countdown) */}
        {isOnline && incomingOffer && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '22px 24px',
            border: '2px solid #22C55E',
            boxShadow: '0 4px 20px -2px rgba(34, 197, 94, 0.25)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-forest" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
                  {t('providerDashboard.newOfferTitle')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {t('providerDashboard.nearestTechMatch')} {incomingOffer.city}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 800,
                color: incomingCountdown < 15 ? '#DC2626' : 'var(--forest-800)',
                backgroundColor: 'var(--bg-warm)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)'
              }}>
                <Clock size={15} />
                <span>{t('providerDashboard.offerExpiresInPrefix')} {incomingCountdown + 's'}</span>
              </div>
            </div>

            {/* Request Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {incomingOffer.serviceTitle}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--forest-700)" />
                    {incomingOffer.area}
                  </span>
                  <span>•</span>
                  <span>{t('providerDashboard.dateLabel')} <strong>{incomingOffer.scheduledDate}</strong></span>
                  <span>•</span>
                  <span>{t('providerDashboard.slotLabel')} <strong>{incomingOffer.timeSlot}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('providerDashboard.estimatedPayout')}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-800)' }}>
                    ₹{incomingOffer.price}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={actionInProgress}
                    onClick={() => handleAcceptJob(incomingOffer.bookingId)}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#16A34A', padding: '10px 20px', fontWeight: 800 }}
                  >
                    <Check size={16} />
                    <span>{t('providerDashboard.acceptJobBtn')}</span>
                  </button>
                  <button
                    type="button"
                    disabled={actionInProgress}
                    onClick={() => handleDeclineJob(incomingOffer.bookingId)}
                    className="btn btn-outline"
                    style={{ borderColor: '#FCA5A5', color: '#DC2626', padding: '10px 16px' }}
                  >
                    <X size={16} />
                    <span>{t('providerDashboard.passBtn')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1.5px solid var(--border-light)',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          <button
            type="button"
            onClick={() => handleTabChange('active-jobs')}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              color: activeTab === 'active-jobs' ? 'var(--forest-800)' : 'var(--text-muted)',
              borderBottom: activeTab === 'active-jobs' ? '3px solid var(--forest-700)' : '3px solid transparent',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Briefcase size={16} />
            <span>{t('providerDashboard.tabActiveJobs')} ({activeJobs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('history')}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              color: activeTab === 'history' ? 'var(--forest-800)' : 'var(--text-muted)',
              borderBottom: activeTab === 'history' ? '3px solid var(--forest-700)' : '3px solid transparent',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{t('providerDashboard.tabHistory')} ({completedJobs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('earnings')}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              color: activeTab === 'earnings' ? 'var(--forest-800)' : 'var(--text-muted)',
              borderBottom: activeTab === 'earnings' ? '3px solid var(--forest-700)' : '3px solid transparent',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <DollarSign size={16} />
            <span>{t('providerDashboard.tabEarnings')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('profile')}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              color: activeTab === 'profile' ? 'var(--forest-800)' : 'var(--text-muted)',
              borderBottom: activeTab === 'profile' ? '3px solid var(--forest-700)' : '3px solid transparent',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Award size={16} />
            <span>{t('providerDashboard.tabCredentials')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('reviews')}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              color: activeTab === 'reviews' ? 'var(--forest-800)' : 'var(--text-muted)',
              borderBottom: activeTab === 'reviews' ? '3px solid var(--forest-700)' : '3px solid transparent',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Star size={16} />
            <span>{t('providerDashboard.tabReviews', 'Ratings & Reviews')} ({reviews.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('notifications')}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              color: activeTab === 'notifications' ? 'var(--forest-800)' : 'var(--text-muted)',
              borderBottom: activeTab === 'notifications' ? '3px solid var(--forest-700)' : '3px solid transparent',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Bell size={16} />
            <span>{t('notifications.title', 'Notifications')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('settings')}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              color: activeTab === 'settings' ? 'var(--forest-800)' : 'var(--text-muted)',
              borderBottom: activeTab === 'settings' ? '3px solid var(--forest-700)' : '3px solid transparent',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <SettingsIcon size={16} />
            <span>{t('admin.navSettings', 'Settings')}</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE JOBS PIPELINE */}
        {activeTab === 'active-jobs' && (
          <div>
            {activeJobs.length === 0 ? (
              <div className="card" style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
                <Briefcase size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {t('providerDashboard.noActiveJobs')}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '6px auto 16px auto' }}>
                  {t('providerDashboard.keepOnlineNotice')}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    type="button" 
                    onClick={handleToggleOnline} 
                    className="btn btn-primary btn-sm"
                    disabled={isOnline || providerStatus !== 'approved'}
                  >
                    {isOnline ? t('providerDashboard.currentlyOnline') : t('providerDashboard.goOnlineNow')}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeJobs.map((job) => (
                  <div
                    key={job._id || job.bookingId}
                    className="card"
                    style={{
                      padding: '24px 28px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-xl)',
                      border: '1.5px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                            {t('providerDashboard.bookingRef')}{job.bookingId}
                          </span>
                          <span className={`badge ${job.status === 'WORKING' ? 'badge-yellow' : 'badge-forest'}`} style={{ fontSize: '11px' }}>
                            {t('status.' + job.status, job.status.replace('_', ' '))}
                          </span>
                          {job.disputeStatus === 'OPEN' && (
                            <span className="badge badge-yellow" style={{ fontSize: '11px' }}>
                              {t('providerDashboard.complaintOpen')}
                            </span>
                          )}
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)' }}>
                          {job.serviceTitle}
                        </h2>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('providerDashboard.estimatedPayout')}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-800)' }}>
                          ₹{job.invoice?.totalAmount || job.basePrice}
                        </div>
                      </div>
                    </div>

                    {/* Customer Info Card */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: 'var(--bg-warm)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.customerNameLabel')}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>{job.customerName || t('providerDashboard.customerPlaceholder')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{job.customerPhone || t('providerDashboard.contactRevealedNotice')}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.doorstepAddressLabel')}</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-900)' }}>{job.address}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('providerDashboard.slotLabel')} {job.scheduledDate} ({job.timeSlot})</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.problemDescLabel')}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--forest-900)', lineHeight: 1.4 }}>
                          "{job.notes || t('providerDashboard.standardNotes')}"
                        </div>
                      </div>
                    </div>

                    {/* Quotation Status notice if submitted */}
                    {job.quotation && (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: job.quotation.status === 'APPROVED' ? 'var(--forest-50)' : job.quotation.status === 'REJECTED' ? '#FEF2F2' : '#FEF3C7',
                        border: `1px solid ${job.quotation.status === 'APPROVED' ? 'var(--forest-200)' : job.quotation.status === 'REJECTED' ? '#EF4444' : '#F59E0B'}`,
                        marginBottom: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px'
                      }}>
                        <FileText size={16} color={job.quotation.status === 'APPROVED' ? 'var(--forest-700)' : job.quotation.status === 'REJECTED' ? '#DC2626' : '#B45309'} />
                        <span>
                          <strong>{t('providerDashboard.sparePartsQuoteLabel')}</strong> {t('providerDashboard.statusIs')} <strong>{t('status.' + job.quotation.status, job.quotation.status.replace(/_/g, ' '))}</strong> (₹{job.quotation.total} {t('providerDashboard.extraSuffix')}
                          {job.quotation.reason && ` ${t('providerDashboard.reasonPrefix')} "${job.quotation.reason}"`}
                        </span>
                      </div>
                    )}

                    {/* Stage Action Controls */}
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '16px'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {job.status === 'ACCEPTED' && (
                          <button
                            type="button"
                            disabled={actionInProgress}
                            onClick={() => handleAdvanceStep(job._id, 'ON_THE_WAY')}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <MapPin size={14} />
                            <span>{t('providerDashboard.onTheWayBtn')}</span>
                          </button>
                        )}

                        {job.status === 'ON_THE_WAY' && (
                          <button
                            type="button"
                            disabled={actionInProgress}
                            onClick={() => handleAdvanceStep(job._id, 'WORKING')}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Wrench size={14} />
                            <span>{t('providerDashboard.arrivedBtn')}</span>
                          </button>
                        )}

                        {job.status === 'WORKING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenQuoteModal(job)}
                              className="btn btn-outline btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Plus size={14} />
                              <span>{t('providerDashboard.sendQuoteBtn')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenOtpModal(job)}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <KeyRound size={14} />
                              <span>{t('providerDashboard.finishWithCodeBtn')}</span>
                            </button>
                          </>
                        )}
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {t('providerDashboard.codeSecurityNotice')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPLETED HISTORY */}
        {activeTab === 'history' && (
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '16px' }}>
              {t('providerDashboard.completedRecords')}
            </h2>

            {completedJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                {t('providerDashboard.noCompletedJobs')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {completedJobs.map((job) => (
                  <div
                    key={job._id || job.bookingId}
                    style={{
                      padding: '18px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--forest-900)' }}>
                          {job.serviceTitle}
                        </span>
                        <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                          {t('providerDashboard.warrantedBadge')}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {t('providerDashboard.customerLabel')} {job.customerName || t('providerDashboard.verifiedCustomer')} {t('providerDashboard.bookingNumLabel')}{job.bookingId} · {job.scheduledDate}
                      </div>
                      {job.review && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12px', color: '#B45309' }}>
                          <Star size={13} fill="#F59E0B" color="#F59E0B" />
                          <span>{t('providerDashboard.ratedLabel')} {`${job.review.rating}/5 — "${job.review.comment}"`}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('providerDashboard.amountBilled')}</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-800)' }}>
                        ₹{job.invoice?.totalAmount || job.basePrice}
                      </div>
                      {job.paymentStatus === 'PAID' ? (
                        <div style={{ marginTop: '4px' }}>
                          <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                            {t('providerDashboard.paidBadge')} ({job.invoiceNumber || job.invoice?.invoiceNo || t('providerDashboard.receiptIssued')})
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={cashSubmittingId === job._id || cashSubmittingId === job.bookingId}
                          onClick={() => handleConfirmCash(job.bookingId)}
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: '6px', fontSize: '12px', padding: '6px 12px' }}
                        >
                          {cashSubmittingId === job._id || cashSubmittingId === job.bookingId ? t('providerDashboard.confirming') : t('providerDashboard.confirmCashReceived')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EARNINGS & PAYOUTS */}
        {activeTab === 'earnings' && (
          <div>
            {/* Earnings Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div className="card" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.todayNet')}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
                  ₹{(earnings?.today || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {t('providerDashboard.feeDeductionNotice')} (₹{settings.platformFee} & {settings.commissionPercent}%)
                </div>
              </div>

              <div className="card" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.weekNet')}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-800)', marginTop: '4px' }}>
                  ₹{(earnings?.week || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '4px', fontWeight: 600 }}>
                  {t('providerDashboard.rollingWeeklyTotal')}
                </div>
              </div>

              <div className="card" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.monthNet')}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
                  ₹{(earnings?.month || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {t('providerDashboard.acrossCompletedJobs')} ({earnings?.totalJobs || completedJobs.length})
                </div>
              </div>

              <div className="card" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.lifetimeNet')}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
                  ₹{(earnings?.lifetime || provider?.earningsLifetime || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {t('providerDashboard.acrossCompletedJobs')} ({earnings?.totalJobs || completedJobs.length})
                </div>
              </div>
            </div>

            {/* Commission Transparency Explanation */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
                {t('providerDashboard.commissionTitle')}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {t('providerDashboard.commissionNotice')}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: VERIFIED SKILLS & BADGES */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '16px' }}>
              {t('providerDashboard.credentialsTitle')}
            </h2>

            {/* Profile Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'var(--bg-warm)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.specialtyAndCity')}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>{provider?.specialty || t('providerDashboard.generalSpecialist')}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{provider?.city} • {provider?.serviceArea || t('providerDashboard.citywide')}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.experienceLabel')}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>{provider?.experienceYears || 1}{t('providerDashboard.fieldExp')}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('provider.phone')}: {provider?.phone || userProfile?.phone || t('providerDashboard.onFile')}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('providerDashboard.kycStatusLabel')}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: providerStatus === 'approved' ? '#15803D' : '#D97706' }}>
                  {t('status.' + providerStatus, providerStatus.toUpperCase().replace(/_/g, ' '))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {t('providerDashboard.idProofLabel')} {provider?.idProofUrl ? t('providerDashboard.uploaded') : t('providerDashboard.missing')}
                </div>
              </div>
            </div>

            {/* Verified Skills Header & Add Service */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                {t('providerDashboard.skillsCert')}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/provider/test" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>{t('providerDashboard.allTestsBtn', 'Your Skill Tests')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} />
                  <span>{t('providerDashboard.addServiceBtn', 'Add Another Service')}</span>
                </button>
              </div>
            </div>

            {provider?.skills && provider.skills.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {provider.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--radius-lg)',
                      border: `1.5px solid ${skill.status === 'retest_required' ? '#FDE68A' : skill.status === 'approved' ? 'var(--forest-600)' : skill.passed ? '#FDE68A' : '#E5E7EB'}`,
                      backgroundColor: skill.status === 'retest_required' ? '#FEF3C7' : skill.status === 'approved' ? 'var(--forest-50)' : skill.passed ? '#FEF3C7' : '#F9FAFB'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: skill.status === 'retest_required' ? '#B45309' : skill.status === 'approved' ? 'var(--forest-700)' : skill.passed ? '#B45309' : '#9CA3AF',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Award size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--forest-900)' }}>
                          {skill.categoryName || 'Trade Craft'}
                        </div>
                        <div style={{ fontSize: '12px', color: skill.status === 'retest_required' ? '#B45309' : skill.status === 'approved' ? 'var(--forest-700)' : skill.passed ? '#B45309' : '#6B7280', fontWeight: 700 }}>
                          {skill.status === 'retest_required'
                            ? t('providerTest.retestRequiredBadge', 'Re-test Required by Admin')
                            : skill.status === 'approved'
                            ? t('providerDashboard.verifiedSkillBadge')
                            : skill.passed
                            ? t('providerDashboard.waitingForApproval', 'Waiting for approval')
                            : t('providerDashboard.certPending')}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {t('providerDashboard.scoreLabel')} <strong>{skill.testScore || 0}%</strong> {skill.passed ? t('providerDashboard.passedExam') : t('providerDashboard.requires70')}
                    </div>

                    {(!skill.passed || skill.status === 'retest_required') && (
                      <div style={{ marginTop: '12px' }}>
                        <Link
                          to={`/provider/test/${skill.categoryId}`}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                        >
                          <span>{skill.status === 'retest_required' ? t('providerTest.takeRetestBtn', 'Take Re-Test') : t('providerTest.takeTestBtn', 'Take Test')}</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t('providerDashboard.noSkills')}
              </p>
            )}

            {/* Add Another Trade Service Modal */}
            {showAddSkillModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px',
              }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-xl)',
                  padding: '28px',
                  maxWidth: '480px',
                  width: '100%',
                  boxShadow: 'var(--shadow-xl)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                      {t('providerDashboard.addServiceModalTitle', 'Add Another Trade Service')}
                    </h3>
                    <button type="button" onClick={() => setShowAddSkillModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                      <X size={18} />
                    </button>
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
                    {t('providerDashboard.addServiceModalDesc', 'Expand your earning potential. Select an additional trade service, pass its 10-question safety test, and administration will verify it.')}
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px' }}>
                      {t('providerDashboard.selectServiceLabel', 'Choose Trade Service')}
                    </label>
                    <select
                      className="form-control"
                      value={selectedNewSkill}
                      onChange={(e) => setSelectedNewSkill(e.target.value)}
                      style={{ fontWeight: 600 }}
                    >
                      <option value="">{t('providerDashboard.selectServicePlaceholder', '-- Select Service --')}</option>
                      {availableCategories
                        .filter((c) => !provider?.skills?.some((s) => s.categoryId === (c.categoryId || c.id)))
                        .map((c) => (
                          <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                            {c.name} {c.startingPrice ? `(from ₹${c.startingPrice})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => setShowAddSkillModal(false)} className="btn btn-outline btn-sm">
                      {t('common.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSkillSubmit}
                      disabled={addingSkill || !selectedNewSkill}
                      className="btn btn-primary btn-sm"
                      style={{ fontWeight: 700 }}
                    >
                      {addingSkill ? t('common.submitting', 'Adding...') : t('providerDashboard.confirmAddService', 'Add Service & Take Test')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* KYC Uploaded Documents Review */}
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '12px' }}>
              {t('providerDashboard.privateKycDocs')}
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {provider?.idProofUrl ? (
                <button
                  type="button"
                  disabled={documentLoading === 'idProof'}
                  onClick={() => handleViewDocument('idProof')}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileCheck size={14} color="var(--forest-700)" />
                  <span>{documentLoading === 'idProof' ? t('providerDashboard.generatingUrl') : t('providerDashboard.viewGovtId')}</span>
                  <ExternalLink size={12} />
                </button>
              ) : (
                <span style={{ fontSize: '13px', color: '#DC2626' }}>{t('providerDashboard.idNotUploaded')}</span>
              )}

              {provider?.certificateUrl && (
                <button
                  type="button"
                  disabled={documentLoading === 'certificate'}
                  onClick={() => handleViewDocument('certificate')}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileCheck size={14} color="var(--forest-700)" />
                  <span>{documentLoading === 'certificate' ? t('providerDashboard.generatingUrl') : t('providerDashboard.viewTradeCert')}</span>
                  <ExternalLink size={12} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/provider/test" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} />
                <span>{t('providerDashboard.testAnotherCraft')}</span>
              </Link>
              <Link to="/provider/register" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{t('providerDashboard.updateKycDetails')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* TAB 5: RATINGS & CUSTOMER REVIEWS */}
        {activeTab === 'reviews' && (
          <div>
            {/* Reviews Summary Card */}
            <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--forest-50)',
                    border: '1.5px solid var(--forest-100)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--forest-900)'
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1 }}>
                      {provider?.rating ? provider.rating.toFixed(1) : '5.0'}
                    </span>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} color="#F59E0B" fill="#F59E0B" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: '0 0 4px 0' }}>
                      {t('providerDashboard.overallScore', 'Overall Performance Score')}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
                      {t('providerDashboard.basedOn', 'Based on')} {reviews.length} {t('providerDashboard.authenticReviewsSub', 'authentic homeowner reviews after verified job completion.')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <span className="badge badge-sage" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    <ShieldCheck size={14} style={{ marginRight: '4px' }} />
                    {provider?.jobsCompleted || 0} {t('providerDashboard.jobsCompleted', 'Jobs Completed')}
                  </span>
                  <span className="badge badge-forest" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
                    {t('providerDashboard.otpVerifiedPayouts', 'OTP Verified Payouts')}
                  </span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="card" style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                <Star size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {t('providerDashboard.noReviewsYet', 'No Customer Reviews Yet')}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '6px auto 16px auto' }}>
                  {t('providerDashboard.noReviewsSub', 'When you accept and complete service bookings with customer completion OTPs, verified customer feedback and star ratings will appear here.')}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('active-jobs')}
                  className="btn btn-primary btn-sm"
                >
                  {t('providerDashboard.viewActiveJobs', 'View Active Jobs')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {reviews.map((rev, idx) => {
                  const rating = rev.rating || 5;
                  const isPositive = rating >= 4;
                  return (
                    <div
                      key={rev._id || idx}
                      className="card"
                      style={{
                        padding: '20px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Rating Stars + Sentiment Tag */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                color={i < rating ? '#F59E0B' : '#E5E7EB'}
                                fill={i < rating ? '#F59E0B' : 'transparent'}
                              />
                            ))}
                          </div>
                          <span
                            className="badge"
                            style={{
                              fontSize: '11px',
                              backgroundColor: isPositive ? '#ECFDF5' : '#FEF3C7',
                              color: isPositive ? '#065F46' : '#92400E',
                              border: `1px solid ${isPositive ? '#A7F3D0' : '#FDE68A'}`
                            }}
                          >
                            {isPositive ? t('providerDashboard.recommended', '✨ Highly Recommended') : t('providerDashboard.satisfactory', '👍 Satisfactory Work')}
                          </span>
                        </div>

                        {/* Comment Text with line-clamp */}
                        <p style={{
                          fontSize: '13.5px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.55,
                          fontStyle: 'italic',
                          marginBottom: '14px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          "{rev.comment || t('providerDashboard.defaultReviewText', 'Specialist arrived on time and performed reliable maintenance work.')}"
                        </p>
                      </div>

                      {/* Customer info */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-light)'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--forest-900)' }}>
                            {rev.customerName || rev.authorName || t('home.homeownerDefault', 'Homeowner')}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {rev.createdAt ? formatDate(rev.createdAt) : t('common.verifiedBooking', 'Verified Booking')}
                          </div>
                        </div>

                        <span style={{ fontSize: '11px', color: 'var(--forest-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <ShieldCheck size={13} /> {t('common.verified', 'Verified')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS DESK */}
        {activeTab === 'notifications' && (
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {t('notifications.title', 'Notifications')}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {t('providerDashboard.notificationsSubtitle', 'Real-time booking dispatch alerts, customer confirmations, and settlement notices.')}
                </p>
              </div>
              <button
                type="button"
                onClick={fetchNotifications}
                className="btn btn-outline btn-sm"
                disabled={loadingNotifs}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
              >
                <RefreshCw size={13} className={loadingNotifs ? 'animate-spin' : ''} />
                <span>{t('common.refresh', 'Refresh')}</span>
              </button>
            </div>

            {loadingNotifs ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 12px auto' }} />
                <div>{t('common.loading', 'Loading notifications...')}</div>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
                <Bell size={42} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                  {t('notifications.emptyNotifications', 'No new notifications right now.')}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {t('providerDashboard.emptyNotifHelp', 'You will be notified immediately when a customer books a job in your service zone.')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    style={{
                      padding: '16px 18px',
                      backgroundColor: notif.isRead ? 'var(--bg-warm)' : 'var(--forest-50)',
                      borderRadius: 'var(--radius-md)',
                      border: notif.isRead ? '1px solid var(--border-light)' : '1px solid var(--forest-100)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: notif.isRead ? '#E5E7EB' : 'var(--forest-100)',
                        color: notif.isRead ? '#6B7280' : 'var(--forest-800)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Bell size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-900)' }}>
                          {notif.code ? t(`notifications.type${notif.type ? notif.type.charAt(0).toUpperCase() + notif.type.slice(1) : 'System'}`, notif.title) : notif.title}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          {formatTime(notif.createdAt)} · {formatDate(notif.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SETTINGS & ACCOUNT GOVERNANCE */}
        {activeTab === 'settings' && (
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                {t('admin.navSettings', 'Settings')} & {t('providerDashboard.tabAccountGovernance', 'Account Governance')}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('providerDashboard.settingsSubtitle', 'Manage portal preferences, security credentials, data exports, and technician account settings.')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Language Preferences */}
              <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Globe size={18} color="var(--forest-700)" />
                  <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>
                    {t('common.language', 'Platform Language')}
                  </label>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {t('userActions.langDesc', 'Select your preferred language across bookings, invoices, and alerts.')}
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिंदी (Hindi)' },
                    { code: 'mr', label: 'मराठी (Marathi)' }
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        authAPI.updatePreferredLanguage(l.code).catch(() => {});
                        window.location.reload();
                      }}
                      className={`btn btn-sm ${currentUser?.preferredLanguage === l.code ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: '12.5px', padding: '8px 16px' }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security & Password */}
              <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Lock size={18} color="var(--forest-700)" />
                  <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>
                    {t('auth.changePassword', 'Account Security')}
                  </label>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {t('userActions.securityDesc', 'Manage login credentials, update passwords, and maintain active session security.')}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/change-password')}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                >
                  <Lock size={15} />
                  <span>{t('auth.changePassword', 'Change Password')}</span>
                </button>
              </div>

              {/* Data & Privacy Export (GDPR / DPDP) */}
              <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Download size={18} color="var(--forest-700)" />
                  <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>
                    {t('userActions.downloadTitle', 'Data & Privacy Export (GDPR / DPDP)')}
                  </label>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {t('userActions.downloadDesc', 'Request a complete JSON archive of your personal profile, booking history, submitted reviews, and support tickets.')}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleDownloadMyData}
                  disabled={downloadingData}
                  style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                >
                  <Download size={15} />
                  <span>{downloadingData ? t('common.loading', 'Generating Export...') : t('userActions.downloadBtn', 'Download JSON Data Export')}</span>
                </button>
              </div>

              {/* Sign Out Section with Confirmation */}
              <div style={{
                padding: '16px 20px',
                backgroundColor: '#FEF2F2',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #FCA5A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={16} />
                    <span>{t('accountMenu.signOut', 'Sign Out of Account')}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#7F1D1D', marginTop: '2px' }}>
                    {t('userActions.signOutDesc', 'End current session on this device securely.')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm(t('auth.loginSubtitle', 'Are you sure you want to sign out?'))) {
                      await logOut();
                      navigate('/login');
                    }
                  }}
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={14} />
                  <span>{t('accountMenu.signOut', 'Sign Out')}</span>
                </button>
              </div>

              {/* Danger Zone: Delete Account */}
              <div style={{
                padding: '20px',
                backgroundColor: '#FFF1F2',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #FECDD3'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Trash2 size={18} color="#BE123C" />
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#9F1239' }}>
                    {t('userActions.deleteTitle', 'Delete My Account')}
                  </h4>
                </div>
                <p style={{ fontSize: '12.5px', color: '#881337', marginBottom: '14px', lineHeight: 1.5 }}>
                  {t('userActions.deleteWarning', 'Account deletion is irreversible. Your personal contact details and KYC documents will be permanently anonymized. Accounting records are retained for compliance.')}
                </p>

                {deleteError && (
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #EF4444',
                    borderRadius: 'var(--radius-sm)',
                    color: '#B91C1C',
                    fontSize: '12.5px',
                    marginBottom: '14px'
                  }}>
                    {deleteError}
                  </div>
                )}

                {deleteSuccess ? (
                  <div style={{
                    padding: '14px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #10B981',
                    borderRadius: 'var(--radius-sm)',
                    color: '#065F46',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    {t('common.successGeneral', 'Account successfully deleted.')}
                  </div>
                ) : (
                  <div style={{ maxWidth: '400px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#4C0519', display: 'block', marginBottom: '6px' }}>
                      {t('userActions.enterPasswordToDelete', 'Enter your password to confirm deletion:')}
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="password"
                        className="input"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        onClick={handleDeleteMyAccount}
                        disabled={deletingAccount || !deletePassword}
                        style={{
                          backgroundColor: '#BE123C',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: deletingAccount || !deletePassword ? 'not-allowed' : 'pointer',
                          opacity: deletingAccount || !deletePassword ? 0.6 : 1,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {deletingAccount ? t('common.loading', 'Deleting...') : t('userActions.deleteBtn', 'Delete Account')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: Send Extra Quotation */}
        {isQuoteModalOpen && selectedJobForQuote && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '540px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {t('providerDashboard.digitalQuoteTitle')}
                </h3>
                <button type="button" onClick={() => setIsQuoteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t('providerDashboard.quoteWarning')}
              </p>

              <form onSubmit={handleSendExtraQuotation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                    {t('providerDashboard.defectReasonLabel')}
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Capacitor degraded causing motor hum..."
                    value={quoteReason}
                    onChange={(e) => setQuoteReason(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                    {t('providerDashboard.partNameLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OEM Dual Run Capacitor 45uF"
                    value={quotePartName}
                    onChange={(e) => setQuotePartName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '13px' }}
                  />
                </div>

                <div className="modal-2col-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                      {t('providerDashboard.partCostLabel')}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 450"
                      value={quotePartCost}
                      onChange={(e) => setQuotePartCost(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                      {t('providerDashboard.installLaborLabel')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 100"
                      value={quoteLaborCost}
                      onChange={(e) => setQuoteLaborCost(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--forest-50)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12.5px',
                  color: 'var(--forest-900)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{t('providerDashboard.totalAddlQuote')}</span>
                  <strong>₹{Number(quotePartCost || 0) + Number(quoteLaborCost || 0)}</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="btn btn-outline btn-sm">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={quoteSubmitting} className="btn btn-primary btn-sm">
                    <Send size={14} />
                    <span>{quoteSubmitting ? t('providerDashboard.sending') : t('providerDashboard.sendQuoteToCustomer')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Complete Job with Customer 4-digit code */}
        {isOtpModalOpen && selectedJobForOtp && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '460px',
              width: '100%',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--forest-100)',
                color: 'var(--forest-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <KeyRound size={28} />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
                {t('providerDashboard.enterFinishCodeTitle')}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                {t('providerDashboard.enterFinishCodeDesc')}
              </p>

              <form onSubmit={handleVerifyOtpAndComplete}>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  placeholder="• • • •"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '180px',
                    margin: '0 auto 20px auto',
                    padding: '12px',
                    fontSize: '24px',
                    fontWeight: 800,
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--forest-700)'
                  }}
                />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button type="button" onClick={() => setIsOtpModalOpen(false)} className="btn btn-outline">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={otpSubmitting} className="btn btn-primary" style={{ backgroundColor: '#16A34A' }}>
                    <CheckCircle2 size={16} />
                    <span>{otpSubmitting ? t('providerDashboard.verifying') : t('providerDashboard.verifyAndFinish')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
