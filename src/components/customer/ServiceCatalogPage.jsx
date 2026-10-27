import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Search, 
  ArrowUpDown, 
  Star, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Home,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function ServiceCatalogPage() {
  const { 
    services, 
    categories, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
    navigateToCustomerPage,
    setBookingModalService,
    setIsBookingModalOpen
  } = useStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all'); // 'all' | 'under-400' | '400-800' | 'above-800'
  const [minRating, setMinRating] = useState(0); // 0, 4.85, 4.9
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price-asc' | 'price-desc' | 'rating'

  // Filter & sort logic
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Category filter
      if (selectedCategoryFilter !== 'all' && service.categoryId !== selectedCategoryFilter) {
        return false;
      }

      // Keyword search
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesTitle = service.title.toLowerCase().includes(query);
        const matchesCategory = service.category.toLowerCase().includes(query);
        const matchesFeatures = service.features?.some(f => f.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCategory && !matchesFeatures) return false;
      }

      // Price filter
      if (selectedPriceRange === 'under-400' && service.startingPrice >= 400) return false;
      if (selectedPriceRange === '400-800' && (service.startingPrice < 400 || service.startingPrice > 800)) return false;
      if (selectedPriceRange === 'above-800' && service.startingPrice <= 800) return false;

      // Rating filter
      if (minRating > 0 && service.rating < minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.startingPrice - b.startingPrice;
      if (sortBy === 'price-desc') return b.startingPrice - a.startingPrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount; // default popular
    });
  }, [services, selectedCategoryFilter, searchFilter, selectedPriceRange, minRating, sortBy]);

  const resetAllFilters = () => {
    setSelectedCategoryFilter('all');
    setSearchFilter('');
    setSelectedPriceRange('all');
    setMinRating(0);
    setSortBy('popular');
  };

  const activeCategoryObject = categories.find(c => c.id === selectedCategoryFilter);

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
            onClick={() => navigateToCustomerPage('home')}
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
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-800)' }}>
              FixNear Price Guarantee
            </div>
            <div style={{ fontSize: '12px', color: 'var(--forest-700)' }}>
              ✓ No surprise doorstep callout fees
            </div>
            <div style={{ fontSize: '12px', color: 'var(--forest-700)' }}>
              ✓ Digital approval required for extra parts
            </div>
          </div>
        </div>

        {/* Main Content: Sidebar Filters + Service Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 280px) minmax(0, 1fr)',
          gap: '32px',
          alignItems: 'flex-start'
        }}>
          
          {/* Left Sticky Filter Sidebar */}
          <aside 
            aria-label="Service catalog filters"
            className="card"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              position: 'sticky',
              top: '90px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
                <SlidersHorizontal size={16} color="var(--forest-700)" />
                <span>Filters</span>
              </div>
              <button 
                type="button"
                onClick={resetAllFilters}
                style={{ fontSize: '12px', color: 'var(--forest-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: 'none' }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Filter 1: Categories */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Service Category
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13.5px',
                    fontWeight: selectedCategoryFilter === 'all' ? 700 : 500,
                    backgroundColor: selectedCategoryFilter === 'all' ? 'var(--forest-100)' : 'transparent',
                    color: selectedCategoryFilter === 'all' ? 'var(--forest-900)' : 'var(--text-secondary)',
                    transition: 'all 150ms ease'
                  }}
                >
                  All Categories ({services.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13.5px',
                      fontWeight: selectedCategoryFilter === cat.id ? 700 : 500,
                      backgroundColor: selectedCategoryFilter === cat.id ? 'var(--forest-100)' : 'transparent',
                      color: selectedCategoryFilter === cat.id ? 'var(--forest-900)' : 'var(--text-secondary)',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 2: Price Range */}
            <div style={{ marginBottom: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Starting Price
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                {[
                  { id: 'all', label: 'Any Price' },
                  { id: 'under-400', label: 'Under ₹400' },
                  { id: '400-800', label: '₹400 - ₹800' },
                  { id: 'above-800', label: 'Above ₹800' }
                ].map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="priceRange" 
                      checked={selectedPriceRange === p.id} 
                      onChange={() => setSelectedPriceRange(p.id)}
                      style={{ accentColor: 'var(--forest-700)' }}
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 3: Minimum Rating */}
            <div style={{ paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Customer Rating
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                {[
                  { val: 0, label: 'All Ratings' },
                  { val: 4.85, label: '4.85 ★ & Above' },
                  { val: 4.90, label: '4.90 ★ & Above' }
                ].map(r => (
                  <label key={r.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="ratingFilter" 
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

          {/* Right Main Grid */}
          <div>
            
            {/* Top Toolbar: Search + Sort + Count */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '24px'
            }}>
              
              {/* Keyword Filter Input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-warm)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                minWidth: '260px'
              }}>
                <Search size={16} color="var(--forest-700)" />
                <input 
                  type="text"
                  placeholder="Filter by keyword (e.g. gas, drain, fan)..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
                />
              </div>

              {/* Sorting and Result Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--forest-900)' }}>{filteredServices.length}</strong> services
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-light)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Services List / Cards */}
            {filteredServices.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                  No services match your active filters
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                  Try resetting the category or price range to explore our full rate card.
                </p>
                <button className="btn btn-outline btn-sm" onClick={resetAllFilters}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '24px' }}>
                {filteredServices.map(service => (
                  <div 
                    key={service.id}
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {/* Image & Badges */}
                    <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
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
                        <span>{service.duration}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{service.rating}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          ({service.reviewsCount} reviews)
                        </span>
                      </div>

                      <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.35 }}>
                        {service.title}
                      </h3>

                      {/* Feature checkmarks */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', flex: 1 }}>
                        {service.features.slice(0, 3).map((f, i) => (
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
                            <span style={{ fontSize: '12.5px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                              ₹{service.originalPrice}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--forest-600)', fontWeight: 600 }}>
                            Fixed Rate
                          </span>
                        </div>

                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setBookingModalService(service);
                            setIsBookingModalOpen(true);
                          }}
                        >
                          <span>Book Now</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
