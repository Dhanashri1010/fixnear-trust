import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  ShieldCheck, 
  PhoneCall, 
  MessageSquare, 
  AlertTriangle, 
  ChevronRight, 
  Home, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SupportDeskPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useLanguage();

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(0);

  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoadingTickets(true);
      supportAPI.getMyTickets()
        .then((res) => {
          if (res.success && res.tickets) {
            setMyTickets(res.tickets);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingTickets(false));
    }
  }, [currentUser]);

  const faqs = [
    {
      q: t('support.faq1Q', "How does FixNear Payment Protection protect my money?"),
      a: t('support.faq1A', "When you book a service, your payment is held safely. The specialist is not paid until you inspect the completed work and provide your 4-digit finish code.")
    },
    {
      q: t('support.faq2Q', "What if the technician requests additional money for spare parts at the doorstep?"),
      a: t('support.faq2A', "Technicians cannot verbally charge extra. Any replacement parts must be submitted in-app as a digital quotation with itemized part numbers. You have the power to approve or decline before any work occurs.")
    },
    {
      q: t('support.faq3Q', "How do I trigger the 30-Day Free Workmanship Warranty?"),
      a: t('support.faq3A', "If the repaired problem resurfaces within 30 days of service completion, navigate to My Bookings or submit a ticket here. We dispatch a specialist for a free re-inspection and resolution.")
    }
  ];

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login?redirect=/support');
      return;
    }

    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      showToast(t('support.fillSubjectMsgPrompt', 'Please fill in both subject and description.'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await supportAPI.createTicket({
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
        bookingId: bookingId.trim(),
      });

      if (res.success && res.ticket) {
        setTicketSubmitted(res.ticket);
        showToast(t('support.ticketSuccess', 'Support ticket created successfully!'), 'success');
        setTicketSubject('');
        setTicketMessage('');
        setBookingId('');
        // Refresh list
        supportAPI.getMyTickets().then(r => r.success && setMyTickets(r.tickets));
      }
    } catch (err) {
      showToast(err.message || t('common.errorGeneral', 'Failed to submit support ticket. Please try again.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh', padding: '32px 0 72px 0' }}>
      <div className="container">
        
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
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--forest-700)', fontWeight: 600, textDecoration: 'none' }}
          >
            <Home size={14} />
            <span>{t('nav.home')}</span>
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>{t('support.helpAndSupport')}</span>
        </nav>

        {/* Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'inline-flex', marginBottom: '8px' }}>
            <span className="badge badge-forest">
              <ShieldCheck size={14} />
              {t('support.deskTitle')}
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            {t('support.howCanWeAssist')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '640px' }}>
            {t('support.deskDescription')}
          </p>
        </div>

        {/* Quick Channels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <PhoneCall size={28} color="var(--forest-700)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '6px' }}>{t('support.directPhoneSupport', 'Direct Phone Support')}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t('support.directPhoneDesc', 'Priority phone assistance for ongoing appointments or emergencies.')}
            </p>
            <a href="tel:18002661234" style={{ fontWeight: 700, color: 'var(--forest-800)', fontSize: '15px', textDecoration: 'none' }}>
              1800-266-1234
            </a>
          </div>

          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <MessageSquare size={28} color="var(--forest-700)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '6px' }}>{t('support.whatsappUpdates', 'WhatsApp Updates')}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t('support.whatsappDesc', 'Receive dispatch milestones and technician arrival updates instantly.')}
            </p>
            <span style={{ fontWeight: 700, color: 'var(--forest-800)', fontSize: '14px' }}>
              {t('support.automatedOnBooking', 'Automated on Booking')}
            </span>
          </div>

          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <ShieldCheck size={28} color="var(--forest-700)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '6px' }}>{t('support.workmanshipGuarantee', 'Workmanship Guarantee')}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t('support.workmanshipDesc', 'Every completed repair includes 30 days of free re-inspection cover.')}
            </p>
            <Link to="/bookings" style={{ fontWeight: 700, color: 'var(--forest-800)', fontSize: '14px', textDecoration: 'none' }}>
              {t('myBookings.title')} →
            </Link>
          </div>
        </div>

        {/* 2-Column: FAQs and Real Support Ticket Submission */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '32px' }}>
          
          {/* FAQs */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
              {t('support.frequentlyAsked')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    padding: '16px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpandedFaq(expandedFaq === i ? -1 : i)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--forest-900)' }}>
                      {faq.q}
                    </span>
                    <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
                      {expandedFaq === i ? '−' : '+'}
                    </span>
                  </div>

                  {expandedFaq === i && (
                    <p style={{ marginTop: '10px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Existing Submitted Tickets */}
            {currentUser && myTickets.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px' }}>
                  {t('support.myTicketsTitle')} ({myTickets.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myTickets.map((tk) => (
                    <div
                      key={tk.ticketId || tk._id}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--forest-800)', backgroundColor: 'var(--forest-50)', padding: '2px 6px', borderRadius: '4px' }}>
                            #{tk.ticketId}
                          </span>
                          <span className="badge badge-forest" style={{ fontSize: '10px' }}>
                            {tk.status}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', marginTop: '4px' }}>{tk.subject}</div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatDate(tk.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real Support Ticket Form */}
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
              {t('support.submitTicketTitle')}
            </h2>

            {ticketSubmitted ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <CheckCircle2 size={42} color="var(--forest-700)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>#{ticketSubmitted.ticketId} {t('support.ticketSuccess')}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  {t('support.openTicketCardDesc')}
                </p>
                <button className="btn btn-outline btn-sm" onClick={() => setTicketSubmitted(null)}>
                  {t('support.submitAnother', 'Submit Another Inquiry')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('support.subjectLabel')}
                  </label>
                  <input 
                    type="text" 
                    placeholder={t('support.subjectPlaceholder')}
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '13.5px'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('support.bookingRefPrompt', 'Booking Reference (Optional)')}
                  </label>
                  <input 
                    type="text" 
                    placeholder="FX-98214"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '13.5px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('support.messageLabel')}
                  </label>
                  <textarea 
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder={t('support.messagePlaceholder')}
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '12px' }}
                >
                  <Send size={15} />
                  <span>{submitting ? t('support.sendingBtn') : t('support.submitTicketBtn')}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
