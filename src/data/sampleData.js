// ===================================================================
// FixNear Trust - Sample Data for UI/UX Evaluation
// Note: All data below is clearly identified mock data for frontend preview
// ===================================================================

export const DEMO_USER = {
  name: "Aarav Patel",
  email: "aarav.patel@example.com",
  phone: "+91 98201 54321",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  currentAddress: "Flat 402, Green Meadows, Bandra West, Mumbai 400050",
  pincode: "400050",
  savedAddresses: [
    { id: "addr_1", label: "Home", address: "Flat 402, Green Meadows, Bandra West, Mumbai 400050", isDefault: true },
    { id: "addr_2", label: "Office", address: "Unit 12B, Trade Tower, BKC, Mumbai 400051", isDefault: false },
  ],
  notificationsCount: 3
};

export const SERVICE_CATEGORIES = [
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

export const FEATURED_SERVICES = [
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
    id: "srv-plumbing-leak",
    title: "Precision Tap & Concealed Pipe Leak Triage",
    category: "Plumbing Systems",
    categoryId: "plumbing",
    rating: 4.92,
    reviewsCount: 512,
    startingPrice: 299,
    originalPrice: 449,
    discountBadge: "Standard Flat Inspection",
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
  }
];

export const TRUST_PILLARS = [
  {
    icon: "ShieldCheck",
    title: "Vetted & Certified Technicians",
    description: "Every partner passes criminal background checks, skill assessments, and continuous customer rating audits."
  },
  {
    icon: "ReceiptText",
    title: "Transparent Digital Quotations",
    description: "No verbal estimates. Review itemized labor and parts on your screen before authorizing any repair."
  },
  {
    icon: "ClockAlert",
    title: "Guaranteed Punctuality",
    description: "Your time matters. Real-time arrival windows with dedicated technician communication."
  },
  {
    icon: "BadgeCheck",
    title: "30-Day Workmanship Warranty",
    description: "If an issue reoccurs within 30 days, we send a technician back for a free inspection and rectification."
  }
];

export const FEATURED_TECHNICIANS = [
  {
    id: "tech-1",
    name: "Ramesh Sharma",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    specialty: "Senior HVAC & Cooling Specialist",
    rating: 4.94,
    reviewsCount: 428,
    experience: "9+ Years",
    trustScore: "98% Trust Index",
    badges: ["Police Verified", "FixNear Gold", "Top Rated 2026"],
    jobsCompleted: 1420,
    eta: "35 mins away"
  },
  {
    id: "tech-2",
    name: "Vikas Deshmukh",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80",
    specialty: "Licensed Master Electrician",
    rating: 4.91,
    reviewsCount: 310,
    experience: "7+ Years",
    trustScore: "96% Trust Index",
    badges: ["Licensed Wireman", "Background Checked"],
    jobsCompleted: 980,
    eta: "50 mins away"
  },
  {
    id: "tech-3",
    name: "Sunil Nair",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    specialty: "Master Plumber & Sanitization Pro",
    rating: 4.89,
    reviewsCount: 265,
    experience: "8+ Years",
    trustScore: "97% Trust Index",
    badges: ["Plumbing Council Certified", "Police Verified"],
    jobsCompleted: 850,
    eta: "25 mins away"
  }
];

export const CUSTOMER_TESTIMONIALS = [
  {
    id: "rev-1",
    author: "Pooja Hegde",
    locality: "Khar West, Mumbai",
    service: "Split AC Deep Clean",
    rating: 5,
    date: "3 days ago",
    content: "The technician arrived right on time with high-pressure cleaning gear. The pricing breakdown was shown on the app before he touched a single screw. Truly refreshing level of professionalism.",
    verified: true
  },
  {
    id: "rev-2",
    author: "Devendra Verma",
    locality: "Indiranagar, Bangalore",
    service: "Distribution Box MCB Tripping Fix",
    rating: 5,
    date: "1 week ago",
    content: "Our main MCB kept tripping every evening. Vikas diagnosed an overloaded neutral wire in 20 minutes that two previous local technicians couldn't figure out. Highly recommended!",
    verified: true
  },
  {
    id: "rev-3",
    author: "Ananya Sen",
    locality: "Salt Lake, Kolkata",
    service: "Concealed Bathroom Leak Repair",
    rating: 5,
    date: "2 weeks ago",
    content: "What impressed me was the 30-day warranty card issued right after completion. Clean, quiet work, and no random extra charges asked at the doorstep.",
    verified: true
  }
];
