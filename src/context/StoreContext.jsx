// ===================================================================
// FixNear Trust - Reactive Store Context
// NOTE: Customer-side and Provider-side operations are fully on MongoDB REST API & Sockets.
// This context provides in-memory reactive state for the Admin console (Phase D).
// ===================================================================

import React, { createContext, useContext, useState } from 'react';
import { 
  SEED_CATEGORIES, 
  SEED_SERVICES, 
  SEED_PROVIDERS, 
  SEED_BOOKINGS,
  SEED_DISPUTES,
  INITIAL_REVIEWS
} from './mockData';
import { useToast } from './ToastContext';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const { showToast } = useToast();

  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState('admin');

  // Core Collections (in-memory for Admin Phase D desks)
  const [services, setServices] = useState(SEED_SERVICES);
  const [categories, setCategories] = useState(SEED_CATEGORIES);
  const [technicians, setTechnicians] = useState(SEED_PROVIDERS);
  const [bookings, setBookings] = useState(SEED_BOOKINGS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [disputes, setDisputes] = useState(SEED_DISPUTES);
  const [questionBank, setQuestionBank] = useState([]);
  const [passMark, setPassMark] = useState(70);
  const [activeBookingId, setActiveBookingId] = useState(null);
  
  // Modal states
  const [bookingModalService, setBookingModalService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeUserAction, setActiveUserAction] = useState(null);

  // Visible Reviews: Excludes any reviews hidden by Admin Moderation Desk
  const visibleReviews = reviews.filter((r) => !r.isHidden);

  // Approved technicians
  const approvedTechnicians = technicians
    .filter((t) => t.status === 'approved' || !t.status)
    .map((tech) => {
      const techReviews = visibleReviews.filter((r) => r.technicianId === tech.id || r.providerId === tech.id);
      const computedAvg = techReviews.length > 0 
        ? Number((techReviews.reduce((sum, r) => sum + r.rating, 0) / techReviews.length).toFixed(2))
        : tech.ratingAvg;
      return {
        ...tech,
        ratingAvg: computedAvg,
        ratingCount: techReviews.length > 0 ? techReviews.length : tech.ratingCount,
      };
    });

  // Active focused booking
  const activeBooking = bookings.find((b) => b.id === activeBookingId) || bookings[0] || SEED_BOOKINGS[0];

  // Admin Candidate Approvals Actions
  const approveProvider = async (providerId) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id === providerId || t.userId === providerId) {
          return { ...t, status: 'approved', rejectionReason: null, adminMessage: null };
        }
        return t;
      })
    );
    showToast('Provider application approved! Partner is now active for customer dispatches.', 'success');
  };

  const rejectProvider = async (providerId, reason) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id === providerId || t.userId === providerId) {
          return { ...t, status: 'rejected', rejectionReason: reason, isOnline: false };
        }
        return t;
      })
    );
    showToast('Provider application rejected. Feedback logged.', 'warning');
  };

  const requestProviderInfo = async (providerId, message) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id === providerId || t.userId === providerId) {
          return { ...t, status: 'needs_info', adminMessage: message };
        }
        return t;
      })
    );
    showToast('Clarification request sent to candidate.', 'info');
  };

  const suspendProvider = async (providerId, reason) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id === providerId || t.userId === providerId) {
          return { ...t, status: 'suspended', suspensionReason: reason, isOnline: false };
        }
        return t;
      })
    );
    showToast('Provider account suspended and blocked from new bookings.', 'warning');
  };

  const reinstateProvider = async (providerId) => {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id === providerId || t.userId === providerId) {
          return { ...t, status: 'approved', suspensionReason: null };
        }
        return t;
      })
    );
    showToast('Provider reinstated to active status.', 'success');
  };

  // Dispute Resolution Desk Actions
  const createDispute = async (disputeData) => {
    const disputeId = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDispute = {
      id: disputeId,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      timeline: [
        { 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          title: 'Dispute Raised by Customer', 
          note: disputeData.reason 
        }
      ],
      ...disputeData,
    };
    setDisputes((prev) => [newDispute, ...prev]);
    setBookings((prev) => prev.map((b) => (b.id === disputeData.bookingId ? { ...b, isDisputed: true, disputeId } : b)));
    showToast(`Dispute #${disputeId} lodged! Case sent to Admin Disputes Desk.`, 'warning');
    return newDispute;
  };

  const resolveDispute = async (disputeId, { decision, adminNote, refundAmount, providerPayout }) => {
    setDisputes((prev) =>
      prev.map((d) => {
        if (d.id === disputeId) {
          return {
            ...d,
            status: 'RESOLVED',
            decision,
            adminNote,
            refundAmount: refundAmount || 0,
            providerPayout: providerPayout || 0,
            resolvedAt: new Date().toISOString(),
            timeline: [
              ...(d.timeline || []),
              { 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                title: `Admin Decision: ${decision.replace(/_/g, ' ')}`, 
                note: adminNote 
              }
            ],
          };
        }
        return d;
      })
    );

    setBookings((prev) =>
      prev.map((b) => {
        if (b.disputeId === disputeId) {
          return {
            ...b,
            disputeResolution: { decision, adminNote, refundAmount, providerPayout, resolvedAt: new Date().toISOString() },
          };
        }
        return b;
      })
    );

    showToast(`Dispute #${disputeId} resolved (${decision.replace(/_/g, ' ')}). Both sides notified.`, 'success');
  };

  // Services Management Actions
  const addService = async (serviceData) => {
    const serviceId = `srv-${Date.now()}`;
    const newService = {
      id: serviceId,
      rating: 5.0,
      reviewsCount: 0,
      isActive: true,
      features: serviceData.features || ['Verified technician', '30-day warranty'],
      scope: serviceData.scope || { included: ['Full diagnosis & repair'], excluded: ['Heavy materials'] },
      ...serviceData,
    };
    setServices((prev) => [newService, ...prev]);
    return newService;
  };

  const updateService = async (serviceId, updatedFields) => {
    setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, ...updatedFields } : s)));
  };

  const toggleServiceStatus = async (serviceId) => {
    let serviceName = 'Service';
    let isNowActive = true;
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const updated = !Boolean(s.isActive ?? true);
          serviceName = s.title || s.name || 'Service';
          isNowActive = updated;
          return { ...s, isActive: updated };
        }
        return s;
      })
    );
    showToast(`Service "${serviceName}" is now ${isNowActive ? 'Active' : 'Disabled'}.`, 'info');
  };

  // Review Moderation Actions
  const toggleReviewVisibility = async (reviewId) => {
    let newHiddenState = false;
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const isHidden = !Boolean(r.isHidden);
          newHiddenState = isHidden;
          return { ...r, isHidden };
        }
        return r;
      })
    );
    showToast(`Review is now ${newHiddenState ? 'Hidden (Excluded from ratings)' : 'Visible (Included in ratings)'}.`, 'info');
  };

  // Stubs for legacy interfaces
  const getCategoryQuestions = async () => [];
  const submitTestAttempt = async () => ({ success: false });

  return (
    <StoreContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        services,
        categories,
        technicians,
        approvedTechnicians,
        bookings,
        reviews,
        visibleReviews,
        disputes,
        questionBank,
        passMark,
        setPassMark,
        activeBookingId,
        setActiveBookingId,
        activeBooking,
        bookingModalService,
        setBookingModalService,
        isBookingModalOpen,
        setIsBookingModalOpen,
        activeUserAction,
        setActiveUserAction,
        // Admin Phase D exports
        approveProvider,
        rejectProvider,
        requestProviderInfo,
        suspendProvider,
        reinstateProvider,
        createDispute,
        resolveDispute,
        addService,
        updateService,
        toggleServiceStatus,
        toggleReviewVisibility,
        getCategoryQuestions,
        submitTestAttempt,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
