import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, 
  Search, 
  Star, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Home,
  SlidersHorizontal,
  RotateCcw,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { servicesAPI } from '../../services/api';

export default function ServiceCatalogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [searchFilter, setSearchFilter] = useState(searchParams.get('search') || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all'); // 'all' | 'under-400' | '400-800' | 'above-800'
  const [minRating, setMinRating] = useState(0); // 0, 4.85, 4.9
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price-asc' | 'price-desc' | 'rating'

  useEffect(() => {
    let isMounted = true;
    const loadCatalogData = async () => {
      try {
        setLoading(true);
        const [catsRes, servsRes] = await Promise.all([
          servicesAPI.getCategories(),
          servicesAPI.getServices(),
        ]);
        if (isMounted) {
          setCategories(catsRes.categories || []);
          setServices(servsRes.services || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load catalog data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCatalogData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync category changes to URL
  const handleCategoryChange = (catId) => {
    setSelectedCategoryFilter(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  // Filter & sort logic
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Category filter
      if (selectedCategoryFilter !== 'all' && service.categoryId !== selectedCategoryFilter && service.category !== selectedCategoryFilter) {
        return false;
      }

      // Keyword search
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesTitle = service.title?.toLowerCase().includes(query);
        const matchesCategory = service.category?.toLowerCase().includes(query);
        const matchesFeatures = service.features?.some(f => f.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCategory && !matchesFeatures) return false;
      }

      // Price filter
      if (selectedPriceRange === 'under-400' && service.startingPrice >= 400) return false;
      if (selectedPriceRange === '400-800' && (service.startingPrice < 400 || service.startingPrice > 800)) return false;
      if (selectedPriceRange === 'above-800' && service.startingPrice <= 800) return false;

      // Rating filter
      if (minRating > 0 && (service.rating || 4.9) < minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.startingPrice - b.startingPrice;
      if (sortBy === 'price-desc') return b.startingPrice - a.startingPrice;
      if (sortBy === 'rating') return (b.rating || 4.9) - (a.rating || 4.9);
      return (b.reviewsCount || 100) - (a.reviewsCount || 100);
    });
  }, [services, selectedCategoryFilter, searchFilter, selectedPriceRange, minRating, sortBy]);

  const resetAllFilters = () => {
    handleCategoryChange('all');
    setSearchFilter('');
    setSelectedPriceRange('all');
    setMinRating(0);
    setSortBy('popular');
  };

  const activeCategoryObject = categories.find(c => c.categoryId === selectedCategoryFilter || c.name === selectedCategoryFilter);

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <nav 
          aria-label="Breadcrumbs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '24px'
          }}
        >
          <button 
            type="button"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--forest-700)', fontWeight: 600, background: 'none' }}
          >
            <Home size={14} />
            <span>Home</span>
          </button>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--text-secondary)' }}>All Services</span>
          {activeCategoryObject && (
            <>
              <ChevronRight size={13} />
              <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>
                {activeCategoryObject.name}
              </span>
            </>
          )}
        </nav>

        {/* Page Title & Trust Summary Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '8px' }}>
              <span className="badge badge-forest">
                <ShieldCheck size={14} />
                Standardized Rate Catalog
              </span>
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {activeCategoryObject ? activeCategoryObject.name : "Explore All Certified Home Services"}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '620px' }}>
              Every service includes upfront itemized pricing, vetted skill-certified partners, and our signature 30-day workmanship guarantee.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px 20px',
            backgroundColor: 'var(--forest-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--forest-100)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--forest-800)' }}>
              <CheckCircle2 size={16} color="var(--forest-700)" />
              <span>Zero Doorstep Surprises</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--forest-800)' }}>
              <CheckCircle2 size={16} color="var(--forest-700)" />
              <span>Payment Protected by Server</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            <p style={{ fontSize: '15px' }}>Loading verified service catalog...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-lg)', border: '1px solid #FECACA' }}>
            <AlertCircle size={32} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#991B1B', marginBottom: '6px' }}>Catalog error</h4>
            <p style={{ fontSize: '14px', color: '#B91C1C' }}>{error}</p>
          </div>
        )}

        {/* Main 2-Column Layout */}
        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '280px minmax(0, 1fr)',
            gap: '32px',
            alignItems: 'start'
          }}>
            
            {/* Left Sidebar: Filters */}
            <aside style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '90px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px' }}>
                  <Filter size={18} color="var(--forest-700)" />
                  <span>Filters</span>
                </div>
                <button 
                  onClick={resetAllFilters}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--forest-700)', fontWeight: 600, background: 'none' }}
                >
                  <RotateCcw size={12} />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Filter 1: Search inside catalog */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'block', color: 'var(--text-primary)' }}>
                  Search Catalog
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by issue or name..."
                    className="input-field"
                    style={{ paddingLeft: '34px', fontSize: '13px', height: '38px' }}
                  />
                </div>
              </div>

              {/* Filter 2: Categories */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'block', color: 'var(--text-primary)' }}>
                  Service Category
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    onClick={() => handleCategoryChange('all')}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: selectedCategoryFilter === 'all' ? 700 : 500,
                      backgroundColor: selectedCategoryFilter === 'all' ? 'var(--forest-50)' : 'transparent',
                      color: selectedCategoryFilter === 'all' ? 'var(--forest-800)' : 'var(--text-secondary)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    All Categories ({services.length})
                  </button>
                  {categories.map(c => {
                    const count = services.filter(s => s.categoryId === c.categoryId || s.category === c.name).length;
                    const catKey = c.categoryId || c.name;
                    return (
                      <button
                        key={catKey}
                        onClick={() => handleCategoryChange(catKey)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                          fontWeight: selectedCategoryFilter === catKey ? 700 : 500,
                          backgroundColor: selectedCategoryFilter === catKey ? 'var(--forest-50)' : 'transparent',
                          color: selectedCategoryFilter === catKey ? 'var(--forest-800)' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{c.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 3: Price Range */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'block', color: 'var(--text-primary)' }}>
                  Base Rate
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'all', label: 'Any Base Price' },
                    { id: 'under-400', label: 'Under ₹400' },
                    { id: '400-800', label: '₹400 - ₹800' },
                    { id: 'above-800', label: 'Above ₹800' }
                  ].map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input 
                        type="radio" 
                        name="price-filter"
                        checked={selectedPriceRange === p.id}
                        onChange={() => setSelectedPriceRange(p.id)}
                        style={{ accentColor: 'var(--forest-700)' }}
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 4: Rating */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'block', color: 'var(--text-primary)' }}>
                  Technician Rating
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { val: 0, label: 'All Verified Ratings' },
                    { val: 4.85, label: '4.85+ Highly Rated' },
                    { val: 4.9, label: '4.9+ FixNear Premier' }
                  ].map(r => (
                    <label key={r.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input 
                        type="radio" 
                        name="rating-filter"
                        checked={minRating === r.val}
                        onChange={() => setMinRating(r.val)}
                        style={{ accentColor: 'var(--forest-700)' }}
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </aside>

            {/* Right Column: Results & Sorting */}
            <div>
              
              {/* Results Topbar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '12px 20px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Showing <strong style={{ color: 'var(--forest-900)' }}>{filteredServices.length}</strong> standardized services
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SlidersHorizontal size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field"
                    style={{ height: '36px', fontSize: '13px', padding: '0 12px', minWidth: '150px' }}
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Service Cards Grid */}
              {filteredServices.length === 0 ? (
                <div style={{
                  padding: '64px 32px',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-medium)'
                }}>
                  <Wrench size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No matching services found</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Try clearing or relaxing your search query and filters.
                  </p>
                  <button onClick={resetAllFilters} className="btn btn-outline btn-sm">
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '24px'
                }}>
                  {filteredServices.map(service => {
                    const serviceKey = service.serviceId || service._id;
                    return (
                      <div 
                        key={serviceKey}
                        className="card card-hover"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: '#FFFFFF',
                          borderRadius: 'var(--radius-lg)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        {/* Image & Badges */}
                        <div style={{ position: 'relative', height: '175px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--forest-50)' }}>
                          {service.image ? (
                            <img 
                              src={service.image} 
                              alt={service.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--forest-100)' }}>
                              <Wrench size={38} color="var(--forest-700)" />
                            </div>
                          )}
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(4px)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: 'var(--forest-800)'
                          }}>
                            {service.category}
                          </div>

                          <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            backgroundColor: 'rgba(30, 58, 47, 0.92)',
                            color: '#FFFFFF',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock size={11} />
                            <span>{service.duration || '45 - 60 mins'}</span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <Star size={14} color="#F59E0B" fill="#F59E0B" />
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>{service.rating || '4.9'}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              ({service.reviewsCount || 100} ratings)
                            </span>
                          </div>

                          <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.35 }}>
                            {service.title}
                          </h3>

                          {/* Feature checkmarks */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', flex: 1 }}>
                            {(service.features || []).slice(0, 3).map((f, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                <CheckCircle2 size={13} color="var(--forest-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>

                          {/* Pricing & Booking Action */}
                          <div style={{
                            paddingTop: '16px',
                            borderTop: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-800)' }}>
                                  ₹{service.startingPrice}
                                </span>
                                {service.originalPrice > service.startingPrice && (
                                  <span style={{ fontSize: '12.5px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                                    ₹{service.originalPrice}
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--forest-600)', fontWeight: 600 }}>
                                Standard Rate
                              </span>
                            </div>

                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/book?serviceId=${serviceKey}`)}
                            >
                              <span>Book Now</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
