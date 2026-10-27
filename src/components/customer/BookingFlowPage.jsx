import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Image as ImageIcon,
  AlertCircle,
  Home,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';

export default function BookingFlowPage() {
  const navigate = useNavigate();
  const { 
    services, 
    technicians, 
    approvedTechnicians,
    createBooking, 
    navigateToCustomerPage, 
    bookingModalService 
  } = useStore();
  const { currentUser, userProfile } = useAuth();
  const { showToast } = useToast();

  const selectableTechnicians = approvedTechnicians && approvedTechnicians.length > 0 
    ? approvedTechnicians 
    : technicians.filter(t => t.status === 'approved' || !t.status);

  const [currentStep, setCurrentStep] = useState(1); // 1: Service/Pro, 2: Address, 3: Schedule, 4: Problem/Photos, 5: Review

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState(bookingModalService?.id || services[0]?.id || "srv-ac-service");
  const [selectedTechId, setSelectedTechId] = useState(selectableTechnicians[0]?.id || "provider-demo-1");
  const [addressLine, setAddressLine] = useState(userProfile?.currentAddress || "Flat 402, Green Meadows, Bandra West, Mumbai 400050");
  const [selectedDate, setSelectedDate] = useState("Tomorrow, 10:00 AM");
  const [selectedSlot, setSelectedSlot] = useState("Morning (10:00 AM - 01:00 PM)");
  const [problemNotes, setProblemNotes] = useState("The split AC cools intermittently and has begun leaking water along the indoor drain tray.");
  const [uploadedPhotos, setUploadedPhotos] = useState([
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80"
  ]);

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];
  const selectedTech = selectableTechnicians.find(t => t.id === selectedTechId) || selectableTechnicians[0] || technicians[0];

  const dateOptions = [
    { label: "Today", sub: "Earliest 04:30 PM", val: "Today, 04:30 PM" },
    { label: "Tomorrow", sub: "Standard Slots", val: "Tomorrow, 10:00 AM" },
    { label: "Day After", sub: "Weekend Choice", val: "Day After, 11:30 AM" }
  ];

  const slotOptions = [
    "Morning (09:00 AM - 12:00 PM)",
    "Afternoon (12:00 PM - 03:00 PM)",
    "Evening (03:00 PM - 06:00 PM)"
  ];

  const samplePhotoPresets = [
    { name: "AC Leaking Water", url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80" },
    { name: "Tripped MCB Box", url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=300&q=80" }
  ];

  const handleFinalSubmit = async () => {
    const newBookingId = await createBooking({
      serviceTitle: selectedService.title,
      serviceId: selectedService.id,
      basePrice: selectedService.startingPrice,
      customerId: currentUser?.uid || "customer-demo-1",
      customerName: userProfile?.name || currentUser?.displayName || "Aarav Patel",
      customerPhone: userProfile?.phone || "+91 98201 54321",
      technicianId: selectedTech.id,
      technicianName: selectedTech.name,
      scheduledDate: selectedDate,
      timeSlot: selectedSlot,
      address: addressLine,
      notes: problemNotes,
      photos: uploadedPhotos
    });

    showToast('Service appointment created! Live tracking activated.', 'success');
    navigate(`/track/${newBookingId}`);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        
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
          <button 
            type="button"
            onClick={() => navigateToCustomerPage('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--forest-700)', fontWeight: 600, background: 'none' }}
          >
            <Home size={14} />
            <span>Home</span>
          </button>
          <ChevronRight size={13} />
          <button 
            type="button"
            onClick={() => navigateToCustomerPage('catalog')}
            style={{ color: 'var(--text-secondary)', background: 'none' }}
          >
            Services
          </button>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Schedule Appointment</span>
        </nav>

        {/* Header & Stepper */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <span className="badge badge-forest" style={{ fontSize: '11.5px', marginBottom: '6px' }}>
                <ShieldCheck size={13} />
                FixNear Transparent Booking
              </span>
              <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Schedule Your Certified Repair</h1>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Step <strong style={{ color: 'var(--forest-800)' }}>{currentStep}</strong> of 5
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {[
              "1. Service", 
              "2. Address", 
              "3. Schedule", 
              "4. Symptoms", 
              "5. Review"
            ].map((stepName, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: currentStep >= i + 1 ? 'var(--forest-700)' : 'var(--border-light)',
                  marginBottom: '6px',
                  transition: 'background-color 200ms ease'
                }} />
                <span style={{
                  fontSize: '11px',
                  fontWeight: currentStep === i + 1 ? 700 : 500,
                  color: currentStep === i + 1 ? 'var(--forest-900)' : 'var(--text-muted)'
                }}>
                  {stepName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Steps Container */}
        <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
          
          {/* STEP 1: Service & Specialist */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px' }}>1. Confirm Service & Preferred Specialist</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Select your required service and choose a certified partner for direct dispatch.
              </p>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                Select Service from Catalog:
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  fontSize: '14px',
                  marginBottom: '20px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} — ₹{s.startingPrice} ({s.category})
                  </option>
                ))}
              </select>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                Assigned Certified Specialist:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {selectableTechnicians.map(tech => (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTechId(tech.id)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: selectedTechId === tech.id ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                      backgroundColor: selectedTechId === tech.id ? 'var(--forest-50)' : 'var(--bg-warm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <img src={tech.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"} alt={tech.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-900)' }}>{tech.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        ★ {tech.ratingAvg || tech.rating || 4.9} · {tech.jobsDone || tech.jobsCompleted || 850}+ jobs
                      </div>
                      <span className="badge badge-forest" style={{ fontSize: '10.5px', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={11} />
                        <span>Verified Skill ({tech.verifiedSkills?.[0]?.score || tech.testScore || 92}%)</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Address & Access */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px' }}>2. Service Location & Access Details</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Confirm where the certified specialist should arrive.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Street Address & Flat Number:
                </label>
                <textarea
                  rows={3}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13.5px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => setAddressLine("Flat 402, Green Meadows, Bandra West, Mumbai 400050")}
                  className="btn btn-outline btn-sm"
                >
                  Use Home (Bandra West)
                </button>
                <button
                  type="button"
                  onClick={() => setAddressLine("Unit 12B, Trade Tower, BKC, Mumbai 400051")}
                  className="btn btn-outline btn-sm"
                >
                  Use Office (BKC)
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Date & Time Slot */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px' }}>3. Select Arrival Window</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Technicians adhere to strict arrival windows with guaranteed punctuality.
              </p>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Preferred Day:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {dateOptions.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDate(d.val)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedDate === d.val ? '2px solid var(--forest-700)' : '1px solid var(--border-light)',
                      backgroundColor: selectedDate === d.val ? 'var(--forest-100)' : '#FFFFFF',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{d.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.sub}</div>
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Preferred Time Slot:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {slotOptions.map((s, i) => (
                  <label key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedSlot === s ? '1.5px solid var(--forest-700)' : '1px solid var(--border-light)',
                    backgroundColor: selectedSlot === s ? 'var(--forest-50)' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '13.5px'
                  }}>
                    <input 
                      type="radio" 
                      name="slotSelection" 
                      checked={selectedSlot === s} 
                      onChange={() => setSelectedSlot(s)}
                      style={{ accentColor: 'var(--forest-700)' }}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Symptoms & Photo Upload */}
          {currentStep === 4 && (
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px' }}>4. Describe Symptoms & Attach Photos (Optional)</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Helping the specialist understand symptoms beforehand ensures they bring the correct OEM replacement spares.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Problem Symptoms & Behavior:
                </label>
                <textarea
                  rows={3}
                  value={problemNotes}
                  onChange={(e) => setProblemNotes(e.target.value)}
                  placeholder="Explain noises, error codes, leaks, or tripping patterns..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13.5px'
                  }}
                />
              </div>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                Diagnostic Photos (Simulated Upload):
              </label>
              <div style={{
                border: '2px dashed var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-warm)',
                marginBottom: '16px'
              }}>
                <Upload size={28} color="var(--forest-700)" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Drag and drop images or pick sample diagnostic photos</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG up to 10MB</div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                  {samplePhotoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUploadedPhotos([preset.url])}
                      className="btn btn-outline btn-sm"
                    >
                      + Attach "{preset.name}"
                    </button>
                  ))}
                </div>
              </div>

              {uploadedPhotos.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Attached:</span>
                  {uploadedPhotos.map((url, i) => (
                    <img key={i} src={url} alt="Problem Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Final Review & Transparency Card */}
          {currentStep === 5 && (
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px' }}>5. Review & Confirm Booking</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Review your upfront estimate. Funds are held in escrow and only released after your satisfaction and completion OTP.
              </p>

              {/* Order Summary Box */}
              <div style={{
                backgroundColor: 'var(--bg-warm)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-light)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{selectedService.title}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Specialist: <strong>{selectedTech.name}</strong> ({selectedTech.specialty})</div>
                  </div>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-800)' }}>
                    ₹{selectedService.startingPrice}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Standard Diagnostics & Scope Labor</span>
                    <span>₹{selectedService.startingPrice}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--forest-700)' }}>
                    <span>Doorstep Callout & Travel Fee</span>
                    <strong>FREE (₹0)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--forest-700)' }}>
                    <span>30-Day Workmanship Warranty Protection</span>
                    <strong>INCLUDED (₹0)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
                    <span>Initial Amount to Escrow</span>
                    <span style={{ color: 'var(--forest-900)' }}>₹{selectedService.startingPrice}</span>
                  </div>
                </div>
              </div>

              {/* Trust Safeguard Notice */}
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--yellow-100)',
                border: '1px solid var(--yellow-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--yellow-800)',
                marginBottom: '24px',
                lineHeight: 1.5
              }}>
                <strong>Zero Doorstep Price Shock:</strong> If unexpected spare parts are needed, the specialist must generate a digital quotation on your screen. You have full power to approve or decline before work begins.
              </div>
            </div>
          )}

          {/* Wizard Action Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                <ArrowLeft size={15} />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigateToCustomerPage('catalog')}
              >
                Cancel & Exit
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(prev => prev + 1)}
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleFinalSubmit}
              >
                <ShieldCheck size={18} />
                <span>Confirm & Dispatch Specialist</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
