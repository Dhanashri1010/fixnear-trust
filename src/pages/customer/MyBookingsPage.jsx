// ===================================================================
// FixNear Trust - Customer "My Bookings" Page
// Tabs: Upcoming / Completed + Direct "Track Job" and "Book Again" actions
// ===================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Wrench, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw, 
  Navigation, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { bookings, setActiveBookingId } = useStore();
  const { currentUser } = useAuth();
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'completed'

  // Filter bookings for current customer
  const myBookings = bookings.filter(b => 
    !currentUser || !b.customerId || b.customerId === currentUser.uid || b.customerId === 'customer-demo-1'
  );

  const upcomingBookings = myBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const completedBookings = myBookings.filter(b => b.status === 'COMPLETED');

  const displayed = tab === 'upcoming' ? upcomingBookings : completedBookings;

  const handleTrackBooking = (bookingId) => {
    setActiveBookingId(bookingId);
    navigate(`/track/${bookingId}`);
  };

  const handleBookAgain = (serviceId) => {
    navigate('/book');
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '800px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)' }}>
          My Bookings
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Track real-time progress, review verified technician quotations and warranty receipts.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border-light)',
        marginBottom: '24px',
        gap: '24px'
      }}>
        <button
          type="button"
          onClick={() => setTab('upcoming')}
          style={{
            padding: '12px 4px',
            fontSize: '15px',
            fontWeight: 700,
            color: tab === 'upcoming' ? 'var(--forest-700)' : 'var(--text-muted)',
            borderBottom: tab === 'upcoming' ? '3px solid var(--forest-700)' : '3px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <Clock size={16} />
          <span>Upcoming & Active ({upcomingBookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('completed')}
          style={{
            padding: '12px 4px',
            fontSize: '15px',
            fontWeight: 700,
            color: tab === 'completed' ? 'var(--forest-700)' : 'var(--text-muted)',
            borderBottom: tab === 'completed' ? '3px solid var(--forest-700)' : '3px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <CheckCircle2 size={16} />
          <span>Completed History ({completedBookings.length})</span>
        </button>
      </div>

      {/* Empty State */}
      {displayed.length === 0 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-warm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: 'var(--text-muted)'
          }}>
            <CalendarDays size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '8px' }}>
            No {tab} bookings found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            {tab === 'upcoming' 
              ? 'You do not have any active service requests right now.' 
              : 'You have not completed any home service appointments yet.'}
          </p>
          <Link to="/book" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <Wrench size={16} />
            <span>Book a Verified Service</span>
          </Link>
        </div>
      )}

      {/* Booking Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayed.map((booking) => {
          const isCompleted = booking.status === 'COMPLETED';
          const hasQuote = Boolean(booking.quotation || booking.additionalQuotation);

          return (
            <div
              key={booking.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                border: '1.5px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'border-color 150ms ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--forest-700)', backgroundColor: 'var(--forest-50)', padding: '2px 8px', borderRadius: '4px' }}>
                      {booking.id}
                    </span>
                    <span className={`badge ${isCompleted ? 'badge-forest' : 'badge-yellow'}`} style={{ fontSize: '12px' }}>
                      {booking.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)', marginTop: '8px' }}>
                    {booking.serviceTitle}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                    ₹{booking.price || booking.basePrice || 499}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {isCompleted ? 'Escrow Released' : 'Standard Escrow'}
                  </div>
                </div>
              </div>

              {/* Technician & Appointment Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-warm)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '13.5px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Specialist Assigned
                  </span>
                  <strong style={{ color: 'var(--forest-900)' }}>
                    {booking.technicianName || booking.providerName || "Ramesh Sharma"}
                  </strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Scheduled Slot
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {booking.scheduledDate || "Today"}, {booking.slot || booking.timeSlot || "Morning"}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Completion OTP
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    color: isCompleted ? 'var(--text-muted)' : '#059669',
                    fontFamily: 'monospace'
                  }}>
                    {isCompleted ? 'VERIFIED' : `● ● ${booking.completionOtp || booking.otp || '4821'}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {hasQuote && !isCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBookingId(booking.id);
                      navigate(`/quote/${booking.id}`);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <FileText size={14} />
                    <span>Review Quotation</span>
                  </button>
                )}

                {!isCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleTrackBooking(booking.id)}
                    className="btn btn-primary btn-sm"
                  >
                    <Navigation size={14} />
                    <span>Live Tracking</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBookingId(booking.id);
                        navigate(`/invoice/${booking.id}`);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <FileText size={14} />
                      <span>Warranty Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBookAgain(booking.serviceId)}
                      className="btn btn-primary btn-sm"
                    >
                      <RotateCcw size={14} />
                      <span>Book Again</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
