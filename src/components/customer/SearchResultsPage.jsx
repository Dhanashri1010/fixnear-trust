import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Wrench
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { servicesAPI, providersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import InitialsAvatar from '../common/InitialsAvatar';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity } = useAuth();

  const query = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState(query);
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalSearch(query);
  }, [query]);

  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      try {
        setLoading(true);
        const [servRes, provRes] = await Promise.all([
          servicesAPI.getServices(query ? { search: query } : {}),
          providersAPI.getProviders({ city: selectedCity, search: query }),
        ]);

        if (isMounted) {
          setServices(servRes.services || []);
          setTechnicians(provRes.providers || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load search results.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResults();
    return () => {
      isMounted = false;
    };
  }, [query, selectedCity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ q: localSearch.trim() });
    } else {
      setSearchParams({});
    }
  };

  const popularSearches = [
    "Split AC",
    "Pipe Leak",
    "Switchboard",
    "Water Purifier",
    "Washing Machine"
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container">
        
        {/* Breadcrumbs */}
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
          <span style={{ color: 'var(--text-secondary)' }}>Search</span>
          {query && (
            <>
              <ChevronRight size={13} />
              <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>
                "{query}"
              </span>
            </>
          )}
        </nav>

        {/* Search Input Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px'
        }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
            {query ? `Search Results for "${query}"` : "Search Services & Specialists"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '20px' }}>
            Discover standardized rate items and background-vetted specialists in {selectedCity}.
          </p>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', maxWidth: '640px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="What service or issue do you need help with?"
                className="input-field"
                style={{ paddingLeft: '40px', height: '46px', fontSize: '15px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
              Search
            </button>
          </form>

          {/* Quick tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Popular:</span>
            {popularSearches.map((tag, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={() => {
                  setLocalSearch(tag);
                  setSearchParams({ q: tag });
                }}
                className="badge badge-sage"
                style={{ cursor: 'pointer', border: 'none' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            <p style={{ fontSize: '14.5px' }}>Searching services and certified specialists...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-lg)', border: '1px solid #FECACA' }}>
            <AlertCircle size={28} color="#DC2626" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ fontSize: '14px', color: '#B91C1C' }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <div>
            {/* Matching Services Section */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                  Standard Rate Services ({services.length})
                </h2>
                <span className="badge badge-sage">Fixed upfront price</span>
              </div>

              {services.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-medium)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No specific standard services matched your search term.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {services.map(service => {
                    const serviceKey = service.serviceId || service._id;
                    return (
                      <div key={serviceKey} className="card card-hover" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span className="badge badge-forest" style={{ alignSelf: 'flex-start', marginBottom: '8px', fontSize: '11px' }}>
                            {service.category}
                          </span>
                          <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '8px' }}>
                            {service.title}
                          </h3>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', flex: 1 }}>
                            {(service.features || []).slice(0, 2).join(' • ')}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                            <div>
                              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-800)' }}>₹{service.startingPrice}</span>
                              <span style={{ fontSize: '11px', color: 'var(--forest-600)', display: 'block' }}>Standard Rate</span>
                            </div>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/book?serviceId=${serviceKey}`)}
                            >
                              <span>Book</span>
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

            {/* Matching Verified Technicians Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                  Certified Technicians ({technicians.length})
                </h2>
                <span className="badge badge-sage">Verified in {selectedCity}</span>
              </div>

              {technicians.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-medium)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No verified specialists found matching "{query}" in {selectedCity}.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {technicians.map(tech => {
                    const techId = tech._id || tech.id;
                    return (
                      <div key={techId} className="card card-hover" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                          <InitialsAvatar name={tech.name} size={52} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{tech.name}</h3>
                              <ShieldCheck size={14} color="var(--forest-700)" />
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tech.specialty || 'Service Specialist'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                              <Star size={12} color="#F59E0B" fill="#F59E0B" />
                              <strong>{tech.ratingAvg || 4.9}</strong>
                              <span style={{ color: 'var(--text-muted)' }}>({tech.ratingCount || 0} reviews)</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>● Online</span>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/technician/${techId}`)}
                          >
                            View Profile
                          </button>
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
