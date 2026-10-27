// ===================================================================
// FixNear Trust - Seed Data & Database Seeder
// Moves categories, services, demo users, providers & question bank to Firestore
// ===================================================================

import { QUESTION_BANK_SEED } from './questionBankSeed.js';

export const SEED_CATEGORIES = [
  {
    id: "ac-cooling",
    name: "Air Conditioning",
    tagline: "Cooling diagnostics, servicing & compressor repair",
    icon: "Wind",
    badge: "Popular in Summer",
    count: "12 Services",
    startingPrice: 499,
    accentBg: "var(--blue-50)",
    accentText: "var(--blue-700)"
  },
  {
    id: "plumbing",
    name: "Plumbing Systems",
    tagline: "Leak detection, pipe repairs, fixture installs",
    icon: "Droplets",
    badge: "30-Day Guarantee",
    count: "18 Services",
    startingPrice: 299,
    accentBg: "var(--sage-50)",
    accentText: "var(--sage-700)"
  },
  {
    id: "electrical",
    name: "Electrical & Safety",
    tagline: "Circuit triage, rewiring, smart switches & MCB",
    icon: "Zap",
    badge: "Certified Pros",
    count: "15 Services",
    startingPrice: 349,
    accentBg: "var(--yellow-50)",
    accentText: "var(--yellow-800)"
  },
  {
    id: "appliances",
    name: "Home Appliances",
    tagline: "Washing machines, microwave, refrigerators",
    icon: "Tv",
    badge: "OEM Parts Only",
    count: "22 Services",
    startingPrice: 399,
    accentBg: "var(--forest-50)",
    accentText: "var(--forest-700)"
  },
  {
    id: "carpentry",
    name: "Carpentry & Fitting",
    tagline: "Lock repairs, custom shelving, hinge realignment",
    icon: "Hammer",
    badge: "Precision Craft",
    count: "14 Services",
    startingPrice: 299,
    accentBg: "var(--bg-warm-secondary)",
    accentText: "var(--text-secondary)"
  },
  {
    id: "deep-cleaning",
    name: "Deep Cleaning",
    tagline: "Kitchen degreasing, bathroom sanitization",
    icon: "Sparkles",
    badge: "Eco-Friendly",
    count: "9 Services",
    startingPrice: 799,
    accentBg: "var(--blue-50)",
    accentText: "var(--blue-700)"
  }
];

export const SEED_SERVICES = [
  {
    id: "srv-ac-service",
    title: "Split AC Master Service & Jet Clean",
    category: "Air Conditioning",
    categoryId: "ac-cooling",
    rating: 4.88,
    reviewsCount: 342,
    startingPrice: 599,
    originalPrice: 899,
    discountBadge: "33% Off",
    duration: "45 - 60 mins",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    features: [
      "High-pressure foam jet cleaning",
      "Indoor cooling coil & filter flush",
      "Gas pressure & leakage diagnostic check",
      "30-Day FixNear Workmanship Warranty"
    ],
    scope: {
      included: ["Indoor unit deep foam wash", "Outdoor fan flush", "Drain tray unclogging", "Amperage & temperature check"],
      excluded: ["Refrigerant gas refill (quoted separately if required)", "Spare replacement"]
    }
  },
  {
    id: "srv-ac-gas",
    title: "Eco-Friendly Refrigerant Gas Refill (R32 / R410A)",
    category: "Air Conditioning",
    categoryId: "ac-cooling",
    rating: 4.82,
    reviewsCount: 174,
    startingPrice: 1299,
    originalPrice: 1800,
    discountBadge: "Fixed Gram Scale",
    duration: "60 mins",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    features: [
      "Precision electronic manifold gauge leak test",
      "Vacuum pump moisture purge",
      "OEM-grade high-purity refrigerant cylinder",
      "Post-fill amperage & vent temperature validation"
    ],
    scope: {
      included: ["Nitrogen pressure holding test", "Gas recharge", "30-day zero-leak warranty"],
      excluded: ["Major copper coil brazing (quoted separately if fractured)"]
    }
  },
  {
    id: "srv-plumbing-leak",
    title: "Precision Tap & Concealed Pipe Leak Triage",
    category: "Plumbing Systems",
    categoryId: "plumbing",
    rating: 4.92,
    reviewsCount: 512,
    startingPrice: 299,
    originalPrice: 449,
    discountBadge: "Flat Inspection",
    duration: "30 - 45 mins",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
    features: [
      "Non-invasive moisture meter inspection",
      "Spindle, cartridge & washer replacements",
      "Pressure regulation check",
      "Zero hidden callout fee if repaired"
    ],
    scope: {
      included: ["Fault diagnosis", "Labor for single tap/valve fix", "Post-repair cleanup"],
      excluded: ["Wall cutting & core drilling", "Cost of brand-new faucet hardware"]
    }
  },
  {
    id: "srv-drain-blockage",
    title: "Motorized Kitchen & Bathroom Drain De-clogging",
    category: "Plumbing Systems",
    categoryId: "plumbing",
    rating: 4.90,
    reviewsCount: 231,
    startingPrice: 449,
    originalPrice: 650,
    discountBadge: "Fast Clearance",
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    features: [
      "Heavy-duty rotational drain-snake cable",
      "Fat, grease & mineral build-up extraction",
      "Chemical-free, pipe-safe clearing",
      "Drain overflow check & trap resealing"
    ],
    scope: {
      included: ["Clearing of main sink trap and floor gully", "Cleanup after clearing"],
      excluded: ["Total building main stack excavation"]
    }
  },
  {
    id: "srv-electrical-mcb",
    title: "Main MCB & Short-Circuit Safety Inspection",
    category: "Electrical & Safety",
    categoryId: "electrical",
    rating: 4.95,
    reviewsCount: 289,
    startingPrice: 399,
    originalPrice: 599,
    discountBadge: "Safety First",
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
    features: [
      "Thermal load test on distribution box",
      "Earthing resistance measurement",
      "Loose wire fastening & neutral check",
      "Certified Grade-A Electrician"
    ],
    scope: {
      included: ["Complete home panel check", "Identification of tripping causes", "Safety advisory report"],
      excluded: ["Total rewiring materials", "Heavy industrial switchgear"]
    }
  },
  {
    id: "srv-fan-installation",
    title: "BLDC Energy-Saving Ceiling Fan Fitting & Setup",
    category: "Electrical & Safety",
    categoryId: "electrical",
    rating: 4.87,
    reviewsCount: 165,
    startingPrice: 249,
    originalPrice: 350,
    discountBadge: "Quick Install",
    duration: "30 mins",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    features: [
      "Anchor bolt & downrod torque fastening",
      "Remote controller pairing & speed calibration",
      "Zero-wobble dynamic balancing",
      "Old fan unmounting included"
    ],
    scope: {
      included: ["Installation of 1 fan", "Connection to existing ceiling hook & wiring"],
      excluded: ["Cost of ceiling fan unit", "New ceiling wiring conduits"]
    }
  },
  {
    id: "srv-washing-machine",
    title: "Front / Top Load Washing Machine Drum & Spin Triage",
    category: "Home Appliances",
    categoryId: "appliances",
    rating: 4.86,
    reviewsCount: 312,
    startingPrice: 499,
    originalPrice: 700,
    discountBadge: "OEM Diagnostics",
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80",
    features: [
      "Drain pump filter & impeller inspection",
      "Drive belt tension & motor capacitor check",
      "Error code diagnostic scan (E01 - E04)",
      "Zero surprise estimate guarantee"
    ],
    scope: {
      included: ["Full fault diagnosis", "Door lock & drain check"],
      excluded: ["PCB motherboard replacement cost"]
    }
  },
  {
    id: "srv-ro-water",
    title: "RO Water Purifier Complete Filter Overhaul",
    category: "Home Appliances",
    categoryId: "appliances",
    rating: 4.84,
    reviewsCount: 198,
    startingPrice: 449,
    originalPrice: 650,
    discountBadge: "Pure Water",
    duration: "40 - 50 mins",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    features: [
      "Sediment & pre-carbon candle replacement check",
      "TDS calibration (Pre & Post service)",
      "Pump pressure & solenoid valve test",
      "Guaranteed authentic food-grade membranes"
    ],
    scope: {
      included: ["Sanitization of storage tank", "TDS digital audit", "Pipe leakage fix"],
      excluded: ["Membrane cost (charged as per OEM rate card)"]
    }
  },
  {
    id: "srv-carpentry-lock",
    title: "High-Security Main Door Digital / Mortise Lock Fitting",
    category: "Carpentry & Fitting",
    categoryId: "carpentry",
    rating: 4.93,
    reviewsCount: 142,
    startingPrice: 499,
    originalPrice: 750,
    discountBadge: "Precision Fit",
    duration: "60 mins",
    image: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=600&q=80",
    features: [
      "Precision mortise chiseling & strike plate alignment",
      "Deadbolt latch smooth operation check",
      "Handle spring tension calibration",
      "30-day alignment guarantee"
    ],
    scope: {
      included: ["Fitting labor for lock body and handles", "Key cylinder tuning"],
      excluded: ["Cost of brand-new lock unit"]
    }
  },
  {
    id: "srv-bathroom-deep-clean",
    title: "Intense Bathroom Limescale & Tile Grout Descaling",
    category: "Deep Cleaning",
    categoryId: "deep-cleaning",
    rating: 4.89,
    reviewsCount: 280,
    startingPrice: 699,
    originalPrice: 999,
    discountBadge: "Eco Steam",
    duration: "75 mins",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    features: [
      "Hard water stain & scale removal from fixtures",
      "Tile grout motorized scrub & whitening",
      "Mirror polishing & exhaust fan degrease",
      "Hospital-grade surface sanitization"
    ],
    scope: {
      included: ["Complete sanitization of 1 standard bathroom", "All specialized cleaning chemicals"],
      excluded: ["Acid wash causing marble damage"]
    }
  }
];

export const SEED_USERS = [
  {
    id: "customer-demo-1",
    role: "customer",
    name: "Aarav Patel",
    email: "customer@fixnear.com",
    phone: "+91 98201 54321",
    city: "Mumbai",
    currentAddress: "Flat 402, Green Meadows, Bandra West, Mumbai 400050",
    pincode: "400050",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date().toISOString()
  },
  {
    id: "provider-demo-1",
    role: "provider",
    name: "Ramesh Sharma",
    email: "provider@fixnear.com",
    phone: "+91 98200 11223",
    city: "Mumbai",
    currentAddress: "Bandra West, Mumbai 400050",
    pincode: "400050",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date().toISOString()
  },
  {
    id: "admin-demo-1",
    role: "admin",
    name: "FixNear Main Admin",
    email: "admin@fixnear.com",
    phone: "+91 99999 00000",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date().toISOString()
  }
];

export const SEED_PROVIDERS = [
  {
    id: "provider-demo-1",
    userId: "provider-demo-1",
    name: "Ramesh Sharma",
    phone: "+91 98200 11223",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    skills: ["ac-cooling", "plumbing"],
    experienceYears: 9,
    serviceArea: "Bandra West, Khar, Santacruz, BKC",
    bio: "Senior HVAC engineer with over 9 years of hands-on experience across inverter and cassette air conditioners. Certified by National Skill Development Council (NSDC) and police verified.",
    status: "approved", // "test_pending" | "test_failed" | "under_review" | "approved" | "suspended"
    verifiedSkills: [
      { categoryId: "ac-cooling", categoryName: "Air Conditioning", score: 92, badge: "Gold", verifiedAt: "2026-10-15" },
      { categoryId: "plumbing", categoryName: "Plumbing Systems", score: 85, badge: "Silver", verifiedAt: "2026-10-18" }
    ],
    testScore: 92,
    ratingAvg: 4.94,
    ratingCount: 428,
    jobsDone: 1420,
    isOnline: true,
    certificateUrl: "https://example.com/nsdc-cert.pdf",
    idProofUrl: "https://example.com/aadhaar-sample.jpg"
  },
  {
    id: "provider-demo-2",
    userId: "provider-demo-2",
    name: "Vikas Deshmukh",
    phone: "+91 98200 22334",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80",
    skills: ["electrical"],
    experienceYears: 7,
    serviceArea: "Bandra West, Kurla West, Dadar, BKC",
    bio: "Licensed Grade-A wireman and electrician specializing in circuit breaker balancing, smart automation and surge protection systems.",
    status: "approved",
    verifiedSkills: [
      { categoryId: "electrical", categoryName: "Electrical & Safety", score: 95, badge: "Gold", verifiedAt: "2026-10-10" }
    ],
    testScore: 95,
    ratingAvg: 4.91,
    ratingCount: 310,
    jobsDone: 980,
    isOnline: true
  },
  {
    id: "provider-demo-3",
    userId: "provider-demo-3",
    name: "Sunil Nair",
    phone: "+91 98200 33445",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    skills: ["plumbing"],
    experienceYears: 8,
    serviceArea: "Bandra West, Andheri West, Powai",
    bio: "Master plumber accredited by Indian Plumbing Skills Council. Expert in non-destructive leak triage, pressure boosting, and motorized drain unclogging.",
    status: "approved",
    verifiedSkills: [
      { categoryId: "plumbing", categoryName: "Plumbing Systems", score: 88, badge: "Silver", verifiedAt: "2026-10-12" }
    ],
    testScore: 88,
    ratingAvg: 4.89,
    ratingCount: 265,
    jobsDone: 850,
    isOnline: false
  },
  {
    id: "provider-demo-pending",
    userId: "provider-demo-pending",
    name: "Karan Verma",
    phone: "+91 98200 99887",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    skills: ["ac-cooling", "electrical"],
    experienceYears: 4,
    serviceArea: "Andheri East, Powai",
    bio: "Experienced technician in AC filter cleaning and domestic switchboards.",
    status: "under_review", // Candidate for Admin approval desk
    verifiedSkills: [
      { categoryId: "ac-cooling", categoryName: "Air Conditioning", score: 82, badge: "Silver", verifiedAt: "2026-10-25" }
    ],
    testScore: 82,
    ratingAvg: 0,
    ratingCount: 0,
    jobsDone: 0,
    isOnline: false,
    tabSwitches: 1,
    idProofUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80",
    certificateUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "provider-demo-flagged",
    userId: "provider-demo-flagged",
    name: "Santosh Yadav",
    phone: "+91 98200 44556",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    skills: ["appliances", "plumbing"],
    experienceYears: 3,
    serviceArea: "Dadar, Parel, Lower Parel",
    bio: "General appliance technician handling domestic repair calls.",
    status: "approved",
    verifiedSkills: [
      { categoryId: "appliances", categoryName: "Home Appliances", score: 74, badge: "Silver", verifiedAt: "2026-10-02" }
    ],
    testScore: 74,
    ratingAvg: 3.2, // Below 3.5 after 7 reviews -> Auto-flagged with "Needs attention"
    ratingCount: 7,
    jobsDone: 18,
    isOnline: false,
    idProofUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80"
  }
];

export const SEED_DISPUTES = [
  {
    id: "DSP-3104",
    bookingId: "FX-98214",
    customerId: "customer-demo-1",
    customerName: "Aarav Patel",
    customerPhone: "+91 98201 54321",
    providerId: "provider-demo-1",
    providerName: "Ramesh Sharma",
    providerPhone: "+91 98200 11223",
    serviceTitle: "Split AC Master Service & Jet Clean",
    status: "OPEN", // "OPEN", "RESOLVED"
    reason: "Water leaking inside bedroom after service",
    details: "The technician replaced the capacitor and serviced the AC, but after 2 hours water started dripping rapidly from the indoor casing onto the wooden flooring.",
    photoUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80",
    escrowAmount: 1407,
    requestedResolution: "Full refund or urgent re-service",
    timeline: [
      { timestamp: "2026-10-27 11:30 AM", title: "Job Marked Completed", note: "OTP verified by provider" },
      { timestamp: "2026-10-27 01:15 PM", title: "Dispute Raised by Customer", note: "Reason: Water leakage reported" }
    ],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

export const SEED_BOOKINGS = [
  {
    id: "FX-98214",
    customerId: "customer-demo-1",
    customerName: "Aarav Patel",
    customerPhone: "+91 98201 54321",
    providerId: "provider-demo-1",
    providerName: "Ramesh Sharma",
    providerPhone: "+91 98200 11223",
    technicianName: "Ramesh Sharma",
    serviceId: "srv-ac-service",
    serviceTitle: "Split AC Master Service & Jet Clean",
    address: "Flat 402, Green Meadows, Bandra West, Mumbai 400050",
    pincode: "400050",
    slot: "Morning (10:00 AM - 01:00 PM)",
    scheduledDate: "Today",
    problemNote: "AC cooling reduced over past week, whistling sound coming from outdoor compressor fan.",
    status: "WORKING", // "REQUESTED", "ACCEPTED", "ON_THE_WAY", "WORKING", "COMPLETED", "CANCELLED"
    price: 599,
    basePrice: 599,
    quotation: {
      id: "QUO-7712",
      reason: "Outdoor compressor fan run-capacitor degraded (tested 18uF vs rated 45uF), causing thermal cutoffs.",
      diagnosticReport: "Motor running at 4.2A (above 2.8A normal rating). Replacing capacitor will restore full cooling coil temperature to 14°C.",
      validUntil: "Today, 11:59 PM (Valid for 14 hrs)",
      parts: [
        { name: "OEM EPCOS Dual Motor Run-Capacitor (45+5 uF)", cost: 450, tax: 40, oemCertified: true },
        { name: "High-Temperature Outdoor Anti-Vibration Bushings (Set of 4)", cost: 200, tax: 18, oemCertified: true }
      ],
      laborAddon: 100,
      taxes: 58,
      totalExtra: 808,
      baselineService: 599,
      finalTotalEstimate: 1407,
      status: "PENDING_CUSTOMER_APPROVAL", // "PENDING_CUSTOMER_APPROVAL" | "APPROVED" | "REJECTED"
      requestedAt: "Today, 10:30 AM"
    },
    invoice: {
      invoiceNo: "INV-98214",
      status: "UNPAID",
      issuedAt: "Upon work completion",
      approvedQuotationTotal: 1407,
      actualBilledTotal: 1407,
      lineItemsApproved: [
        { desc: "Split AC Master Service & Jet Clean (Base)", amount: 599 },
        { desc: "OEM EPCOS Dual Motor Run-Capacitor (45+5 uF)", amount: 490 },
        { desc: "High-Temperature Outdoor Anti-Vibration Bushings", amount: 218 },
        { desc: "Precision Labor Calibration & Fitting", amount: 100 }
      ],
      lineItemsActual: [
        { desc: "Split AC Master Service & Jet Clean (Base)", amount: 599 },
        { desc: "OEM EPCOS Dual Motor Run-Capacitor (45+5 uF)", amount: 490 },
        { desc: "High-Temperature Outdoor Anti-Vibration Bushings", amount: 218 },
        { desc: "Precision Labor Calibration & Fitting", amount: 100 }
      ],
      hasVariance: false,
      varianceAmount: 0,
      varianceExplanation: "Charges strictly match approved quotation QUO-7712."
    },
    otp: "4821",
    completionOtp: "4821",
    timeline: [
      { step: "Booking Created", time: "Yesterday, 06:30 PM", done: true },
      { step: "Provider Accepted (Ramesh Sharma)", time: "Yesterday, 07:15 PM", done: true },
      { step: "Provider On The Way", time: "Today, 09:45 AM", done: true },
      { step: "Working: Diagnostics & Jet Clean", time: "Today, 10:15 AM", current: true },
      { step: "Completion with OTP", time: "Pending", done: false }
    ],
    createdAt: new Date().toISOString()
  }
];

// Helper to seed everything into Firestore collections
export async function seedFirestoreDatabase(db, { doc, setDoc }) {
  const stats = {
    categories: 0,
    services: 0,
    questions: 0,
    users: 0,
    providers: 0,
    bookings: 0
  };

  // 1. Categories
  for (const cat of SEED_CATEGORIES) {
    await setDoc(doc(db, "categories", cat.id), cat, { merge: true });
    stats.categories++;
  }

  // 2. Services
  for (const srv of SEED_SERVICES) {
    await setDoc(doc(db, "services", srv.id), srv, { merge: true });
    stats.services++;
  }

  // 3. Question Bank (90 questions)
  for (let i = 0; i < QUESTION_BANK_SEED.length; i++) {
    const q = QUESTION_BANK_SEED[i];
    const qId = `q-${q.categoryId}-${i + 1}`;
    await setDoc(doc(db, "questionBank", qId), { ...q, id: qId }, { merge: true });
    stats.questions++;
  }

  // 4. Users
  for (const u of SEED_USERS) {
    await setDoc(doc(db, "users", u.id), u, { merge: true });
    stats.users++;
  }

  // 5. Providers
  for (const p of SEED_PROVIDERS) {
    await setDoc(doc(db, "providers", p.id), p, { merge: true });
    stats.providers++;
  }

  // 6. Bookings
  for (const b of SEED_BOOKINGS) {
    await setDoc(doc(db, "bookings", b.id), b, { merge: true });
    stats.bookings++;
  }

  return stats;
}
