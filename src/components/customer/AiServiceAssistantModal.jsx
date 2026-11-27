// ===================================================================
// FixNear Trust - AI Customer Problem Diagnosis & Guidance Assistant
// Natural language problem symptom parser, safety hazard detector,
// and smart service matching modal
// ===================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react';
import { aiAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function AiServiceAssistantModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const { t } = useLanguage();
  const [problemText, setProblemText] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [error, setError] = useState('');

  const quickPrompts = [
    'Bathroom tap leaking continuously under the sink',
    'Main power switch tripping when geyser is switched on',
    'Split AC not blowing cold air and making rattling noise',
    'Front wooden door lock stuck and handle is loose',
  ];

  const handleAnalyze = async (textToAnalyze) => {
    const input = textToAnalyze || problemText;
    if (!input || !input.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await aiAPI.diagnose(input.trim());
      if (res.success && res.diagnosis) {
        setDiagnosis(res.diagnosis);
      }
    } catch (err) {
      setError(err.message || 'Unable to diagnose issue right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedBooking = () => {
    onClose();
    if (diagnosis?.categoryId) {
      navigate(`/book?category=${diagnosis.categoryId}`);
    } else {
      navigate('/book');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(14, 27, 21, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1.5px solid var(--border-light)',
          animation: 'fadeInSlide 180ms ease'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--forest-100)',
              color: 'var(--forest-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="var(--forest-700)" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                {t('home.aiAssistantTitle', 'FixNear AI Assistant')}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {t('home.aiAssistantSub', 'Describe your repair problem in plain words')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Quick Issue Chips */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              {t('home.commonHomeIssues', 'Common Home Issues:')}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setProblemText(prompt);
                    handleAnalyze(prompt);
                  }}
                  style={{
                    backgroundColor: 'var(--bg-warm)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '5px 10px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Input Area */}
          <div style={{ marginBottom: '20px' }}>
            <textarea
              rows={3}
              className="input"
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="e.g. Water is leaking from the kitchen sink pipe and flooding my cabinet floor..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13.5px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                outline: 'none',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => handleAnalyze()}
                disabled={loading || !problemText.trim()}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
              >
                {loading ? (
                  <>
                    <div className="spinner-sm" />
                    <span>{t('home.analyzingIssue', 'Analyzing Issue...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>{t('home.analyzeAndMatch', 'Analyze & Match Service')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#B91C1C', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Diagnosis Result Card */}
          {diagnosis && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--forest-100)',
              padding: '18px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Safety Hazard Alert if Detected */}
              {diagnosis.hasHazard && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #EF4444',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#991B1B' }}>
                      {t('home.safetyNoticeTitle', 'Immediate Safety Precaution Advised')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '2px', lineHeight: 1.45 }}>
                      {diagnosis.hazardAlert}
                    </div>
                  </div>
                </div>
              )}

              {/* Matched Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <span className="badge badge-forest" style={{ fontSize: '11px', marginBottom: '4px' }}>
                    {diagnosis.categoryName}
                  </span>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', margin: '4px 0' }}>
                    {diagnosis.recommendedService}
                  </h4>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <span>{t('home.estimatedDoorstepRate', 'Estimated Doorstep Rate:')}</span> <strong style={{ color: 'var(--forest-800)' }}>{diagnosis.estimatedPriceRange}</strong>
                  </div>
                </div>

                <div style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--forest-50)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--forest-800)',
                  fontWeight: 700
                }}>
                  {`${Math.round(diagnosis.confidence * 100)}% ${t('home.matchConfidence', 'Match Confidence')}`}
                </div>
              </div>

              {/* Troubleshooting Tips */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {t('home.prepTipsTitle', 'Preparation Tips Before Specialist Arrives:')}
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {diagnosis.troubleshootingTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Direct Booking CTA */}
              <button
                type="button"
                onClick={handleProceedBooking}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontWeight: 700 }}
              >
                <span>{t('home.bookThisVerifiedService', 'Book This Verified Service')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
