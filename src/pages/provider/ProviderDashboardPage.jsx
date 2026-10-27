// ===================================================================
// FixNear Trust - Full Service Provider (Technician) Dashboard
// Online/Offline Toggle | 60s Incoming Job Radar | Active Job Pipeline
// Extra Quotation Modal | Completion OTP Verify | Earnings & Payouts
// ===================================================================

import React, { useState, useEffect } from 'react';
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
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function ProviderDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, providerProfile, logOut } = useAuth();
  const { 
    bookings, 
    technicians, 
    advanceBookingStage, 
    submitExtraQuotation, 
    releaseInvoiceEscrow,
    toggleProviderOnlineStatus,
    acceptJobBooking,
    declineJobBooking
  } = useStore();
  const { showToast } = useToast();

  const providerId = providerProfile?.userId || currentUser?.uid || "provider-demo-1";
  const technician = technicians.find(t => t.id === providerId || t.userId === providerId) || {
    id: providerId,
    name: providerProfile?.name || userProfile?.name || "Ramesh Sharma",
    status: providerProfile?.status || "approved",
    isOnline: true,
    ratingAvg: 4.94,
    ratingCount: 428,
    jobsDone: 1420,
    testScore: 92,
    verifiedSkills: [
      { categoryName: "Air Conditioning", score: 92, badge: "Gold" },
      { categoryName: "Plumbing Systems", score: 85, badge: "Silver" }
    ]
  };

  const [activeTab, setActiveTab] = useState('active-jobs'); // 'active-jobs' | 'incoming' | 'history' | 'earnings' | 'profile'
  const [isOnline, setIsOnline] = useState(technician.isOnline ?? true);

  // Incoming Job Countdown (60 seconds)
  const [incomingCountdown, setIncomingCountdown] = useState(60);
  const [dismissedJobs, setDismissedJobs] = useState([]);

  // Modals
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedJobForQuote, setSelectedJobForQuote] = useState(null);
  const [quoteReason, setQuoteReason] = useState('Outdoor compressor capacitor degraded (tested 18uF vs rated 45uF).');
  const [quotePartName, setQuotePartName] = useState('OEM EPCOS Dual Motor Run-Capacitor (45+5 uF)');
  const [quotePartCost, setQuotePartCost] = useState(450);
  const [quoteLaborCost, setQuoteLaborCost] = useState(100);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedJobForOtp, setSelectedJobForOtp] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  // Filter bookings for this provider
  const myBookings = bookings.filter(b => b.providerId === providerId || b.providerId === "provider-demo-1" || !b.providerId);
  const activeJobs = myBookings.filter(b => ['ACCEPTED', 'ON_THE_WAY', 'WORKING'].includes(b.status));
  const completedJobs = myBookings.filter(b => b.status === 'COMPLETED');
  
  // Potential incoming requests (status: 'REQUESTED')
  const incomingRequests = bookings.filter(b => 
    b.status === 'REQUESTED' && 
    !dismissedJobs.includes(b.id)
  );

  // 60-second timer for incoming job radar
  useEffect(() => {
    if (!isOnline || incomingRequests.length === 0) return;

    const timer = setInterval(() => {
      setIncomingCountdown(prev => {
        if (prev <= 1) {
          // Auto-pass first incoming request
          const firstJobId = incomingRequests[0]?.id;
          if (firstJobId) {
            setDismissedJobs(d => [...d, firstJobId]);
          }
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOnline, incomingRequests]);

  // Online / Offline Toggle
  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    await toggleProviderOnlineStatus(providerId, nextState);
    showToast(nextState ? "You are now ONLINE. Dispatches active." : "You are OFFLINE. No dispatches will be sent.", nextState ? "success" : "info");
  };

  // Accept / Decline Incoming Request
  const handleAcceptJob = async (jobId) => {
    await acceptJobBooking(jobId, providerId, technician.name);
    showToast("Job Accepted! Head over to your Active Jobs queue.", "success");
    setActiveTab('active-jobs');
  };

  const handleDeclineJob = (jobId) => {
    setDismissedJobs(prev => [...prev, jobId]);
    showToast("Job request declined.", "info");
  };

  // Pipeline Step Advance
  const handleAdvanceStep = async (bookingId, targetStatus) => {
    await advanceBookingStage(bookingId, targetStatus);
    const messages = {
      'ON_THE_WAY': "Status updated: You are on the way! Customer notified with live GPS.",
      'WORKING': "Status updated: Diagnostic and triage work underway at doorstep."
    };
    showToast(messages[targetStatus] || "Status updated.", "success");
  };

  // Send Extra Quotation
  const handleOpenQuoteModal = (job) => {
    setSelectedJobForQuote(job);
    setIsQuoteModalOpen(true);
  };

  const handleSendExtraQuotation = async (e) => {
    e.preventDefault();
    if (!selectedJobForQuote) return;

    await submitExtraQuotation(selectedJobForQuote.id, {
      reason: quoteReason,
      parts: [
        { name: quotePartName, cost: Number(quotePartCost), tax: Math.round(quotePartCost * 0.18), oemCertified: true }
      ],
      laborAddon: Number(quoteLaborCost)
    });

    setIsQuoteModalOpen(false);
    showToast("Digital quotation sent! Waiting for customer authorization.", "success");
  };

  // Complete Job with Customer OTP
  const handleOpenOtpModal = (job) => {
    setSelectedJobForOtp(job);
    setEnteredOtp('');
    setIsOtpModalOpen(true);
  };

  const handleVerifyOtpAndComplete = async (e) => {
    e.preventDefault();
    if (!selectedJobForOtp) return;

    setOtpSubmitting(true);
    const result = await releaseInvoiceEscrow(selectedJobForOtp.id, enteredOtp);
    setOtpSubmitting(false);

    if (result.success) {
      setIsOtpModalOpen(false);
      showToast("OTP verified! Job completed and escrow payment released.", "success");
      setActiveTab('history');
    } else {
      showToast(result.message || "Invalid OTP entered.", "error");
    }
  };

  // Financials Calculation
  const totalCompletedEarnings = completedJobs.reduce((sum, b) => sum + (b.invoice?.actualBilledTotal || b.price || 499), 0);
  const platformFee = Math.round(totalCompletedEarnings * 0.15);
  const netTechnicianPayout = totalCompletedEarnings - platformFee;

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
                  {technician.name}
                </h1>
                <span className={`badge ${technician.status === 'approved' ? 'badge-forest' : technician.status === 'under_review' ? 'badge-yellow' : 'badge-demo'}`} style={{ fontSize: '11px' }}>
                  {technician.status === 'approved' ? '✓ Verified Partner' : technician.status === 'under_review' ? '⏳ Under Review' : '📝 Test Pending'}
                </span>
                {technician.testScore > 0 && (
                  <span className="badge badge-forest" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={12} />
                    <span>Skill Score: {technician.testScore}%</span>
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Specialist Partner Console • Rating: <strong>⭐ {technician.ratingAvg || 4.9}</strong> ({technician.jobsDone || 1400}+ jobs)
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
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#16A34A' : '#9CA3AF',
                boxShadow: isOnline ? '0 0 8px #22C55E' : 'none'
              }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: isOnline ? '#15803D' : '#4B5563' }}>
                {isOnline ? 'Online (Dispatches Active)' : 'Offline'}
              </span>
            </div>

            <button 
              type="button" 
              onClick={logOut} 
              className="btn btn-outline btn-sm"
              style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Status Pipeline Banner if not yet approved */}
        {technician.status === 'pending_test' && (
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
                Skill Certification Test Required
              </div>
              <div style={{ fontSize: '13px', color: '#78350F', marginTop: '2px' }}>
                Complete the 15-minute, 10-question technical test (70% pass mark) to unlock incoming job dispatches.
              </div>
            </div>
            <Link to="/provider/test" className="btn btn-primary" style={{ backgroundColor: '#D97706', borderColor: '#B45309' }}>
              <span>Start 15-Min Skill Test</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {technician.status === 'under_review' && (
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
              <strong>Application Under Verification:</strong> You scored <strong>{technician.testScore}%</strong> on your skill test! Your KYC documents are currently in the Admin Approval queue. Dispatches will activate upon admin sign-off.
            </div>
          </div>
        )}

        {technician.status === 'rejected' && (
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
                  KYC Verification Unsuccessful
                </div>
                <div style={{ fontSize: '13.5px', color: '#B91C1C', marginTop: '2px' }}>
                  <strong>Admin Reason:</strong> {technician.rejectionReason || "Uploaded documents could not be verified. Please ensure your Govt ID is clear and legible."}
                </div>
              </div>
            </div>
            <Link to="/provider/register" className="btn btn-primary" style={{ backgroundColor: '#DC2626', borderColor: '#B91C1C' }}>
              <span>Fix & Resubmit KYC</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {technician.status === 'needs_info' && (
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
                  Additional Information Requested
                </div>
                <div style={{ fontSize: '13.5px', color: '#B45309', marginTop: '2px' }}>
                  <strong>Admin Message:</strong> {technician.adminMessage || "Please upload a clearer copy of your Govt ID proof or provide your trade license."}
                </div>
              </div>
            </div>
            <Link to="/provider/register" className="btn btn-primary" style={{ backgroundColor: '#D97706', borderColor: '#B45309' }}>
              <span>Update Documents</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {technician.status === 'suspended' && (
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
                Account Suspended by FixNear Trust & Safety
              </div>
              <div style={{ fontSize: '13.5px', color: '#7F1D1D', marginTop: '2px' }}>
                Reason: {technician.suspensionReason || "Account flagged due to customer disputes or quality reviews below platform standards."}
              </div>
            </div>
          </div>
        )}

        {/* Incoming Job Radar Banner (if any available and online) */}
        {isOnline && incomingRequests.length > 0 && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '22px 24px',
            border: '2px solid #22C55E',
            boxShadow: '0 4px 20px -2px rgba(34, 197, 94, 0.25)',
            marginBottom: '24px',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-forest" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
                  ⚡ New Incoming Dispatch
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Nearest available technician match
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
                <span>Expires in {incomingCountdown}s</span>
              </div>
            </div>

            {/* Request Details */}
            {incomingRequests.slice(0, 1).map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                    {req.serviceTitle}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} color="var(--forest-700)" />
                      {req.address}
                    </span>
                    <span>•</span>
                    <span>Customer: <strong>{req.customerName || 'Aarav Patel'}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Estimated Payout</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-800)' }}>
                      ₹{req.basePrice || req.price || 599}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleAcceptJob(req.id)}
                      className="btn btn-primary"
                      style={{ backgroundColor: '#16A34A', padding: '12px 24px', fontWeight: 800 }}
                    >
                      <Check size={16} />
                      <span>Accept Job</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineJob(req.id)}
                      className="btn btn-outline"
                      style={{ borderColor: '#FCA5A5', color: '#DC2626' }}
                    >
                      <X size={16} />
                      <span>Pass</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
            <span>Active Jobs ({activeJobs.length})</span>
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
            <span>Completed History ({completedJobs.length})</span>
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
            <span>Earnings & Payouts</span>
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
            <span>Verified Skills & Badges</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE JOBS PIPELINE */}
        {activeTab === 'active-jobs' && (
          <div>
            {activeJobs.length === 0 ? (
              <div className="card" style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
                <Briefcase size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  No Active Jobs In Progress
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '6px auto 16px auto' }}>
                  Keep your status set to <strong>Online</strong> to receive instant customer dispatch requests in your locality.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button type="button" onClick={() => setIsOnline(true)} className="btn btn-primary btn-sm">
                    Ensure Online Status
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeJobs.map(job => (
                  <div
                    key={job.id}
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
                            Booking #{job.id}
                          </span>
                          <span className={`badge ${job.status === 'WORKING' ? 'badge-yellow' : 'badge-forest'}`} style={{ fontSize: '11px' }}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)' }}>
                          {job.serviceTitle}
                        </h2>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Billed Total</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-800)' }}>
                          ₹{job.invoice?.actualBilledTotal || job.price || 599}
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
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Customer Name</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>{job.customerName || 'Aarav Patel'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{job.customerPhone || '+91 98201 54321'}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Doorstep Address</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-900)' }}>{job.address}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Slot: {job.slot || 'Morning (10:00 AM)'}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Reported Problem</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--forest-900)', lineHeight: 1.4 }}>
                          "{job.problemNote || job.notes || 'AC cooling reduced over past week'}"
                        </div>
                      </div>
                    </div>

                    {/* Quotation Status notice if pending */}
                    {job.quotation && (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: job.quotation.status === 'APPROVED' ? 'var(--forest-50)' : '#FEF3C7',
                        border: `1px solid ${job.quotation.status === 'APPROVED' ? 'var(--forest-200)' : '#F59E0B'}`,
                        marginBottom: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px'
                      }}>
                        <FileText size={16} color={job.quotation.status === 'APPROVED' ? 'var(--forest-700)' : '#B45309'} />
                        <span>
                          <strong>Quotation #{job.quotation.id}:</strong> Status is <strong>{job.quotation.status.replace('_', ' ')}</strong> (₹{job.quotation.finalTotalEstimate} Total).
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
                            onClick={() => handleAdvanceStep(job.id, 'ON_THE_WAY')}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <MapPin size={14} />
                            <span>I'm On The Way</span>
                          </button>
                        )}

                        {job.status === 'ON_THE_WAY' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStep(job.id, 'WORKING')}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Wrench size={14} />
                            <span>Arrived / Start Work</span>
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
                              <span>Send Extra Parts Quote</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenOtpModal(job)}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <KeyRound size={14} />
                              <span>Complete Job with OTP</span>
                            </button>
                          </>
                        )}
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Completion OTP is held securely by the customer until satisfaction.
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
              Completed Workmanship Records
            </h2>

            {completedJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                No completed jobs yet. Complete jobs using OTP to build your verified trust score.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {completedJobs.map(job => (
                  <div
                    key={job.id}
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
                          ✓ Warranted
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Customer: {job.customerName || 'Aarav Patel'} · Booking #{job.id}
                      </div>
                      {job.review && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12px', color: '#B45309' }}>
                          <Star size={13} fill="#F59E0B" color="#F59E0B" />
                          <span>Rated {job.review.rating}/5 — "{job.review.content}"</span>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paid via Escrow</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-800)' }}>
                        ₹{job.invoice?.actualBilledTotal || job.price || 599}
                      </div>
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
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Billed Work</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
                  ₹{totalCompletedEarnings.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Across {completedJobs.length} completed jobs
                </div>
              </div>

              <div className="card" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Net Take-Home (85%)</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-800)', marginTop: '4px' }}>
                  ₹{netTechnicianPayout.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '4px', fontWeight: 600 }}>
                  FixNear 15% commission deducted
                </div>
              </div>

              <div className="card" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Available for Direct Bank Transfer</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
                  ₹{netTechnicianPayout.toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Simulated instant UPI payout of ₹${netTechnicianPayout} processed to your verified account!`)}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '8px', width: '100%' }}
                >
                  <CreditCard size={14} />
                  <span>Request Instant Payout</span>
                </button>
              </div>
            </div>

            {/* Commission Transparency Explanation */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
                FixNear Fair Partner Commission Structure
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                FixNear deducts a flat <strong>15% commission</strong> covering lead generation, real-time GPS dispatching, payment gateway fees, and 30-day customer warranty coverage. You keep <strong>85% of labor and spare parts</strong> with zero hidden deductions.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: VERIFIED SKILLS & BADGES */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '16px' }}>
              Your Verified Technical Credentials
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {technician.verifiedSkills?.map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--forest-600)',
                    backgroundColor: 'var(--forest-50)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--forest-700)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Award size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--forest-900)' }}>
                        {skill.categoryName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--forest-700)', fontWeight: 700 }}>
                        {skill.badge || 'Gold'} Verified Badge
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Assessment Score: <strong>{skill.score}%</strong> (Passed anti-cheat test)
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Link to="/provider/test" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} />
                <span>Test for Another Trade Craft</span>
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
                  Submit Itemized Digital Quotation
                </h3>
                <button type="button" onClick={() => setIsQuoteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                FixNear prevents verbal estimates. The customer must tap 'Approve' on their phone before you install any spare parts.
              </p>

              <form onSubmit={handleSendExtraQuotation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                    Diagnostic Finding / Defect Reason *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={quoteReason}
                    onChange={(e) => setQuoteReason(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                    Replacement Part Name & Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={quotePartName}
                    onChange={(e) => setQuotePartName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                      Part Cost (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={quotePartCost}
                      onChange={(e) => setQuotePartCost(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                      Installation Labor (₹) *
                    </label>
                    <input
                      type="number"
                      required
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
                  <span>Total Additional Estimate:</span>
                  <strong>₹{Number(quotePartCost) + Number(quoteLaborCost) + Math.round(quotePartCost * 0.18)} (inc. GST)</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={14} />
                    <span>Send Quote to Customer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Complete Job with Customer OTP */}
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
                Enter Customer 4-Digit Completion OTP
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Ask the customer for the completion code displayed on their FixNear tracking screen once the repair has been demonstrated.
              </p>

              <form onSubmit={handleVerifyOtpAndComplete}>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  placeholder="• • • •"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
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
                    Cancel
                  </button>
                  <button type="submit" disabled={otpSubmitting} className="btn btn-primary" style={{ backgroundColor: '#16A34A' }}>
                    <CheckCircle2 size={16} />
                    <span>{otpSubmitting ? 'Verifying...' : 'Verify OTP & Release Escrow'}</span>
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
