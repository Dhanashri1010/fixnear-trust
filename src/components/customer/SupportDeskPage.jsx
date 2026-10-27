import React, { useState } from 'react';
import { 
  HelpCircle, 
  ShieldCheck, 
  PhoneCall, 
  MessageSquare, 
  AlertTriangle, 
  ChevronRight, 
  Home, 
  Send, 
  CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function SupportDeskPage() {
  const navigate = useNavigate();
  const [ticketSubject, setTicketSubject] = useState('Warranty Claim on Service #FX-98214');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      q: "How does FixNear Payment Protection protect my money?",
      a: "When you book a service, your payment is held safely. The technician is not paid until you inspect the completed work and give your 4-digit finish code."
    },
    {
      q: "What if the technician requests additional money for spare parts at the doorstep?",
      a: "Technicians cannot verbally charge you extra. Any replacement parts must be logged in their Service Partner app, creating a digital quotation that pops up on your screen. You have full power to accept or decline."
    },
    {
      q: "How do I trigger the 30-Day Free Workmanship Warranty?",
      a: "If the repaired problem resurfaces within 30 days of service completion, navigate to your Repair History or submit a ticket here. We dispatch a specialist for a free re-inspection and resolution."
    },
    {
      q: "Are all technicians criminal background checked?",
      a: "Yes. Every partner onboarded to FixNear Trust undergoes a 3-layer audit: government ID check (Aadhaar), local police clearance verification, and hands-on trade certification."
    }
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setTicketSubmitted(true);
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
          <button 
            type="button"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--forest-700)', fontWeight: 600, background: 'none' }}
          >
            <Home size={14} />
            <span>Home</span>
          </button>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>Help & Customer Support</span>
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
              24/7 FixNear Trust Desk
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            How Can We Assist You Today?
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '640px' }}>
            Get instant clarity on your bookings, warranty protection, quotations, or submit an official inquiry to our resolution team.
          </p>
        </div>

        {/* 3 Quick Channels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--forest-100)', color: 'var(--forest-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <PhoneCall size={20} />
            </div>
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '4px' }}>Priority Helpline</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              For active appointment emergency escalations.
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-800)' }}>
              1800-419-FIXNEAR (Toll Free)
            </div>
          </div>

          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--blue-100)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <MessageSquare size={20} />
            </div>
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '4px' }}>WhatsApp Concierge</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Live booking ETA alerts and digital quotation review.
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--blue-700)' }}>
              +91 98200 99881
            </div>
          </div>

          <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--yellow-100)', color: 'var(--yellow-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '4px' }}>Escrow Dispute Fast-Track</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Hold payment release if work quality is disputed.
            </div>
            <span className="badge badge-yellow" style={{ fontSize: '11px' }}>
              Immediate Escrow Freeze
            </span>
          </div>
        </div>

        {/* FAQs & Support Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '32px' }}>
          
          {/* FAQs */}
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>
              Frequently Answered Questions
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, i) => (
                <div 
                  key={i}
                  onClick={() => setExpandedFaq(expandedFaq === i ? -1 : i)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: expandedFaq === i ? 'var(--forest-50)' : 'var(--bg-warm)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {faq.q}
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-700)' }}>
                      {expandedFaq === i ? '−' : '+'}
                    </span>
                  </div>

                  {expandedFaq === i && (
                    <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Submission Form */}
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
              Create a Support Ticket
            </h2>

            {ticketSubmitted ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <CheckCircle2 size={42} color="var(--forest-700)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Ticket #TCK-4819 Created</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Our resolution team has received your inquiry. We review customer tickets within 15 minutes.
                </p>
                <button className="btn btn-outline btn-sm" onClick={() => setTicketSubmitted(false)}>
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Inquiry Subject
                  </label>
                  <input 
                    type="text" 
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
                    Detailed Description
                  </label>
                  <textarea 
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue or warranty claim details..."
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

                <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
                  <Send size={15} />
                  <span>Submit Ticket (Demo Preview)</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
