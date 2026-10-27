// ===================================================================
// FixNear Trust - Mandatory Anti-Cheat Skill Test Engine
// 10 Random Category Questions | 15:00 Countdown | Tab Switch Guard
// 70% Pass Threshold | 24-Hour Cooldown on Failure
// ===================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function ProviderSkillTestPage() {
  const { categoryId: urlCategory } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, providerProfile, updateProviderProfile } = useAuth();
  const { categories, getCategoryQuestions, submitTestAttempt, technicians } = useStore();
  const { showToast } = useToast();

  const selectedCategory = urlCategory || providerProfile?.category || providerProfile?.skills?.[0] || 'ac-cooling';
  const categoryMeta = categories.find(c => c.id === selectedCategory) || {
    id: selectedCategory,
    name: "Specialized Craft",
    icon: "Wrench"
  };

  const providerId = providerProfile?.userId || currentUser?.uid || "provider-demo-1";
  const currentTech = technicians.find(t => t.id === providerId || t.userId === providerId);

  // Check 24-hour cooldown
  const existingCooldown = currentTech?.cooldownUntil;
  const isCooldownActive = existingCooldown && new Date(existingCooldown).getTime() > Date.now();

  // Test State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIdx]: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [lastWarningText, setLastWarningText] = useState('');
  const [startTimeStamp, setStartTimeStamp] = useState(Date.now());

  const timerRef = useRef(null);
  const testStorageKey = `fixnear_exam_${selectedCategory}_${providerId}`;

  // Initialize or resume exam with SANITIZED questions
  const handleStartExam = async () => {
    // Check local storage for existing session
    const saved = localStorage.getItem(testStorageKey);
    let qList = [];
    let startTs = Date.now();
    let prevAnswers = {};
    let prevSwitches = 0;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
        if (elapsed < 900) {
          qList = parsed.questions;
          startTs = parsed.startTime;
          prevAnswers = parsed.answers || {};
          prevSwitches = parsed.tabSwitches || 0;
          setTimeLeft(900 - elapsed);
        } else {
          localStorage.removeItem(testStorageKey);
          qList = await getCategoryQuestions(selectedCategory);
        }
      } catch {
        qList = await getCategoryQuestions(selectedCategory);
      }
    } else {
      qList = await getCategoryQuestions(selectedCategory);
      localStorage.setItem(testStorageKey, JSON.stringify({
        questions: qList,
        startTime: startTs,
        answers: {},
        tabSwitches: 0
      }));
    }

    setStartTimeStamp(startTs);
    setQuestions(qList);
    setAnswers(prevAnswers);
    setTabSwitches(prevSwitches);
    setTestStarted(true);
  };

  // Submit Handler to Secure Server Evaluator
  const handleFinishExam = useCallback(async (forcedReason = null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem(testStorageKey);

    try {
      // Map numerical index answers to question IDs for secure server evaluation
      const formattedAnswers = {};
      questions.forEach((q, idx) => {
        if (answers[idx] !== undefined) {
          formattedAnswers[q.id] = answers[idx];
        }
      });

      const result = await submitTestAttempt({
        providerId,
        categoryId: selectedCategory,
        categoryName: categoryMeta.name,
        answers: formattedAnswers,
        startTime: startTimeStamp,
        tabSwitches: forcedReason ? tabSwitches + 1 : tabSwitches
      });

      if (updateProviderProfile) {
        updateProviderProfile({
          status: result.passed ? 'under_review' : 'test_failed',
          testScore: result.score,
          cooldownUntil: result.cooldownUntil
        });
      }

      setTestResult(result);
      setTestSubmitted(true);

      if (forcedReason) {
        showToast(forcedReason, 'error');
      } else if (result.passed) {
        showToast(`Congratulations! You passed with ${result.score}%!`, 'success');
      } else {
        showToast(`Score: ${result.score}%. Minimum 70% required to pass.`, 'error');
      }
    } catch (err) {
      console.error("Test evaluation error:", err);
      showToast(err.message || "Evaluation error", 'error');
    }
  }, [answers, categoryMeta.name, providerId, questions, selectedCategory, startTimeStamp, submitTestAttempt, tabSwitches, testStorageKey, updateProviderProfile, showToast]);

  // Anti-Cheat: Tab Switch Detection
  useEffect(() => {
    if (!testStarted || testSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount === 1) {
            setLastWarningText("Warning 1 of 3: Tab switch detected! FixNear tests must be taken without opening other tabs or windows.");
            setShowWarningModal(true);
          } else if (newCount === 2) {
            setLastWarningText("Warning 2 of 3: FINAL WARNING! Navigating away one more time will immediately auto-submit your exam.");
            setShowWarningModal(true);
          } else if (newCount >= 3) {
            handleFinishExam("Exam auto-submitted due to 3 unauthorized tab switches!");
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testStarted, testSubmitted, handleFinishExam]);

  // 15-Minute Countdown Timer
  useEffect(() => {
    if (!testStarted || testSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinishExam("Time's up! Exam submitted automatically.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted, testSubmitted, handleFinishExam]);

  // Anti-Cheat: Prevent Copy, Paste, Cut & Context Menu
  const handlePreventCheating = (e) => {
    e.preventDefault();
    showToast("Copying, pasting, and right-click are strictly disabled during certification exams.", "warning");
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers(prev => {
      const updated = { ...prev, [currentIndex]: optionIndex };
      // Sync to local storage
      const saved = localStorage.getItem(testStorageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          localStorage.setItem(testStorageKey, JSON.stringify({ ...parsed, answers: updated }));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimerCritical = timeLeft < 120; // under 2 mins

  const answeredCount = Object.keys(answers).length;

  // 1. Cooldown Screen
  if (isCooldownActive) {
    const cooldownDate = new Date(existingCooldown);
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '48px 16px' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="card" style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <Clock size={32} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#991B1B', marginBottom: '8px' }}>
              24-Hour Retake Cooldown Active
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              To uphold high workmanship standards for homeowners, FixNear requires a mandatory 24-hour study period before re-attempting the skill test.
            </p>
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-warm)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13.5px',
              color: 'var(--forest-900)',
              marginBottom: '28px',
              border: '1px solid var(--border-light)'
            }}>
              Eligible to re-attempt after: <strong>{cooldownDate.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/provider/dashboard" className="btn btn-primary">
                <span>Go to Provider Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Pre-Test Instructions Screen
  if (!testStarted) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '40px 16px 80px 16px' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          
          <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--forest-100)',
                color: 'var(--forest-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                    Mandatory Certification
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    FixNear Skill Verification
                  </span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '4px' }}>
                  {categoryMeta.name} Technical Assessment
                </h1>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              marginBottom: '28px'
            }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-warm)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Questions</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '2px' }}>10 Practical</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Single-choice MCQs</div>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-warm)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Time Allowed</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '2px' }}>15 Minutes</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Non-stop countdown</div>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-warm)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pass Threshold</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>70% (7/10)</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Gold Badge at 90%+</div>
              </div>
            </div>

            {/* Anti-Cheat Rules Box */}
            <div style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>
                <ShieldAlert size={18} />
                <span>FixNear Anti-Cheat System Rules</span>
              </div>
              <ul style={{ fontSize: '13px', color: '#7F1D1D', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.4 }}>
                <li><strong>Tab-Switch Monitoring:</strong> Navigating away from this window triggers warnings. On the 3rd tab switch, the test auto-submits immediately.</li>
                <li><strong>Clipboard Disabled:</strong> Copy, paste, and cut commands are blocked.</li>
                <li><strong>Timer Persistence:</strong> Refreshing or closing the browser does NOT reset the 15-minute countdown clock.</li>
                <li><strong>24-Hour Cooldown:</strong> If you score below 70%, retakes are locked for 24 hours while you study the missed concepts.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/provider/dashboard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} />
                <span>Return to Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={handleStartExam}
                className="btn btn-primary"
                style={{ padding: '14px 36px', fontSize: '15px', fontWeight: 800 }}
              >
                <span>I Understand, Begin Test Now</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // 3. Post-Test Results Screen
  if (testSubmitted && testResult) {
    const isPass = testResult.passed;
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '40px 16px 80px 16px' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', marginBottom: '28px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: isPass ? 'var(--forest-100)' : '#FEE2E2',
                color: isPass ? 'var(--forest-700)' : '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                {isPass ? <Award size={36} /> : <XCircle size={36} />}
              </div>

              <div style={{ display: 'inline-block', marginBottom: '8px' }}>
                <span className={`badge ${isPass ? 'badge-forest' : 'badge-demo'}`} style={{ fontSize: '12px' }}>
                  {isPass ? `${testResult.badge} Verified Specialist` : 'Needs Improvement'}
                </span>
              </div>

              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-900)' }}>
                {isPass ? 'Skill Assessment Passed!' : 'Assessment Not Cleared'}
              </h1>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '8px auto 0 auto' }}>
                {isPass 
                  ? `Your score of ${testResult.score}% meets FixNear standards. Your application has been moved to 'Under Review' for admin approval.`
                  : `You scored ${testResult.score}% (${testResult.correctCount}/${testResult.totalQuestions}). A minimum score of 70% is required. Please review the topics below and re-test in 24 hours.`
                }
              </p>
            </div>

            {/* Score Summary Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'var(--bg-warm)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              marginBottom: '28px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Final Score</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: isPass ? 'var(--forest-800)' : '#B91C1C' }}>
                  {testResult.score}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Correct Answers</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {testResult.correctCount} / {testResult.totalQuestions}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Time Spent</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {Math.floor(testResult.timeSpentSeconds / 60)}m {testResult.timeSpentSeconds % 60}s
                </div>
              </div>
            </div>

            {/* Weak Topics & Diagnostic Feedback (Returned securely by Server) */}
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="var(--forest-700)" />
                <span>Diagnostic Assessment & Weak Topics Analysis</span>
              </h2>

              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isPass ? '#F0FDF4' : '#FEF2F2',
                border: `1.5px solid ${isPass ? '#86EFAC' : '#FCA5A5'}`
              }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: isPass ? '#166534' : '#991B1B', marginBottom: '8px' }}>
                  {isPass ? '✓ Competency Profile: Verified' : '⚠ Skill Diagnostic: Topics Requiring Revision Before Retest'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {testResult.weakTopics && testResult.weakTopics.map((topic, i) => (
                    <span 
                      key={i} 
                      className={`badge ${isPass ? 'badge-forest' : 'badge-red'}`} 
                      style={{ fontSize: '13px', padding: '6px 12px' }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.5 }}>
                  {isPass
                    ? "Your responses demonstrated safe trade handling, correct equipment diagnostics, and high adherence to FixNear safety standards."
                    : "Review the flagged trade topics above in your trade manual. In accordance with platform security rules, you can re-attempt the assessment after the 24-hour cooldown expires."}
                </p>
              </div>
            </div>

            {/* Test Integrity & Anti-Cheat Summary */}
            <div style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-warm)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <strong style={{ fontSize: '13.5px', color: 'var(--forest-900)' }}>Test Integrity Audit Log</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Recorded during 15:00 session: <strong>{testResult.tabSwitches || 0} tab switch warnings</strong>
                </div>
              </div>
              <span className={`badge ${testResult.tabSwitches === 0 ? 'badge-forest' : testResult.tabSwitches > 1 ? 'badge-yellow' : 'badge-sage'}`}>
                {testResult.tabSwitches === 0 ? 'Verified High Integrity' : `${testResult.tabSwitches} Warnings Logged`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link to="/provider/dashboard" className="btn btn-primary" style={{ padding: '12px 36px' }}>
                <span>Continue to Provider Console</span>
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // 4. Live Exam Screen (1 question per screen)
  return (
    <div 
      onCopy={handlePreventCheating}
      onPaste={handlePreventCheating}
      onCut={handlePreventCheating}
      onContextMenu={handlePreventCheating}
      style={{ backgroundColor: 'var(--bg-warm)', minHeight: '90vh', padding: '24px 16px 80px 16px', userSelect: 'none' }}
    >
      <div className="container" style={{ maxWidth: '820px' }}>
        
        {/* Anti-Cheat Tab Warning Modal */}
        {showWarningModal && (
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
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
              border: '2px solid #EF4444'
            }}>
              <AlertTriangle size={48} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#991B1B', marginBottom: '8px' }}>
                Anti-Cheat Security Warning
              </h2>
              <p style={{ fontSize: '14px', color: '#7F1D1D', lineHeight: 1.5, marginBottom: '20px' }}>
                {lastWarningText}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowWarningModal(false)}
                style={{ backgroundColor: '#DC2626', width: '100%', padding: '12px' }}
              >
                I Understand — Resume Exam
              </button>
            </div>
          </div>
        )}

        {/* Top Floating Sticky Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '16px 24px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              {categoryMeta.name} Certification Exam
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--forest-900)' }}>
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Warning indicator */}
            {tabSwitches > 0 && (
              <span className="badge badge-demo" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                <AlertTriangle size={12} />
                <span>Switches: {tabSwitches}/3</span>
              </span>
            )}

            {/* Countdown Clock */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isTimerCritical ? '#FEE2E2' : 'var(--forest-50)',
              border: `1.5px solid ${isTimerCritical ? '#EF4444' : 'var(--forest-200)'}`,
              color: isTimerCritical ? '#B91C1C' : 'var(--forest-800)',
              fontWeight: 800,
              fontSize: '16px',
              letterSpacing: '0.05em'
            }}>
              <Clock size={18} />
              <span>{timerDisplay}</span>
            </div>
          </div>
        </div>

        {/* Question Stepper Indicator Dots */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '6px',
          marginBottom: '20px'
        }}>
          {questions.map((_, idx) => {
            const isAnswered = answers[idx] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                style={{
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isCurrent ? 'var(--forest-700)' : isAnswered ? 'var(--forest-100)' : '#FFFFFF',
                  color: isCurrent ? '#FFFFFF' : isAnswered ? 'var(--forest-800)' : 'var(--text-muted)',
                  border: isCurrent ? '2px solid var(--forest-800)' : '1px solid var(--border-light)',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question Card */}
        {currentQ && (
          <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="badge badge-forest" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                Difficulty: {currentQ.difficulty || 'Practical'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {answeredCount} of {questions.length} answered
              </span>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', lineHeight: 1.45, marginBottom: '24px' }}>
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentIndex] === optIdx;
                const optionLetters = ['A', 'B', 'C', 'D'];
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-lg)',
                      border: isSelected ? '2px solid var(--forest-700)' : '1.5px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--forest-700)' : 'var(--bg-warm)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0
                    }}>
                      {isSelected ? <Check size={16} /> : optionLetters[optIdx]}
                    </div>
                    <div style={{ fontSize: '14px', color: isSelected ? 'var(--forest-900)' : 'var(--text-secondary)', fontWeight: isSelected ? 700 : 500, lineHeight: 1.4 }}>
                      {opt}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Navigation Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: currentIndex === 0 ? 0.5 : 1 }}
          >
            <ArrowLeft size={16} />
            <span>Previous Question</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Next Question</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleFinishExam()}
              className="btn btn-primary"
              style={{
                backgroundColor: '#16A34A',
                padding: '12px 28px',
                fontSize: '14.5px',
                fontWeight: 800
              }}
            >
              <CheckCircle2 size={16} />
              <span>Submit Assessment ({answeredCount}/{questions.length})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
