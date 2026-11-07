// ===================================================================
// FixNear Trust - Admin Provider Approval Desk (Phase D)
// Real MongoDB Data | Signed Document Preview | Exam Audit History
// Approve / Reject (Reason Required) / Request Info (Message Required)
// ===================================================================

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Award, 
  Clock, 
  Phone, 
  MapPin, 
  Briefcase, 
  Eye, 
  X, 
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import InitialsAvatar from '../common/InitialsAvatar';

export default function AdminApprovalsDesk() {
  const { showToast } = useToast();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [candidateDetail, setCandidateDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Document modal preview
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const [previewDocTitle, setPreviewDocTitle] = useState('');

  // Modals for actions
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Govt ID document details unreadable or invalid. Please re-upload clear proof.');

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState('Please upload a clear government photo ID with your name and address visible.');

  const [processing, setProcessing] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getApprovals();
      if (res.success) {
        setCandidates(res.candidates || []);
        if (res.candidates && res.candidates.length > 0) {
          setSelectedCandidateId(res.candidates[0]._id);
        } else {
          setSelectedCandidateId(null);
          setCandidateDetail(null);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load approvals queue.');
      showToast('Approvals error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Fetch full details whenever selectedCandidateId changes
  useEffect(() => {
    if (!selectedCandidateId) {
      setCandidateDetail(null);
      return;
    }

    let isMounted = true;
    const fetchDetails = async () => {
      setDetailLoading(true);
      try {
        const res = await adminAPI.getProviderDetails(selectedCandidateId);
        if (isMounted && res.success) {
          setCandidateDetail(res);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load candidate details:', err);
          showToast('Could not load provider documents: ' + err.message, 'error');
        }
      } finally {
        if (isMounted) setDetailLoading(false);
      }
    };

    fetchDetails();
    return () => { isMounted = false; };
  }, [selectedCandidateId]);

  const handleApprove = async () => {
    if (!selectedCandidateId) return;
    setProcessing(true);
    try {
      const res = await adminAPI.approveProvider(selectedCandidateId);
      showToast(res.message || 'Provider application approved! Partner is now active.', 'success');
      fetchCandidates();
    } catch (err) {
      showToast('Approval failed: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedCandidateId || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      const res = await adminAPI.rejectProvider(selectedCandidateId, rejectReason.trim());
      showToast(res.message || 'Provider rejected with notification sent.', 'info');
      setRejectModalOpen(false);
      fetchCandidates();
    } catch (err) {
      showToast('Rejection failed: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmRequestInfo = async () => {
    if (!selectedCandidateId || !infoMessage.trim()) return;
    setProcessing(true);
    try {
      const res = await adminAPI.requestProviderInfo(selectedCandidateId, infoMessage.trim());
      showToast(res.message || 'Information request dispatched to provider.', 'info');
      setInfoModalOpen(false);
      fetchCandidates();
    } catch (err) {
      showToast('Failed to request info: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)' }}>Loading Approvals Queue...</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Retrieving submitted partner applications awaiting verification.</p>
      </div>
    );
  }

  const activeProvider = candidateDetail?.provider;
  const activeAttempts = candidateDetail?.testAttempts || [];
  const activeDocs = candidateDetail?.documents || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        border: '1.5px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="var(--forest-700)" />
            <span>Specialist Verification & KYC Review Queue</span>
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Review skill examination scores, signed KYC identification proofs, and make binding onboarding rulings.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '12.5px' }}>
            {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''} Awaiting Review
          </span>
          <button type="button" onClick={fetchCandidates} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 24px',
          textAlign: 'center',
          border: '1.5px solid var(--border-light)'
        }}>
          <CheckCircle2 size={44} color="#16A34A" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
            All Verification Submissions Processed
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto' }}>
            No technicians waiting for approval. As soon as a provider completes registration and skill testing, their dossier will appear here for review.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: '20px',
          alignItems: 'start'
        }}>
          
          {/* Candidates List Column */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-light)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-warm)' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase' }}>
                Pending Candidates ({candidates.length})
              </span>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {candidates.map((cand) => {
                const isSelected = cand._id === selectedCandidateId;
                const passedSkill = cand.skills?.find(s => s.passed);

                return (
                  <div
                    key={cand._id}
                    onClick={() => setSelectedCandidateId(cand._id)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid var(--forest-700)' : '4px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <InitialsAvatar name={cand.name} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cand.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {cand.specialty || 'General Service'} • {cand.city}
                        </div>
                      </div>
                      {passedSkill && (
                        <span className="badge badge-success" style={{ fontSize: '11px', fontWeight: 800 }}>
                          {passedSkill.testScore}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dossier Detail Column */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1.5px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading provider dossier and signed document URLs...</span>
              </div>
            ) : !activeProvider ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                Select a candidate from the left queue to inspect their dossier.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Dossier Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <InitialsAvatar name={activeProvider.name} size={56} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                          {activeProvider.name}
                        </h3>
                        <span className="badge badge-warning" style={{ fontSize: '11px', fontWeight: 800 }}>
                          WAITING APPROVAL
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} /> {activeProvider.phone || activeProvider.userId?.phone || 'No phone'}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} /> {activeProvider.city}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Briefcase size={13} /> {activeProvider.experienceYears || 3} Years Exp
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Ruling Buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => setRejectModalOpen(true)}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                    >
                      <XCircle size={15} />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => setInfoModalOpen(true)}
                      className="btn btn-secondary btn-sm"
                    >
                      <MessageSquare size={15} />
                      <span>Request Info</span>
                    </button>
                    <button
                      type="button"
                      disabled={processing}
                      onClick={handleApprove}
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: '#16A34A', borderColor: '#16A34A' }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve Partner</span>
                    </button>
                  </div>
                </div>

                {/* Section 1: Skill Testing History */}
                <div style={{
                  backgroundColor: 'var(--bg-warm)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid var(--border-light)'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} color="var(--forest-700)" />
                    <span>Skill Test Certification & Integrity Audit</span>
                  </h4>

                  {activeAttempts.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {activeProvider.skills && activeProvider.skills.length > 0 ? (
                        <div>
                          Skill verified: <strong>{activeProvider.skills[0].categoryName}</strong> with score <strong>{activeProvider.skills[0].testScore}%</strong>.
                        </div>
                      ) : (
                        'No test session records found.'
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeAttempts.map((att, idx) => (
                        <div 
                          key={att._id || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#FFFFFF',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--forest-900)' }}>
                              {att.categoryName || att.categoryId} Test
                            </span>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Date: {new Date(att.createdAt).toLocaleDateString()} • Warnings: {att.warningCount || 0}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={att.passed ? 'badge badge-success' : 'badge badge-danger'} style={{ fontSize: '12px', fontWeight: 800 }}>
                              {att.score}% ({att.passed ? 'PASSED' : 'FAILED'})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Signed KYC Documents */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="var(--forest-700)" />
                    <span>Signed KYC & Identification Documents</span>
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    
                    {/* Document 1: ID Proof */}
                    <div style={{
                      backgroundColor: 'var(--bg-warm)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>
                          Government Photo ID
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                          Confidential
                        </span>
                      </div>

                      {activeDocs.idProof?.url ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewDocUrl(activeDocs.idProof.url);
                              setPreviewDocTitle(`${activeProvider.name} - Government Photo ID`);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>
                          <a
                            href={activeDocs.idProof.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#DC2626' }}>
                          No ID proof uploaded.
                        </div>
                      )}
                    </div>

                    {/* Document 2: Certificate */}
                    <div style={{
                      backgroundColor: 'var(--bg-warm)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>
                          Trade Certificate / ITI
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                          Skill Verification
                        </span>
                      </div>

                      {activeDocs.certificate?.url ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewDocUrl(activeDocs.certificate.url);
                              setPreviewDocTitle(`${activeProvider.name} - Trade Certificate`);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>
                          <a
                            href={activeDocs.certificate.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Optional trade certificate not submitted.
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#DC2626', marginBottom: '8px' }}>
              Reject Application for {activeProvider?.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Please specify the precise reason for rejection. This explanation is saved in the audit log and delivered to the provider's console so they can correct their documents.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="form-control"
              style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}
              placeholder="Explain why the documents or background check did not satisfy requirements..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing || rejectReason.trim().length < 5}
                onClick={handleConfirmReject}
                className="btn btn-danger btn-sm"
              >
                {processing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {infoModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
              Request Additional Information
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Send a formal message to {activeProvider?.name}. Their account status will transition to <strong>more_info_needed</strong> so they can upload fresh photos or clarifications.
            </p>

            <textarea
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              rows={4}
              className="form-control"
              style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}
              placeholder="State exactly what additional document or clarification is required..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing || infoMessage.trim().length < 5}
                onClick={handleConfirmRequestInfo}
                className="btn btn-primary btn-sm"
              >
                {processing ? 'Sending...' : 'Dispatch Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Document Preview Modal */}
      {previewDocUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--forest-900)' }}>
                {previewDocTitle}
              </span>
              <button
                type="button"
                onClick={() => setPreviewDocUrl(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', textAlign: 'center', flex: 1, backgroundColor: 'var(--bg-warm)' }}>
              {previewDocUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={previewDocUrl} style={{ width: '100%', height: '500px', border: 'none' }} title={previewDocTitle} />
              ) : (
                <img
                  src={previewDocUrl}
                  alt={previewDocTitle}
                  style={{ maxWidth: '100%', maxHeight: '550px', borderRadius: '8px', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
