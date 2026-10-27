import React, { useState } from 'react';
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
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function BookingFlowPage() {
  const navigate = useNavigate();
  const { 
    services, 
    technicians, 
    approvedTechnicians,
    createBooking, 
    bookingModalService 
  } = useStore();
  const { currentUser, userProfile } = useAuth();
  const { showToast } = useToast();

  const selectableTechnicians = (approvedTechnicians && approvedTechnicians.length > 0)
    ? approvedTechnicians
    : (technicians || []).filter(t => t.status === 'approved' || !t.status);

  // 3-Step Wizard: 1: Service & Problem, 2: Address & Schedule, 3: Review & Confirm
  const [currentStep, setCurrentStep] = useState(1);

  // Form State (No fake pre-filled values)
  const [selectedServiceId, setSelectedServiceId] = useState(bookingModalService?.id || (services && services[0]?.id) || '');
  const [problemNotes, setProblemNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]); // Real file uploads / data URLs, max 3
  
  const [addressLine, setAddressLine] = useState(userProfile?.currentAddress || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [preferredTechId, setPreferredTechId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  const selectedService = (services || []).find(s => s.id === selectedServiceId) || services?.[0] || {
    id: 'srv-standard',
    title: 'Standard Home Service',
    startingPrice: 499,
    category: 'General'
  };

  const slotOptions = [
    "Morning (09:00 AM - 12:00 PM)",
    "Afternoon (12:00 PM - 03:00 PM)",
    "Evening (03:00 PM - 06:00 PM)",
    "Night (06:00 PM - 09:00 PM)"
  ];

  // Minimum date today
  const todayStr = new Date().toISOString().split('T')[0];

  // Real photo upload handler (max 3 photos, file validation)
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadedPhotos.length + files.length > 3) {
      showToast('You can attach a maximum of 3 photos.', 'error');
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files (JPG, PNG, WebP) are allowed.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5 MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhotos(prev => {
          if (prev.length >= 3) return prev;
          return [...prev, event.target.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Availability check
  const hasAvailableTech = selectableTechnicians.length > 0;

  // Step Validations
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
      const assignedTech = selectableTechnicians.find(t => t.id === preferredTechId) || selectableTechnicians[0];

      const newBookingId = await createBooking({
        serviceTitle: selectedService.title || selectedService.name,
        serviceId: selectedService.id,
        basePrice: selectedService.startingPrice || selectedService.basePrice || 499,
        customerId: currentUser?.id || currentUser?.uid || '',
        customerName: userProfile?.name || currentUser?.name || currentUser?.displayName || '',
        customerPhone: userProfile?.phone || currentUser?.phone || '',
        technicianId: assignedTech?.id || '',
        technicianName: assignedTech?.name || 'Assigned Certified Technician',
        scheduledDate: selectedDate,
        timeSlot: selectedSlot,
        address: addressLine.trim(),
        notes: problemNotes.trim(),
        photos: uploadedPhotos
      });

      if (!newBookingId) {
        throw new Error('Booking could not be created');
      }

      setBookingConfirmed({
        id: newBookingId,
        service: selectedService.title || selectedService.name,
        date: selectedDate,
        slot: selectedSlot,
        address: addressLine.trim(),
        price: selectedService.startingPrice || 499
      });
      showToast('Booking placed successfully! Your technician will be confirmed shortly.', 'success');
    } catch (err) {
      console.error(err);
      setSubmitError("We could not place your booking. Please try again.");
      showToast("We could not place your booking. Please try again.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN: Clear "Booking placed" screen
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
              Booking Reference: <strong style={{ color: 'var(--forest-900)', fontSize: '17px' }}>#{bookingConfirmed.id}</strong>
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
                <span style={{ color: 'var(--text-secondary)' }}>Scheduled Date & Time:</span>
                <strong>{bookingConfirmed.date} ({bookingConfirmed.slot})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Address:</span>
                <span style={{ maxWidth: '320px', textAlign: 'right' }}>{bookingConfirmed.address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <span style={{ fontWeight: 700 }}>Total (Payment Protection):</span>
                <strong style={{ color: 'var(--forest-800)', fontSize: '16px' }}>₹{bookingConfirmed.price}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/track/${bookingConfirmed.id}`)}
                style={{ minWidth: '180px', padding: '12px 20px' }}
              >
                Track Appointment →
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
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Schedule Verified Repair</h1>
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
            <AlertCircle size={18} />
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Select Service:
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="" disabled>-- Select a home service --</option>
                  {(services || []).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title || s.name} — ₹{s.startingPrice || s.basePrice} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Describe the Issue:
                </label>
                <textarea
                  rows={4}
                  value={problemNotes}
                  onChange={(e) => setProblemNotes(e.target.value)}
                  placeholder="Describe what is wrong (e.g. AC cooling low, unusual sound, pipe leak under sink)..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Attach Photos of the Issue (Optional, max 3):
                </label>
                <div style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-warm)',
                  marginBottom: '16px'
                }}>
                  <Upload size={24} color="var(--forest-700)" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Click to upload photos (PNG, JPG up to 5 MB)</div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={uploadedPhotos.length >= 3}
                    style={{ marginTop: '10px', fontSize: '13px' }}
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {uploadedPhotos.length} / 3 photos attached
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

          {/* STEP 2: Address, Date, Time & Availability Check */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                2. Service Address, Date & Arrival Window
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Tell us where and when the verified specialist should arrive.
              </p>

              {/* Availability Notice if no verified technician */}
              {!hasAvailableTech && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--yellow-100)',
                  border: '1px solid var(--yellow-200)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '13.5px',
                  color: 'var(--yellow-800)'
                }}>
                  <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>No technician is currently available for this exact time and area.</strong>
                    <div style={{ marginTop: '4px' }}>
                      Please select an alternate date or time window, or reach out to our support team for priority scheduling.
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Complete Street Address & Landmark:
                </label>
                <textarea
                  rows={3}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Enter house/flat number, apartment/building name, street, landmark, area and city..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    Select Preferred Date:
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    Preferred Arrival Window:
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '14px',
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

              {selectableTechnicians.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    Verified Technicians in Your Area:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    {selectableTechnicians.slice(0, 3).map(tech => (
                      <div
                        key={tech.id}
                        onClick={() => setPreferredTechId(tech.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: preferredTechId === tech.id ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                          backgroundColor: preferredTechId === tech.id ? 'var(--forest-50)' : 'var(--bg-warm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--forest-100)',
                          color: 'var(--forest-800)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700
                        }}>
                          {tech.name ? tech.name.charAt(0) : 'T'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{tech.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            ★ {tech.rating || 4.9} · Skill Verified
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{selectedService.title || selectedService.name}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Arrival: <strong>{selectedDate} ({selectedSlot})</strong>
                    </div>
                  </div>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-800)' }}>
                    ₹{selectedService.startingPrice || 499}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Standard Inspection & Diagnosis</span>
                    <span>₹{selectedService.startingPrice || 499}</span>
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
                    <span>₹{selectedService.startingPrice || 499}</span>
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
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Service Location:</div>
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
