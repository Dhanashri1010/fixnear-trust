// ===================================================================
// FixNear Trust - Full Service Provider (Technician) Dashboard
// Connected to MongoDB REST API & Socket.io
// Online/Offline Switch | 60s Incoming Job Radar | Active Job Pipeline
// Extra Quotation Modal | Completion Code Verify | Live Earnings
// ===================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { providersAPI, bookingsAPI, paymentsAPI, getSocket } from '../../services/api';

export default function ProviderDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, logOut } = useAuth();
  const { showToast } = useToast();
  const { t, formatCurrency, formatDate } = useLanguage();

  const [provider, setProvider] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, totalJobs: 0 });
  const [settings, setSettings] = useState({ commissionPercent: 10, platformFee: 20 });
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('active-jobs'); // 'active-jobs' | 'history' | 'earnings' | 'profile'
  const [isOnline, setIsOnline] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

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

  // Fetch Dashboard Data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      const [profileRes, bookingsRes] = await Promise.all([
        providersAPI.getMyProfile(),
        bookingsAPI.getMyBookings(),
      ]);

      if (profileRes.success) {
        setProvider(profileRes.provider);
        setIsOnline(Boolean(profileRes.provider?.isOnline));
        if (profileRes.earnings) setEarnings(profileRes.earnings);
        if (profileRes.settings) setSettings(profileRes.settings);
        if (profileRes.reviews) setReviews(profileRes.reviews);
      }

      if (bookingsRes.success && Array.isArray(bookingsRes.bookings)) {
        setBookings(bookingsRes.bookings);

        // Check if there is an unexpired incoming offer for this provider
        const pendingOffer = bookingsRes.bookings.find(
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

  // Safe document view handler
  const handleViewDocument = async (type) => {
    setDocumentLoading(type);
    try {
      const res = await providersAPI.getPrivateDocumentSignedUrl(type);
      if (res.success && res.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      } else {
        window.open(`/api/providers/documents/${type}/file`, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      // Fallback to streaming endpoint directly
      window.open(`/api/providers/documents/${type}/file`, '_blank', 'noopener,noreferrer');
    } finally {
      setDocumentLoading(null);
    }
  };

  // Filter Bookings
  const activeJobs = bookings.filter((b) => ['ACCEPTED', 'ON_THE_WAY', 'WORKING'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  const providerName = provider?.name || userProfile?.name || currentUser?.name || 'Technician Partner';
  const providerStatus = provider?.status || 'take_skill_test';
  const providerRating = provider?.ratingAvg || 5.0;
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

            <Link
              to="/change-password"
              className="btn btn-outline btn-sm"
              style={{ color: '#475569', borderColor: '#CBD5E1', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <KeyRound size={14} />
              <span>{t('providerDashboard.password')}</span>
            </Link>

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
            onClick={() => setActiveTab('active-jobs')}
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
            onClick={() => setActiveTab('history')}
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
            onClick={() => setActiveTab('earnings')}
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
            onClick={() => setActiveTab('profile')}
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

            {/* Verified Skills Grid */}
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '12px' }}>
              {t('providerDashboard.skillsCert')}
            </h3>

            {provider?.skills && provider.skills.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {provider.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--radius-lg)',
                      border: `1.5px solid ${skill.passed ? 'var(--forest-600)' : '#E5E7EB'}`,
                      backgroundColor: skill.passed ? 'var(--forest-50)' : '#F9FAFB'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: skill.passed ? 'var(--forest-700)' : '#9CA3AF',
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
                        <div style={{ fontSize: '12px', color: skill.passed ? 'var(--forest-700)' : '#6B7280', fontWeight: 700 }}>
                          {skill.passed ? t('providerDashboard.verifiedSkillBadge') : t('providerDashboard.certPending')}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {t('providerDashboard.scoreLabel')} <strong>{skill.testScore || 0}%</strong> {skill.passed ? t('providerDashboard.passedExam') : t('providerDashboard.requires70')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t('providerDashboard.noSkills')}
              </p>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
