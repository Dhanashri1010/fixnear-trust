// ===================================================================
// FixNear Trust - Admin Services & Pricing Manager
// Add, edit, disable/enable catalog services, update base prices & features
// ===================================================================

import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Edit3, 
  Power, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Star, 
  X,
  Search
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function AdminServicesDesk() {
  const { services, categories, addService, updateService, toggleServiceStatus } = useStore();
  const { showToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Service Modal State (Add or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'ac-cooling',
    category: 'Air Conditioning',
    startingPrice: 499,
    originalPrice: 699,
    duration: '45 - 60 mins',
    discountBadge: 'Standard',
    featuresText: 'High-pressure foam jet cleaning\n30-Day FixNear Workmanship Warranty',
    includedText: 'Standard diagnosis\nCore equipment service',
    excludedText: 'Cost of spare parts\nMajor unit overhaul'
  });

  const filteredServices = services.filter(srv => {
    const catMatch = selectedCategory === 'all' || srv.categoryId === selectedCategory;
    const searchMatch = !search.trim() || srv.title.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const handleOpenAddModal = () => {
    setEditingServiceId(null);
    setFormData({
      title: '',
      categoryId: 'ac-cooling',
      category: 'Air Conditioning',
      startingPrice: 499,
      originalPrice: 699,
      duration: '45 - 60 mins',
      discountBadge: 'Fixed Scale',
      featuresText: 'High-pressure foam jet cleaning\n30-Day FixNear Workmanship Warranty',
      includedText: 'Complete equipment diagnostics\nMulti-point safety triage',
      excludedText: 'Cost of extra OEM parts\nMajor overhaul'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (srv) => {
    setEditingServiceId(srv.id);
    setFormData({
      title: srv.title,
      categoryId: srv.categoryId || 'ac-cooling',
      category: srv.category || 'Air Conditioning',
      startingPrice: srv.startingPrice || 499,
      originalPrice: srv.originalPrice || 699,
      duration: srv.duration || '45 mins',
      discountBadge: srv.discountBadge || 'Standard',
      featuresText: (srv.features || []).join('\n'),
      includedText: (srv.scope?.included || []).join('\n'),
      excludedText: (srv.scope?.excluded || []).join('\n')
    });
    setModalOpen(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startingPrice) {
      showToast('Please provide a valid service title and base price.', 'error');
      return;
    }

    const payload = {
      title: formData.title,
      categoryId: formData.categoryId,
      category: categories.find(c => c.id === formData.categoryId)?.name || formData.category,
      startingPrice: Number(formData.startingPrice),
      originalPrice: Number(formData.originalPrice || formData.startingPrice),
      duration: formData.duration,
      discountBadge: formData.discountBadge,
      features: formData.featuresText.split('\n').filter(Boolean),
      scope: {
        included: formData.includedText.split('\n').filter(Boolean),
        excluded: formData.excludedText.split('\n').filter(Boolean)
      }
    };

    if (editingServiceId) {
      await updateService(editingServiceId, payload);
      showToast(`Service "${formData.title}" updated successfully!`, 'success');
    } else {
      await addService(payload);
      showToast(`New service "${formData.title}" added to catalog!`, 'success');
    }

    setModalOpen(false);
  };

  const handleToggle = async (srv) => {
    await toggleServiceStatus(srv.id);
    const newState = srv.isActive === false ? 'enabled' : 'disabled';
    showToast(`Service "${srv.title}" ${newState}.`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Desk Info */}
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
            <Wrench size={22} color="var(--forest-700)" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
              Services Catalog & Upfront Pricing Desk
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Maintain transparent base rate cards, service scopes, and toggle offering availability for customers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>Add New Service Offering</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        border: '1.5px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`btn btn-xs ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Services ({services.length})
          </button>
          {categories.map(cat => {
            const count = services.filter(s => s.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn btn-xs ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service title..."
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border-light)',
              fontSize: '13px'
            }}
          />
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {filteredServices.map(srv => {
          const isActive = srv.isActive ?? true;

          return (
            <div
              key={srv.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: isActive ? '1.5px solid var(--border-light)' : '1.5px dashed #D1D5DB',
                opacity: isActive ? 1 : 0.65,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                    {srv.category || 'Home Service'}
                  </span>
                  <span className={`badge ${isActive ? 'badge-forest' : 'badge-demo'}`} style={{ fontSize: '10.5px' }}>
                    {isActive ? '✓ Active' : 'Disabled'}
                  </span>
                </div>

                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '10px', marginBottom: '6px' }}>
                  {srv.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-800)' }}>
                    ₹{srv.startingPrice}
                  </span>
                  {srv.originalPrice > srv.startingPrice && (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ₹{srv.originalPrice}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    • {srv.duration || '45 mins'}
                  </span>
                </div>

                {srv.features && (
                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {srv.features.slice(0, 3).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  onClick={() => handleToggle(srv)}
                  className="btn btn-outline btn-xs"
                  style={{ color: isActive ? '#DC2626' : '#16A34A', borderColor: isActive ? '#FCA5A5' : '#86EFAC', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Power size={13} />
                  <span>{isActive ? 'Disable Service' : 'Enable Service'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(srv)}
                  className="btn btn-secondary btn-xs"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit3 size={13} />
                  <span>Edit Rate & Scope</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal */}
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
                {editingServiceId ? 'Edit Service Offering' : 'Add New Service Offering'}
              </h3>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Inverter Split AC Deep Chemical Jet Clean"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                    Category *
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
                    Estimated Duration *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 45 - 60 mins"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                    Base Starting Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.startingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, startingPrice: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                    Strikethrough Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
                  Bullet Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuresText: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontSize: '13px', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
                  {editingServiceId ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
