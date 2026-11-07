import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Home, 
  Upload, 
  ArrowLeft, 
  ArrowRight,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { servicesAPI, bookingsAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function BookingFlowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, selectedCity } = useAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // 3-Step Wizard: 1: Service & Problem, 2: Address & Schedule, 3: Review & Confirm
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [problemNotes, setProblemNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]); // real URLs
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoErrorNotice, setPhotoErrorNotice] = useState('');
  
  const [addressLine, setAddressLine] = useState('');
  const [bookingCity, setBookingCity] = useState(selectedCity || 'Mumbai');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [servicesError, setServicesError] = useState('');

  // 1. Restore draft from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('fixnear_booking_draft');
      if (raw) {
        const d = JSON.parse(raw);
        if (d.selectedServiceId) setSelectedServiceId(d.selectedServiceId);
        if (d.problemNotes) setProblemNotes(d.problemNotes);
        if (d.addressLine) setAddressLine(d.addressLine);
        if (d.bookingCity) setBookingCity(d.bookingCity);
        if (d.selectedDate) setSelectedDate(d.selectedDate);
        if (d.selectedSlot) setSelectedSlot(d.selectedSlot);
      }
    } catch (_) {}
  }, []);

  // 2. Persist draft to sessionStorage
  useEffect(() => {
    try {
      if (selectedServiceId || problemNotes || addressLine || selectedDate || selectedSlot) {
        sessionStorage.setItem('fixnear_booking_draft', JSON.stringify({
          selectedServiceId,
          problemNotes,
          addressLine,
          bookingCity,
          selectedDate,
          selectedSlot,
        }));
      }
    } catch (_) {}
  }, [selectedServiceId, problemNotes, addressLine, bookingCity, selectedDate, selectedSlot]);

  // 3. Redirect to login if user is not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
    } else {
      if (!addressLine && userProfile?.savedAddresses?.[0]?.address) {
        setAddressLine(userProfile.savedAddresses[0].address);
      } else if (!addressLine && userProfile?.currentAddress) {
        setAddressLine(userProfile.currentAddress);
      }
      if (selectedCity && !bookingCity) {
        setBookingCity(selectedCity);
      }
    }
  }, [currentUser, userProfile, selectedCity, navigate, location]);

  const fetchServices = () => {
    setLoadingServices(true);
    setServicesError('');
    servicesAPI.getServices()
      .then((res) => {
        if (res.success && res.services) {
          setServices(res.services);
          if (res.services.length > 0) {
            const queryParams = new URLSearchParams(location.search);
            const preSelect = queryParams.get('service') || queryParams.get('id');
            const match = res.services.find(s => s.serviceId === preSelect || s._id === preSelect);
            setSelectedServiceId(prev => prev || (match ? match.serviceId : res.services[0].serviceId));
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load services:', err.message);
        setServicesError('We could not connect. Please try again.');
      })
      .finally(() => {
        setLoadingServices(false);
      });
  };

  // 4. Fetch live active services from API
  useEffect(() => {
    fetchServices();
  }, [location.search]);

  const selectedService = services.find(s => s.serviceId === selectedServiceId || s._id === selectedServiceId) || services[0] || {
    serviceId: 'srv-standard',
    title: 'Standard Home Service',
    startingPrice: 499,
    category: 'General Maintenance'
  };

  const slotOptions = [
    "Morning (09:00 AM - 12:00 PM)",
    "Afternoon (12:00 PM - 03:00 PM)",
    "Evening (03:00 PM - 06:00 PM)",
    "Night (06:00 PM - 09:00 PM)"
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  // Photo upload using uploadAPI (multer + Cloudinary / graceful fallback)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadedPhotos.length + files.length > 3) {
      showToast('You can attach a maximum of 3 photos.', 'error');
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files (JPG, PNG, WebP) are allowed.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5 MB.', 'error');
        return;
      }
    }

    setUploadingPhotos(true);
    setPhotoErrorNotice('');

    try {
      const res = await uploadAPI.uploadPhotos(files);
      if (res.success && res.urls) {
        setUploadedPhotos(prev => [...prev, ...res.urls].slice(0, 3));
        showToast('Photos uploaded successfully.', 'success');
      }
    } catch (err) {
      console.warn('Upload API message:', err.message);
      setPhotoErrorNotice('Photo upload is not available right now. You may proceed with your booking without photos.');
      showToast('Photo upload is not available right now. You can continue without photos.', 'info');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    setSubmitError('');
    if (currentStep === 1) {
      if (!selectedServiceId) {
        setSubmitError('Please select a service.');
        return;
      }
      if (!problemNotes.trim()) {
        setSubmitError('Please provide a brief description of the problem.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!addressLine.trim()) {
        setSubmitError('Please enter your complete service address.');
        return;
      }
      if (!selectedDate) {
        setSubmitError('Please pick a preferred service date.');
        return;
      }
      if (!selectedSlot) {
        setSubmitError('Please select a preferred arrival time window.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const payload = {
        serviceId: selectedService.serviceId || selectedService._id,
        address: addressLine.trim(),
        city: bookingCity,
        scheduledDate: selectedDate,
        timeSlot: selectedSlot,
        notes: problemNotes.trim(),
        photos: uploadedPhotos,
      };

      const res = await bookingsAPI.createBooking(payload);

      if (!res.success || !res.booking) {
        throw new Error(res.message || 'We could not place your booking. Please try again.');
      }

      setBookingConfirmed({
        id: res.booking._id,
        bookingNumber: res.booking.bookingId,
        service: res.booking.serviceTitle,
        date: res.booking.scheduledDate,
        slot: res.booking.timeSlot,
        address: res.booking.address,
        city: res.booking.city,
        price: res.booking.basePrice,
        finishCode: res.booking.completionOtp,
      });

      try {
        sessionStorage.removeItem('fixnear_booking_draft');
      } catch (_) {}

      showToast('Booking placed successfully! Your technician will be confirmed shortly.', 'success');
    } catch (err) {
      console.error('Booking placement error:', err);
      const msg = err.message || 'We could not place your booking. Please try again.';
      setSubmitError(msg);
      showToast(msg, 'error');
      // Keep what the user typed in the form!
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (bookingConfirmed) {
    return (
      <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '48px 0 72px 0' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="card" style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--forest-100)',
              color: 'var(--forest-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <span className="badge badge-forest" style={{ marginBottom: '12px', fontSize: '13px' }}>
              Booking Placed
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
              Your Booking is Confirmed!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
              Booking Reference: <strong style={{ color: 'var(--forest-900)', fontSize: '17px' }}>#{bookingConfirmed.bookingNumber}</strong>
            </p>

            <div style={{
              backgroundColor: 'var(--bg-warm)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Service:</span>
                <strong>{bookingConfirmed.service}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Scheduled Arrival:</span>
                <strong>{bookingConfirmed.date} ({bookingConfirmed.slot})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>City:</span>
                <strong>{bookingConfirmed.city}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Address:</span>
                <span style={{ maxWidth: '320px', textAlign: 'right' }}>{bookingConfirmed.address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <span style={{ fontWeight: 700 }}>Total (Payment Protection):</span>
                <strong style={{ color: 'var(--forest-800)', fontSize: '16px' }}>₹{bookingConfirmed.price}</strong>
              </div>
              {bookingConfirmed.finishCode && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--forest-50)',
                  border: '1px solid var(--forest-200)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--forest-900)', fontWeight: 700 }}>Your 4-Digit Finish Code:</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Share with technician ONLY after job is finished</div>
                  </div>
                  <strong style={{ fontSize: '20px', color: 'var(--forest-800)', letterSpacing: '3px' }}>{bookingConfirmed.finishCode}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/track/${bookingConfirmed.id}`)}
                style={{ minWidth: '180px', padding: '12px 20px' }}
              >
                Track Live →
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/bookings')}
                style={{ minWidth: '160px', padding: '12px 20px' }}
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        
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
          <Link 
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--forest-700)', fontWeight: 600 }}
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
          <ChevronRight size={13} />
          <Link 
            to="/services"
            style={{ color: 'var(--text-secondary)' }}
          >
            Services
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Book Service</span>
        </nav>

        {/* Header & 3-Step Stepper Progress Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <span className="badge badge-forest" style={{ fontSize: '12px', marginBottom: '6px' }}>
                <ShieldCheck size={13} />
                FixNear 3-Step Booking
              </span>
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Schedule Verified Service</h1>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Step <strong style={{ color: 'var(--forest-800)' }}>{currentStep}</strong> of 3
            </div>
          </div>

          {/* Stepper Progress Bar (3 Steps) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              "1. Service & Problem", 
              "2. Address & Time", 
              "3. Review & Confirm"
            ].map((stepName, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  height: '5px',
                  borderRadius: '3px',
                  backgroundColor: currentStep >= i + 1 ? 'var(--forest-700)' : 'var(--border-light)',
                  marginBottom: '6px',
                  transition: 'background-color 200ms ease'
                }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: currentStep === i + 1 ? 700 : 500,
                  color: currentStep === i + 1 ? 'var(--forest-900)' : 'var(--text-muted)'
                }}>
                  {stepName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert Banner */}
        {submitError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FEE2E2',
            color: '#B91C1C',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Wizard Steps Card */}
        <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
          
          {/* STEP 1: Choose Service & Describe Problem */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                1. Choose Service & Describe the Problem
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Select what needs fixing and provide details so the technician comes equipped.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="service-select" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Select Service:
                </label>
                {servicesError ? (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#FEE2E2',
                    borderRadius: 'var(--radius-md)',
                    color: '#B91C1C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    fontSize: '13.5px'
                  }}>
                    <span>{servicesError}</span>
                    <button
                      type="button"
                      onClick={fetchServices}
                      className="btn btn-outline btn-sm"
                      style={{ backgroundColor: '#FFFFFF', minHeight: '38px', padding: '6px 14px' }}
                    >
                      Retry
                    </button>
                  </div>
                ) : loadingServices ? (
                  <div style={{ padding: '12px', fontSize: '13.5px', color: 'var(--text-muted)' }}>Loading services from server...</div>
                ) : (
                  <select
                    id="service-select"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '16px',
                      minHeight: '44px',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {services.map(s => (
                      <option key={s.serviceId || s._id} value={s.serviceId || s._id}>
                        {s.title} — ₹{s.startingPrice} ({s.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="problem-notes" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Describe the Issue:
                </label>
                <textarea
                  id="problem-notes"
                  rows={4}
                  value={problemNotes}
                  onChange={(e) => setProblemNotes(e.target.value)}
                  placeholder="Describe what is wrong (e.g. AC cooling low, unusual sound, pipe leak under sink)..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '16px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Attach Photos of the Issue (Optional, max 3):
                </label>

                {photoErrorNotice && (
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    ℹ️ {photoErrorNotice}
                  </div>
                )}

                <div style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-warm)',
                  marginBottom: '16px'
                }}>
                  <Upload size={24} color="var(--forest-700)" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Click to attach photos (PNG, JPG up to 5 MB)</div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={uploadedPhotos.length >= 3 || uploadingPhotos}
                    style={{ marginTop: '10px', fontSize: '13px' }}
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {uploadingPhotos ? 'Uploading photos...' : `${uploadedPhotos.length} / 3 photos attached`}
                  </div>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {uploadedPhotos.map((photoUrl, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img 
                          src={photoUrl} 
                          alt={`Uploaded preview ${idx + 1}`} 
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-light)' }} 
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            background: '#EF4444',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Address, City & Arrival Window */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                2. Service Address, City & Arrival Window
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Tell us where and when the verified specialist should arrive.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="service-city" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Service City:
                </label>
                <input
                  id="service-city"
                  type="text"
                  value={bookingCity}
                  onChange={(e) => setBookingCity(e.target.value)}
                  placeholder="e.g. Mumbai, Bengaluru"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '16px',
                    minHeight: '44px',
                    backgroundColor: '#FFFFFF'
                  }}
                  required
                />
              </div>

              {/* Saved addresses shortcut if any */}
              {userProfile?.savedAddresses && userProfile.savedAddresses.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Or select from saved addresses:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {userProfile.savedAddresses.map((addr) => (
                      <button
                        key={addr.id || addr.address}
                        type="button"
                        onClick={() => setAddressLine(addr.address)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '6px',
                          border: addressLine === addr.address ? '1.5px solid var(--forest-700)' : '1px solid var(--border-light)',
                          backgroundColor: addressLine === addr.address ? 'var(--forest-50)' : '#FFFFFF',
                          fontSize: '13px',
                          minHeight: '44px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <strong>{addr.label || 'Saved'}:</strong> {addr.address.slice(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="street-address" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Complete Street Address & Landmark:
                </label>
                <textarea
                  id="street-address"
                  rows={3}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Enter house/flat number, apartment/building name, street, landmark, area..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '16px',
                    minHeight: '80px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label htmlFor="service-date" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    Select Preferred Date:
                  </label>
                  <input
                    id="service-date"
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '16px',
                      minHeight: '44px',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="service-slot" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    Preferred Arrival Window:
                  </label>
                  <select
                    id="service-slot"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '16px',
                      minHeight: '44px',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="" disabled>-- Choose time slot --</option>
                    {slotOptions.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Check Price & Confirm */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                3. Check Price & Confirm
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Transparent pricing with no doorstep surprises. Payment Protection is active.
              </p>

              {/* Itemized Price Breakdown */}
              <div style={{
                backgroundColor: 'var(--bg-warm)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-light)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{selectedService.title}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Arrival: <strong>{selectedDate} ({selectedSlot})</strong> in <strong>{bookingCity}</strong>
                    </div>
                  </div>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-800)' }}>
                    ₹{selectedService.startingPrice}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Standard Inspection & Diagnosis</span>
                    <span>₹{selectedService.startingPrice}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--forest-700)' }}>
                    <span>Doorstep Visit & Travel Fee</span>
                    <strong>FREE (₹0)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--forest-700)' }}>
                    <span>30-Day Free Workmanship Warranty</span>
                    <strong>INCLUDED (₹0)</strong>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: '16px',
                    paddingTop: '12px',
                    borderTop: '1px dashed var(--border-light)',
                    color: 'var(--forest-900)'
                  }}>
                    <span>Total Estimated Amount</span>
                    <span>₹{selectedService.startingPrice}</span>
                  </div>
                </div>
              </div>

              {/* Service Address Confirmation */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: '#FFFFFF',
                marginBottom: '20px',
                fontSize: '13.5px'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Service Location ({bookingCity}):</div>
                <div style={{ color: 'var(--text-secondary)' }}>{addressLine}</div>
                {problemNotes && (
                  <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                    <strong>Reported issue:</strong> {problemNotes}
                  </div>
                )}
              </div>

              {/* Payment Protection Notice */}
              <div style={{
                padding: '14px 18px',
                backgroundColor: 'var(--forest-50)',
                border: '1px solid var(--forest-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--forest-900)',
                marginBottom: '24px',
                lineHeight: 1.5
              }}>
                <strong>FixNear Payment Protection:</strong> You only pay after the repair is completed to your satisfaction and you share your 4-digit finish code. Any extra parts require your explicit in-app approval beforehand.
              </div>
            </div>
          )}

          {/* Stepper Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={isSubmitting}
                style={{ minHeight: '44px', fontSize: '15px' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/services')}
                style={{ minHeight: '44px', fontSize: '15px' }}
              >
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextStep}
                style={{ minHeight: '44px', fontSize: '15px' }}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                style={{ minHeight: '44px', fontSize: '16px', padding: '12px 24px' }}
              >
                <ShieldCheck size={18} />
                <span>{isSubmitting ? 'Placing Booking...' : 'Confirm & Place Booking'}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
