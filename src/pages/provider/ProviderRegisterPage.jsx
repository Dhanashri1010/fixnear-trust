// ===================================================================
// FixNear Trust - Service Provider 3-Step Registration Page
// Step 1: Personal Details | Step 2: Skills & Area | Step 3: Identity Verification
// Direct REST API Migration (MongoDB & Private KYC Uploads)
// ===================================================================

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { servicesAPI, providersAPI, uploadAPI } from '../../services/api';

export default function ProviderRegisterPage() {
  const navigate = useNavigate();
  const { user, profile, currentUser, role, logOut, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [existingProvider, setExistingProvider] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: profile?.name || user?.name || '',
    phone: profile?.phone || user?.phone || '',
    city: profile?.city || user?.city || 'Mumbai',
    serviceArea: '',
    categoryId: 'ac-cooling',
    categoryName: 'Air Conditioner',
    specialty: 'AC Installation, Repair & Servicing',
    experienceYears: 3,
    idProofUrl: '',
    idProofPublicId: '',
    idProofResourceType: 'image',
    certificateUrl: '',
    certificatePublicId: '',
    certificateResourceType: 'image',
    agreeTerms: true,
  });

  const [idFileName, setIdFileName] = useState('');
  const [certFileName, setCertFileName] = useState('');
  const [idPreviewUrl, setIdPreviewUrl] = useState('');
  const [certPreviewUrl, setCertPreviewUrl] = useState('');
  const [uploadingField, setUploadingField] = useState(null);

  // Redirect unauthenticated visitors to partner signup
  useEffect(() => {
    if (!authLoading && !currentUser) {
      showToast('Please create your technician account or log in first.', 'info');
      navigate('/signup?role=provider&redirect=/provider/register', { replace: true });
    }
  }, [authLoading, currentUser, navigate]);

  // Fetch categories and existing provider profile
  useEffect(() => {
    let isMounted = true;
    const fetchInitData = async () => {
      try {
        const [catsRes, provRes] = await Promise.allSettled([
          servicesAPI.getCategories(),
          providersAPI.getMyProfile(),
        ]);

        if (isMounted && catsRes.status === 'fulfilled' && catsRes.value?.categories) {
          setCategories(catsRes.value.categories);
        }

        if (isMounted && provRes.status === 'fulfilled' && provRes.value?.provider) {
          const prov = provRes.value.provider;
          setExistingProvider(prov);
          setFormData((prev) => ({
            ...prev,
            name: prov.name || prev.name || profile?.name || currentUser?.name || '',
            phone: prov.phone || prev.phone || profile?.phone || currentUser?.phone || '',
            city: prov.city || prev.city || profile?.city || currentUser?.city || 'Mumbai',
            serviceArea: prov.serviceArea || prev.serviceArea,
            specialty: prov.specialty || prev.specialty,
            categoryId: prov.skills?.[0]?.categoryId || prev.categoryId,
            categoryName: prov.skills?.[0]?.categoryName || prev.categoryName,
            experienceYears: prov.experienceYears || prev.experienceYears,
            idProofUrl: prov.idProofUrl || '',
            idProofPublicId: prov.idProofPublicId || '',
            idProofResourceType: prov.idProofResourceType || 'image',
            certificateUrl: prov.certificateUrl || '',
            certificatePublicId: prov.certificatePublicId || '',
            certificateResourceType: prov.certificateResourceType || 'image',
          }));

          if (prov.idProofPublicId) {
            setIdFileName('Uploaded ID Document');
            setIdPreviewUrl(prov.idProofUrl || 'document-preview');
          }
          if (prov.certificatePublicId) {
            setCertFileName('Uploaded Certificate');
            setCertPreviewUrl(prov.certificateUrl || 'document-preview');
          }
        }
      } catch (err) {
        console.warn('Initialization notice:', err.message);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    if (currentUser) {
      fetchInitData();
    } else {
      setInitialLoading(false);
    }
    return () => { isMounted = false; };
  }, [currentUser, profile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const matched = categories.find((c) => c.categoryId === catId || c.id === catId);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      categoryName: matched ? matched.name : catId,
    }));
  };

  // Real Private KYC File Upload
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

    // 2. Enforce JPG, PNG, WebP, and PDF formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid format. Please upload JPG, PNG, WebP, or PDF files only.', 'error');
      e.target.value = '';
      return;
    }

    setUploadingField(field);
    setFileName(file.name);

    try {
      // Local immediate preview
      if (file.type.startsWith('image/')) {
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
      } else {
        setPreviewUrl('pdf-document');
      }

      const res = await uploadAPI.uploadPrivateDoc(file);
      if (res.success && res.publicId) {
        const urlKey = field === 'idProof' ? 'idProofUrl' : 'certificateUrl';
        const publicIdKey = field === 'idProof' ? 'idProofPublicId' : 'certificatePublicId';
        const resourceTypeKey = field === 'idProof' ? 'idProofResourceType' : 'certificateResourceType';

        setFormData((prev) => ({
          ...prev,
          [urlKey]: res.url || `/api/providers/documents/${field}/file`,
          [publicIdKey]: res.publicId,
          [resourceTypeKey]: res.resourceType || (file.type === 'application/pdf' ? 'raw' : 'image'),
        }));
        showToast(`${field === 'idProof' ? 'ID Proof' : 'Certificate'} uploaded securely.`, 'success');
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload document. Please try again.', 'error');
      setPreviewUrl('');
      setFileName('');
    } finally {
      setUploadingField(null);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      showToast('Please enter your full name.', 'error');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return false;
    }
    if (!formData.city.trim()) {
      showToast('Please specify your working city.', 'error');
      return false;
    }
    if (!formData.serviceArea.trim()) {
      showToast('Please specify the local areas/neighborhoods you can serve.', 'error');
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.categoryId) {
      showToast('Please select your primary trade category.', 'error');
      return false;
    }
    if (!formData.specialty.trim()) {
      showToast('Please describe your specific technical skills.', 'error');
      return false;
    }
    if (formData.experienceYears < 0 || formData.experienceYears > 50) {
      showToast('Please enter realistic years of experience (0 - 50).', 'error');
      return false;
    }
    return true;
  };

  // Step 3 Validation & Submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (!formData.idProofPublicId && !formData.idProofUrl) {
      showToast('Please upload your Government Identity Proof (Aadhaar or Voter ID).', 'error');
      return;
    }
    if (!formData.agreeTerms) {
      showToast('You must agree to the FixNear Trust safety code of conduct.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        serviceArea: formData.serviceArea.trim(),
        specialty: formData.specialty.trim(),
        categoryId: formData.categoryId,
        categoryName: formData.categoryName,
        experienceYears: Number(formData.experienceYears) || 1,
        idProofUrl: formData.idProofUrl,
        idProofPublicId: formData.idProofPublicId,
        idProofResourceType: formData.idProofResourceType,
        certificateUrl: formData.certificateUrl,
        certificatePublicId: formData.certificatePublicId,
        certificateResourceType: formData.certificateResourceType,
      };

      const res = await providersAPI.registerProfile(payload);
      if (res.success) {
        showToast('Registration details saved! Proceeding to practical skill test.', 'success');
        navigate(`/provider/test/${formData.categoryId}`);
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit registration. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading technician registration...</p>
        </div>
      </div>
    );
  }

  if (currentUser && role === 'customer') {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh', padding: '60px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '520px', width: '100%', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '36px 32px', textAlign: 'center', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--forest-50)', color: 'var(--forest-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Wrench size={28} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-900)', marginBottom: '8px' }}>
            Technician Account Required
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            You are currently signed in with a customer account ({currentUser.email}). To offer home services and earn on FixNear, please create a Service Partner account.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await logOut();
                navigate('/signup?role=provider&redirect=/provider/register');
              }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Sign Up as Service Partner
            </button>
            <Link to="/" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '40px 16px 80px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        
        {/* Header Banner */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--forest-100)',
            color: 'var(--forest-800)',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <ShieldCheck size={16} />
            <span>FIXNEAR PARTNER NETWORK</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-900)', margin: '0 0 8px' }}>
            Technician Partner Registration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '520px', margin: '0 auto' }}>
            Join our verified marketplace. Complete your profile, verify your identity, and pass the safety skill test.
          </p>
        </div>

        {/* Existing Application Status Alert */}
        {existingProvider && existingProvider.status !== 'approved' && (
          <div style={{
            backgroundColor: existingProvider.status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
            border: `1.5px solid ${existingProvider.status === 'rejected' ? '#FCA5A5' : '#FCD34D'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle size={20} color={existingProvider.status === 'rejected' ? '#DC2626' : '#D97706'} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: existingProvider.status === 'rejected' ? '#991B1B' : '#92400E', fontSize: '14px' }}>
                {existingProvider.status === 'rejected' ? 'Application Needs Correction' : 'Application In Progress'}
              </div>
              <div style={{ fontSize: '13px', color: existingProvider.status === 'rejected' ? '#7F1D1D' : '#78350F', marginTop: '4px' }}>
                {existingProvider.rejectionReason || 'Please review your details, update your documents, and complete your verification.'}
              </div>
            </div>
          </div>
        )}

        {/* 3-Step Progress Indicator */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 28px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid var(--border-light)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            
            {/* Connecting line */}
            <div style={{
              position: 'absolute',
              top: '18px',
              left: '40px',
              right: '40px',
              height: '3px',
              backgroundColor: 'var(--border-light)',
              zIndex: 0
            }}>
              <div style={{
                height: '100%',
                backgroundColor: 'var(--forest-600)',
                width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Step 1 */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: step >= 1 ? 'var(--forest-700)' : 'var(--border-light)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                margin: '0 auto 6px'
              }}>
                {step > 1 ? <CheckCircle2 size={20} /> : '1'}
              </div>
              <span style={{ fontSize: '12px', fontWeight: step === 1 ? 700 : 500, color: step >= 1 ? 'var(--forest-900)' : 'var(--text-muted)' }}>
                Personal Details
              </span>
            </div>

            {/* Step 2 */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: step >= 2 ? 'var(--forest-700)' : 'var(--border-light)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                margin: '0 auto 6px'
              }}>
                {step > 2 ? <CheckCircle2 size={20} /> : '2'}
              </div>
              <span style={{ fontSize: '12px', fontWeight: step === 2 ? 700 : 500, color: step >= 2 ? 'var(--forest-900)' : 'var(--text-muted)' }}>
                Trade & Experience
              </span>
            </div>

            {/* Step 3 */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: step >= 3 ? 'var(--forest-700)' : 'var(--border-light)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                margin: '0 auto 6px'
              }}>
                3
              </div>
              <span style={{ fontSize: '12px', fontWeight: step === 3 ? 700 : 500, color: step >= 3 ? 'var(--forest-900)' : 'var(--text-muted)' }}>
                ID Verification
              </span>
            </div>

          </div>
        </div>

        {/* Form Container */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid var(--border-light)'
        }}>

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <User size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--forest-900)' }}>
                  Step 1: Technician Identity & Service Area
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Full Legal Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Direct Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. 9820012345"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Operating City *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mumbai, Pune, Thane"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Service Area / Localities *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Areas you can travel to"
                    value={formData.serviceArea}
                    onChange={(e) => handleInputChange('serviceArea', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--forest-50)',
                border: '1px solid var(--forest-100)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginTop: '20px',
                fontSize: '13px',
                color: 'var(--forest-800)'
              }}>
                <Info size={18} style={{ flexShrink: 0 }} />
                <span>Your direct contact number is kept private and will only be shared with customers after you accept their job request.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>Continue to Skills</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Trade Skills & Experience */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Briefcase size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--forest-900)' }}>
                  Step 2: Practical Trade & Experience
                </h2>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Primary Service Category *</label>
                <select
                  className="form-control"
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  style={{ fontWeight: 600 }}
                >
                  {categories.map((c) => (
                    <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                      {c.name} {c.startingPrice ? `(from ₹${c.startingPrice})` : ''}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="ac-cooling">Air Conditioner & Cooling</option>
                      <option value="electrical">Electrician & Wiring</option>
                      <option value="plumbing">Plumbing & Sanitary</option>
                      <option value="appliances">Appliance Repair</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Specialty & Scope of Work *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Deep clean, compressor servicing, PCB diagnostics"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Years of Practical Field Experience: <strong>{formData.experienceYears} Years</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--forest-700)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>Beginner (0 yrs)</span>
                  <span>Skilled (5 yrs)</span>
                  <span>Master (15+ yrs)</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                fontSize: '13px',
                color: '#1E40AF'
              }}>
                <Award size={18} style={{ flexShrink: 0 }} />
                <span>You will need to complete a 10-question practical safety exam for your selected category with at least 70% to receive verified status.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>Continue to Documents</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Identity Verification & Documents */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <ShieldCheck size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--forest-900)' }}>
                  Step 3: Identity Verification (KYC)
                </h2>
              </div>

              {/* ID Proof Upload */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Government Photo ID (Aadhaar / Voter ID / PAN) *
                </label>
                <div style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: idPreviewUrl ? 'var(--forest-50)' : 'transparent',
                  position: 'relative'
                }}>
                  {uploadingField === 'idProof' ? (
                    <div>
                      <div className="spinner" style={{ margin: '0 auto 12px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-800)' }}>
                        Uploading private document securely...
                      </div>
                    </div>
                  ) : idPreviewUrl ? (
                    <div>
                      <CheckCircle2 size={32} color="var(--forest-700)" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>
                        {idFileName || 'ID Proof Uploaded'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--forest-700)', marginTop: '4px' }}>
                        Stored securely in your private KYC vault.
                      </div>
                      <label className="btn btn-outline btn-sm" style={{ marginTop: '12px', cursor: 'pointer' }}>
                        <span>Change Document</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleRealFileUpload(e, 'idProof', setIdFileName, setIdPreviewUrl)}
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        Upload Clear Photo or PDF of Government ID
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        JPG, PNG, WebP or PDF (Max 5 MB)
                      </div>
                      <label className="btn btn-secondary btn-sm" style={{ marginTop: '14px', cursor: 'pointer' }}>
                        <span>Select File</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleRealFileUpload(e, 'idProof', setIdFileName, setIdPreviewUrl)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Trade Certificate */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Trade Certificate or Diploma (Optional)
                </label>
                <div style={{
                  border: '1.5px dashed var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: certPreviewUrl ? 'var(--forest-50)' : 'transparent'
                }}>
                  {uploadingField === 'certificate' ? (
                    <div>
                      <div className="spinner" style={{ margin: '0 auto 10px' }} />
                      <div style={{ fontSize: '13px', color: 'var(--forest-800)' }}>Uploading certificate...</div>
                    </div>
                  ) : certPreviewUrl ? (
                    <div>
                      <CheckCircle2 size={26} color="var(--forest-700)" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>
                        {certFileName || 'Certificate Uploaded'}
                      </div>
                      <label className="btn btn-outline btn-sm" style={{ marginTop: '10px', cursor: 'pointer' }}>
                        <span>Change</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleRealFileUpload(e, 'certificate', setCertFileName, setCertPreviewUrl)}
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <Award size={26} color="var(--text-muted)" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                        Upload ITI, Polytechnic, or OEM Certificate
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Boosts customer confidence and profile ranking
                      </div>
                      <label className="btn btn-outline btn-sm" style={{ marginTop: '10px', cursor: 'pointer' }}>
                        <span>Upload Certificate</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleRealFileUpload(e, 'certificate', setCertFileName, setCertPreviewUrl)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Code of Conduct Agreement */}
              <div style={{
                backgroundColor: 'var(--bg-warm)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                    style={{ marginTop: '3px', accentColor: 'var(--forest-700)' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    I agree to FixNear Trust safety standards, transparent rate card compliance, and identity verification. I understand that fraudulent finish codes or off-platform demands will result in permanent suspension.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleFinalSubmit}
                  disabled={loading || uploadingField !== null}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete & Start Skill Test</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
