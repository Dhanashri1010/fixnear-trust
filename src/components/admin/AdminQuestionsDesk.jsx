// ===================================================================
// FixNear Trust - Admin Question Bank Desk
// Add/Edit/Delete questions per category, Question counts & <12 warning,
// Pass-mark threshold configuration (default 70%)
// ===================================================================

import React, { useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  Award, 
  Sliders, 
  X,
  Search,
  BookOpen
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function AdminQuestionsDesk() {
  const { 
    categories, 
    questionBank, 
    addQuestion, 
    updateQuestion, 
    deleteQuestion,
    passMark,
    setPassMark
  } = useStore();
  const { showToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState('ac-cooling');
  const [search, setSearch] = useState('');
  
  // Pass-mark slider state
  const [localPassMark, setLocalPassMark] = useState(passMark || 70);

  // Question Modal (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    categoryId: 'ac-cooling',
    craftArea: 'Safety & Fundamentals',
    options: ['', '', '', ''],
    correctIndex: 0,
    difficulty: 'medium',
    explanation: ''
  });

  // Filter questions for active view
  const categoryQuestions = questionBank.filter(q => q.categoryId === selectedCategory);
  const filteredQuestions = categoryQuestions.filter(q => 
    !search.trim() || q.question.toLowerCase().includes(search.toLowerCase())
  );

  const handleSavePassMark = () => {
    setPassMark(Number(localPassMark));
    showToast(`Passing threshold updated to ${localPassMark}% across all craft tests!`, 'success');
  };

  const handleOpenAdd = () => {
    setEditingQuestionId(null);
    setFormData({
      question: '',
      categoryId: selectedCategory,
      craftArea: 'Diagnostics & Troubleshooting',
      options: ['', '', '', ''],
      correctIndex: 0,
      difficulty: 'medium',
      explanation: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestionId(q.id);
    setFormData({
      question: q.question,
      categoryId: q.categoryId || selectedCategory,
      craftArea: q.craftArea || 'Diagnostics & Troubleshooting',
      options: [...(q.options || ['', '', '', ''])],
      correctIndex: q.correctIndex || 0,
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (q) => {
    if (window.confirm(`Delete question: "${q.question.slice(0, 40)}..."?`)) {
      await deleteQuestion(q.id);
      showToast('Question deleted from bank.', 'info');
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || formData.options.some(opt => !opt.trim())) {
      showToast('Please fill out the question and all 4 options.', 'error');
      return;
    }

    const payload = {
      question: formData.question,
      categoryId: formData.categoryId,
      craftArea: formData.craftArea,
      options: formData.options,
      correctIndex: Number(formData.correctIndex),
      difficulty: formData.difficulty,
      explanation: formData.explanation
    };

    if (editingQuestionId) {
      await updateQuestion(editingQuestionId, payload);
      showToast('Question updated successfully!', 'success');
    } else {
      await addQuestion(payload);
      showToast('New question added to category question bank!', 'success');
    }

    setModalOpen(false);
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
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={22} color="var(--forest-700)" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
              Technical Skill Assessment & Question Bank Desk
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Total Questions in Vault: <strong>{questionBank.length} questions</strong> across {categories.length} crafts. Correct answers are kept secured server-side.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>Add Exam Question</span>
        </button>
      </div>

      {/* Requirement: Pass-mark setting (default 70%) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        border: '1.5px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--forest-100)',
            color: 'var(--forest-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sliders size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '14.5px', color: 'var(--forest-900)' }}>
              Anti-Cheat Exam Passing Threshold Setting
            </strong>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Current global pass mark: <strong>{passMark}%</strong> (Minimum score required to qualify for Admin KYC review)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <input
            type="range"
            min={50}
            max={90}
            step={5}
            value={localPassMark}
            onChange={(e) => setLocalPassMark(e.target.value)}
            style={{ width: '130px', accentColor: 'var(--forest-700)' }}
          />
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-900)', minWidth: '44px' }}>
            {localPassMark}%
          </span>
          <button
            type="button"
            onClick={handleSavePassMark}
            className="btn btn-secondary btn-sm"
          >
            Update Pass Mark
          </button>
        </div>
      </div>

      {/* Categories Cards Overview & Warnings */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase', marginBottom: '10px' }}>
          Question Distribution by Craft
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {categories.map(cat => {
            const count = questionBank.filter(q => q.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            const hasWarning = count < 12; // Requirement: warn when category has fewer than 12 questions

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                  border: isSelected ? '2px solid var(--forest-700)' : hasWarning ? '1.5px solid #FCA5A5' : '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--forest-900)' }}>{cat.name}</strong>
                  <span className={`badge ${count < 12 ? 'badge-red' : 'badge-forest'}`} style={{ fontSize: '11px' }}>
                    {count} Questions
                  </span>
                </div>

                {/* Requirement: Warning banner when category has fewer than 12 questions */}
                {hasWarning && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#DC2626', marginTop: '6px', fontWeight: 700 }}>
                    <AlertTriangle size={12} />
                    <span>Below 12-question safe threshold!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Notice for Active Category if < 12 */}
      {categoryQuestions.length < 12 && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FEF2F2',
          border: '1.5px solid #F87171',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#991B1B' }}>
            <strong>Safety Warning:</strong> This category contains only <strong>{categoryQuestions.length} questions</strong>. FixNear platform standards require at least <strong>12 questions</strong> to maintain exam variety and prevent question memorization. Please add {12 - categoryQuestions.length} more questions.
          </div>
        </div>
      )}

      {/* Questions List for Active Category */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
              {categories.find(c => c.id === selectedCategory)?.name || 'Category'} Question Bank ({filteredQuestions.length})
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Candidates are randomly served 10 randomized questions with anti-cheat monitoring
            </div>
          </div>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question text..."
              style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-light)', fontSize: '12.5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id || idx}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-warm)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-sage" style={{ fontSize: '10.5px' }}>
                      Q{idx + 1}
                    </span>
                    <span className="badge badge-demo" style={{ fontSize: '10.5px' }}>
                      {q.craftArea || 'General'}
                    </span>
                    <span className="badge badge-yellow" style={{ fontSize: '10.5px' }}>
                      {q.difficulty || 'Medium'}
                    </span>
                  </div>

                  <strong style={{ fontSize: '14px', color: 'var(--forest-900)' }}>
                    {q.question}
                  </strong>

                  {/* Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginTop: '10px' }}>
                    {q.options && q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex;
                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: isCorrect ? '#DCFCE7' : '#FFFFFF',
                            border: isCorrect ? '1.5px solid #22C55E' : '1px solid var(--border-light)',
                            fontSize: '12.5px',
                            color: isCorrect ? '#15803D' : 'var(--text-primary)',
                            fontWeight: isCorrect ? 700 : 400
                          }}
                        >
                          {String.fromCharCode(65 + optIdx)}. {opt} {isCorrect && '✓ (Key)'}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                      Why: {q.explanation}
                    </div>
                  )}
                </div>

                {/* Edit / Delete Actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    className="btn btn-outline btn-xs"
                    style={{ padding: '4px 8px' }}
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q)}
                    className="btn btn-outline btn-xs"
                    style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '4px 8px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Question Modal */}
      {modalOpen && (
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
            borderRadius: 'var(--radius-xl)',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                {editingQuestionId ? 'Edit Exam Question' : 'Add New Question to Vault'}
              </h3>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                  Question Text *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="e.g. When diagnosing a split AC outdoor unit that buzzes but does not spin..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                    Craft Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                    Topic / Craft Area
                  </label>
                  <input
                    type="text"
                    value={formData.craftArea}
                    onChange={(e) => setFormData(prev => ({ ...prev, craftArea: e.target.value }))}
                    placeholder="e.g. Capacitor Diagnostics"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* 4 Options */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                  4 Multiple Choice Options (Check radio for correct answer) *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="radio"
                        name="correctAnswerIndex"
                        checked={formData.correctIndex === i}
                        onChange={() => setFormData(prev => ({ ...prev, correctIndex: i }))}
                        title="Mark as correct answer"
                      />
                      <span style={{ fontSize: '12px', fontWeight: 800, width: '16px' }}>{String.fromCharCode(65 + i)}</span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...formData.options];
                          newOpts[i] = e.target.value;
                          setFormData(prev => ({ ...prev, options: newOpts }));
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', fontSize: '12.5px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                  Safety Explanation / Rationale
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why the selected answer is correct..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingQuestionId ? 'Save Question' : 'Add to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
