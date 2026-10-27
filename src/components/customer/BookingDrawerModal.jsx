import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function BookingDrawerModal({ isOpen, service, onClose }) {
  // CRITICAL FIX: All hooks MUST be called unconditionally at the top of the component
  const navigate = useNavigate();
  const { createBooking, services } = useStore();
  const { currentUser, userProfile } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [address, setAddress] = useState(userProfile?.currentAddress || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedId, setConfirmedId] = useState('');

  // Fallback to first service if opened generally
  const currentService = service || services[0] || {
    id: 'srv-general',
    name: 'Home Service',
    title: 'Home Service',
    startingPrice: 499,
    duration: '60 mins'
  };

  const serviceTitle = currentService.name || currentService.title || 'Home Service';
  const servicePrice = currentService.basePrice || currentService.startingPrice || 499;

  // Standard time slots
  const slots = [
    "Morning (09:00 AM - 12:00 PM)",
    "Afternoon (12:00 PM - 03:00 PM)",
    "Evening (03:00 PM - 06:00 PM)"
  ];

  // Calculate today's date for minimum date picker
  const todayStr = new Date().toISOString().split('T')[0];

  const handleConfirm = async (e) => {
    if (e) e.preventDefault();
    setSubmitError('');

    if (!selectedDate) {
      setSubmitError('Please select a preferred service date.');
      showToast('Please select a preferred service date.', 'error');
      return;
    }

    if (!selectedSlot) {
      setSubmitError('Please choose an arrival time window.');
      showToast('Please choose an arrival time window.', 'error');
      return;
    }

    if (!address.trim()) {
      setSubmitError('Please enter your service address.');
      showToast('Please enter your service address.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = await createBooking({
        serviceTitle,
        serviceId: currentService.id,
        basePrice: servicePrice,
        scheduledDate: selectedDate,
        timeSlot: selectedSlot,
        address: address.trim(),
        notes: notes.trim()
      });

      if (!newId) {
        throw new Error('Server did not return a valid booking ID');
      }

      setConfirmedId(newId);
      setIsSuccess(true);
      showToast('Booking request submitted successfully!', 'success');
    } catch (err) {
      console.error('Booking creation error:', err);
      const msg = 'We could not place your booking. Please try again.';
      setSubmitError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setSubmitError('');
    setStep(1);
    onClose();
  };

  // Safe early return AFTER all hooks
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(14, 27, 21, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
          animation: 'fadeInSlide 200ms ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-forest" style={{ fontSize: '11.5px' }}>
                FixNear Verified Service
              </span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, marginTop: '4px', color: 'var(--forest-900)' }}>
              {isSuccess ? 'Booking Placed' : serviceTitle}
            </h3>
          </div>

          <button 
            type="button"
            onClick={resetAndClose}
            aria-label="Close booking modal"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          
          {isSuccess ? (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--forest-100)',
                color: 'var(--forest-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h4 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: 'var(--forest-900)' }}>
                Booking Placed Successfully!
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px auto' }}>
                Booking Reference: <strong style={{ color: 'var(--forest-800)' }}>{confirmedId}</strong>
                <br />
                Scheduled for: <strong>{selectedDate} • {selectedSlot}</strong>
              </p>

              {/* Confirmation Notice */}
              <div style={{
                backgroundColor: 'var(--forest-50)',
                border: '1px solid var(--forest-100)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                textAlign: 'left',
                fontSize: '13px',
                color: 'var(--forest-900)',
                marginBottom: '24px'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--forest-700)" />
                  <span>Payment Protection Activated:</span>
                </div>
                Your verified technician will be dispatched for your scheduled slot. You only share your 4-digit finish code once you are fully satisfied with the service.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    resetAndClose();
                    navigate(`/track/${confirmedId}`);
                  }}
                  style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                >
                  <span>Track Appointment Live</span>
                  <ArrowRight size={16} />
                </button>

                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={resetAndClose}
                  style={{ width: '100%', padding: '10px', justifyContent: 'center' }}
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleConfirm}>
              {/* Service Price Card */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                backgroundColor: 'var(--forest-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--forest-100)',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Standard Visit & Inspection Fee</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-800)' }}>
                    ₹{servicePrice}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-sage">30-Day Free Rework</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Est. {currentService.duration || '60 mins'}
                  </div>
                </div>
              </div>

              {submitError && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 'var(--radius-sm)',
                  color: '#991B1B',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <AlertCircle size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* 1. Date Selection */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--forest-900)' }}>
                  1. Choose Date
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', backgroundColor: '#FFFFFF' }}>
                  <Calendar size={16} color="var(--forest-700)" />
                  <input 
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      background: 'transparent'
                    }}
                  />
                </div>
              </div>

              {/* 2. Slot Selection */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--forest-900)' }}>
                  2. Preferred Time Slot
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {slots.map((s, i) => (
                    <label 
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: selectedSlot === s ? '1.5px solid var(--forest-700)' : '1px solid var(--border-light)',
                        backgroundColor: selectedSlot === s ? 'var(--forest-50)' : '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: 500
                      }}
                    >
                      <input 
                        type="radio" 
                        name="drawerTimeSlot" 
                        checked={selectedSlot === s}
                        onChange={() => setSelectedSlot(s)}
                        required
                        style={{ accentColor: 'var(--forest-700)', width: '16px', height: '16px' }}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Address */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--forest-900)' }}>
                  3. Service Address
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', backgroundColor: '#FFFFFF' }}>
                  <MapPin size={16} color="var(--forest-700)" style={{ flexShrink: 0 }} />
                  <input 
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/flat no., street, landmark, city & pincode"
                    required
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '13.5px',
                      color: 'var(--text-primary)',
                      background: 'transparent'
                    }}
                  />
                </div>
              </div>

              {/* 4. Problem Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--forest-900)' }}>
                  4. Describe the Problem (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what is wrong (e.g. water leakage, unusual sound, tripping breaker)..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Scope Confirmation Note */}
              <div style={{
                backgroundColor: 'var(--bg-warm)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '20px',
                lineHeight: 1.5
              }}>
                <strong style={{ color: 'var(--forest-800)' }}>Zero Doorstep Price Shock:</strong>
                {' '}Any extra spare parts will require your digital approval on your screen before installation.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={resetAndClose}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '12px' }}
                >
                  <span>{isSubmitting ? 'Placing Booking...' : 'Confirm Booking'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
