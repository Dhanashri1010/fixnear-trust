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
  AlertCircle,
  Wind,
  Droplets,
  Zap,
  Tv,
  Hammer
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
    selectedCategories: ['ac-cooling'],
    categoryId: 'ac-cooling',
    categoryName: 'Air Conditioner',
    specialty: '',
    experienceYears: 3,
    idProofUrl: '',
    idProofPublicId: '',
    idProofResourceType: 'image',
    certificateUrl: '',
    certificatePublicId: '',
    certificateResourceType: 'image',
    agreeTerms: true,
  });

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'ac-cooling': return <Wind size={18} />;
      case 'plumbing': return <Droplets size={18} />;
      case 'electrical': return <Zap size={18} />;
      case 'appliances': return <Tv size={18} />;
      case 'carpentry': return <Hammer size={18} />;
      case 'deep-cleaning': return <Sparkles size={18} />;
      default: return <Briefcase size={18} />;
    }
  };

  const toggleCategory = (catId) => {
    setFormData((prev) => {
      const exists = prev.selectedCategories?.includes(catId);
      let nextCats;
      if (exists) {
        if (prev.selectedCategories.length === 1) {
          showToast(t('provider.selectAtLeastOne', 'Please select at least one trade service.'), 'error');
          return prev;
        }
        nextCats = prev.selectedCategories.filter((c) => c !== catId);
      } else {
        nextCats = [...(prev.selectedCategories || []), catId];
      }
      const matched = categories.find((c) => (c.categoryId || c.id) === nextCats[0]);
      return {
        ...prev,
        selectedCategories: nextCats,
        categoryId: nextCats[0] || 'ac-cooling',
        categoryName: matched ? matched.name : 'Air Conditioner',
      };
    });
  };

  const [idFileName, setIdFileName] = useState('');
  const [certFileName, setCertFileName] = useState('');
  const [idFileSize, setIdFileSize] = useState('');
  const [certFileSize, setCertFileSize] = useState('');
  const [idPreviewUrl, setIdPreviewUrl] = useState('');
  const [certPreviewUrl, setCertPreviewUrl] = useState('');
  const [uploadingField, setUploadingField] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ idProof: 0, certificate: 0 });
  const [uploadError, setUploadError] = useState({ idProof: null, certificate: null });
  const [failedFile, setFailedFile] = useState({ idProof: null, certificate: null });

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
            selectedCategories:
              prov.skills && prov.skills.length > 0
                ? prov.skills.map((s) => s.categoryId)
                : prev.selectedCategories,
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

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Real Private KYC File Upload
  const performUpload = async (file, field) => {
    if (!file) return;

    // 1. Enforce 5 MB maximum size limit
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      const errTxt = t('errors.FILE_TOO_LARGE', 'This file is bigger than 5 MB. Please choose a smaller file.');
      showToast(errTxt, 'error');
      setUploadError((prev) => ({ ...prev, [field]: errTxt }));
      return;
    }

    // 2. Enforce JPG, PNG, WebP, and PDF formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      const errTxt = t('errors.FILE_TYPE_NOT_ALLOWED', 'Please upload a JPG, PNG, WebP or PDF file.');
      showToast(errTxt, 'error');
      setUploadError((prev) => ({ ...prev, [field]: errTxt }));
      return;
    }

    setUploadingField(field);
    setUploadProgress((prev) => ({ ...prev, [field]: 0 }));
    setUploadError((prev) => ({ ...prev, [field]: null }));

    if (field === 'idProof') {
      setIdFileName(file.name);
      setIdFileSize(formatFileSize(file.size));
      if (file.type.startsWith('image/')) {
        setIdPreviewUrl(URL.createObjectURL(file));
      } else {
        setIdPreviewUrl('pdf-document');
      }
    } else {
      setCertFileName(file.name);
      setCertFileSize(formatFileSize(file.size));
      if (file.type.startsWith('image/')) {
        setCertPreviewUrl(URL.createObjectURL(file));
      } else {
        setCertPreviewUrl('pdf-document');
      }
    }

    try {
      const res = await uploadAPI.uploadPrivateDoc(file, field, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prev) => ({ ...prev, [field]: percent }));
        }
      });

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
        setFailedFile((prev) => ({ ...prev, [field]: null }));
        showToast(`${field === 'idProof' ? 'ID Proof' : 'Certificate'} uploaded securely.`, 'success');
      } else {
        throw new Error(res.message || t('provider.uploadFailed', 'Upload failed. Please try again.'));
      }
    } catch (err) {
      const errMsg = err.code && t('errors.' + err.code)
        ? t('errors.' + err.code)
        : err.message || t('provider.uploadFailed', 'Upload failed. Please try again.');
      showToast(errMsg, 'error');
      setFailedFile((prev) => ({ ...prev, [field]: file }));
      setUploadError((prev) => ({ ...prev, [field]: errMsg }));
    } finally {
      setUploadingField(null);
    }
  };

  const handleRealFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    performUpload(file, field);
    e.target.value = '';
  };

  const handleRemoveDoc = (field) => {
    if (field === 'idProof') {
      setIdFileName('');
      setIdFileSize('');
      setIdPreviewUrl('');
      setFormData((prev) => ({
        ...prev,
        idProofUrl: '',
        idProofPublicId: '',
        idProofResourceType: 'image',
      }));
      setFailedFile((prev) => ({ ...prev, idProof: null }));
      setUploadError((prev) => ({ ...prev, idProof: null }));
    } else {
      setCertFileName('');
      setCertFileSize('');
      setCertPreviewUrl('');
      setFormData((prev) => ({
        ...prev,
        certificateUrl: '',
        certificatePublicId: '',
        certificateResourceType: 'image',
      }));
      setFailedFile((prev) => ({ ...prev, certificate: null }));
      setUploadError((prev) => ({ ...prev, certificate: null }));
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
    if (!formData.selectedCategories || formData.selectedCategories.length === 0) {
      showToast(t('provider.selectAtLeastOne', 'Please select at least one trade service.'), 'error');
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
        specialty: formData.specialty.trim() || 'General Maintenance & Repairs',
        selectedCategories: formData.selectedCategories,
        categoryId: formData.categoryId || formData.selectedCategories[0],
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
        showToast('Registration details saved! Proceeding to skill tests.', 'success');
        navigate('/provider/test');
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
          <p style={{ color: 'var(--text-muted)' }}>{t('provider.loadingReg')}</p>
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
            {t('provider.techAccountRequired')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            {t('provider.customerAccountNotice')}
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
              {t('provider.signUpPartnerBtn')}
            </button>
            <Link to="/" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              {t('provider.backToHome')}
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
            <span>{t('provider.partnerNetwork')}</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-900)', margin: '0 0 8px' }}>
            {t('provider.regHeading')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '520px', margin: '0 auto' }}>
            {t('provider.regSubheading')}
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
                {t('provider.step1Title')}
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
                {t('provider.step2Title')}
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
                {t('provider.step3Title')}
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
                  {t('provider.step1Heading')}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>{t('provider.fullNameLabel')}</label>
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
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>{t('provider.mobileLabel')}</label>
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
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>{t('provider.cityLabel')}</label>
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
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>{t('provider.areaLabel')}</label>
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
                <span>{t('provider.privacyNotice')}</span>
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
                  <span>{t('provider.continueToSkills')}</span>
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
                  {t('provider.step2Heading')}
                </h2>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('provider.selectTradeServices', 'Select Trade Services (Choose one or more)')}</span>
                  <span style={{ fontSize: '11px', color: 'var(--forest-700)', fontWeight: 600 }}>
                    {formData.selectedCategories?.length || 0} {t('provider.servicesSelected', 'selected')}
                  </span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {categories.map((c) => {
                    const catId = c.categoryId || c.id;
                    const isSelected = formData.selectedCategories?.includes(catId);
                    return (
                      <div
                        key={catId}
                        onClick={() => toggleCategory(catId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-lg)',
                          border: `2px solid ${isSelected ? 'var(--forest-600)' : 'var(--border-light)'}`,
                          backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: `2px solid ${isSelected ? 'var(--forest-600)' : '#D1D5DB'}`,
                          backgroundColor: isSelected ? 'var(--forest-600)' : 'transparent',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {isSelected && <CheckCircle2 size={14} />}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={{ color: isSelected ? 'var(--forest-700)' : 'var(--text-muted)' }}>
                            {getCategoryIcon(catId)}
                          </span>
                          <span style={{ fontSize: '13.5px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--forest-950)' : 'var(--text-main)' }}>
                            {c.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {categories.length === 0 && (
                    ['ac-cooling', 'plumbing', 'electrical', 'appliances', 'carpentry', 'deep-cleaning'].map((catId) => {
                      const isSelected = formData.selectedCategories?.includes(catId);
                      return (
                        <div
                          key={catId}
                          onClick={() => toggleCategory(catId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-lg)',
                            border: `2px solid ${isSelected ? 'var(--forest-600)' : 'var(--border-light)'}`,
                            backgroundColor: isSelected ? 'var(--forest-50)' : '#FFFFFF',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ color: isSelected ? 'var(--forest-700)' : 'var(--text-muted)' }}>
                            {getCategoryIcon(catId)}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{catId}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  {t('provider.specialtyLabel', 'Describe your experience (Optional)')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('provider.specialtyPlaceholder', 'e.g. 5+ years in compressor repair, inverter PCB, pipe welding')}
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  {t('provider.experienceYearsLabel')} <strong>{formData.experienceYears} {t('provider.yearsSuffix')}</strong>
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
                  <span>{t('provider.beginner')}</span>
                  <span>{t('provider.skilled')}</span>
                  <span>{t('provider.master')}</span>
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
                <span>{t('provider.testNotice')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>{t('provider.backBtn')}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>{t('provider.continueToDocs')}</span>
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
                  {t('provider.step3Heading')}
                </h2>
              </div>

              {/* Correction Banner for Rejected or Needs-Info Providers */}
              {(existingProvider?.status === 'rejected' ||
                existingProvider?.status === 'needs_info' ||
                existingProvider?.status === 'more_info_needed') && (
                <div style={{
                  backgroundColor: '#FFFBEB',
                  border: '1.5px solid #FCD34D',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                      {t('provider.rejectionNote', 'Application status: Needs corrections before re-submitting.')}
                    </div>
                    {(existingProvider.rejectionReason || existingProvider.adminNotes) && (
                      <div style={{ fontSize: '13px', color: '#B45309', marginTop: '4px' }}>
                        <strong>{t('provider.feedback')}: </strong>
                        <span>{existingProvider.rejectionReason || existingProvider.adminNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ID Proof Upload */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  {t('provider.govtIdLabel')}
                </label>
                <div style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: idPreviewUrl ? 'var(--forest-50)' : 'transparent',
                  position: 'relative',
                }}>
                  {uploadingField === 'idProof' ? (
                    <div>
                      <div className="spinner" style={{ margin: '0 auto 12px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-800)', marginBottom: '8px' }}>
                        {t('provider.uploadProgress', 'Uploading...')} {idFileName} ({uploadProgress.idProof}%)
                      </div>
                      <div style={{ width: '80%', maxWidth: '300px', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress.idProof}%`, height: '100%', backgroundColor: 'var(--forest-600)', transition: 'width 0.2s ease' }} />
                      </div>
                    </div>
                  ) : uploadError.idProof ? (
                    <div>
                      <AlertCircle size={32} color="#DC2626" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#DC2626', marginBottom: '10px' }}>
                        {uploadError.idProof}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {failedFile.idProof && (
                          <button
                            type="button"
                            onClick={() => performUpload(failedFile.idProof, 'idProof')}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: '#DC2626', color: '#DC2626' }}
                          >
                            {t('provider.retryUpload', 'Retry Upload')}
                          </button>
                        )}
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <span>{t('provider.selectFileBtn')}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            onChange={(e) => handleRealFileUpload(e, 'idProof')}
                          />
                        </label>
                      </div>
                    </div>
                  ) : idPreviewUrl || formData.idProofPublicId ? (
                    <div>
                      {idPreviewUrl && idPreviewUrl !== 'pdf-document' ? (
                        <div style={{ marginBottom: '10px' }}>
                          <img
                            src={idPreviewUrl}
                            alt="ID Preview"
                            style={{ maxHeight: '140px', maxWidth: '240px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                          />
                        </div>
                      ) : (
                        <FileText size={36} color="var(--forest-700)" style={{ margin: '0 auto 8px' }} />
                      )}
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>
                        {idFileName || t('provider.docSecureVault')}
                      </div>
                      {idFileSize && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {idFileSize}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: 'var(--forest-700)', marginTop: '4px' }}>
                        {t('provider.docSecureVault')}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
                        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                          <span>{t('provider.replaceDoc', 'Replace')}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            onChange={(e) => handleRealFileUpload(e, 'idProof')}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc('idProof')}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                        >
                          {t('provider.removeDoc', 'Remove')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {t('provider.uploadIdPrompt')}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {t('provider.formatLimit')}
                      </div>
                      <label className="btn btn-secondary btn-sm" style={{ marginTop: '14px', cursor: 'pointer' }}>
                        <span>{t('provider.selectFileBtn')}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleRealFileUpload(e, 'idProof')}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Trade Certificate */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  {t('provider.tradeCertLabel')}
                </label>
                <div style={{
                  border: '1.5px dashed var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: certPreviewUrl ? 'var(--forest-50)' : 'transparent',
                }}>
                  {uploadingField === 'certificate' ? (
                    <div>
                      <div className="spinner" style={{ margin: '0 auto 10px' }} />
                      <div style={{ fontSize: '13px', color: 'var(--forest-800)', marginBottom: '6px' }}>
                        {t('provider.uploadProgress', 'Uploading...')} {certFileName} ({uploadProgress.certificate}%)
                      </div>
                      <div style={{ width: '80%', maxWidth: '300px', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress.certificate}%`, height: '100%', backgroundColor: 'var(--forest-600)', transition: 'width 0.2s ease' }} />
                      </div>
                    </div>
                  ) : uploadError.certificate ? (
                    <div>
                      <AlertCircle size={28} color="#DC2626" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626', marginBottom: '8px' }}>
                        {uploadError.certificate}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {failedFile.certificate && (
                          <button
                            type="button"
                            onClick={() => performUpload(failedFile.certificate, 'certificate')}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: '#DC2626', color: '#DC2626' }}
                          >
                            {t('provider.retryUpload', 'Retry Upload')}
                          </button>
                        )}
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <span>{t('provider.selectFileBtn')}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            onChange={(e) => handleRealFileUpload(e, 'certificate')}
                          />
                        </label>
                      </div>
                    </div>
                  ) : certPreviewUrl || formData.certificatePublicId ? (
                    <div>
                      {certPreviewUrl && certPreviewUrl !== 'pdf-document' ? (
                        <div style={{ marginBottom: '8px' }}>
                          <img
                            src={certPreviewUrl}
                            alt="Certificate Preview"
                            style={{ maxHeight: '120px', maxWidth: '200px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                          />
                        </div>
                      ) : (
                        <FileText size={28} color="var(--forest-700)" style={{ margin: '0 auto 6px' }} />
                      )}
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>
                        {certFileName || 'Certificate Uploaded'}
                      </div>
                      {certFileSize && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {certFileSize}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                          <span>{t('provider.replaceDoc', 'Replace')}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            onChange={(e) => handleRealFileUpload(e, 'certificate')}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc('certificate')}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                        >
                          {t('provider.removeDoc', 'Remove')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Award size={26} color="var(--text-muted)" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {t('provider.uploadCertPrompt')}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t('provider.certBoost')}
                      </div>
                      <label className="btn btn-outline btn-sm" style={{ marginTop: '10px', cursor: 'pointer' }}>
                        <span>{t('provider.uploadCertBtn')}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleRealFileUpload(e, 'certificate')}
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
                marginBottom: '24px',
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                    style={{ marginTop: '3px', accentColor: 'var(--forest-700)' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {t('provider.agreementText')}
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
                  <span>{t('provider.backBtn')}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleFinalSubmit}
                  disabled={loading || uploadingField !== null || (!formData.idProofPublicId && !formData.idProofUrl)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      <span>{t('provider.savingProfile')}</span>
                    </>
                  ) : (existingProvider?.status === 'rejected' || existingProvider?.status === 'needs_info' || existingProvider?.status === 'more_info_needed') ? (
                    <>
                      <span>{t('provider.fixAndSendAgain', 'Fix and submit again')}</span>
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      <span>{t('provider.completeAndStartTest')}</span>
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
