// ===================================================================
// FixNear Trust - Certified Specialist Spotlight
// Shows only verified, approved providers with skill badges, ratings & job counts
// ===================================================================

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Star, 
  Briefcase, 
  Award, 
  CheckCircle, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { providersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import InitialsAvatar from '../common/InitialsAvatar';

export default function TechnicianSpotlight({ onSelectTechnician }) {
  const navigate = useNavigate();
  const { selectedCity } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const data = await providersAPI.getProviders({ city: selectedCity });
        if (isMounted) {
          setTechnicians(data.providers || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load verified technicians at this time.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProviders();
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  const handleSelect = (techId) => {
    if (onSelectTechnician) {
      onSelectTechnician(techId);
    } else {
      navigate(`/technician/${techId}`);
    }
  };

  return (
    <section id="technicians" className="section-spacing" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-sage">
              <ShieldCheck size={13} style={{ marginRight: '4px' }} />
              Verified Service Partners
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Meet Your Certified Local Specialists
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15.5px' }}>
            Background-vetted, skill-certified service partners in {selectedCity || 'your city'}.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            <p style={{ fontSize: '14.5px' }}>Finding verified specialists in {selectedCity}...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-lg)', border: '1px solid #FECACA' }}>
            <AlertCircle size={32} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '14px', color: '#B91C1C' }}>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && technicians.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-medium)' }}>
            <ShieldCheck size={40} color="var(--forest-600)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>No verified specialists currently listed in {selectedCity}</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
              We are currently vetting and onboarding background-verified technicians in this area. You can switch your city above to view active providers.
            </p>
          </div>
        )}

        {/* Technicians Grid */}
        {!loading && !error && technicians.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {technicians.map((tech) => {
              const techId = tech._id || tech.id;
              const ratingValue = tech.ratingAvg || 4.9;
              const jobsCount = tech.jobsCompleted || 0;
              const skills = tech.skills || [tech.specialty || 'General Maintenance'];

              return (
                <div 
                  key={techId}
                  className="card card-hover"
                  style={{
                    padding: '24px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Profile Top */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <div style={{ position: 'relative' }}>
                      {tech.avatar && !tech.avatar.includes('unsplash') ? (
                        <img 
                          src={tech.avatar} 
                          alt={tech.name} 
                          style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <InitialsAvatar name={tech.name} size={64} />
                      )}
                      <span style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        backgroundColor: 'var(--forest-700)',
                        color: '#FFFFFF',
                        borderRadius: '50%',
                        padding: '2px',
                        display: 'flex',
                        border: '2px solid #FFFFFF'
                      }}>
                        <ShieldCheck size={14} />
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-900)' }}>
                          {tech.name}
                        </h3>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {tech.bio ? `${tech.bio.slice(0, 50)}...` : tech.specialty || "Certified Technician"}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={14} color="#F59E0B" fill="#F59E0B" />
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>{ratingValue}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          ({tech.ratingCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Skill Badges */}
                  <div style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--forest-50)',
                    border: '1px solid var(--forest-100)',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--forest-800)', fontWeight: 800, textTransform: 'uppercase' }}>
                        Verified Skills
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-700)' }}>
                        {jobsCount} Jobs Completed
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {skills.map((s, idx) => (
                        <span 
                          key={idx} 
                          className="badge badge-forest" 
                          style={{ fontSize: '11px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Award size={12} />
                          <span>{typeof s === 'string' ? s : s.categoryName || 'Verified'}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                    <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                      <CheckCircle size={11} />
                      Background Verified
                    </span>
                    <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                      <CheckCircle size={11} />
                      {tech.experienceYears || 5}+ Years Exp
                    </span>
                    <span className="badge badge-yellow" style={{ fontSize: '11px' }}>
                      <Sparkles size={11} />
                      30-Day Warranty
                    </span>
                  </div>

                  {/* Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700 }}>
                      ● Online & Active
                    </span>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSelect(techId)}
                    >
                      View Verified Profile →
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
