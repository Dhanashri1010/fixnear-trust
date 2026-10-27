// ===================================================================
// FixNear Trust - Service Provider 3-Step Registration Page
// Step 1: Personal Details | Step 2: Skills & Area | Step 3: Documents
// ===================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { storage, ref, uploadBytes, getDownloadURL, isLiveFirebaseConfigured } from '../../services/firebase/firebase';

export default function ProviderRegisterPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateProviderProfile } = useAuth();
  const { categories, registerProviderProfile } = useStore();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: userProfile?.name || currentUser?.displayName || '',
    phone: userProfile?.phone || '+91 98200 ',
    city: userProfile?.city || 'Mumbai',
    serviceArea: 'Bandra West, Khar, Santacruz',
    category: 'ac-cooling',
    experienceYears: 4,
    bio: 'Dedicated technician with extensive hands-on experience in domestic diagnostics, safety adherence, and fast repairs.',
    idProofUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    certificateUrl: '',
    agreeTerms: true
  });

  const [idFileName, setIdFileName] = useState('aadhaar_card_front.jpg');
  const [certFileName, setCertFileName] = useState('');
  const [idPreviewUrl, setIdPreviewUrl] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80');
  const [certPreviewUrl, setCertPreviewUrl] = useState('');
  const [uploadingField, setUploadingField] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Real File Upload to Firebase Storage with Fallback Data URL Preview
  const handleRealFileUpload = async (e, field, setFileName, setPreviewUrl) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Enforce 5 MB maximum size limit
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      showToast('File size exceeds the 5 MB limit. Please select a smaller file.', 'error');
      e.target.value = '';
      return;
    }

    // 2. Enforce JPG, PNG, and PDF formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid format. Please upload JPG, PNG, or PDF files only.', 'error');
      e.target.value = '';
      return;
    }

    setUploadingField(field);
    setFileName(file.name);

    try {
      // Create local preview immediately
      if (file.type.startsWith('image/')) {
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
      } else {
        setPreviewUrl('pdf-document');
      }

      // If Firebase Live Storage is available, upload directly
      if (isLiveFirebaseConfigured && storage) {
        const ext = file.name.split('.').pop() || 'jpg';
        const userId = currentUser?.uid || `prov-${Date.now()}`;
        const fileRef = ref(storage, `kyc/${userId}/${field}_${Date.now()}.${ext}`);
        await uploadBytes(fileRef, file);
        const remoteUrl = await getDownloadURL(fileRef);
        handleInputChange(field, remoteUrl);
        showToast(`${file.name} uploaded to secure storage!`, 'success');
      } else {
        // Fallback: convert to base64 Data URL so Admin can inspect it directly
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const dataUrl = loadEvt.target.result;
          handleInputChange(field, dataUrl);
          if (file.type.startsWith('image/')) {
            setPreviewUrl(dataUrl);
          }
          showToast(`${file.name} attached successfully!`, 'success');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Storage upload error, using local reference:', err);
      showToast(`Attached ${file.name} locally.`, 'info');
    } finally {
      setUploadingField(null);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name.trim() || !formData.phone.trim() || !formData.city.trim()) {
        showToast('Please fill out all personal details.', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.serviceArea.trim() || !formData.category) {
        showToast('Please specify your service area and skills.', 'error');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      showToast('Please agree to FixNear Safety & Quality Code.', 'warning');
      return;
    }
    if (!formData.idProofUrl) {
      showToast('Please attach a valid Government ID proof to continue.', 'error');
      return;
    }

    setLoading(true);
    try {
      const providerPayload = {
        userId: currentUser?.uid || `prov-${Date.now()}`,
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        serviceArea: formData.serviceArea,
        category: formData.category,
        skills: [formData.category],
        experienceYears: Number(formData.experienceYears),
        bio: formData.bio,
        idProofUrl: formData.idProofUrl,
        certificateUrl: formData.certificateUrl || null,
        status: 'pending_test'
      };

      await registerProviderProfile(providerPayload);
      if (updateProviderProfile) {
        await updateProviderProfile(providerPayload);
      }

      showToast('Profile registered! Now proceeding to the mandatory skill test.', 'success');
      navigate(`/provider/test/${formData.category}`);
    } catch (err) {
      console.error('Registration error:', err);
      showToast('Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryObj = categories.find(c => c.id === formData.category) || categories[0];

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '36px 16px 80px 16px' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--forest-100)',
            color: 'var(--forest-800)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <ShieldCheck size={16} />
            <span>Join 2,400+ Certified FixNear Partners</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-900)' }}>
            Service Provider Registration
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '8px auto 0 auto' }}>
            Earn ₹35,000 - ₹65,000/month with zero upfront investment. Complete 3 simple steps to get certified.
          </p>
        </div>

        {/* 3-Step Stepper Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: step >= 1 ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            border: step === 1 ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
            boxShadow: step === 1 ? 'var(--shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: step > 1 ? 'var(--forest-700)' : step === 1 ? 'var(--forest-100)' : 'var(--border-light)',
              color: step > 1 ? '#FFFFFF' : step === 1 ? 'var(--forest-800)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px'
            }}>
              {step > 1 ? <CheckCircle2 size={16} /> : '1'}
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Step 1</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>Personal Info</div>
            </div>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: step >= 2 ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            border: step === 2 ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
            boxShadow: step === 2 ? 'var(--shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: step > 2 ? 'var(--forest-700)' : step === 2 ? 'var(--forest-100)' : 'var(--border-light)',
              color: step > 2 ? '#FFFFFF' : step === 2 ? 'var(--forest-800)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px'
            }}>
              {step > 2 ? <CheckCircle2 size={16} /> : '2'}
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Step 2</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>Skills & Area</div>
            </div>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: step === 3 ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            border: step === 3 ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
            boxShadow: step === 3 ? 'var(--shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: step === 3 ? 'var(--forest-100)' : 'var(--border-light)',
              color: step === 3 ? 'var(--forest-800)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px'
            }}>
              3
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Step 3</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>KYC Documents</div>
            </div>
          </div>
        </div>

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <form onSubmit={handleNext} className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
              Step 1: Your Personal Information
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Customers will see your name and contact once a service request is assigned.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                  Full Name (as per Aadhaar / PAN card) *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                    Mobile Number (for SMS & OTP alerts) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 98200 11223"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-light)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                    Primary Operating City *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-light)',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <option value="Mumbai">Mumbai (All Zones)</option>
                      <option value="Navi Mumbai">Navi Mumbai</option>
                      <option value="Thane">Thane</option>
                      <option value="Pune">Pune</option>
                      <option value="Bengaluru">Bengaluru</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--forest-50)',
                border: '1px solid var(--forest-100)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
                color: 'var(--forest-900)'
              }}>
                <Info size={20} color="var(--forest-700)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>FixNear Privacy Guarantee:</strong> Your contact number is masked during initial discovery and only shared once you accept a dispatched booking.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                  <span>Continue to Skills & Area</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 2: Trade Skills & Experience */}
        {step === 2 && (
          <form onSubmit={handleNext} className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
              Step 2: Skills, Experience & Service Coverage
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Select the primary craft in which you wish to take the certification skill test.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Category Grid */}
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '10px' }}>
                  Select Your Primary Trade Craft *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {categories.map(cat => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleInputChange('category', cat.id)}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--forest-700)' : '1.5px solid var(--border-light)',
                          backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--forest-700)' : 'var(--bg-warm)',
                          color: isSelected ? '#FFFFFF' : 'var(--forest-800)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '18px'
                        }}>
                          {cat.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-900)' }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {cat.servicesCount || '6'} services available
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Experience and Service Area */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                    Years of Field Experience *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select
                      value={formData.experienceYears}
                      onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-light)',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <option value={1}>1 Year (Junior Technician)</option>
                      <option value={2}>2 Years</option>
                      <option value={3}>3 Years (Senior Technician)</option>
                      <option value={5}>5+ Years (Specialist)</option>
                      <option value={8}>8+ Years (Master Technician)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                    Preferred Service Localities / Pin Codes *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      value={formData.serviceArea}
                      onChange={(e) => handleInputChange('serviceArea', e.target.value)}
                      placeholder="e.g. Bandra West, Khar, Santacruz"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-light)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                  Professional Bio / Experience Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Share details about your background, brands you service, and customer commitment..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-light)',
                    fontSize: '13.5px',
                    lineHeight: 1.5
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                  <span>Continue to Documents</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </form>
        )}

        {/* Step 3: KYC & Document Verification */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
              Step 3: Identity Verification & Certificates
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              FixNear requires verified Aadhaar/Govt ID proof to prevent doorstep fraud and earn customer trust.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* ID Proof Box with Real File Upload & Preview */}
              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px dashed var(--forest-600)',
                backgroundColor: 'var(--forest-50)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {idPreviewUrl && idPreviewUrl !== 'pdf-document' ? (
                      <img 
                        src={idPreviewUrl} 
                        alt="ID Preview" 
                        style={{ 
                          width: '54px', 
                          height: '54px', 
                          borderRadius: 'var(--radius-md)', 
                          objectFit: 'cover', 
                          border: '2px solid var(--forest-600)',
                          boxShadow: 'var(--shadow-sm)'
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--forest-800)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <FileText size={26} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--forest-900)' }}>
                        Government ID Proof (Aadhaar / Driving License / PAN) *
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {idFileName ? (
                          <span>File: <strong>{idFileName}</strong> • Verified Format</span>
                        ) : (
                          <span style={{ color: '#DC2626' }}>Required (Max 5 MB • JPG, PNG, PDF)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="real-id-upload"
                      className="btn btn-outline btn-sm"
                      style={{ 
                        cursor: 'pointer', 
                        backgroundColor: '#FFFFFF', 
                        borderColor: 'var(--forest-700)', 
                        color: 'var(--forest-800)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Upload size={14} />
                      <span>{uploadingField === 'idProofUrl' ? 'Uploading...' : idFileName ? 'Change File' : 'Upload ID Proof'}</span>
                    </label>
                    <input 
                      id="real-id-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleRealFileUpload(e, 'idProofUrl', setIdFileName, setIdPreviewUrl)}
                    />
                  </div>
                </div>
              </div>

              {/* Trade Certificate (Optional) with Real Upload & Preview */}
              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px dashed var(--border-light)',
                backgroundColor: 'var(--bg-warm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {certPreviewUrl && certPreviewUrl !== 'pdf-document' ? (
                      <img 
                        src={certPreviewUrl} 
                        alt="Certificate Preview" 
                        style={{ 
                          width: '54px', 
                          height: '54px', 
                          borderRadius: 'var(--radius-md)', 
                          objectFit: 'cover', 
                          border: '2px solid var(--forest-600)',
                          boxShadow: 'var(--shadow-sm)'
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <Award size={26} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--forest-900)' }}>
                        Trade Diploma / ITI / OEM Certificate (Optional)
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {certFileName ? `File: ${certFileName}` : "Upload certificate to earn 'Gold Certified' distinction (Max 5 MB)"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="real-cert-upload"
                      className="btn btn-outline btn-sm"
                      style={{ 
                        cursor: 'pointer', 
                        backgroundColor: '#FFFFFF', 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Upload size={14} />
                      <span>{uploadingField === 'certificateUrl' ? 'Uploading...' : certFileName ? 'Replace' : 'Upload Certificate'}</span>
                    </label>
                    <input 
                      id="real-cert-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleRealFileUpload(e, 'certificateUrl', setCertFileName, setCertPreviewUrl)}
                    />
                  </div>
                </div>
              </div>

              {/* Next Step Info Box */}
              <div style={{
                padding: '18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FEF3C7',
                border: '1.5px solid #F59E0B',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start'
              }}>
                <Clock size={22} color="#B45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#92400E' }}>
                    Mandatory Anti-Cheat Skill Test (Next Step)
                  </div>
                  <p style={{ fontSize: '13px', color: '#78350F', marginTop: '4px', lineHeight: 1.5 }}>
                    After clicking Submit, you will begin a <strong>15-minute, 10-question practical exam</strong> on <strong>{currentCategoryObj?.name}</strong>.
                    Passing mark is <strong>70% (7/10)</strong>. Browser tab switches and copy-paste are strictly monitored.
                  </p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--forest-900)' }}>
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                  style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--forest-700)' }}
                />
                <span>
                  I certify that all personal and technical qualifications submitted are genuine. I agree to abide by FixNear's zero-hidden-charge code and punctual doorstep safety policy.
                </span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(2)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '14px 32px', fontSize: '15px', fontWeight: 800 }}
                >
                  <Sparkles size={16} />
                  <span>{loading ? 'Submitting...' : 'Register & Start Skill Test (15 Mins)'}</span>
                </button>
              </div>

            </div>
          </form>
        )}

      </div>
    </div>
  );
}
