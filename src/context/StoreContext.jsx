// ===================================================================
// FixNear Trust - Reactive Store Context with Firestore Sync
// Phase 2: Live Bookings, Quotation Approval, OTP Verification, Ratings & Reviews
// ===================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  db, 
  isLiveFirebaseConfigured, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc,
  addDoc
} from '../services/firebase/firebase';
import { 
  SEED_CATEGORIES, 
  SEED_SERVICES, 
  SEED_PROVIDERS, 
  SEED_BOOKINGS,
  SEED_DISPUTES,
  seedFirestoreDatabase 
} from '../services/firebase/seedData';
import { QUESTION_BANK_SEED } from '../services/firebase/questionBankSeed.js';
const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    author: "Pooja Hegde",
    locality: "Khar West, Mumbai",
    service: "Split AC Deep Clean",
    rating: 5,
    date: "3 days ago",
    content: "The technician arrived right on time with high-pressure cleaning gear. The pricing breakdown was shown on the app before work began. Truly refreshing level of professionalism.",
    verified: true
  },
  {
    id: "rev-2",
    author: "Devendra Verma",
    locality: "Indiranagar, Bangalore",
    service: "Distribution Box MCB Tripping Fix",
    rating: 5,
    date: "1 week ago",
    content: "Our main MCB kept tripping every evening. The electrician diagnosed an overloaded neutral wire in 20 minutes with zero hidden callout fees.",
    verified: true
  },
  {
    id: "rev-3",
    author: "Ananya Sen",
    locality: "Salt Lake, Kolkata",
    service: "Concealed Bathroom Leak Repair",
    rating: 5,
    date: "2 weeks ago",
    content: "Clean, quiet work, and no random extra charges asked at the doorstep. The 30-day workmanship warranty gave great peace of mind.",
    verified: true
  }
];
import { getSecureCategoryQuestions, evaluateSecureExamAttempt } from '../services/skillTestService';
import { useToast } from './ToastContext';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const { showToast } = useToast();

  // Navigation State
  const [currentRole, setCurrentRole] = useState('customer'); // 'customer' | 'provider' | 'admin'
  const [customerPage, setCustomerPage] = useState('home'); 

  // Core Collections
  const [services, setServices] = useState(SEED_SERVICES);
  const [categories, setCategories] = useState(SEED_CATEGORIES);
  const [technicians, setTechnicians] = useState(SEED_PROVIDERS);
  const [bookings, setBookings] = useState(SEED_BOOKINGS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [disputes, setDisputes] = useState(SEED_DISPUTES);
  const [questionBank, setQuestionBank] = useState(QUESTION_BANK_SEED);
  const [passMark, setPassMark] = useState(70);
  const [activeBookingId, setActiveBookingId] = useState(null);
  
  // Customer View State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('provider-demo-1');
  const [bookingModalService, setBookingModalService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeUserAction, setActiveUserAction] = useState(null);

  // Firestore Real-time Listeners (when live Firebase is connected)
  useEffect(() => {
    if (!isLiveFirebaseConfigured || !db) return;

    // 1. Services
    const unsubServices = onSnapshot(collection(db, "services"), (snap) => {
      if (!snap.empty) {
        const list = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
        setServices(list);
      }
    }, (err) => console.warn("Firestore services listener:", err.message));

    // 2. Categories
    const unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
      if (!snap.empty) {
        const list = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
        setCategories(list);
      }
    }, (err) => console.warn("Firestore categories listener:", err.message));

    // 3. Providers
    const unsubProviders = onSnapshot(collection(db, "providers"), (snap) => {
      if (!snap.empty) {
        const list = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
        setTechnicians(list);
      }
    }, (err) => console.warn("Firestore providers listener:", err.message));

    // 4. Bookings
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      if (!snap.empty) {
        const list = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
        setBookings(list);
      }
    }, (err) => console.warn("Firestore bookings listener:", err.message));

    // 5. Reviews
    const unsubReviews = onSnapshot(collection(db, "reviews"), (snap) => {
      if (!snap.empty) {
        const list = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
        setReviews(list);
      }
    }, (err) => console.warn("Firestore reviews listener:", err.message));

    // 6. Disputes
    const unsubDisputes = onSnapshot(collection(db, "disputes"), (snap) => {
      if (!snap.empty) {
        const list = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
        setDisputes(list);
      }
    }, (err) => console.warn("Firestore disputes listener:", err.message));

    return () => {
      unsubServices();
      unsubCategories();
      unsubProviders();
      unsubBookings();
      unsubReviews();
      unsubDisputes();
    };
  }, []);

  // Visible Reviews: Excludes any reviews hidden by Admin Moderation Desk
  const visibleReviews = reviews.filter(r => !r.isHidden);

  // Approved providers visible to customers (Calculates ratingAvg based strictly on visibleReviews)
  const approvedTechnicians = technicians
    .filter(t => t.status === 'approved' || !t.status)
    .map(tech => {
      const techReviews = visibleReviews.filter(r => r.technicianId === tech.id || r.providerId === tech.id);
      const computedAvg = techReviews.length > 0 
        ? Number((techReviews.reduce((sum, r) => sum + r.rating, 0) / techReviews.length).toFixed(2))
        : tech.ratingAvg;
      return {
        ...tech,
        ratingAvg: computedAvg,
        ratingCount: techReviews.length > 0 ? techReviews.length : tech.ratingCount
      };
    });

  // Active focused booking
  const activeBooking = bookings.find(b => b.id === activeBookingId) || bookings[0] || SEED_BOOKINGS[0];

  // Helper: Create a new booking in Firestore and local state
  const createBooking = async (newBookingData) => {
    const bookingId = `FX-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomOtp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const newEntry = {
      id: bookingId,
      serviceTitle: newBookingData.serviceTitle || "Home Service Request",
      serviceId: newBookingData.serviceId || "srv-ac-service",
      customerId: newBookingData.customerId || "",
      customerName: newBookingData.customerName || "Customer",
      customerPhone: newBookingData.customerPhone || "",
      address: newBookingData.address || "",
      pincode: newBookingData.pincode || "",
      providerId: newBookingData.providerId || newBookingData.technicianId || "",
      providerName: newBookingData.providerName || newBookingData.technicianName || "Assigned Technician",
      providerPhone: newBookingData.providerPhone || "+91 98200 00000",
      technicianId: newBookingData.providerId || newBookingData.technicianId || "",
      technicianName: newBookingData.providerName || newBookingData.technicianName || "Assigned Technician",
      technicianPhone: "+91 98200 11223",
      technicianEta: "35 mins away",
      status: "REQUESTED", // Pipeline: "REQUESTED" -> "ACCEPTED" -> "ON_THE_WAY" -> "WORKING" -> "COMPLETED"
      scheduledDate: newBookingData.scheduledDate || "Tomorrow",
      timeSlot: newBookingData.timeSlot || "Morning (10:00 AM - 01:00 PM)",
      slot: newBookingData.timeSlot || "Morning (10:00 AM - 01:00 PM)",
      basePrice: newBookingData.basePrice || 499,
      price: newBookingData.basePrice || 499,
      inspectionFee: 0,
      notes: newBookingData.notes || "",
      problemNote: newBookingData.notes || "",
      photos: newBookingData.photos || [],
      hasAdditionalQuotation: false,
      additionalQuotation: null,
      quotation: null,
      invoice: {
        invoiceNo: `INV-${bookingId.replace('FX-', '')}`,
        status: "UNPAID",
        issuedAt: "Upon work completion",
        approvedQuotationTotal: newBookingData.basePrice || 499,
        actualBilledTotal: newBookingData.basePrice || 499,
        lineItemsApproved: [
          { desc: `${newBookingData.serviceTitle || "Standard Service"} (Base Rate)`, amount: newBookingData.basePrice || 499 }
        ],
        lineItemsActual: [
          { desc: `${newBookingData.serviceTitle || "Standard Service"} (Base Rate)`, amount: newBookingData.basePrice || 499 }
        ],
        hasVariance: false,
        varianceAmount: 0,
        varianceExplanation: "Charges strictly match your original base rate booking."
      },
      otp: randomOtp,
      completionOtp: randomOtp,
      warrantyDaysLeft: 30,
      timeline: [
        { step: "Booking Created & Requested", time: "Just now", done: true },
        { step: "Provider Accepted", time: "Pending", current: true, done: false },
        { step: "Provider On The Way", time: "Pending", done: false },
        { step: "Working & Diagnostics", time: "Pending", done: false },
        { step: "Completion with OTP", time: "Pending", done: false }
      ],
      createdAt: new Date().toISOString()
    };

    if (isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "bookings", bookingId), newEntry);
      } catch (err) {
        console.warn("Firestore save booking:", err.message);
      }
    }

    setBookings(prev => [newEntry, ...prev]);
    setActiveBookingId(bookingId);
    return bookingId;
  };

  // Helper: Live stage advancement (Requested -> Accepted -> On the Way -> Working -> Completed)
  const advanceBookingStage = async (bookingId, targetStatus) => {
    let updatedBooking = null;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const timeNow = "Just now";
        let newTimeline = [...b.timeline];

        if (targetStatus === 'ACCEPTED') {
          newTimeline = [
            { step: "Booking Created & Requested", time: b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Earlier", done: true },
            { step: "Provider Accepted (Ramesh Sharma)", time: timeNow, done: true },
            { step: "Provider On The Way", time: "Upcoming", current: true, done: false },
            { step: "Working & Diagnostics", time: "Pending", done: false },
            { step: "Completion with OTP", time: "Pending", done: false }
          ];
        } else if (targetStatus === 'ON_THE_WAY') {
          newTimeline = [
            { step: "Booking Created & Requested", time: "Earlier", done: true },
            { step: "Provider Accepted (Ramesh Sharma)", time: "Earlier", done: true },
            { step: "Provider On The Way (Live GPS)", time: timeNow, done: true },
            { step: "Working & Diagnostics", time: "Upcoming", current: true, done: false },
            { step: "Completion with OTP", time: "Pending", done: false }
          ];
        } else if (targetStatus === 'WORKING') {
          newTimeline = [
            { step: "Booking Created & Requested", time: "Earlier", done: true },
            { step: "Provider Accepted", time: "Earlier", done: true },
            { step: "Provider Arrived at Doorstep", time: "Earlier", done: true },
            { step: "Working & Triage Underway", time: timeNow, current: true, done: false },
            { step: "Completion with OTP", time: "Pending", done: false }
          ];
        } else if (targetStatus === 'COMPLETED') {
          newTimeline = newTimeline.map(t => ({ ...t, done: true, current: false }));
        }

        const updated = {
          ...b,
          status: targetStatus,
          timeline: newTimeline
        };

        if (targetStatus === 'COMPLETED' && updated.invoice) {
          updated.invoice = {
            ...updated.invoice,
            status: "ESCROW_RELEASED",
            paidAt: "Just now via FixNear Escrow"
          };
        }

        updatedBooking = updated;
        return updated;
      }
      return b;
    }));

    if (updatedBooking && isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "bookings", bookingId), updatedBooking);
      } catch (err) {
        console.warn("Firestore advance status:", err.message);
      }
    }

    return updatedBooking;
  };

  // Helper: Provider sends extra quotation for replacement parts
  const submitExtraQuotation = async (bookingId, quoteData) => {
    let updatedBooking = null;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const quoteObj = {
          id: `QUO-${Math.floor(1000 + Math.random() * 9000)}`,
          reason: quoteData.reason || "Outdoor compressor fan run-capacitor degraded, causing thermal cutoffs.",
          diagnosticReport: quoteData.diagnosticReport || "Motor running above normal rating. Replacing capacitor will restore full 14°C cooling.",
          validUntil: "Today, 11:59 PM (Valid for 14 hrs)",
          parts: quoteData.parts || [
            { name: "OEM EPCOS Dual Motor Run-Capacitor (45+5 uF)", cost: 450, tax: 40, oemCertified: true },
            { name: "High-Temperature Outdoor Anti-Vibration Bushings (Set of 4)", cost: 200, tax: 18, oemCertified: true }
          ],
          laborAddon: quoteData.laborAddon || 100,
          taxes: quoteData.taxes || 58,
          totalExtra: quoteData.totalExtra || 808,
          baselineService: b.price || b.basePrice || 599,
          finalTotalEstimate: (b.price || b.basePrice || 599) + (quoteData.totalExtra || 808),
          status: "PENDING_CUSTOMER_APPROVAL",
          requestedAt: "Just now"
        };

        const updated = {
          ...b,
          hasAdditionalQuotation: true,
          additionalQuotation: quoteObj,
          quotation: quoteObj
        };

        updatedBooking = updated;
        return updated;
      }
      return b;
    }));

    if (updatedBooking && isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "bookings", bookingId), updatedBooking);
      } catch (err) {
        console.warn("Firestore send quote:", err.message);
      }
    }
  };

  // Helper: Customer approves or rejects digital quotation
  const updateQuotationStatus = async (bookingId, newStatus, changeNotes = "") => {
    let updatedBooking = null;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId && (b.additionalQuotation || b.quotation)) {
        const quote = b.additionalQuotation || b.quotation;

        if (newStatus === 'APPROVED' && quote.status === 'REJECTED') {
          alert("Security safeguard: A rejected quotation cannot be approved. The technician must submit a revised quote.");
          return b;
        }

        const isApproved = newStatus === 'APPROVED';
        const isRejected = newStatus === 'REJECTED';

        const updatedTimeline = b.timeline.map(t => {
          if (t.step.includes("Quotation")) {
            return { ...t, done: true, current: false };
          }
          return t;
        });

        const updatedInvoice = b.invoice ? {
          ...b.invoice,
          approvedQuotationTotal: isApproved ? quote.finalTotalEstimate : b.basePrice,
          actualBilledTotal: isApproved ? quote.finalTotalEstimate : b.basePrice
        } : null;

        const updated = {
          ...b,
          status: "WORKING",
          hasAdditionalQuotation: isApproved,
          additionalQuotation: {
            ...quote,
            status: newStatus,
            changeNotes: changeNotes || quote.changeNotes
          },
          quotation: {
            ...quote,
            status: newStatus,
            changeNotes: changeNotes || quote.changeNotes
          },
          invoice: updatedInvoice,
          timeline: updatedTimeline
        };

        updatedBooking = updated;
        return updated;
      }
      return b;
    }));

    if (updatedBooking && isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "bookings", bookingId), updatedBooking);
      } catch (err) {
        console.warn("Firestore quotation status sync:", err.message);
      }
    }
  };

  // Helper: Escrow release with 4-digit OTP
  const releaseInvoiceEscrow = async (bookingId, enteredOtp) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Booking not found." };

    const expectedOtp = booking.completionOtp || booking.otp;
    if (enteredOtp !== expectedOtp) {
      return { success: false, message: "Invalid Completion OTP. Please check the 4-digit code shown in your booking tracker." };
    }

    let completedBooking = null;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const completed = {
          ...b,
          status: "COMPLETED",
          invoice: {
            ...b.invoice,
            status: "ESCROW_RELEASED",
            paidAt: "Just now via FixNear Escrow"
          },
          timeline: b.timeline.map(t => ({ ...t, done: true, current: false }))
        };
        completedBooking = completed;
        return completed;
      }
      return b;
    }));

    if (completedBooking && isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "bookings", bookingId), completedBooking);
      } catch (err) {
        console.warn("Firestore escrow release sync:", err.message);
      }
    }

    return { success: true, message: "Payment released from escrow to technician. 30-Day Warranty activated!" };
  };

  // Helper: Dispute submission
  const submitInvoiceDispute = async (bookingId, disputeData) => {
    let disputedBooking = null;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updated = {
          ...b,
          status: "DISPUTED",
          invoice: {
            ...b.invoice,
            status: "DISPUTED",
            disputeTicket: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
            disputeReason: disputeData.reason,
            disputeClaim: disputeData.claimAmount,
            disputeNotes: disputeData.notes,
            disputeFiledAt: "Just now"
          }
        };
        disputedBooking = updated;
        return updated;
      }
      return b;
    }));

    if (disputedBooking && isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "bookings", bookingId), disputedBooking);
      } catch (err) {
        console.warn("Firestore dispute sync:", err.message);
      }
    }
  };

  // Helper: Post-completion 1-5 star review submission with photo & feedback
  const submitReview = async ({ bookingId, providerId, rating, comment, photoUrl, authorName, serviceTitle }) => {
    const reviewId = `rev-${Date.now()}`;
    const newReview = {
      id: reviewId,
      bookingId,
      providerId: providerId || "",
      author: authorName || "Customer",
      locality: "Mumbai",
      service: serviceTitle || "Home Service",
      rating: Number(rating) || 5,
      content: comment || "Great service and verified specialist!",
      photoUrl: photoUrl || null,
      date: "Just now",
      verified: true,
      createdAt: new Date().toISOString()
    };

    // Update local reviews list
    setReviews(prev => [newReview, ...prev]);

    // Mark booking as reviewed
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, isReviewed: true, review: newReview } : b));

    // Update provider ratings count and average
    setTechnicians(prev => prev.map(t => {
      if (t.id === providerId || t.userId === providerId) {
        const newCount = (t.ratingCount || 0) + 1;
        const newAvg = Number((((t.ratingAvg || 4.8) * (t.ratingCount || 1) + rating) / newCount).toFixed(2));
        return {
          ...t,
          ratingCount: newCount,
          ratingAvg: newAvg,
          jobsDone: (t.jobsDone || 0) + 1
        };
      }
      return t;
    }));

    // If live Firestore is available, save review & update booking/provider
    if (isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "reviews", reviewId), newReview);
        await updateDoc(doc(db, "bookings", bookingId), { isReviewed: true, reviewId });
      } catch (err) {
        console.warn("Firestore submit review:", err.message);
      }
    }

    showToast('Review submitted! Thank you for rating your service.', 'success');
    return newReview;
  };

  // --- Phase 3 Provider Operations ---

  // 1. Register or update provider profile
  const registerProviderProfile = async (providerData) => {
    const provId = providerData.userId || providerData.id || `prov-${Date.now()}`;
    const newProvider = {
      id: provId,
      userId: provId,
      name: providerData.name || "Technician Partner",
      phone: providerData.phone || "",
      city: providerData.city || "Mumbai",
      serviceArea: providerData.serviceArea || providerData.city || "Mumbai",
      skills: providerData.skills || [providerData.category || "ac-cooling"],
      experienceYears: Number(providerData.experienceYears) || 3,
      bio: providerData.bio || "Certified home service professional.",
      idProofUrl: providerData.idProofUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80",
      certificateUrl: providerData.certificateUrl || null,
      status: providerData.status || "pending_test", // 'pending_test' | 'under_review' | 'approved'
      verifiedSkills: providerData.verifiedSkills || [],
      testScore: providerData.testScore || 0,
      ratingAvg: 4.9,
      ratingCount: 0,
      jobsDone: 0,
      isOnline: true,
      createdAt: new Date().toISOString()
    };

    setTechnicians(prev => {
      const idx = prev.findIndex(t => t.id === provId || t.userId === provId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...newProvider };
        return updated;
      }
      return [newProvider, ...prev];
    });

    if (isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "providers", provId), newProvider, { merge: true });
      } catch (err) {
        console.warn("Firestore register provider:", err.message);
      }
    }

    return newProvider;
  };

  // 2. Toggle Provider Online / Offline state
  const toggleProviderOnlineStatus = async (providerId, isOnline) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === providerId || t.userId === providerId) {
        return { ...t, isOnline };
      }
      return t;
    }));

    if (isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "providers", providerId), { isOnline });
      } catch (err) {
        console.warn("Firestore toggle online:", err.message);
      }
    }
  };

  // 3. Fetch 10 random questions for category using Secure Exam Service (correctIndex STRIPPED)
  const getCategoryQuestions = async (categoryId = "ac-cooling") => {
    return await getSecureCategoryQuestions(categoryId);
  };

  // 4. Submit test attempt to secure evaluator (enforces 15m limit, 24h cooldown, server answers)
  const [testAttempts, setTestAttempts] = useState([]);

  const submitTestAttempt = async ({ providerId, categoryId, categoryName, answers, startTime, tabSwitches = 0 }) => {
    const prov = technicians.find(t => t.id === providerId || t.userId === providerId);
    
    // Call secure evaluation service
    const evalResult = await evaluateSecureExamAttempt({
      providerId,
      categoryId,
      categoryName,
      answers,
      startTime,
      tabSwitches,
      providerCooldownUntil: prov?.cooldownUntil,
      passMark: passMark || 70
    });

    const attemptRecord = {
      id: evalResult.attemptId,
      providerId,
      categoryId,
      categoryName: categoryName || categoryId,
      score: evalResult.score,
      correctCount: evalResult.correctCount,
      totalQuestions: evalResult.totalQuestions,
      passed: evalResult.passed,
      badge: evalResult.badge,
      weakTopics: evalResult.weakTopics,
      timeSpentSeconds: evalResult.timeSpentSeconds,
      tabSwitches: evalResult.tabSwitches,
      cooldownUntil: evalResult.cooldownUntil,
      createdAt: new Date().toISOString()
    };

    setTestAttempts(prev => [attemptRecord, ...prev]);

    // Update technician record in local store
    setTechnicians(prev => prev.map(t => {
      if (t.id === providerId || t.userId === providerId) {
        const existingSkills = t.verifiedSkills || [];
        const filteredSkills = existingSkills.filter(s => s.categoryId !== categoryId);
        const updatedSkills = evalResult.passed ? [
          ...filteredSkills,
          { categoryId, categoryName: categoryName || categoryId, score: evalResult.score, badge: evalResult.badge, verifiedAt: new Date().toISOString() }
        ] : existingSkills;

        return {
          ...t,
          status: evalResult.passed ? "under_review" : "test_failed",
          testScore: evalResult.score,
          tabSwitches: evalResult.tabSwitches,
          cooldownUntil: evalResult.cooldownUntil,
          verifiedSkills: updatedSkills
        };
      }
      return t;
    }));

    if (isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "testAttempts", evalResult.attemptId), attemptRecord);
        const provUpdates = evalResult.passed ? {
          status: "under_review",
          testScore: evalResult.score,
          tabSwitches: evalResult.tabSwitches,
          cooldownUntil: null
        } : { 
          status: "test_failed",
          cooldownUntil: evalResult.cooldownUntil,
          tabSwitches: evalResult.tabSwitches
        };
        await updateDoc(doc(db, "providers", providerId), provUpdates);
      } catch (err) {
        console.warn("Firestore test attempt sync:", err.message);
      }
    }

    return evalResult;
  };

  // 5. Provider accepts incoming job request
  const acceptJobBooking = async (bookingId, providerId, providerName) => {
    return advanceBookingStage(bookingId, 'ACCEPTED');
  };

  // 6. Provider declines job
  const declineJobBooking = async (bookingId, providerId) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  // ===================================================================
  // PHASE 4: ADMIN PORTAL ACTIONS
  // ===================================================================

  // 1. Approval Desk Actions
  const approveProvider = async (providerId) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === providerId || t.userId === providerId) {
        return { ...t, status: 'approved', rejectionReason: null, adminMessage: null, approvedAt: new Date().toISOString() };
      }
      return t;
    }));
    if (isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "providers", providerId), {
          status: "approved",
          rejectionReason: null,
          adminMessage: null,
          approvedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore approve provider:", err.message);
      }
    }
    showToast('Provider application approved! Partner is now active and visible.', 'success');
  };

  const rejectProvider = async (providerId, reason) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === providerId || t.userId === providerId) {
        return { ...t, status: 'rejected', rejectionReason: reason, rejectedAt: new Date().toISOString() };
      }
      return t;
    }));
    if (isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "providers", providerId), {
          status: "rejected",
          rejectionReason: reason,
          rejectedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore reject provider:", err.message);
      }
    }
    showToast('Provider application rejected. Reason posted to their dashboard.', 'warning');
  };

  const requestProviderInfo = async (providerId, message) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === providerId || t.userId === providerId) {
        return { ...t, status: 'needs_info', adminMessage: message };
      }
      return t;
    }));
    if (isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "providers", providerId), {
          status: "needs_info",
          adminMessage: message
        });
      } catch (err) {
        console.warn("Firestore request provider info:", err.message);
      }
    }
    showToast('Information request sent to technician partner.', 'info');
  };

  // 2. Provider Management Actions (Suspend / Reinstate)
  const suspendProvider = async (providerId, reason) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === providerId || t.userId === providerId) {
        return { ...t, status: 'suspended', suspensionReason: reason, isOnline: false };
      }
      return t;
    }));
    if (isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "providers", providerId), {
          status: "suspended",
          suspensionReason: reason,
          isOnline: false
        });
      } catch (err) {
        console.warn("Firestore suspend provider:", err.message);
      }
    }
    showToast('Provider account suspended and blocked from new bookings.', 'warning');
  };

  const reinstateProvider = async (providerId) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === providerId || t.userId === providerId) {
        return { ...t, status: 'approved', suspensionReason: null };
      }
      return t;
    }));
    if (isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "providers", providerId), {
          status: "approved",
          suspensionReason: null
        });
      } catch (err) {
        console.warn("Firestore reinstate provider:", err.message);
      }
    }
    showToast('Provider reinstated to active status.', 'success');
  };

  // 3. Dispute Resolution Desk Actions
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
      ...disputeData
    };
    setDisputes(prev => [newDispute, ...prev]);

    // Mark booking as disputed
    setBookings(prev => prev.map(b => b.id === disputeData.bookingId ? { ...b, isDisputed: true, disputeId } : b));

    if (isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "disputes", disputeId), newDispute);
        await updateDoc(doc(db, "bookings", disputeData.bookingId), { isDisputed: true, disputeId });
      } catch (err) {
        console.warn("Firestore create dispute:", err.message);
      }
    }
    showToast(`Dispute #${disputeId} lodged! Case sent to Admin Disputes Desk.`, 'warning');
    return newDispute;
  };

  const resolveDispute = async (disputeId, { decision, adminNote, refundAmount, providerPayout }) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: 'RESOLVED',
          decision, // 'REFUND_CUSTOMER' | 'PAY_PROVIDER' | 'PARTIAL_SPLIT'
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
          ]
        };
      }
      return d;
    }));

    // Update associated booking
    setBookings(prev => prev.map(b => {
      if (b.disputeId === disputeId) {
        return {
          ...b,
          disputeResolution: { decision, adminNote, refundAmount, providerPayout, resolvedAt: new Date().toISOString() }
        };
      }
      return b;
    }));

    if (isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "disputes", disputeId), {
          status: 'RESOLVED',
          decision,
          adminNote,
          refundAmount: refundAmount || 0,
          providerPayout: providerPayout || 0,
          resolvedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore resolve dispute:", err.message);
      }
    }
    showToast(`Dispute #${disputeId} resolved (${decision.replace(/_/g, ' ')}). Both sides notified.`, 'success');
  };

  // 4. Services & Pricing Management Actions
  const addService = async (serviceData) => {
    const serviceId = `srv-${Date.now()}`;
    const newService = {
      id: serviceId,
      rating: 5.0,
      reviewsCount: 0,
      isActive: true,
      features: serviceData.features || ["Verified technician", "30-day warranty"],
      scope: serviceData.scope || { included: ["Full diagnosis & repair"], excluded: ["Heavy materials"] },
      ...serviceData
    };
    setServices(prev => [newService, ...prev]);
    if (isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "services", serviceId), newService);
      } catch (err) {
        console.warn("Firestore add service:", err.message);
      }
    }
    return newService;
  };

  const updateService = async (serviceId, updatedFields) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...updatedFields } : s));
    if (isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "services", serviceId), updatedFields);
      } catch (err) {
        console.warn("Firestore update service:", err.message);
      }
    }
  };

  const toggleServiceStatus = async (serviceId) => {
    let serviceName = "Service";
    let isNowActive = true;
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const updated = !Boolean(s.isActive ?? true);
        serviceName = s.name;
        isNowActive = updated;
        if (isLiveFirebaseConfigured && db) {
          updateDoc(doc(db, "services", serviceId), { isActive: updated }).catch(console.warn);
        }
        return { ...s, isActive: updated };
      }
      return s;
    }));
    showToast(`Service "${serviceName}" is now ${isNowActive ? 'Active' : 'Disabled'}.`, 'info');
  };

  // 5. Question Bank Management Actions
  const addQuestion = async (qData) => {
    const qId = `q-${Date.now()}`;
    const newQ = { id: qId, ...qData };
    setQuestionBank(prev => [newQ, ...prev]);
    if (isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "questions", qId), newQ);
      } catch (err) {
        console.warn("Firestore add question:", err.message);
      }
    }
    showToast('Question added to exam question bank!', 'success');
    return newQ;
  };

  const updateQuestion = async (qId, updatedFields) => {
    setQuestionBank(prev => prev.map(q => q.id === qId ? { ...q, ...updatedFields } : q));
    if (isLiveFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "questions", qId), updatedFields);
      } catch (err) {
        console.warn("Firestore update question:", err.message);
      }
    }
    showToast('Question updated.', 'success');
  };

  const deleteQuestion = async (qId) => {
    setQuestionBank(prev => prev.filter(q => q.id !== qId));
    if (isLiveFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "questions", qId));
      } catch (err) {
        console.warn("Firestore delete question:", err.message);
      }
    }
    showToast('Question removed from exam question bank.', 'info');
  };

  // 6. Review Moderation Actions
  const toggleReviewVisibility = async (reviewId) => {
    let newHiddenState = false;
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        const isHidden = !Boolean(r.isHidden);
        newHiddenState = isHidden;
        if (isLiveFirebaseConfigured && db) {
          updateDoc(doc(db, "reviews", reviewId), { isHidden }).catch(console.warn);
        }
        return { ...r, isHidden };
      }
      return r;
    }));
    showToast(`Review is now ${newHiddenState ? 'Hidden (Excluded from ratings)' : 'Visible (Included in ratings)'}.`, 'info');
  };



  return (
    <StoreContext.Provider value={{
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
      createBooking,
      advanceBookingStage,
      submitExtraQuotation,
      updateQuotationStatus,
      releaseInvoiceEscrow,
      submitInvoiceDispute,
      submitReview,
      registerProviderProfile,
      toggleProviderOnlineStatus,
      getCategoryQuestions,
      submitTestAttempt,
      testAttempts,
      acceptJobBooking,
      declineJobBooking,
      // Phase 4 Admin exports
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
      addQuestion,
      updateQuestion,
      deleteQuestion,
      toggleReviewVisibility,
      searchQuery,
      setSearchQuery,
      selectedCategoryFilter,
      setSelectedCategoryFilter,
      selectedTechnicianId,
      setSelectedTechnicianId,
      bookingModalService,
      setBookingModalService,
      isBookingModalOpen,
      setIsBookingModalOpen,
      activeUserAction,
      setActiveUserAction
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
