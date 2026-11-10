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
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function BookingDrawerModal({ isOpen, service, onClose }) {
  const navigate = useNavigate();
  const { currentUser, userProfile, selectedCity } = useAuth();
  const { t, formatCurrency, getErrorMessage } = useLanguage();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [address, setAddress] = useState(userProfile?.savedAddresses?.[0]?.address || userProfile?.currentAddress || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const currentService = service || {
    id: 'srv-general',
    serviceId: 'srv-general',
    name: 'Home Service',
    title: 'Home Service',
    startingPrice: 499,
    duration: '60 mins'
  };

  const serviceTitle = currentService.title || currentService.name || t('home.browseCategories', 'Home Service');
  const servicePrice = currentService.startingPrice || currentService.basePrice || 499;

  const slots = [
    t('booking.slotMorning', 'Morning (09:00 AM - 12:00 PM)'),
    t('booking.slotAfternoon', 'Afternoon (12:00 PM - 03:00 PM)'),
    t('booking.slotEvening', 'Evening (03:00 PM - 06:00 PM)')
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  const handleConfirm = async (e) => {
    if (e) e.preventDefault();
    setSubmitError('');

    if (!currentUser) {
      onClose();
      navigate('/login?redirect=/book');
      return;
    }

    if (!selectedDate) {
      const msg = t('booking.selectDateSlotError', 'Please select a preferred service date.');
      setSubmitError(msg);
      showToast(msg, 'error');
      return;
    }

    if (!selectedSlot) {
      const msg = t('booking.selectSlotPrompt', 'Please choose an arrival time window.');
      setSubmitError(msg);
      showToast(msg, 'error');
      return;
    }

    if (!address.trim()) {
      const msg = t('booking.fillAddressPrompt', 'Please enter your service address.');
      setSubmitError(msg);
      showToast(msg, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        serviceId: currentService.serviceId || currentService._id || currentService.id,
        address: address.trim(),
        city: selectedCity || userProfile?.city || 'Mumbai',
        scheduledDate: selectedDate,
        timeSlot: selectedSlot,
        notes: notes.trim(),
      };

      const res = await bookingsAPI.createBooking(payload);

      if (!res.success || !res.booking) {
        throw new Error(res.message || t('common.errorGeneral', 'Server did not return a valid booking'));
      }

      setConfirmedBooking(res.booking);
      setIsSuccess(true);
      showToast(t('booking.successModalTitle', 'Booking placed successfully! Your technician will be confirmed shortly.'), 'success');
    } catch (err) {
      console.error('Booking creation error:', err);
      const msg = getErrorMessage(err, t('common.errorGeneral', 'We could not place your booking. Please try again.'));
      setSubmitError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setSubmitError('');
    setConfirmedBooking(null);
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-forest" style={{ fontSize: '11px' }}>
              <ShieldCheck size={12} />
              {t('booking.drawerTitle', 'Verified Booking')}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {step === 1 ? t('booking.step1', 'Step 1 of 2') : t('booking.step2', 'Step 2 of 2')}
            </span>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>

          {isSuccess && confirmedBooking ? (
            /* Booking Confirmed Screen */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--forest-100)',
                color: 'var(--forest-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle2 size={34} />
              </div>

              <span className="badge badge-forest" style={{ marginBottom: '8px' }}>
                {t('booking.successModalTitle', 'Booking Placed')}
              </span>

              <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
                {t('booking.successModalDesc', 'Appointment Confirmed!')}
              </h3>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t('booking.bookingIdLabel', 'Booking Reference:')} <strong style={{ color: 'var(--forest-900)' }}>#{confirmedBooking.bookingId}</strong>
              </p>

              <div style={{
                backgroundColor: 'var(--bg-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '20px',
                fontSize: '13.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('common.details', 'Service:')}</span>
                  <strong>{confirmedBooking.serviceTitle}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('common.time', 'Arrival:')}</span>
                  <strong>{confirmedBooking.scheduledDate} ({confirmedBooking.timeSlot})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('common.city', 'City:')}</span>
                  <strong>{confirmedBooking.city}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 700 }}>{t('common.total', 'Total Billed:')}</span>
                  <strong style={{ color: 'var(--forest-800)' }}>{formatCurrency(confirmedBooking.basePrice)}</strong>
                </div>
                {confirmedBooking.completionOtp && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--forest-50)',
                    border: '1px solid var(--forest-200)',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--forest-900)', fontWeight: 600 }}>{t('booking.finishCode4Digit', 'Your Finish Code:')}</span>
                    <strong style={{ fontSize: '16px', color: 'var(--forest-800)', letterSpacing: '2px' }}>{confirmedBooking.completionOtp}</strong>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetAndClose}
                  style={{ flex: 1 }}
                >
                  {t('common.close', 'Done')}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    resetAndClose();
                    navigate(`/track/${confirmedBooking._id}`);
                  }}
                  style={{ flex: 1 }}
                >
                  {t('booking.trackBookingBtn', 'Track Live →')}
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleConfirm}>

              {/* Service Summary Card */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-warm)',
                border: '1px solid var(--border-light)',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '15.5px', fontWeight: 700 }}>
                    {serviceTitle}
                  </h4>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {currentService.duration || '45 - 60 mins'} · {t('common.city', 'City:')} {selectedCity || 'Mumbai'}
                  </div>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-800)' }}>
                  {formatCurrency(servicePrice)}
                </span>
              </div>

              {submitError && (
                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#991B1B',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Step 1: Schedule & Address */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      {t('booking.chooseDate', 'Preferred Service Date:')}
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      {t('booking.chooseTime', 'Arrival Time Window:')}
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF'
                      }}
                      required
                    >
                      <option value="" disabled>{t('booking.selectSlotPrompt', '-- Select Arrival Window --')}</option>
                      {slots.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      {t('booking.serviceAddress', 'Complete Service Address:')}
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t('booking.addressPlaceholder', 'Flat/House No, Building, Landmark, Area and City...')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '13.5px',
                        resize: 'none'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      {t('booking.describeProblem', 'Problem Note (Optional):')}
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('booking.describeProblemPlaceholder', 'e.g., cooling low, water leaking from pipe')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '13.5px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={resetAndClose}
                      style={{ flex: 1 }}
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (!selectedDate || !selectedSlot || !address.trim()) {
                          setSubmitError(t('booking.selectDateSlotError', 'Please complete the date, time slot, and address fields.'));
                          return;
                        }
                        setSubmitError('');
                        setStep(2);
                      }}
                      style={{ flex: 1 }}
                    >
                      {t('common.next', 'Next: Review →')}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Rate Card Breakdown & Payment Protection Confirmation */}
              {step === 2 && (
                <div>
                  <div style={{
                    backgroundColor: 'var(--bg-warm)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{t('home.inspectionRepair', 'Standard Inspection & Labor')}</span>
                      <span>{formatCurrency(servicePrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--forest-700)' }}>
                      <span>{t('home.doorstepEvaluation', 'Doorstep Visit & Inspection Fee')}</span>
                      <strong>{t('home.includedFree', 'FREE (₹0)')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--forest-700)' }}>
                      <span>{t('home.workmanshipWarranty', '30-Day Workmanship Warranty')}</span>
                      <strong>{t('home.includedFree', 'INCLUDED')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-light)', paddingTop: '8px', fontWeight: 800, fontSize: '15px' }}>
                      <span>{t('booking.totalPayable', 'Total (Payment Protection)')}</span>
                      <span style={{ color: 'var(--forest-800)' }}>{formatCurrency(servicePrice)}</span>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--forest-50)',
                    border: '1px solid var(--forest-100)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--forest-900)',
                    marginBottom: '20px',
                    lineHeight: 1.5
                  }}>
                    🛡️ <strong>{t('common.paymentProtection', 'Payment Protection:')}</strong> {t('home.escrowProtectionDesc', 'You only pay after the specialist completes the work and you provide your 4-digit finish code.')}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                      style={{ flex: 1 }}
                    >
                      {t('common.back', '← Edit Details')}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      style={{ flex: 1.5 }}
                    >
                      {isSubmitting ? t('booking.submittingBooking', 'Placing Booking...') : t('booking.confirmBookingBtn', 'Confirm & Book')}
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
