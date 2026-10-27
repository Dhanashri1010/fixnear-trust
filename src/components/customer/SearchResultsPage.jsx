import React, { useState } from 'react';
import { 
  Search, 
  Star, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Home, 
  UserCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const { 
    services, 
    technicians, 
    searchQuery, 
    setSearchQuery, 
    setBookingModalService,
    setIsBookingModalOpen
  } = useStore();

  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const executeSearch = (term) => {
    setSearchQuery(term);
  };

  const query = (searchQuery || '').trim().toLowerCase();

  // Search matching services
  const matchingServices = services.filter(s => {
    if (activeCategoryFilter !== 'all' && s.categoryId !== activeCategoryFilter) return false;
    if (!query) return true;
    const titleMatch = s.title.toLowerCase().includes(query);
    const catMatch = s.category.toLowerCase().includes(query);
    const featMatch = s.features.some(f => f.toLowerCase().includes(query));
    return titleMatch || catMatch || featMatch;
  });

  // Search matching certified technicians
  const matchingTechnicians = technicians.filter(t => {
    if (!query) return true;
    const nameMatch = t.name.toLowerCase().includes(query);
    const specMatch = t.specialty.toLowerCase().includes(query);
    const bioMatch = t.bio?.toLowerCase().includes(query);
    const areaMatch = t.serviceAreas?.some(a => a.toLowerCase().includes(query));
    return nameMatch || specMatch || bioMatch || areaMatch;
  });

  const popularSearches = [
    "Split AC Foam Clean",
    "Pipe Leak Triage",
    "MCB Tripping Fix",
    "Gas Refill",
    "Drain Blockage",
    "Ceiling Fan"
  ];

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
          <span style={{ color: 'var(--text-secondary)' }}>Search Results</span>
          {query && (
            <>
              <ChevronRight size={13} />
              <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>"{searchQuery}"</span>
            </>
          )}
        </nav>

        {/* Search Refinement Box */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span className="badge badge-forest">Intelligent Diagnostic Search</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Matches both standardized rates and local specialists
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--bg-warm)',
            border: '1.5px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            marginBottom: '16px'
          }}>
            <Search size={22} color="var(--forest-700)" />
            <input 
              type="text"
              placeholder="Search by problem symptom, service name, or technician specialty..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch(localSearch)}
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '15px',
                color: 'var(--text-primary)'
              }}
            />
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => executeSearch(localSearch)}
            >
              Update Search
            </button>
          </div>

          {/* Quick Suggested Keywords */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Suggested:</span>
            {popularSearches.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLocalSearch(s);
                  executeSearch(s);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Matching Services */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
              Matched Standardized Services ({matchingServices.length})
            </h2>
            <button 
              type="button"
              onClick={() => navigate('/services')}
              style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-700)', background: 'none' }}
            >
              View Full Rate Catalog →
            </button>
          </div>

          {matchingServices.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '40px 24px',
              textAlign: 'center',
              border: '1px solid var(--border-light)'
            }}>
              <AlertCircle size={32} color="var(--yellow-600)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                No standard services found matching "{searchQuery}"
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Try searching for a general symptom like "leak", "cooling", "tripping", or "filter".
              </p>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setLocalSearch('');
                  executeSearch('');
                }}
              >
                Clear Search Query
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {matchingServices.map(service => (
                <div 
                  key={service.id}
                  className="card card-hover"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ height: '170px', position: 'relative' }}>
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--forest-800)'
                    }}>
                      {service.category}
                    </div>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{service.rating}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        ({service.reviewsCount} reviews)
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>
                      {service.title}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px', flex: 1 }}>
                      {service.features.slice(0, 2).map((feat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={13} color="var(--forest-700)" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-light)'
                    }}>
                      <div>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-800)' }}>
                          ₹{service.startingPrice}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--forest-700)' }}>Fixed Scope</div>
                      </div>

                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setBookingModalService(service);
                          setIsBookingModalOpen(true);
                        }}
                      >
                        Book Service
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Matched Verified Specialists */}
        {matchingTechnicians.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <UserCheck size={20} color="var(--forest-700)" />
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
                Certified Specialists for this Category ({matchingTechnicians.length})
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {matchingTechnicians.map(tech => (
                <div 
                  key={tech.id}
                  className="card card-hover"
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <img 
                      src={tech.avatar} 
                      alt={tech.name} 
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{tech.name}</h3>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tech.specialty}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Star size={13} color="#F59E0B" fill="#F59E0B" />
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>{tech.rating}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({tech.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {tech.bio ? tech.bio.slice(0, 110) + '...' : 'Certified local specialist.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                    <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                      {tech.trustScore}
                    </span>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/technician/${tech.id}`)}
                    >
                      <span>View Full Profile</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
