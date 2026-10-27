import React from 'react';
import { 
  X, 
  User, 
  CalendarDays, 
  History, 
  Bell, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Download,
  AlertCircle 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function UserActionModal({ activeAction, onClose }) {
  if (!activeAction) return null;

  const { bookings, handleQuotationDecision, currentUser, navigateToCustomerPage } = useStore();

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
          maxWidth: '560px',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
          animation: 'fadeInSlide 180ms ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-forest" style={{ fontSize: '12px' }}>
              Account Menu Preview
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
              {activeAction}
            </h3>
          </div>

          <button 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Content based on selected menu item */}
        <div style={{ padding: '24px' }}>
          
          {activeAction === 'Profile' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{currentUser.name}</h4>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{currentUser.email}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{currentUser.phone}</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Default Service Address
                </label>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-warm)',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '6px',
                  fontSize: '13.5px',
                  border: '1px solid var(--border-light)'
                }}>
                  {currentUser.currentAddress}
                </div>
              </div>

              <div style={{
                padding: '14px',
                backgroundColor: 'var(--forest-50)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--forest-100)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ShieldCheck size={20} color="var(--forest-700)" />
                <span style={{ fontSize: '13px', color: 'var(--forest-800)', fontWeight: 600 }}>
                  Customer Phone & Email Verified (Demo Profile)
                </span>
              </div>
            </div>
          )}

          {activeAction === 'My Bookings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookings.map((booking) => (
                <div 
                  key={booking.id}
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-light)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        <span className="badge badge-yellow" style={{ fontSize: '11px' }}>
                          Ref: {booking.id}
                        </span>
                        <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                          {booking.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700 }}>
                        {booking.serviceTitle}
                      </h4>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '16.5px', color: 'var(--forest-800)' }}>
                      ₹{booking.basePrice}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                    Scheduled: <strong>{booking.scheduledDate}</strong> ({booking.timeSlot})
                    <br />
                    Assigned Partner: <strong>{booking.technicianName}</strong>
                  </div>

                  {/* Additional Parts Quotation Review Box */}
                  {booking.hasAdditionalQuotation && booking.additionalQuotation && (
                    <div style={{
                      backgroundColor: 'var(--bg-warm)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px',
                      border: '1px solid var(--border-light)',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)' }}>
                          Technician Submitted Extra Parts Quote
                        </span>
                        <span className={`badge ${booking.additionalQuotation.status === 'APPROVED' ? 'badge-forest' : booking.additionalQuotation.status === 'REJECTED' ? 'badge-demo' : 'badge-yellow'}`} style={{ fontSize: '10.5px' }}>
                          {booking.additionalQuotation.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        {booking.additionalQuotation.reason}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '12px' }}>
                        {booking.additionalQuotation.parts.map((p, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>• {p.name}</span>
                            <strong style={{ color: 'var(--text-primary)' }}>₹{p.cost}</strong>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '6px', borderTop: '1px dashed var(--border-light)' }}>
                          <span>Total Extra Quotation</span>
                          <span style={{ color: 'var(--forest-800)' }}>₹{booking.additionalQuotation.totalExtra}</span>
                        </div>
                      </div>

                      {booking.additionalQuotation.status === 'PENDING_CUSTOMER_APPROVAL' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleQuotationDecision(booking.id, true)}
                            style={{ flex: 1 }}
                          >
                            ✓ Approve Extra Parts (₹{booking.additionalQuotation.totalExtra})
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleQuotationDecision(booking.id, false)}
                            style={{ flex: 1, color: '#B91C1C' }}
                          >
                            Decline Extra Work
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--forest-50)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px',
                    color: 'var(--forest-800)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span>Completion OTP: <strong>{booking.completionOtp}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>Give only after work inspection</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onClose();
                        navigateToCustomerPage('booking-tracking', { bookingId: booking.id });
                      }}
                      style={{ flex: 1 }}
                    >
                      Track Appointment →
                    </button>
                    {booking.hasAdditionalQuotation && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          onClose();
                          navigateToCustomerPage('quotation-review', { bookingId: booking.id });
                        }}
                        style={{ flex: 1 }}
                      >
                        Review Quote →
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        onClose();
                        navigateToCustomerPage('invoice-comparison', { bookingId: booking.id });
                      }}
                      style={{ flex: 1 }}
                    >
                      Invoice Audit →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeAction === 'Repair History' && (
            <div>
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-card)',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-forest" style={{ fontSize: '11px' }}>
                    Completed & Warranted
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    14 Oct 2026
                  </span>
                </div>

                <h4 style={{ fontSize: '15.5px', fontWeight: 700, marginBottom: '4px' }}>
                  Precision Concealed Tap Leak Triage
                </h4>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Technician: Sunil Nair · Total Billed: ₹299 (Paid via Escrow)
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-light)',
                  fontSize: '12px'
                }}>
                  <span style={{ color: 'var(--forest-700)', fontWeight: 600 }}>
                    🛡️ Warranty Active (19 Days Left)
                  </span>
                  <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
                    Download Receipt PDF (Simulated)
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeAction === 'Notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--forest-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--forest-100)' }}>
                <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--forest-900)' }}>
                  Technician Assigned to Your Booking
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Ramesh Sharma has accepted your Split AC service request for tomorrow at 10:00 AM.
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>15 mins ago</div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: 600, fontSize: '13.5px' }}>
                  30-Day Workmanship Warranty Active
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Your plumbing service invoice #FX-7721 is now covered under warranty until 13 Nov 2026.
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>2 days ago</div>
              </div>
            </div>
          )}

          {activeAction === 'Settings' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    SMS & WhatsApp Service Updates
                  </label>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Receive technician dispatch alerts, live ETA links, and completion OTPs via WhatsApp.
                  </div>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Escrow Security PIN
                  </label>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Your completion OTP is unique for every booking to prevent premature payment release.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeAction === 'Sign out' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <LogOut size={26} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                Simulated Sign Out
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                You have tested the Sign Out interaction. Since this is an interactive frontend demo, clicking confirm will return you to visitor mode.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={onClose}
                  style={{ flex: 1, backgroundColor: '#B91C1C' }}
                >
                  Confirm Sign Out
                </button>
              </div>
            </div>
          )}

          {activeAction !== 'Sign out' && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
