// ===================================================================
// FixNear Trust - Admin Provider Approval Desk
// Live list of under_review candidates, KYC large document preview,
// Test attempt metrics & tab-switch warning audit, Approve/Reject/Request Info
// ===================================================================

import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function AdminApprovalsDesk() {
  const { 
    technicians, 
    approveProvider, 
    rejectProvider, 
    requestProviderInfo,
    testAttempts
  } = useStore();
  const { showToast } = useToast();

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const [previewDocTitle, setPreviewDocTitle] = useState('');

  // Action Modals State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Govt ID document is blurry / details unreadable. Please provide a clear color scan of Aadhaar or PAN card.');
  
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState('Please upload your ITI trade diploma or specify previous HVAC service center experience.');

  const [processingId, setProcessingId] = useState(null);

  // Filter candidates waiting for admin sign-off
  const pendingCandidates = technicians.filter(t => t.status === 'under_review');
  const activeCandidate = selectedCandidate || pendingCandidates[0] || null;

  // Candidate's test attempts for audit history
  const candidateAttempts = activeCandidate 
    ? testAttempts.filter(a => a.providerId === activeCandidate.id || a.providerId === activeCandidate.userId)
    : [];

  const handleApprove = async (candidate) => {
    setProcessingId(candidate.id);
    try {
      await approveProvider(candidate.id || candidate.userId);
      showToast(`${candidate.name} approved! They now appear in the public Customer directory.`, 'success');
      setSelectedCandidate(null);
    } catch (err) {
      showToast(`Approval failed: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!activeCandidate || !rejectReason.trim()) return;
    setProcessingId(activeCandidate.id);
    try {
      await rejectProvider(activeCandidate.id || activeCandidate.userId, rejectReason);
      showToast(`Application rejected. Reason posted to ${activeCandidate.name}'s console.`, 'info');
      setRejectModalOpen(false);
      setSelectedCandidate(null);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmRequestInfo = async () => {
    if (!activeCandidate || !infoMessage.trim()) return;
    setProcessingId(activeCandidate.id);
    try {
      await requestProviderInfo(activeCandidate.id || activeCandidate.userId, infoMessage);
      showToast(`Info request dispatched to ${activeCandidate.name}.`, 'info');
      setInfoModalOpen(false);
      setSelectedCandidate(null);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Desk Title Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1.5px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={22} color="var(--forest-700)" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
              Specialist KYC & Verification Approval Desk
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Review candidate skill test scores, anti-cheat audit logs, and inspect official ID proofs before approving doorstep dispatch permissions.
          </p>
        </div>

        <span className="badge badge-forest" style={{ fontSize: '12px', padding: '6px 14px' }}>
          {pendingCandidates.length} Application{pendingCandidates.length !== 1 ? 's' : ''} Pending Review
        </span>
      </div>

      {pendingCandidates.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 20px',
          textAlign: 'center',
          border: '1.5px solid var(--border-light)'
        }}>
          <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
            All Clear! No Pending Approvals
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '6px auto 0 auto' }}>
            Every technician who passed their skill test has been audited. New candidates will automatically queue here upon scoring ≥70%.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '20px',
          alignItems: 'start'
        }}>
          
          {/* Candidate List Sidebar */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-light)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-warm)' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--forest-900)' }}>
                Pending Queue ({pendingCandidates.length})
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pendingCandidates.map((cand) => {
                const isSelected = activeCandidate?.id === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                      borderLeft: isSelected ? '4px solid var(--forest-700)' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--forest-900)' }}>
                        {cand.name}
                      </strong>
                      <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                        {cand.testScore || 80}% Test
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {cand.city} • {cand.skills?.[0] || 'Air Conditioning'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Experience: {cand.experienceYears || 3} yrs</span>
                      <span>•</span>
                      <span style={{ color: cand.tabSwitches > 0 ? '#D97706' : '#16A34A', fontWeight: 600 }}>
                        {cand.tabSwitches > 0 ? `${cand.tabSwitches} Tab Warnings` : 'Zero Tab Switches'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Candidate Detailed Inspection Sheet */}
          {activeCandidate && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              border: '1.5px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Header Profile Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img
                    src={activeCandidate.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"}
                    alt={activeCandidate.name}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                        {activeCandidate.name}
                      </h2>
                      <span className="badge badge-yellow" style={{ fontSize: '11px', fontWeight: 700 }}>
                        UNDER REVIEW
                      </span>
                    </div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Phone: <strong>{activeCandidate.phone}</strong> • City: <strong>{activeCandidate.city}</strong>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--forest-700)', marginTop: '2px' }}>
                      Service Area: {activeCandidate.serviceArea}
                    </div>
                  </div>
                </div>

                {/* Score & Badge Pill */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>SKILL SCORE</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--forest-800)' }}>
                    {activeCandidate.testScore || 82}%
                  </div>
                  <span className="badge badge-forest" style={{ fontSize: '11px', marginTop: '2px' }}>
                    {activeCandidate.testScore >= 90 ? 'Gold Specialist' : 'Silver Verified'}
                  </span>
                </div>
              </div>

              {/* Bio & Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                marginBottom: '24px'
              }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Trade Category</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)', marginTop: '2px' }}>
                    {activeCandidate.skills?.join(', ') || 'Air Conditioning'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Experience</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)', marginTop: '2px' }}>
                    {activeCandidate.experienceYears || 4} Years Field Work
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Anti-Cheat Integrity</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: (activeCandidate.tabSwitches || 0) > 0 ? '#D97706' : '#16A34A', marginTop: '2px' }}>
                    {(activeCandidate.tabSwitches || 0) > 0 ? `${activeCandidate.tabSwitches} Tab-Switch Warnings` : '✓ 100% Focused (0 Warnings)'}
                  </div>
                </div>
              </div>

              {/* Professional Bio */}
              <div style={{ marginBottom: '24px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--forest-900)', display: 'block', marginBottom: '6px' }}>
                  Professional Bio & Trade Background:
                </strong>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, backgroundColor: 'var(--bg-warm)', padding: '12px 16px', borderRadius: 'var(--radius-md)', margin: 0 }}>
                  {activeCandidate.bio || "Experienced field technician with specialized background in domestic repairs and diagnostic triage."}
                </p>
              </div>

              {/* Requirement: Uploaded ID Proof & Optional Certificate (Large Preview) */}
              <div style={{ marginBottom: '28px' }}>
                <strong style={{ fontSize: '13.5px', color: 'var(--forest-900)', display: 'block', marginBottom: '10px' }}>
                  Uploaded KYC Credentials & Documents (Click to Open Large Preview):
                </strong>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  
                  {/* Document 1: Government ID Proof */}
                  <div 
                    onClick={() => {
                      setPreviewDocUrl(activeCandidate.idProofUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80");
                      setPreviewDocTitle(`${activeCandidate.name} - Government ID Proof (Aadhaar / DL)`);
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--forest-600)',
                      backgroundColor: 'var(--forest-50)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--forest-800)'
                    }}>
                      <FileText size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--forest-900)' }}>
                        Government ID Proof *
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--forest-700)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Eye size={13} />
                        <span>Inspect Full-Size Preview</span>
                      </div>
                    </div>
                  </div>

                  {/* Document 2: Trade Certificate (Optional) */}
                  {activeCandidate.certificateUrl ? (
                    <div 
                      onClick={() => {
                        setPreviewDocUrl(activeCandidate.certificateUrl);
                        setPreviewDocTitle(`${activeCandidate.name} - Trade Diploma / Certificate`);
                      }}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--forest-800)'
                      }}>
                        <Award size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--forest-900)' }}>
                          Trade Certification / Diploma
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Eye size={13} />
                          <span>Inspect Full-Size Preview</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--text-muted)',
                      fontSize: '12.5px'
                    }}>
                      <AlertCircle size={18} />
                      <span>No optional trade certificate uploaded</span>
                    </div>
                  )}

                </div>
              </div>

              {/* Requirement: Actions (Approve, Reject with reason, Request More Info) */}
              <div style={{
                paddingTop: '20px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  disabled={processingId === activeCandidate.id}
                  onClick={() => setRejectModalOpen(true)}
                  className="btn btn-outline"
                  style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '10px 18px' }}
                >
                  <XCircle size={16} />
                  <span>Reject with Reason</span>
                </button>

                <button
                  type="button"
                  disabled={processingId === activeCandidate.id}
                  onClick={() => setInfoModalOpen(true)}
                  className="btn btn-outline"
                  style={{ color: '#D97706', borderColor: '#FCD34D', padding: '10px 18px' }}
                >
                  <MessageSquare size={16} />
                  <span>Request More Info</span>
                </button>

                <button
                  type="button"
                  disabled={processingId === activeCandidate.id}
                  onClick={() => handleApprove(activeCandidate)}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', backgroundColor: '#15803D', borderColor: '#166534' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{processingId === activeCandidate.id ? 'Approving...' : 'Approve & Activate Partner'}</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Large Document Preview Modal */}
      {previewDocUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-warm)'
            }}>
              <strong style={{ fontSize: '14.5px', color: 'var(--forest-900)' }}>
                {previewDocTitle}
              </strong>
              <button 
                type="button"
                onClick={() => setPreviewDocUrl(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
              <img 
                src={previewDocUrl} 
                alt="Document Full Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '65vh', 
                  borderRadius: 'var(--radius-md)', 
                  objectFit: 'contain',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-md)'
                }} 
              />
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewDocUrl(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject with Reason Modal */}
      {rejectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#991B1B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#DC2626" />
              <span>Reject Application ({activeCandidate?.name})</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Specify the explicit reason for rejection. This reason will display directly on the provider's dashboard along with a "Fix and Resubmit" button.
            </p>

            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Govt ID photo is cut off or blurry. Please upload a clear photo of your Aadhaar card..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-light)',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="btn btn-primary"
                style={{ backgroundColor: '#DC2626', borderColor: '#B91C1C' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request More Info Modal */}
      {infoModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#92400E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#D97706" />
              <span>Request More Info ({activeCandidate?.name})</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Send an actionable message to the technician. Their status will change to "Needs Info" and allow them to upload supplementary documents.
            </p>

            <textarea
              rows={4}
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              placeholder="e.g. Please upload your electrical supervisor license or clear copy of PAN card..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-light)',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setInfoModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRequestInfo}
                className="btn btn-primary"
                style={{ backgroundColor: '#D97706', borderColor: '#B45309' }}
              >
                Send Request to Technician
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
