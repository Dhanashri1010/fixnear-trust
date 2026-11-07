// ===================================================================
// FixNear Trust - Mandatory Anti-Cheat Skill Test Engine
// 10 Random Category Questions | 15:00 Countdown | Tab Switch Counter
// 70% Pass Threshold | 24-Hour Cooldown on Failure
// Connected Directly to MongoDB REST API & Server Evaluator
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
  HelpCircle,
  Briefcase,
  Flame,
  Check,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { skillTestAPI, servicesAPI, providersAPI } from '../../services/api';

export default function ProviderSkillTestPage() {
  const { categoryId: urlCategory } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [categoryId, setCategoryId] = useState(urlCategory || 'ac-cooling');
  const [categoryName, setCategoryName] = useState('Air Conditioner');
  const [categories, setCategories] = useState([]);

  // Session & Question State from Server
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(900); // in seconds
  const [passMark, setPassMark] = useState(70);

  // Status flags
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [inCooldown, setInCooldown] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);

  // Tab switch counter (informational only)
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const timerRef = useRef(null);

  // Fetch categories and provider profile to determine target category
  useEffect(() => {
    let isMounted = true;
    const fetchMeta = async () => {
      try {
        const [catsRes, provRes] = await Promise.allSettled([
          servicesAPI.getCategories(),
          providersAPI.getMyProfile(),
        ]);

        if (isMounted && catsRes.status === 'fulfilled' && catsRes.value?.categories) {
          setCategories(catsRes.value.categories);
        }

        if (isMounted && provRes.status === 'fulfilled' && provRes.value?.provider) {
          const prov = provRes.value.provider;
          const assignedCat = prov.skills?.[0]?.categoryId || urlCategory || 'ac-cooling';
          setCategoryId(assignedCat);
          const matched = catsRes.value?.categories?.find((c) => (c.categoryId || c.id) === assignedCat);
          if (matched) setCategoryName(matched.name);
        }
      } catch (err) {
        console.warn('Metadata fetch notice:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMeta();
    return () => { isMounted = false; };
  }, [urlCategory]);

  // Tab switch anti-cheat tracking (informational warning count)
  useEffect(() => {
    if (!testStarted || testResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const updated = prev + 1;
          setShowWarningModal(true);
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testStarted, testResult]);

  // Timer countdown
  useEffect(() => {
    if (!testStarted || testResult || timeLeft <= 0) return;

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
  }, [testStarted, testResult, timeLeft]);

  // Start or resume test
  const handleStartExam = async () => {
    setLoading(true);
    try {
      const res = await skillTestAPI.startTest(categoryId);
      if (res.success && res.questions) {
        setSessionId(res.sessionId);
        setQuestions(res.questions);
        setCategoryName(res.categoryName || categoryName);
        setPassMark(res.passMark || 70);
        setTimeLeft(res.remainingSeconds || res.durationMinutes * 60 || 900);
        setTestStarted(true);

        if (res.isResumed) {
          showToast('Resuming your active test session.', 'info');
        } else {
          showToast('Skill test started. You have 15 minutes to complete 10 questions.', 'info');
        }
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('cooldown') || err.message?.toLowerCase().includes('wait')) {
        setInCooldown(true);
      }
      showToast(err.message || 'Unable to start examination right now.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Option selection
  const handleOptionSelect = (optionIndex) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ._id || currentQ.id]: optionIndex,
    }));
  };

  // Submit test
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

      const res = await skillTestAPI.submitTest(categoryId, {
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

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading skill test session...</p>
        </div>
      </div>
    );
  }

  // Cooldown active screen
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

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
              Skill Test Cooldown Active
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              To uphold high workmanship and customer safety standards on FixNear Trust, a mandatory <strong>24-hour study and preparation cooldown</strong> is enforced following an unsuccessful test attempt.
            </p>

            <div style={{
              backgroundColor: 'var(--forest-50)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '28px',
              border: '1px solid var(--forest-100)',
              fontSize: '13px',
              color: 'var(--forest-800)'
            }}>
              Please review standard safety codes, manufacturer technical specifications, and diagnostic procedures. You will be able to retake the test once the cooldown timer elapses.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/provider" className="btn btn-secondary">
                <span>Go to Dashboard</span>
              </Link>
              <Link to="/services" className="btn btn-outline">
                <span>Browse Service Rate Cards</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-test Intro / Start Screen
  if (!testStarted && !testResult) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '40px 16px 80px' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '36px',
            boxShadow: 'var(--shadow-sm)',
            border: '1.5px solid var(--border-light)'
          }}>
            
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--forest-100)',
                color: 'var(--forest-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <ShieldCheck size={32} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)', margin: '0 0 6px' }}>
                Practical Safety Skill Assessment
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                Category: <strong>{categoryName}</strong>
              </p>
            </div>

            {/* Assessment Rules */}
            <div style={{
              backgroundColor: 'var(--forest-50)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: '28px',
              border: '1px solid var(--forest-100)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)', margin: '0 0 12px' }}>
                Exam Structure & Anti-Cheat Rules:
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--forest-800)', lineHeight: 1.8 }}>
                <li><strong>10 Shuffled Questions</strong> pulled dynamically from the server question bank.</li>
                <li><strong>15 Minutes Countdown</strong> (starts immediately when you click Start).</li>
                <li><strong>Pass Mark: 70%</strong> (at least 7 correct answers).</li>
                <li><strong>Badges:</strong> Bronze (70-79%), Silver (80-89%), Gold (90-100%).</li>
                <li><strong>24-Hour Cooldown:</strong> Enforced automatically if the pass mark is not met.</li>
                <li><strong>Browser Tab Switches:</strong> Recorded as informational integrity checks.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartExam}
                style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Start 15-Minute Exam</span>
                <ArrowRight size={18} />
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Test Results Screen
  if (testResult) {
    const isPassed = testResult.passed;
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '50px 16px 80px' }}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            boxShadow: 'var(--shadow-md)',
            border: '1.5px solid var(--border-light)'
          }}>

            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: isPassed ? 'var(--forest-100)' : '#FEF2F2',
              color: isPassed ? 'var(--forest-700)' : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              {isPassed ? <Award size={40} /> : <XCircle size={40} />}
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)', margin: '0 0 8px' }}>
              {isPassed ? 'Skill Test Passed!' : 'Assessment Not Passed'}
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
              {isPassed
                ? 'Your technical knowledge and safety protocol score has been verified and submitted for administrative approval.'
                : 'You scored below the required 70% threshold. Please review safety codes and try again after the cooldown.'}
            </p>

            {/* Score & Badge Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: isPassed ? 'var(--forest-50)' : '#FEF2F2',
              border: `1.5px solid ${isPassed ? 'var(--forest-200)' : '#FCA5A5'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '16px 28px',
              marginBottom: '28px'
            }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: isPassed ? 'var(--forest-800)' : '#DC2626' }}>
                  {testResult.score}%
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {testResult.correctAnswers} / {testResult.totalQuestions} Correct
                </div>
              </div>
              {testResult.badge && testResult.badge !== 'None' && (
                <div style={{
                  borderLeft: '1.5px solid var(--border-light)',
                  paddingLeft: '16px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--forest-900)' }}>
                    {testResult.badge} Badge
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--forest-700)' }}>
                    Verified Safety Rating
                  </div>
                </div>
              )}
            </div>

            {/* Weak topics on failure */}
            {!isPassed && testResult.weakTopics && testResult.weakTopics.length > 0 && (
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '28px',
                fontSize: '13px'
              }}>
                <div style={{ fontWeight: 700, color: '#92400E', marginBottom: '6px' }}>Areas to Improve:</div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350F' }}>
                  {testResult.weakTopics.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/provider" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                <span>Go to Provider Dashboard</span>
              </Link>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Active Test Question Screen
  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '90vh', padding: '32px 16px 80px' }}>
      <div className="container" style={{ maxWidth: '740px' }}>

        {/* Top Timer & Header Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '18px 24px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-700)', textTransform: 'uppercase' }}>
              Skill Test • {categoryName}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: timeLeft < 180 ? '#FEF2F2' : 'var(--forest-50)',
            color: timeLeft < 180 ? '#DC2626' : 'var(--forest-800)',
            padding: '8px 16px',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '15px',
            border: `1.5px solid ${timeLeft < 180 ? '#FCA5A5' : 'var(--forest-200)'}`
          }}>
            <Clock size={18} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '6px',
          backgroundColor: 'var(--border-light)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: 'var(--forest-600)',
            width: `${progressPercent}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Question Card */}
        {currentQ && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)',
            border: '1.5px solid var(--border-light)',
            marginBottom: '24px'
          }}>
            
            <h2 style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--forest-950)',
              lineHeight: 1.5,
              marginBottom: '24px'
            }}>
              {currentQ.questionText || currentQ.question}
            </h2>

            {/* Options */}
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
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${isSelected ? 'var(--forest-600)' : 'var(--border-light)'}`,
                      backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--forest-600)' : 'var(--border-light)'}`,
                      backgroundColor: isSelected ? 'var(--forest-600)' : 'transparent',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px',
                      flexShrink: 0
                    }}>
                      {isSelected ? <Check size={14} /> : String.fromCharCode(65 + optIdx)}
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'var(--forest-950)' : 'var(--text-main)'
                    }}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* Navigation / Submit Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {Object.keys(answers).length} of {questions.length} Answered
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitExam}
              disabled={submitting}
              style={{ backgroundColor: 'var(--forest-700)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Exam</span>
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab switch warning alert modal */}
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
              maxWidth: '460px',
              width: '100%',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <AlertTriangle size={42} color="#D97706" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: '0 0 8px' }}>
                Tab Switch Detected
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
                You navigated away from the assessment window. Anti-cheat integrity tracking has logged <strong>{tabSwitches}</strong> window change(s) for audit. Please keep this tab focused.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowWarningModal(false)}
                style={{ width: '100%' }}
              >
                Return to Assessment
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
