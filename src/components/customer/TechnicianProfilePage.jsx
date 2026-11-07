import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Award, 
  Wrench, 
  Clock, 
  ChevronRight, 
  Home, 
  AlertCircle
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { providersAPI, servicesAPI } from '../../services/api';
import InitialsAvatar from '../common/InitialsAvatar';

export default function TechnicianProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [technician, setTechnician] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'equipment' | 'reviews'

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [provRes, servRes] = await Promise.all([
          providersAPI.getProviderById(id),
          servicesAPI.getServices(),
        ]);

        if (isMounted) {
          setTechnician(provRes.provider);
          setReviews(provRes.reviews || []);
          setServices(servRes.services || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Technician profile not found.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchProfile();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Loading certified specialist profile...</p>
        </div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh', padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '520px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '40px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Technician Profile Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              {error || 'This technician might be currently inactive or the profile link is invalid.'}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter services relevant to technician specialty
  const matchedServices = services.filter(s => 
    s.category.toLowerCase().includes((technician.specialty || '').split(' ')[0].toLowerCase()) ||
    (technician.skills && technician.skills.some(sk => s.category.toLowerCase().includes(sk.toLowerCase())))
  );
  const displayServices = matchedServices.length > 0 ? matchedServices : services.slice(0, 4);

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
          <button 
            type="button"
            onClick={() => navigate('/services')}
            style={{ color: 'var(--text-secondary)', background: 'none' }}
          >
            Verified Experts
          </button>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>
            {technician.name}
          </span>
        </nav>

        {/* Profile Header Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '28px'
          }}>
            
            {/* Left: Avatar & Identity Details */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <InitialsAvatar name={technician.name} size={96} />
                <span style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  backgroundColor: 'var(--forest-700)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  padding: '4px',
                  border: '2px solid #FFFFFF',
                  display: 'flex'
                }}>
                  <ShieldCheck size={18} />
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {technician.name}
                  </h1>
                  <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                    Verified Partner
                  </span>
                </div>

                <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  {technician.specialty || 'General Service Specialist'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={15} color="#F59E0B" fill="#F59E0B" />
                    <strong style={{ color: 'var(--text-primary)' }}>{technician.ratingAvg || 4.9}</strong>
                    <span>({technician.ratingCount || 0} reviews)</span>
                  </div>
                  <div>•</div>
                  <div><strong>{technician.experienceYears || 5}+ Years</strong> Experience</div>
                  <div>•</div>
                  <div><strong>{technician.jobsCompleted || 0}</strong> Completed Jobs</div>
                </div>

                {/* Badges Ribbon */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <span className="badge badge-sage" style={{ fontSize: '11.5px', padding: '3px 10px' }}>
                    <CheckCircle2 size={12} />
                    Police Verified
                  </span>
                  <span className="badge badge-sage" style={{ fontSize: '11.5px', padding: '3px 10px' }}>
                    <CheckCircle2 size={12} />
                    Skill Tested
                  </span>
                  <span className="badge badge-yellow" style={{ fontSize: '11.5px', padding: '3px 10px' }}>
                    ⚡ Available for Booking
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Booking Action Box */}
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--forest-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--forest-100)',
              minWidth: '260px'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Service Guarantee</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-800)', marginBottom: '14px' }}>
                Standard Rates Apply
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => {
                  const defaultService = displayServices[0];
                  if (defaultService) {
                    navigate(`/book?serviceId=${defaultService.serviceId || defaultService._id}`);
                  } else {
                    navigate('/book');
                  }
                }}
                style={{ width: '100%', padding: '12px' }}
              >
                <span>Book Service Now</span>
              </button>

              <div style={{ fontSize: '11px', color: 'var(--forest-700)', textAlign: 'center', marginTop: '8px' }}>
                ✓ Guaranteed 30-Day FixNear Workmanship Warranty
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid var(--border-light)',
          marginBottom: '32px',
          gap: '24px'
        }}>
          {[
            { id: 'overview', label: 'Biography & Credentials' },
            { id: 'services', label: `Standard Services (${displayServices.length})` },
            { id: 'reviews', label: `Customer Reviews (${reviews.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 4px',
                fontSize: '14.5px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--forest-800)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '3px solid var(--forest-700)' : '3px solid transparent',
                marginBottom: '-2px',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '32px' }}>
            <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>Professional Summary</h3>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                {technician.bio || `${technician.name} is a certified specialist with over ${technician.experienceYears || 5} years of field experience handling home repairs and servicing with precision.`}
              </p>

              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Service Area</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--bg-warm)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)'
                }}>
                  <MapPin size={13} color="var(--forest-700)" />
                  <span>{technician.city || 'Mumbai'}</span>
                </span>
              </div>

              <div style={{
                padding: '14px',
                backgroundColor: 'var(--forest-50)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--forest-100)',
                fontSize: '13px',
                color: 'var(--forest-800)'
              }}>
                <strong>Trust Audit Completed:</strong> Background check verified and identity authenticated on FixNear Trust Platform.
              </div>
            </div>

            {/* Trust Metrics Card */}
            <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '18px' }}>Quality & Safety Scorecard</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Customer Punctuality Rate</span>
                  <strong style={{ color: 'var(--forest-800)' }}>99.2%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>First-Time Fix Ratio</span>
                  <strong style={{ color: 'var(--forest-800)' }}>98.1%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Quotation Transparency</span>
                  <strong style={{ color: 'var(--forest-800)' }}>100% (No extra charges without consent)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Warranty Re-work Claims</span>
                  <strong style={{ color: 'var(--forest-800)' }}>&lt; 0.5%</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Services */}
        {activeTab === 'services' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {displayServices.map(service => {
              const serviceKey = service.serviceId || service._id;
              return (
                <div key={serviceKey} className="card card-hover" style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--forest-700)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    {service.category}
                  </div>
                  <h4 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '10px' }}>{service.title}</h4>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Est. Duration: {service.duration || '45 - 60 mins'} · 30-Day Warranty
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-800)' }}>₹{service.startingPrice}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Base Rate</span>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/book?serviceId=${serviceKey}`)}
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              Verified Customer Experience ({reviews.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev._id || rev.id} style={{ padding: '16px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rev.authorName || "Verified Customer"}</span>
                    </div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No reviews submitted yet for this provider.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
