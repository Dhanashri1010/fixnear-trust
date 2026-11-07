// ===================================================================
// FixNear Trust - Admin Question Bank Management Desk (Phase D)
// Real MongoDB Data | correctIndex & Explanation Visible to Admin
// Question Counts per Category | Warning when < 12 questions
// ===================================================================

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  X,
  BookOpen
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminQuestionsDesk() {
  const { showToast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: 'plumbing',
    categoryName: 'Plumbing',
    topic: 'Diagnostics & Leakage',
    questionText: '',
    option0: '',
    option1: '',
    option2: '',
    option3: '',
    correctIndex: 0,
    explanation: '',
  });

  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.categoryId = selectedCategory;

      const [qRes, countsRes] = await Promise.all([
        adminAPI.getQuestions(params),
        adminAPI.getQuestionCounts(),
      ]);

      if (qRes.success) setQuestions(qRes.questions || []);
      if (countsRes.success) setCounts(countsRes.counts || []);
    } catch (err) {
      showToast('Failed to load question bank: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const filteredQuestions = questions.filter((q) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      q.questionText?.toLowerCase().includes(term) ||
      q.topic?.toLowerCase().includes(term) ||
      q.options?.some((opt) => opt.toLowerCase().includes(term))
    );
  });

  const handleOpenAddModal = () => {
    setEditingQuestionId(null);
    setFormData({
      categoryId: selectedCategory !== 'all' ? selectedCategory : 'plumbing',
      categoryName: selectedCategory !== 'all' ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Plumbing',
      topic: 'Technical Safety',
      questionText: '',
      option0: '',
      option1: '',
      option2: '',
      option3: '',
      correctIndex: 0,
      explanation: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestionId(q._id);
    setFormData({
      categoryId: q.categoryId,
      categoryName: q.categoryName || q.categoryId,
      topic: q.topic || 'General Technical',
      questionText: q.questionText,
      option0: q.options?.[0] || '',
      option1: q.options?.[1] || '',
      option2: q.options?.[2] || '',
      option3: q.options?.[3] || '',
      correctIndex: q.correctIndex !== undefined ? q.correctIndex : 0,
      explanation: q.explanation || '',
    });
    setModalOpen(true);
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!formData.questionText.trim()) {
      showToast('Question text is required.', 'error');
      return;
    }
    if (!formData.option0 || !formData.option1 || !formData.option2 || !formData.option3) {
      showToast('All 4 options must be filled.', 'error');
      return;
    }

    const payload = {
      categoryId: formData.categoryId,
      categoryName: formData.categoryName,
      topic: formData.topic.trim(),
      questionText: formData.questionText.trim(),
      options: [
        formData.option0.trim(),
        formData.option1.trim(),
        formData.option2.trim(),
        formData.option3.trim(),
      ],
      correctIndex: Number(formData.correctIndex),
      explanation: formData.explanation.trim(),
    };

    setProcessing(true);
    try {
      if (editingQuestionId) {
        await adminAPI.updateQuestion(editingQuestionId, payload);
        showToast('Question updated in database.', 'success');
      } else {
        await adminAPI.createQuestion(payload);
        showToast('Question added to test bank!', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to save question: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this examination question?')) return;
    try {
      await adminAPI.deleteQuestion(id);
      showToast('Question deleted from exam bank.', 'info');
      fetchData();
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  // Categories needing more questions (< 12)
  const deficientCategories = counts.filter((c) => c.count < 12);

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
            <HelpCircle size={20} color="var(--forest-700)" />
            <span>Specialist Skill Exam Question Bank & Curated Criteria</span>
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Curate objective examination questions with answer keys. Correct options are strictly hidden from examinees.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={fetchData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Warning Banner when categories have < 12 questions */}
      {deficientCategories.length > 0 && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FCD34D',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#92400E' }}>
            <strong>Exam Bank Warning:</strong> The following trade categories have fewer than 12 questions:{' '}
            {deficientCategories.map((c) => `${c.categoryName || c.categoryId} (${c.count}/12)`).join(', ')}. Each applicant test generates 10 questions at random, so having fewer than 12 questions reduces test variability.
          </div>
        </div>
      )}

      {/* Category Counts Cards Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px'
      }}>
        {counts.map((c) => {
          const isSelected = selectedCategory === c.categoryId;
          const hasWarning = c.count < 12;

          return (
            <div
              key={c.categoryId}
              onClick={() => setSelectedCategory(isSelected ? 'all' : c.categoryId)}
              style={{
                backgroundColor: isSelected ? 'var(--forest-100)' : '#FFFFFF',
                border: isSelected ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--forest-900)' }}>
                {c.categoryName || c.categoryId}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: hasWarning ? '#D97706' : '#16A34A' }}>
                  {c.count} Qs
                </span>
                {hasWarning && (
                  <span className="badge badge-warning" style={{ fontSize: '10px', padding: '2px 5px' }}>
                    &lt; 12
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        border: '1.5px solid var(--border-light)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by text or topic..."
            className="form-control"
            style={{ width: '100%', paddingLeft: '36px', fontSize: '13px', height: '38px', borderRadius: '8px' }}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-control"
          style={{ fontSize: '13px', height: '38px', borderRadius: '8px', padding: '0 12px' }}
        >
          <option value="all">All Categories ({questions.length})</option>
          {counts.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.categoryName || c.categoryId} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Querying question bank...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', color: 'var(--text-muted)' }}>
            <BookOpen size={36} color="var(--forest-300)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', margin: '0 0 6px 0' }}>No Questions Found</h4>
            <p style={{ fontSize: '13px', margin: 0 }}>No questions matched your search or category filter.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q._id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                border: '1.5px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 800 }}>
                    {q.categoryName || q.categoryId}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                    {q.topic || 'General Technical'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(q)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="btn btn-outline btn-sm"
                    style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-900)' }}>
                {idx + 1}. {q.questionText}
              </div>

              {/* 4 Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                {q.options?.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctIndex;

                  return (
                    <div
                      key={optIdx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        backgroundColor: isCorrect ? '#DCFCE7' : 'var(--bg-warm)',
                        border: isCorrect ? '1.5px solid #22C55E' : '1px solid var(--border-light)',
                        color: isCorrect ? '#14532D' : 'var(--text-main)',
                        fontWeight: isCorrect ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>
                        <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                      </span>
                      {isCorrect && (
                        <CheckCircle2 size={16} color="#16A34A" />
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-warm)', padding: '10px 12px', borderRadius: '8px' }}>
                  <strong>Key Rationale:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {modalOpen && (
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                {editingQuestionId ? 'Edit Exam Question' : 'Add Question to Examination Bank'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const found = counts.find((c) => c.categoryId === e.target.value);
                      setFormData({
                        ...formData,
                        categoryId: e.target.value,
                        categoryName: found?.categoryName || e.target.value,
                      });
                    }}
                    className="form-control"
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    {counts.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName || c.categoryId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Electrical Safety, Pipe Flare"
                    className="form-control"
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>Question Text</label>
                <textarea
                  rows={3}
                  required
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter the technical scenario or diagnostic question..."
                  className="form-control"
                  style={{ width: '100%', fontSize: '13px', padding: '8px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  Options (Mark the single correct option)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[0, 1, 2, 3].map((idx) => {
                    const key = `option${idx}`;
                    const isCorrect = Number(formData.correctIndex) === idx;

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="radio"
                          name="correctIndex"
                          checked={isCorrect}
                          onChange={() => setFormData({ ...formData, correctIndex: idx })}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 700, width: '20px' }}>
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <input
                          type="text"
                          required
                          value={formData[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                          className="form-control"
                          style={{ flex: 1, fontSize: '13px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>
                  Explanation & Reference Rationale (Admin internal)
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain why this option is correct based on Indian Standards / industry practice..."
                  className="form-control"
                  style={{ width: '100%', fontSize: '13px', padding: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn btn-primary btn-sm"
                >
                  {processing ? 'Saving...' : editingQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
