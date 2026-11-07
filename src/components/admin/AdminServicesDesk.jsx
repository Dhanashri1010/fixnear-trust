// ===================================================================
// FixNear Trust - Admin Services & Categories Manager (Phase D)
// Real MongoDB Data | Add, Edit, Disable/Enable Catalog Services
// ===================================================================

import React, { useState, useEffect } from 'react';
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
  Search,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminServicesDesk() {
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Service Modal State (Add or Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formData, setFormData] = useState({
    serviceId: '',
    title: '',
    categoryId: 'ac-cooling',
    category: 'Air Conditioning',
    startingPrice: 499,
    originalPrice: 699,
    duration: '45 - 60 mins',
    featuresText: 'High-pressure foam jet cleaning\n30-Day FixNear Workmanship Warranty',
  });

  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [srvRes, catRes] = await Promise.all([
        adminAPI.getServices(),
        adminAPI.getCategories(),
      ]);

      if (srvRes.success) setServices(srvRes.services || []);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      showToast('Failed to load services: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredServices = services.filter((srv) => {
    const catMatch = selectedCategory === 'all' || srv.categoryId === selectedCategory;
    const searchMatch = !search.trim() || srv.title.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const handleOpenAddModal = () => {
    setEditingServiceId(null);
    setFormData({
      serviceId: `service-${Date.now().toString(36)}`,
      title: '',
      categoryId: categories[0]?.categoryId || 'plumbing',
      category: categories[0]?.name || 'Plumbing',
      startingPrice: 399,
      originalPrice: 599,
      duration: '45 - 60 mins',
      featuresText: 'Verified Specialist\nFixNear Workmanship Guarantee',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingServiceId(service._id);
    setFormData({
      serviceId: service.serviceId,
      title: service.title,
      categoryId: service.categoryId,
      category: service.category || service.categoryName,
      startingPrice: service.startingPrice,
      originalPrice: service.originalPrice || service.startingPrice,
      duration: service.duration || '45 mins',
      featuresText: Array.isArray(service.features) ? service.features.join('\n') : '',
    });
    setModalOpen(true);
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please provide a service title.', 'error');
      return;
    }

    const payload = {
      serviceId: formData.serviceId,
      title: formData.title.trim(),
      categoryId: formData.categoryId,
      category: formData.category,
      startingPrice: Number(formData.startingPrice),
      originalPrice: Number(formData.originalPrice || formData.startingPrice),
      duration: formData.duration,
      features: formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    };

    setProcessing(true);
    try {
      if (editingServiceId) {
        await adminAPI.updateService(editingServiceId, payload);
        showToast('Service updated successfully!', 'success');
      } else {
        await adminAPI.createService(payload);
        showToast('Service added to FixNear catalog!', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to save service: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      const res = await adminAPI.toggleServiceStatus(service._id);
      showToast(res.message || 'Service status updated.', 'info');
      fetchData();
    } catch (err) {
      showToast('Toggle failed: ' + err.message, 'error');
    }
  };

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
            <Wrench size={20} color="var(--forest-700)" />
            <span>Service Catalog & Transparent Price Schedule</span>
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Standardize diagnostic pricing, warranty commitments, and toggle service availability across customer apps.
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
            <span>Add New Service</span>
          </button>
        </div>
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
            placeholder="Search service title..."
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
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.categoryId || c._id} value={c.categoryId}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border-light)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading catalog services...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Wrench size={36} color="var(--forest-300)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', margin: '0 0 6px 0' }}>No Services Listed</h4>
            <p style={{ fontSize: '13px', margin: 0 }}>No services match the selected filter or search term.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-warm)', borderBottom: '1.5px solid var(--border-light)', fontSize: '12px', fontWeight: 800, color: 'var(--forest-900)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Service</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Standard Base Price</th>
                  <th style={{ padding: '14px 18px' }}>Duration</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((srv) => {
                  const isActive = srv.isActive !== false;

                  return (
                    <tr 
                      key={srv._id}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: isActive ? '#FFFFFF' : '#F9FAFB',
                        opacity: isActive ? 1 : 0.65,
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-900)' }}>
                          {srv.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          ID: {srv.serviceId}
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
                          {srv.category || srv.categoryId}
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px', fontWeight: 800, fontSize: '14px', color: 'var(--forest-900)' }}>
                        ₹{srv.startingPrice}
                        {srv.originalPrice > srv.startingPrice && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px', fontWeight: 500 }}>
                            ₹{srv.originalPrice}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px 18px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {srv.duration || '45 mins'}
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px', fontWeight: 800 }}>
                          {isActive ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(srv)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(srv)}
                            className="btn btn-outline btn-sm"
                            style={{ color: isActive ? '#DC2626' : '#16A34A', borderColor: isActive ? '#FCA5A5' : '#86EFAC' }}
                          >
                            <Power size={13} />
                            <span>{isActive ? 'Disable' : 'Enable'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
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
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                {editingServiceId ? 'Edit Catalog Service' : 'Add New Service to FixNear'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>Service Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Inverter AC Jet Servicing & Filter Cleaning"
                  className="form-control"
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const selected = categories.find((c) => c.categoryId === e.target.value);
                      setFormData({
                        ...formData,
                        categoryId: e.target.value,
                        category: selected?.name || e.target.value,
                      });
                    }}
                    className="form-control"
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    {categories.map((c) => (
                      <option key={c.categoryId || c._id} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 45 - 60 mins"
                    className="form-control"
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>Starting Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 700 }}>
                  Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', fontSize: '13px', padding: '8px' }}
                  placeholder="High-pressure foam jet wash&#10;30-day FixNear guarantee"
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
                  {processing ? 'Saving...' : editingServiceId ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
