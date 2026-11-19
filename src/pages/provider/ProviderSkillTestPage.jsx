// ===================================================================
// FixNear Trust - Mandatory Anti-Cheat Skill Test Engine
// Hub: "Your Skill Tests" multi-service overview with states:
//   "Not taken", "Passed (Gold/Silver/Bronze, score)", "Try again in X hours"
// Test: Exactly 10 questions per service | Visible questionText & 4 options
// 15:00 Timer | Realistic Weak Topics | No fallback to default category
// ===================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw,
  BookOpen,
  Briefcase,
  Check,
  ShieldCheck,
  Wind,
  Droplets,
  Zap,
  Tv,
  Hammer,
  Sparkles,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { skillTestAPI, servicesAPI, providersAPI } from '../../services/api';

export default function ProviderSkillTestPage() {
  const { categoryId: urlCategory } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [providerProfile, setProviderProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');

  // Hub vs Test mode
  const isHubMode = !urlCategory;

  // Session & Question State from Server
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [passMark, setPassMark] = useState(70);

  // Status flags
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [inCooldown, setInCooldown] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [cooldownMessage, setCooldownMessage] = useState('');
  const [notPreparedMessage, setNotPreparedMessage] = useState('');
  const [notSelectedError, setNotSelectedError] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Tab switch counter (anti-cheat informational warning)
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const timerRef = useRef(null);

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'ac-cooling': return <Wind size={20} />;
      case 'plumbing': return <Droplets size={20} />;
      case 'electrical': return <Zap size={20} />;
      case 'appliances': return <Tv size={20} />;
      case 'carpentry': return <Hammer size={20} />;
      case 'deep-cleaning': return <Sparkles size={20} />;
      default: return <Briefcase size={20} />;
    }
  };

  // Fetch metadata and provider profile
  useEffect(() => {
    let isMounted = true;
    const fetchInit = async () => {
      setLoading(true);
      setLoadError('');
      setNotPreparedMessage('');
      setNotSelectedError(false);
      try {
        const [catsRes, provRes] = await Promise.allSettled([
          servicesAPI.getCategories(),
          providersAPI.getMyProfile(),
        ]);

        let loadedCategories = [];
        if (catsRes.status === 'fulfilled' && catsRes.value?.categories) {
          loadedCategories = catsRes.value.categories;
          if (isMounted) setCategories(loadedCategories);
        }

        let prov = null;
        if (provRes.status === 'fulfilled' && provRes.value?.provider) {
          prov = provRes.value.provider;
          if (isMounted) setProviderProfile(prov);
        }

        // If in test mode for a specific category
        if (urlCategory) {
          const matched = loadedCategories.find((c) => (c.categoryId || c.id) === urlCategory);
          if (isMounted) setCategoryName(matched?.name || urlCategory);

          // Check if category is in provider's skills
          if (prov && prov.skills && prov.skills.length > 0) {
            const hasSkill = prov.skills.some((s) => s.categoryId === urlCategory);
            if (!hasSkill) {
              if (isMounted) {
                setNotSelectedError(true);
                setLoading(false);
              }
              return;
            }
          }

          // Start or resume test session on server
          await startOrResumeTest(urlCategory);
        }
      } catch (err) {
        if (isMounted) setLoadError(err.message || 'Failed to load test session.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInit();
    return () => { isMounted = false; };
  }, [urlCategory]);

  const startOrResumeTest = async (catId) => {
    try {
      const res = await skillTestAPI.startTest(catId);
      if (res.success && res.questions) {
        // Validate question data: must have questionText and 4 options
        const validQs = res.questions.filter(
          (q) => (q.questionText || q.question) && Array.isArray(q.options) && q.options.length === 4
        );

        if (validQs.length === 0) {
          setLoadError('Exam questions could not be loaded. Please try again.');
          return;
        }

        setQuestions(validQs);
        setSessionId(res.sessionId);
        setCategoryName(res.categoryName || categoryName || catId);
        setTimeLeft(res.remainingSeconds || res.durationMinutes * 60 || 900);
        setPassMark(res.passMark || 70);
        setTestStarted(true);

        if (res.isResumed) {
          showToast(t('providerTest.resumingSession', 'Resuming your active test session.'), 'info');
        }
      }
    } catch (err) {
      if (err.response?.data?.code === 'TEST_NOT_PREPARED' || err.message?.includes('prepared')) {
        setNotPreparedMessage(err.response?.data?.message || 'This test is being prepared. Please check back soon.');
      } else if (err.response?.data?.inCooldown || err.message?.toLowerCase().includes('cooldown') || err.message?.toLowerCase().includes('wait')) {
        setInCooldown(true);
        setCooldownUntil(err.response?.data?.cooldownUntil || null);
        setCooldownMessage(err.response?.data?.message || 'You must wait 24 hours before retrying this test.');
      } else if (err.response?.data?.code === 'SKILL_NOT_SELECTED') {
        setNotSelectedError(true);
      } else {
        setLoadError(err.message || 'Unable to start examination right now.');
      }
    }
  };

  // Tab switch anti-cheat tracking (informational warning count)
  useEffect(() => {
    if (!testStarted || testResult || isHubMode) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          setShowWarningModal(true);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [testStarted, testResult, isHubMode]);

  // 15:00 Countdown Timer
  useEffect(() => {
    if (!testStarted || testResult || isHubMode) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [testStarted, testResult, isHubMode]);

  const handleOptionSelect = (optionIndex) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ._id || currentQ.id]: optionIndex,
    }));
  };

  const handleSubmitExam = async () => {
    if (submitting) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      const unanswered = questions.length - answeredCount;
      const confirmSubmit = window.confirm(
        `You have ${unanswered} unanswered question(s). Unanswered questions will be counted as incorrect. Do you want to submit now?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }));

      const res = await skillTestAPI.submitTest(urlCategory, {
        sessionId,
        answers: formattedAnswers,
        warningCount: tabSwitches,
      });

      if (res.success) {
        setTestResult(res);
        if (res.passed) {
          showToast(`Congratulations! You passed with ${res.score}% (${res.badge} badge).`, 'success');
        } else {
          showToast(`Test score: ${res.score}%. A 24-hour cooldown is now active.`, 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit test. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmitOnTimeout = () => {
    showToast('Time expired! Automatically submitting your answers...', 'error');
    handleSubmitExam();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -----------------------------------------------------------------
  // VIEW 1: LOADING STATE
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>{t('providerTest.loadingSession', 'Loading test session...')}</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // VIEW 2: "YOUR SKILL TESTS" HUB (Multi-Service Overview)
  // -----------------------------------------------------------------
  if (isHubMode) {
    const skills = providerProfile?.skills || [];
    const hasAnyPassed = skills.some((s) => s.passed);

    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '88vh', padding: '40px 16px' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          
          {/* Header */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            border: '1.5px solid var(--border-light)',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', backgroundColor: 'var(--forest-50)', border: '1px solid var(--forest-100)', borderRadius: '20px', color: 'var(--forest-800)', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                  <ShieldCheck size={14} />
                  <span>{t('providerTest.verifiedTrades', 'FixNear Verified Trades')}</span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 6px 0' }}>
                  {t('providerTest.yourSkillTests', 'Your Skill Tests')}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, maxWidth: '580px', lineHeight: 1.5 }}>
                  {t('providerTest.hubSubtitle', 'Take the technical safety test for each of your selected services. Passing at least one service submits your application for verification.')}
                </p>
              </div>

              {hasAnyPassed && (
                <div style={{
                  padding: '8px 14px',
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  borderRadius: 'var(--radius-md)',
                  color: '#065F46',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{t('providerTest.verifiedEligible', 'Eligible for Verification')}</span>
                </div>
              )}
            </div>

            {/* Status Callout */}
            <div style={{
              marginTop: '20px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: hasAnyPassed ? '#F0FDF4' : '#FFFBEB',
              border: `1.5px solid ${hasAnyPassed ? '#BBF7D0' : '#FDE68A'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {hasAnyPassed ? (
                <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0 }} />
              ) : (
                <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '13.5px', color: hasAnyPassed ? '#166534' : '#92400E', lineHeight: 1.4 }}>
                {hasAnyPassed ? (
                  <>
                    <strong>{t('providerTest.passedSkillNotice', 'Great progress!')}</strong>{' '}
                    {t('providerTest.passedSkillNoticeDesc', 'You have passed at least one trade skill test. Your profile can now be reviewed by administrators. You can take tests for your other services at any time.')}
                  </>
                ) : (
                  <>
                    <strong>{t('providerTest.passOneRequired', 'Action Required:')}</strong>{' '}
                    {t('providerTest.passOneRequiredDesc', 'Complete at least one skill test with 70%+ score to move your application to "Waiting for approval".')}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* List of Selected Services & Their Test States */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            {skills.map((skill) => {
              const catId = skill.categoryId;
              const isRetestRequired = skill.status === 'retest_required';
              const isPassed = !!skill.passed && !isRetestRequired;
              const isRetakeOpen = skill.passed && skill.retakeAvailableAt && new Date() >= new Date(skill.retakeAvailableAt);

              return (
                <div
                  key={catId}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px 24px',
                    border: `1.5px solid ${isPassed ? '#86EFAC' : isRetestRequired ? '#FDE68A' : 'var(--border-light)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isPassed ? '#DCFCE7' : isRetestRequired ? '#FEF3C7' : 'var(--forest-50)',
                      color: isPassed ? '#15803D' : isRetestRequired ? '#B45309' : 'var(--forest-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getCategoryIcon(catId)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                          {skill.categoryName || catId}
                        </h3>
                        {isRetestRequired ? (
                          <span style={{
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {t('providerTest.retestRequiredBadge', 'Re-test Required by Admin')}
                          </span>
                        ) : isPassed ? (
                          <span style={{
                            backgroundColor: '#DCFCE7',
                            color: '#15803D',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {skill.badge ? `${skill.badge} Certified` : 'Passed'}
                          </span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        {isRetestRequired
                          ? `${t('providerTest.retestNotice', 'Administration required a re-test:')} ${skill.retestReason || 'Quality check'}`
                          : isPassed
                          ? `${t('providerTest.passedWithScore', 'Passed with')} ${skill.testScore || 80}% • ${t('providerTest.verifiedTradeBadge', 'Verified for customer jobs')}`
                          : skill.testScore > 0
                          ? `${t('providerTest.lastScore', 'Last score')}: ${skill.testScore}% (${t('providerTest.requires70', '70% required')})`
                          : t('providerTest.notTakenYet', 'Test not taken yet • 10 questions • 15 mins')}
                      </div>
                      {isPassed && skill.retakeAvailableAt && !isRetakeOpen && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {t('providerTest.retakeOpensNotice', 'Retake opens on')} {new Date(skill.retakeAvailableAt).toISOString().split('T')[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {isRetestRequired ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/provider/test/${catId}`)}
                        className="btn btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontWeight: 700, backgroundColor: '#D97706', color: '#FFFFFF' }}
                      >
                        <span>{t('providerTest.takeRetestBtn', 'Take Re-Test')}</span>
                        <ArrowRight size={15} />
                      </button>
                    ) : isPassed ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 700, fontSize: '13.5px' }}>
                          <CheckCircle2 size={18} />
                          <span>{t('providerTest.verifiedStatus', 'Skill Verified')}</span>
                        </div>
                        {isRetakeOpen && (
                          <button
                            type="button"
                            onClick={() => navigate(`/provider/test/${catId}`)}
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                          >
                            <span>{t('providerTest.improveBadgeBtn', 'Improve Badge (Retake)')}</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/provider/test/${catId}`)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontWeight: 700 }}
                      >
                        <span>{skill.testScore > 0 ? t('providerTest.retakeTest', 'Retake Test') : t('providerTest.startTestBtn', 'Take Test')}</span>
                        <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {skills.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
                <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('providerTest.noSkillsSelected', 'No Trade Services Selected')}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {t('providerTest.registerFirstNotice', 'Please complete your service profile registration first.')}
                </p>
                <Link to="/provider/register" className="btn btn-primary btn-sm">
                  {t('providerTest.goToRegistration', 'Complete Profile Registration')}
                </Link>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <Link to="/provider/dashboard" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} />
              <span>{t('providerTest.backToDashboard', 'Provider Dashboard')}</span>
            </Link>

            <Link to="/provider/register" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} />
              <span>{t('providerTest.editServices', 'Manage Selected Services')}</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // VIEW 3: ERROR / COOLDOWN / NOT PREPARED SCREENS
  // -----------------------------------------------------------------
  if (notSelectedError) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '60px 16px' }}>
        <div className="container" style={{ maxWidth: '580px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            boxShadow: 'var(--shadow-sm)',
            border: '1.5px solid var(--border-light)'
          }}>
            <AlertTriangle size={48} color="#D97706" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '10px' }}>
              {t('providerTest.serviceNotSelectedTitle', 'Service Not in Your Profile')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
              {t('providerTest.serviceNotSelectedMsg', 'This skill test is for a service not selected in your profile. Please add it to your services first.')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Link to="/provider/test" className="btn btn-primary">
                {t('providerTest.viewMyTests', 'View Your Skill Tests')}
              </Link>
              <Link to="/provider/dashboard" className="btn btn-outline">
                {t('providerTest.goToDashboard', 'Dashboard')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notPreparedMessage) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '60px 16px' }}>
        <div className="container" style={{ maxWidth: '580px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            boxShadow: 'var(--shadow-sm)',
            border: '1.5px solid var(--border-light)'
          }}>
            <Clock size={48} color="var(--forest-700)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '10px' }}>
              {t('providerTest.testNotPreparedTitle', 'Test Being Prepared')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
              {notPreparedMessage}
            </p>
            <Link to="/provider/test" className="btn btn-primary">
              {t('providerTest.backToMyTests', 'Back to Your Skill Tests')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (inCooldown) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '60px 16px' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            boxShadow: 'var(--shadow-md)',
            border: '1.5px solid var(--border-light)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Clock size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '10px' }}>
              {t('providerTest.cooldownTitle', '24-Hour Cooldown Active')}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              {cooldownMessage || t('providerTest.cooldownMsg', 'To protect trade quality standards, a 24-hour waiting period is required before retrying this test.')}
            </p>

            {cooldownUntil && (
              <div style={{
                backgroundColor: 'var(--bg-warm-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '24px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main)'
              }}>
                {t('providerTest.cooldownUntilLabel', 'Next attempt available at:')}{' '}
                <strong>{new Date(cooldownUntil).toLocaleString()}</strong>
              </div>
            )}

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {t('providerTest.cooldownOtherNotice', 'You can continue taking skill tests for your other selected trade services right now.')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Link to="/provider/test" className="btn btn-primary">
                {t('providerTest.backToMyTests', 'Back to Your Skill Tests')}
              </Link>
              <Link to="/provider/dashboard" className="btn btn-outline">
                {t('providerTest.goToDashboard', 'Dashboard')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '60px 16px' }}>
        <div className="container" style={{ maxWidth: '580px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            boxShadow: 'var(--shadow-sm)',
            border: '1.5px solid var(--border-light)'
          }}>
            <XCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '10px' }}>
              {t('providerTest.loadErrorTitle', 'Unable to Load Test')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
              {loadError}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  startOrResumeTest(urlCategory);
                }}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={16} />
                <span>{t('common.tryAgain', 'Try Again')}</span>
              </button>
              <Link to="/provider/test" className="btn btn-outline">
                {t('providerTest.backToMyTests', 'Back to Your Skill Tests')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // VIEW 4: TEST RESULTS SCREEN (Passed or Failed with Weak Topics)
  // -----------------------------------------------------------------
  if (testResult) {
    const isPassed = testResult.passed;

    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '88vh', padding: '60px 16px' }}>
        <div className="container" style={{ maxWidth: '620px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 36px',
            boxShadow: 'var(--shadow-md)',
            border: `2px solid ${isPassed ? 'var(--forest-600)' : '#EF4444'}`
          }}>
            {/* Header Icon */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: isPassed ? 'var(--forest-100)' : '#FEE2E2',
              color: isPassed ? 'var(--forest-800)' : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              {isPassed ? <Award size={36} /> : <XCircle size={36} />}
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '8px' }}>
              {isPassed ? t('providerTest.passedTitle', 'Skill Assessment Passed! 🎉') : t('providerTest.failedTitle', 'Assessment Not Cleared')}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
              {categoryName} • {isPassed ? `${testResult.badge || 'Verified'} Certified` : t('providerTest.requires70', 'Score below 70%')}
            </p>

            {/* Score Ring / Card */}
            <div style={{
              backgroundColor: isPassed ? 'var(--forest-50)' : '#FEF2F2',
              border: `1.5px solid ${isPassed ? 'var(--forest-200)' : '#FECACA'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              marginBottom: '28px'
            }}>
              <div style={{ fontSize: '42px', fontWeight: 900, color: isPassed ? 'var(--forest-800)' : '#DC2626' }}>
                {testResult.score}%
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {testResult.correctAnswers} / {testResult.totalQuestions} {t('providerTest.questionsCorrect', 'questions answered correctly')}
              </div>
            </div>

            {/* Weak Topics Section if failed */}
            {!isPassed && testResult.weakTopics && testResult.weakTopics.length > 0 && (
              <div style={{ textAlign: 'left', marginBottom: '24px', backgroundColor: '#FFF7ED', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid #FFEDD5' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {t('providerTest.weakTopicsTitle', 'Recommended Topics to Review:')}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#9A3412', lineHeight: 1.6 }}>
                  {testResult.weakTopics.map((topic, i) => (
                    <li key={i}><strong>{topic}</strong></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cooldown Information if failed */}
            {!isPassed && testResult.cooldownUntil && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>
                {t('providerTest.cooldownNotice', 'A 24-hour revision period is now active. Next attempt opens on:')}{' '}
                <strong>{new Date(testResult.cooldownUntil).toLocaleString()}</strong>
              </div>
            )}

            {/* Passed Next Steps */}
            {isPassed && (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '28px', textAlign: 'left', fontSize: '13.5px', color: '#166534', lineHeight: 1.5 }}>
                <strong>{t('providerTest.whatNextTitle', 'What happens next?')}</strong>{' '}
                {testResult.newStatus === 'waiting_for_approval'
                  ? t('providerTest.waitingApprovalNotice', 'Your KYC documents and passed skill test have been submitted to administration for verification. Once approved, you can go online to receive customer jobs!')
                  : t('providerTest.skillAddedNotice', 'This skill is now verified on your profile. You can now take tests for your other selected services or manage your jobs.')}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/provider/test" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} />
                <span>{t('providerTest.viewAllMyTests', 'All Skill Tests')}</span>
              </Link>
              <Link to="/provider/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>{t('providerTest.goToDashboard', 'Go to Dashboard')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // VIEW 5: ACTIVE QUESTION EXAM VIEW (10 Questions, Timer, Progress)
  // -----------------------------------------------------------------
  const currentQ = questions[currentIndex];

  if (!currentQ || !(currentQ.questionText || currentQ.question)) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '60px 16px' }}>
        <div className="container" style={{ maxWidth: '580px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            boxShadow: 'var(--shadow-sm)',
            border: '1.5px solid var(--border-light)'
          }}>
            <AlertTriangle size={48} color="#D97706" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '10px' }}>
              {t('providerTest.questionUnavailable', 'Question Data Unavailable')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              {t('providerTest.questionUnavailableMsg', 'Could not load question details. Please try again.')}
            </p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                startOrResumeTest(urlCategory);
              }}
              className="btn btn-primary"
            >
              {t('common.tryAgain', 'Try Again')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '90vh', padding: '32px 16px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        
        {/* Exam Navigation Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '16px 24px',
          border: '1.5px solid var(--border-light)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div>
            <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              {categoryName} • {currentQ.topic || 'Trade Skills'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--forest-950)', marginTop: '2px' }}>
              {t('providerTest.questionOf', 'Question')} {currentIndex + 1} / {questions.length}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Timer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: timeLeft < 120 ? '#FEE2E2' : 'var(--forest-50)',
              color: timeLeft < 120 ? '#DC2626' : 'var(--forest-800)',
              fontWeight: 800,
              fontSize: '14px',
              border: `1.5px solid ${timeLeft < 120 ? '#FCA5A5' : 'var(--forest-200)'}`
            }}>
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Anti-cheat tab switch counter */}
            {tabSwitches > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#D97706',
                fontWeight: 700,
                backgroundColor: '#FEF3C7',
                padding: '4px 10px',
                borderRadius: '12px'
              }}>
                <ShieldAlert size={14} />
                <span>{tabSwitches} {t('providerTest.warnings', 'tab switch warning(s)')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--border-light)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: 'var(--forest-700)',
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Question Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid var(--border-light)',
          marginBottom: '24px'
        }}>
          {/* Question Text */}
          <h2 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--forest-950)',
            lineHeight: 1.5,
            marginBottom: '26px'
          }}>
            {currentQ.questionText || currentQ.question}
          </h2>

          {/* 4 Large Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQ.options?.map((opt, optIdx) => {
              const isSelected = answers[currentQ._id || currentQ.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleOptionSelect(optIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${isSelected ? 'var(--forest-600)' : 'var(--border-light)'}`,
                    backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    userSelect: 'none'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--forest-600)' : '#CBD5E1'}`,
                    backgroundColor: isSelected ? 'var(--forest-600)' : '#F8FAFC',
                    color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                    flexShrink: 0
                  }}>
                    {isSelected ? <Check size={16} /> : String.fromCharCode(65 + optIdx)}
                  </div>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--forest-950)' : 'var(--text-main)',
                    lineHeight: 1.4
                  }}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation & Submit Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>{t('common.previous', 'Previous')}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>{t('common.next', 'Next')}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontWeight: 800 }}
              >
                {submitting ? t('providerTest.submitting', 'Submitting...') : t('providerTest.submitExam', 'Submit Examination')}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Anti-cheat tab switch warning modal */}
      {showWarningModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <ShieldAlert size={44} color="#D97706" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '8px' }}>
              {t('providerTest.tabSwitchWarningTitle', 'Tab Switch Detected')}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              {t('providerTest.tabSwitchWarningDesc', 'FixNear Trust enforces exam integrity. Tab-switching is logged and recorded with your test attempt. Please stay on this tab until test completion.')}
            </p>
            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              {t('common.iUnderstand', 'I Understand, Return to Test')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
