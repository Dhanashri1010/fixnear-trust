import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

import { useNavigate } from 'react-router-dom';

export default function BookingDrawerModal({ isOpen, service, onClose }) {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const { createBooking, services } = useStore();

  // Fallback to first service if opened generally
  const currentService = service || services[0];

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('Tomorrow, 10:00 AM');
  const [selectedSlot, setSelectedSlot] = useState('Morning (10:00 AM - 1:00 PM)');
  const [notes, setNotes] = useState('Split AC is leaking water inside the bedroom and cooling has reduced.');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedId, setConfirmedId] = useState('FX-98214');

  const dates = [
    { label: "Today", sub: "Earliest 4:00 PM", val: "Today, 4:00 PM" },
    { label: "Tomorrow", sub: "Any slot", val: "Tomorrow, 10:00 AM" },
    { label: "Day After", sub: "Weekend", val: "Day After, 11:30 AM" }
  ];

  const slots = [
    "Morning (09:00 AM - 12:00 PM)",
    "Afternoon (12:00 PM - 03:00 PM)",
    "Evening (03:00 PM - 06:00 PM)"
  ];

  const handleConfirm = async () => {
    const newId = await createBooking({
      serviceTitle: currentService.title,
      serviceId: currentService.id,
      basePrice: currentService.startingPrice,
      scheduledDate: selectedDate,
      timeSlot: selectedSlot
    });
    setConfirmedId(newId);
    setIsSuccess(true);
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setStep(1);
    onClose();
  };

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
      padding: '20px'
    }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '580px',
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
                FixNear Transparent Booking
              </span>
              <span className="badge badge-demo" style={{ fontSize: '11px' }}>
                Sample Preview
              </span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, marginTop: '4px' }}>
              {isSuccess ? 'Booking Request Confirmed' : currentService.title}
            </h3>
          </div>

          <button 
            onClick={resetAndClose}
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
            /* Success State Preview */
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

              <h4 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
                Demo Booking Created!
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px auto' }}>
                Booking Reference: <strong style={{ color: 'var(--forest-800)' }}>{confirmedId}</strong>
                <br />
                Your selected time: <strong>{selectedDate}</strong>
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
                  <span>Real-Time Appointment Dispatched:</span>
                </div>
                Your service partner has been notified. You can track their arrival window and view your secure 4-digit completion OTP.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
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
                  className="btn btn-outline"
                  onClick={resetAndClose}
                  style={{ width: '100%', padding: '10px', justifyContent: 'center' }}
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Booking Configuration Steps */
            <div>
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
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Estimated Standard Base Fee</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-800)' }}>
                    ₹{currentService.startingPrice}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-sage">30-Day Free Rework</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Est. {currentService.duration}
                  </div>
                </div>
              </div>

              {/* 1. Date Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '8px' }}>
                  1. Select Date & Arrival Window
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedDate(d.val)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: selectedDate === d.val ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                        backgroundColor: selectedDate === d.val ? 'var(--forest-100)' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{d.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Slot Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '8px' }}>
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
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      <input 
                        type="radio" 
                        name="timeSlot" 
                        checked={selectedSlot === s}
                        onChange={() => setSelectedSlot(s)}
                        style={{ accentColor: 'var(--forest-700)' }}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Address & Symptom Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '8px' }}>
                  3. Service Address & Problem Notes
                </label>
                
                {/* Address Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-warm)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  marginBottom: '10px',
                  fontSize: '12.5px'
                }}>
                  <MapPin size={15} color="var(--forest-700)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {DEMO_USER.currentAddress}
                  </span>
                </div>

                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what's wrong (symptoms, brand, errors)..."
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
                marginBottom: '24px',
                lineHeight: 1.5
              }}>
                <strong style={{ color: 'var(--forest-800)' }}>Zero Doorstep Price Shock:</strong>
                {' '}Any extra spare parts will require your digital approval on your screen before installation.
              </div>

              {/* Action */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-outline"
                  onClick={resetAndClose}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleConfirm}
                  style={{ flex: 2, padding: '12px' }}
                >
                  <span>Request Booking (Demo)</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
