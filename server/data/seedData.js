// ===================================================================
// FixNear Trust - Seed Data & Database Seeder
// Core categories and services for FixNear platform
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
    title: "Eco-Friendly Refrigerant Gas Refill (R32 / R410A)",
    category: "Air Conditioning",
    categoryId: "ac-cooling",
    rating: 4.82,
    reviewsCount: 174,
    startingPrice: 1299,
    originalPrice: 1800,
    discountBadge: "Fixed Gram Scale",
    duration: "60 mins",
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
