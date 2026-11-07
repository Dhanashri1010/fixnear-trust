// ===================================================================
// FixNear Trust - Local In-Memory Mock Data for Admin Portal (Phase D)
// Completely decoupled from external cloud DBs, question banks, and live credentials
// ===================================================================

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
    image: "",
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
    title: "AC Gas Leakage Triage & Top-Up",
    category: "Air Conditioning",
    categoryId: "ac-cooling",
    rating: 4.82,
    reviewsCount: 218,
    startingPrice: 1499,
    originalPrice: 1999,
    discountBadge: "Fixed Price",
    duration: "60 mins",
    image: "",
    features: [
      "Nitrogen pressure hold test",
      "Flaring nut & copper brazing check",
      "OEM virgin R32 / R410A refrigerant",
      "Vacuum pump evacuation included"
    ],
    scope: {
      included: ["Leak detection", "Up to 500g refrigerant", "Amperage verification"],
      excluded: ["Compressor internal valve overhaul"]
    }
  },
  {
    id: "srv-plumbing-leak",
    title: "Concealed Pipe Leak Detection & Tap Repair",
    category: "Plumbing Systems",
    categoryId: "plumbing",
    rating: 4.91,
    reviewsCount: 412,
    startingPrice: 299,
    originalPrice: 450,
    discountBadge: "Popular",
    duration: "30 - 45 mins",
    image: "",
    features: [
      "Acoustic moisture mapping",
      "Ceramic cartridge & washer replacement",
      "Pressure balance verification",
      "Zero wall damage promise"
    ],
    scope: {
      included: ["Diagnosis of 1 concealed point", "Washer / spindle replacement"],
      excluded: ["Tiles breaking & civil re-plastering"]
    }
  },
  {
    id: "srv-mcb-tripping",
    title: "Distribution Box MCB Tripping & Short Circuit Fix",
    category: "Electrical & Safety",
    categoryId: "electrical",
    rating: 4.95,
    reviewsCount: 520,
    startingPrice: 349,
    originalPrice: 500,
    discountBadge: "Emergency",
    duration: "30 - 60 mins",
    image: "",
    features: [
      "Insulation resistance (Megger) test",
      "Neutral loop load re-balancing",
      "Schneider / Havells breaker matching",
      "Shock safety audit certificate"
    ],
    scope: {
      included: ["Triage of tripping circuit", "Tightening of busbar terminals"],
      excluded: ["Cost of replacement MCB/RCCB unit"]
    }
  }
];

export const SEED_PROVIDERS = [
  {
    id: "provider-demo-1",
    userId: "provider-demo-1",
    name: "Ramesh Sharma",
    phone: "+91 98000 00001",
    city: "Mumbai",
    avatar: "",
    skills: ["ac-cooling", "plumbing"],
    experienceYears: 6,
    serviceArea: "Bandra West, Khar West, Santacruz, Juhu",
    bio: "Certified HVAC specialist with 6 years experience in inverter AC diagnostics and eco-jet foam cleaning.",
    status: "approved",
    verifiedSkills: [
      { categoryId: "ac-cooling", categoryName: "Air Conditioning", score: 92, badge: "Gold", verifiedAt: "2026-10-15" },
      { categoryId: "plumbing", categoryName: "Plumbing Systems", score: 85, badge: "Silver", verifiedAt: "2026-10-18" }
    ],
    testScore: 92,
    ratingAvg: 4.94,
    ratingCount: 428,
    jobsDone: 1420,
    isOnline: true,
    certificateUrl: "",
    idProofUrl: ""
  },
  {
    id: "provider-demo-2",
    userId: "provider-demo-2",
    name: "Vikas Deshmukh",
    phone: "+91 98000 00002",
    city: "Mumbai",
    avatar: "",
    skills: ["electrical"],
    experienceYears: 7,
    serviceArea: "Bandra West, Kurla West, Dadar, BKC",
    bio: "Licensed Grade-A wireman and electrician specializing in circuit breaker balancing and smart automation.",
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
    id: "provider-demo-pending",
    userId: "provider-demo-pending",
    name: "Karan Verma",
    phone: "+91 98000 00003",
    city: "Mumbai",
    avatar: "",
    skills: ["ac-cooling", "electrical"],
    experienceYears: 4,
    serviceArea: "Andheri East, Powai",
    bio: "Experienced technician in AC filter cleaning and domestic switchboards.",
    status: "under_review",
    verifiedSkills: [
      { categoryId: "ac-cooling", categoryName: "Air Conditioning", score: 82, badge: "Silver", verifiedAt: "2026-10-25" }
    ],
    testScore: 82,
    ratingAvg: 0,
    ratingCount: 0,
    jobsDone: 0,
    isOnline: false,
    tabSwitches: 1,
    idProofUrl: "",
    certificateUrl: ""
  }
];

export const SEED_DISPUTES = [
  {
    id: "DSP-4012",
    disputeId: "DSP-4012",
    bookingId: "FX-98214",
    bookingNumber: "FX-98214",
    customerId: "customer-demo-1",
    customerName: "Aarav Patel",
    providerId: "provider-demo-1",
    providerName: "Ramesh Sharma",
    providerPhone: "+91 98000 00001",
    serviceTitle: "Split AC Master Service & Jet Clean",
    status: "OPEN",
    reason: "Water leaking inside bedroom after service",
    details: "Water started dripping from the casing after service.",
    escrowAmount: 1407,
    requestedResolution: "Full refund or urgent re-service",
    timeline: [
      { timestamp: "2026-10-27 11:30 AM", title: "Job Marked Completed", note: "Code verified by provider" },
      { timestamp: "2026-10-27 01:15 PM", title: "Dispute Raised by Customer", note: "Reason: Water leakage reported" }
    ],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

export const SEED_BOOKINGS = [
  {
    id: "FX-98214",
    bookingId: "FX-98214",
    customerId: "customer-demo-1",
    customerName: "Aarav Patel",
    customerPhone: "+91 98000 99999",
    providerId: "provider-demo-1",
    providerName: "Ramesh Sharma",
    providerPhone: "+91 98000 00001",
    serviceId: "srv-ac-service",
    serviceTitle: "Split AC Master Service & Jet Clean",
    address: "Bandra West, Mumbai",
    pincode: "400050",
    slot: "Morning (10:00 AM - 01:00 PM)",
    scheduledDate: "Today",
    notes: "AC cooling reduced over past week.",
    status: "WORKING",
    basePrice: 599,
    price: 599,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    author: "Pooja Hegde",
    locality: "Khar West, Mumbai",
    service: "Split AC Deep Clean",
    rating: 5,
    date: "3 days ago",
    content: "The technician arrived right on time with high-pressure cleaning gear. Highly professional.",
    verified: true
  },
  {
    id: "rev-2",
    author: "Devendra Verma",
    locality: "Indiranagar, Bangalore",
    service: "Distribution Box MCB Tripping Fix",
    rating: 5,
    date: "1 week ago",
    content: "Our main MCB kept tripping every evening. The electrician diagnosed it in 20 minutes.",
    verified: true
  }
];
