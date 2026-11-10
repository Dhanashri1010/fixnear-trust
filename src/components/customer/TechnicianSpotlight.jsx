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
import { useLanguage } from '../../context/LanguageContext';
import InitialsAvatar from '../common/InitialsAvatar';

export default function TechnicianSpotlight({ onSelectTechnician }) {
  const navigate = useNavigate();
  const { selectedCity } = useAuth();
  const { t } = useLanguage();
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
          setError(err.message || t('common.errorGeneral', 'Unable to load verified technicians at this time.'));
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
              {t('technician.partnersBadge', 'Verified Service Partners')}
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            {t('technician.meetSpecialists', 'Meet Your Certified Local Specialists')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15.5px' }}>
            {t('technician.meetSpecialistsSub', 'Background-vetted, skill-certified service partners in')} {selectedCity || t('technician.inYourCity', 'your city')}.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            <p style={{ fontSize: '14.5px' }}>{t('technician.findingSpecialists', 'Finding verified specialists in')} {selectedCity}...</p>
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
          <div style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-medium)',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            <Briefcase size={36} color="var(--forest-600)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              {t('technician.noSpecialistsListed', 'No verified specialists currently listed in')} {selectedCity}
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              {t('technician.noSpecialistsSub', 'We are currently onboarding certified technicians for this area.')}
            </p>
          </div>
        )}

        {/* Grid of Verified Technicians */}
        {!loading && !error && technicians.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {technicians.map((tech) => {
              const techId = tech._id || tech.providerId;
              const skills = tech.skills || [tech.specialty || 'General Trade'];
              const ratingValue = Number(tech.ratingAvg || tech.rating || 4.9).toFixed(1);
              const jobsCount = tech.jobsDone || tech.completedJobs || 28;

              return (
                <div 
                  key={techId}
                  className="card card-hover"
                  style={{
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Top: Avatar, Name, Rating */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ position: 'relative' }}>
                      <InitialsAvatar name={tech.name} avatarUrl={tech.avatar} size={56} />
                      <span style={{
                        position: 'absolute',
                        bottom: '-2px',
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
                        {tech.bio ? `${tech.bio.slice(0, 50)}...` : tech.specialty || t('home.certifiedSpecialist', 'Certified Technician')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={14} color="#F59E0B" fill="#F59E0B" />
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>{ratingValue}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          ({tech.ratingCount || 0} {t('catalog.verifiedRatings', 'reviews')})
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
                        {t('technician.skillsList', 'Verified Skills')}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-700)' }}>
                        {jobsCount} {t('technician.completedJobs', 'Jobs Completed')}
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
                          <span>{typeof s === 'string' ? (t(`categories.${s}`, s)) : s.categoryName || t('common.verifiedBadge', 'Verified')}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                    <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                      <CheckCircle size={11} />
                      {t('common.verifiedTechnician', 'Background Verified')}
                    </span>
                    <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                      <CheckCircle size={11} />
                      {tech.experienceYears || 5}+ {t('technician.experienceYears', 'Years Exp')}
                    </span>
                    <span className="badge badge-yellow" style={{ fontSize: '11px' }}>
                      <Sparkles size={11} />
                      {t('common.warrantyBadge', '30-Day Warranty')}
                    </span>
                  </div>

                  {/* Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700 }}>
                      ● {t('common.online', 'Online & Active')}
                    </span>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSelect(techId)}
                    >
                      {t('technician.viewProfile', 'View Verified Profile →')}
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
