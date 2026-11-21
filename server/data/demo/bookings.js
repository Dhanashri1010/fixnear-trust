// ===================================================================
// FixNear Trust - 20 Demo Bookings Data Template
// Interconnected with Demo Customers (0-19) & Demo Providers (0-19)
// Varied realistic statuses, invoice calculations, completion codes & timestamps
// ===================================================================

export const DEMO_BOOKINGS_TEMPLATE = [
  {
    bookingId: 'FX-DEMO-01',
    customerIndex: 0,
    providerIndex: 0, // Rajesh Solanki
    serviceId: 'srv-ac-service',
    serviceTitle: 'Split AC Master Service & Jet Clean',
    basePrice: 599,
    address: 'B-402, Sea Green Apts, Linking Road, Bandra West',
    city: 'Mumbai',
    pincode: '400050',
    scheduledDate: '2026-11-12',
    timeSlot: '10:00 AM - 12:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '4821',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    invoice: {
      invoiceNo: 'INV-DEMO-01',
      status: 'PAID',
      baseAmount: 599,
      extraAmount: 0,
      totalAmount: 619, // 599 + 20 platform fee
      issuedAt: new Date('2026-11-12T11:45:00Z'),
      paidAt: new Date('2026-11-12T11:50:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '09:15 AM', done: true, current: false },
      { step: 'ACCEPTED', time: '09:20 AM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '09:45 AM', done: true, current: false },
      { step: 'WORKING', time: '10:10 AM', done: true, current: false },
      { step: 'COMPLETED', time: '11:45 AM', done: true, current: true }
    ],
    notes: 'Please check cooling efficiency in master bedroom.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-02',
    customerIndex: 1,
    providerIndex: 1, // Sunil Shinde
    serviceId: 'srv-plumbing-leak',
    serviceTitle: 'Precision Tap & Concealed Pipe Leak Triage',
    basePrice: 349,
    address: '12/A, Shivaji Park View, Ranade Road, Dadar West',
    city: 'Mumbai',
    pincode: '400028',
    scheduledDate: '2026-11-14',
    timeSlot: '02:00 PM - 04:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '9134',
    paymentMethod: 'CASH',
    paymentStatus: 'CASH_RECEIVED',
    invoice: {
      invoiceNo: 'INV-DEMO-02',
      status: 'PAID',
      baseAmount: 349,
      extraAmount: 150, // washer replacement
      totalAmount: 519, // 349 + 150 + 20
      issuedAt: new Date('2026-11-14T15:30:00Z'),
      paidAt: new Date('2026-11-14T15:35:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '01:10 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '01:15 PM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '01:40 PM', done: true, current: false },
      { step: 'WORKING', time: '02:05 PM', done: true, current: false },
      { step: 'COMPLETED', time: '03:30 PM', done: true, current: true }
    ],
    notes: 'Kitchen sink tap continuously dripping.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-03',
    customerIndex: 2,
    providerIndex: 2, // Amitabh Sen
    serviceId: 'srv-elec-mcb',
    serviceTitle: 'Main MCB Tripping & Short Circuit Triage',
    basePrice: 449,
    address: 'Tower 3, Apt 1802, Hiranandani Gardens, Powai',
    city: 'Mumbai',
    pincode: '400076',
    scheduledDate: '2026-11-15',
    timeSlot: '11:00 AM - 01:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '6742',
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    invoice: {
      invoiceNo: 'INV-DEMO-03',
      status: 'PAID',
      baseAmount: 449,
      extraAmount: 0,
      totalAmount: 469,
      issuedAt: new Date('2026-11-15T12:40:00Z'),
      paidAt: new Date('2026-11-15T12:45:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '10:00 AM', done: true, current: false },
      { step: 'ACCEPTED', time: '10:05 AM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '10:30 AM', done: true, current: false },
      { step: 'WORKING', time: '11:15 AM', done: true, current: false },
      { step: 'COMPLETED', time: '12:40 PM', done: true, current: true }
    ],
    notes: 'Living room lights tripping whenever AC starts.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-04',
    customerIndex: 3,
    providerIndex: 3, // Ganesh More
    serviceId: 'srv-appliance-wm',
    serviceTitle: 'Front Load Washing Machine Drum Balancing',
    basePrice: 499,
    address: 'Flat 501, Rutu Enclave, Anand Nagar, Ghodbunder Road, Thane West',
    city: 'Mumbai',
    pincode: '400615',
    scheduledDate: '2026-11-16',
    timeSlot: '04:00 PM - 06:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '3358',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    invoice: {
      invoiceNo: 'INV-DEMO-04',
      status: 'PAID',
      baseAmount: 499,
      extraAmount: 350,
      totalAmount: 869,
      issuedAt: new Date('2026-11-16T17:20:00Z'),
      paidAt: new Date('2026-11-16T17:25:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '03:10 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '03:20 PM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '03:45 PM', done: true, current: false },
      { step: 'WORKING', time: '04:15 PM', done: true, current: false },
      { step: 'COMPLETED', time: '05:20 PM', done: true, current: true }
    ],
    notes: 'Heavy vibration and clattering during spin cycle.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-05',
    customerIndex: 4,
    providerIndex: 4, // Mohammad Tariq
    serviceId: 'srv-carpentry-locks',
    serviceTitle: 'Main Door Deadbolt Latch Fitting',
    basePrice: 399,
    address: '702, Matunga Heights, Dr. Ambedkar Road, Matunga Central',
    city: 'Mumbai',
    pincode: '400019',
    scheduledDate: '2026-11-17',
    timeSlot: '09:00 AM - 11:00 AM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '8219',
    paymentMethod: 'CASH',
    paymentStatus: 'CASH_RECEIVED',
    invoice: {
      invoiceNo: 'INV-DEMO-05',
      status: 'PAID',
      baseAmount: 399,
      extraAmount: 0,
      totalAmount: 419,
      issuedAt: new Date('2026-11-17T10:35:00Z'),
      paidAt: new Date('2026-11-17T10:40:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '08:30 AM', done: true, current: false },
      { step: 'ACCEPTED', time: '08:35 AM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '08:50 AM', done: true, current: false },
      { step: 'WORKING', time: '09:10 AM', done: true, current: false },
      { step: 'COMPLETED', time: '10:35 AM', done: true, current: true }
    ],
    notes: 'Safety latch alignment for wooden main entrance door.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-06',
    customerIndex: 5,
    providerIndex: 5, // Nitin Kamble
    serviceId: 'srv-cleaning-deep',
    serviceTitle: 'Intense Kitchen & Bathroom Steam Decontamination',
    basePrice: 899,
    address: 'C-201, Evershine Nagar, Link Road, Malad West',
    city: 'Mumbai',
    pincode: '400064',
    scheduledDate: '2026-11-17',
    timeSlot: '01:00 PM - 03:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '1947',
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    invoice: {
      invoiceNo: 'INV-DEMO-06',
      status: 'PAID',
      baseAmount: 899,
      extraAmount: 0,
      totalAmount: 919,
      issuedAt: new Date('2026-11-17T15:10:00Z'),
      paidAt: new Date('2026-11-17T15:15:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '12:00 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '12:10 PM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '12:35 PM', done: true, current: false },
      { step: 'WORKING', time: '01:05 PM', done: true, current: false },
      { step: 'COMPLETED', time: '03:10 PM', done: true, current: true }
    ],
    notes: 'Chimney mesh degreasing and tile grout cleaning.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-07',
    customerIndex: 6,
    providerIndex: 6, // Suresh Prajapati
    serviceId: 'srv-ac-gas',
    serviceTitle: 'Eco-Friendly Refrigerant Gas Refill (R32 / R410A)',
    basePrice: 1299,
    address: 'Flat 304, Palm Beach Residency, Sector 19A, Vashi, Navi Mumbai',
    city: 'Mumbai',
    pincode: '400703',
    scheduledDate: '2026-11-18',
    timeSlot: '10:00 AM - 12:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '5023',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    invoice: {
      invoiceNo: 'INV-DEMO-07',
      status: 'PAID',
      baseAmount: 1299,
      extraAmount: 200,
      totalAmount: 1519,
      issuedAt: new Date('2026-11-18T11:55:00Z'),
      paidAt: new Date('2026-11-18T12:00:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '09:00 AM', done: true, current: false },
      { step: 'ACCEPTED', time: '09:05 AM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '09:30 AM', done: true, current: false },
      { step: 'WORKING', time: '10:10 AM', done: true, current: false },
      { step: 'COMPLETED', time: '11:55 AM', done: true, current: true }
    ],
    notes: 'AC blowing warm air, pressure test needed.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-08',
    customerIndex: 7,
    providerIndex: 7, // Deepak Jadhav
    serviceId: 'srv-plumbing-leak',
    serviceTitle: 'Bathroom Mixer Diverter & Shower Valve Overhaul',
    basePrice: 399,
    address: 'B-14, Tilak Nagar, Station Road, Dombivli East',
    city: 'Mumbai',
    pincode: '421201',
    scheduledDate: '2026-11-18',
    timeSlot: '03:00 PM - 05:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '7412',
    paymentMethod: 'CASH',
    paymentStatus: 'CASH_RECEIVED',
    invoice: {
      invoiceNo: 'INV-DEMO-08',
      status: 'PAID',
      baseAmount: 399,
      extraAmount: 0,
      totalAmount: 419,
      issuedAt: new Date('2026-11-18T16:45:00Z'),
      paidAt: new Date('2026-11-18T16:50:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '02:00 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '02:08 PM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '02:30 PM', done: true, current: false },
      { step: 'WORKING', time: '03:05 PM', done: true, current: false },
      { step: 'COMPLETED', time: '04:45 PM', done: true, current: true }
    ],
    notes: 'Low shower pressure and diverter stuck.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-09',
    customerIndex: 8,
    providerIndex: 8, // Prakash Rao
    serviceId: 'srv-elec-mcb',
    serviceTitle: 'Inverter Backup Transfer Switch & DB Dressing',
    basePrice: 549,
    address: 'Penthouse 14, Juhu Tara Road, Near Sea Princess, Juhu',
    city: 'Mumbai',
    pincode: '400049',
    scheduledDate: '2026-11-19',
    timeSlot: '11:00 AM - 01:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '2861',
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    invoice: {
      invoiceNo: 'INV-DEMO-09',
      status: 'PAID',
      baseAmount: 549,
      extraAmount: 0,
      totalAmount: 569,
      issuedAt: new Date('2026-11-19T12:35:00Z'),
      paidAt: new Date('2026-11-19T12:40:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '10:00 AM', done: true, current: false },
      { step: 'ACCEPTED', time: '10:04 AM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '10:30 AM', done: true, current: false },
      { step: 'WORKING', time: '11:05 AM', done: true, current: false },
      { step: 'COMPLETED', time: '12:35 PM', done: true, current: true }
    ],
    notes: 'Inverter output line buzzing under heavy load.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-10',
    customerIndex: 9,
    providerIndex: 10, // Anil Parab
    serviceId: 'srv-carpentry-locks',
    serviceTitle: 'Precision Wardrobe Slider Track Realignment',
    basePrice: 429,
    address: '603, Raj Heritage, Babhai Naka, Borivali West',
    city: 'Mumbai',
    pincode: '400092',
    scheduledDate: '2026-11-19',
    timeSlot: '02:00 PM - 04:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'NONE',
    completionOtp: '9580',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    invoice: {
      invoiceNo: 'INV-DEMO-10',
      status: 'PAID',
      baseAmount: 429,
      extraAmount: 0,
      totalAmount: 449,
      issuedAt: new Date('2026-11-19T15:45:00Z'),
      paidAt: new Date('2026-11-19T15:50:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '01:00 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '01:10 PM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '01:30 PM', done: true, current: false },
      { step: 'WORKING', time: '02:00 PM', done: true, current: false },
      { step: 'COMPLETED', time: '03:45 PM', done: true, current: true }
    ],
    notes: 'Glass wardrobe door wheel jumped off rail.',
    isDemo: true
  },
  // Active Jobs (for live customer tracking and admin active jobs counter)
  {
    bookingId: 'FX-DEMO-11',
    customerIndex: 10,
    providerIndex: 0, // Rajesh Solanki
    serviceId: 'srv-ac-service',
    serviceTitle: 'Split AC Master Service & Jet Clean',
    basePrice: 599,
    address: 'Flat 1102, Lodha Bellissimo, NM Joshi Marg, Mahalaxmi',
    city: 'Mumbai',
    pincode: '400011',
    scheduledDate: '2026-11-20',
    timeSlot: '05:00 PM - 07:00 PM',
    status: 'WORKING',
    disputeStatus: 'NONE',
    completionOtp: '1122',
    paymentMethod: 'UNPAID',
    paymentStatus: 'PENDING',
    timeline: [
      { step: 'REQUESTED', time: '04:15 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '04:22 PM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '04:40 PM', done: true, current: false },
      { step: 'WORKING', time: '05:15 PM', done: true, current: true },
      { step: 'COMPLETED', time: 'Pending', done: false, current: false }
    ],
    notes: 'Coil jet spray wash underway in master room.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-12',
    customerIndex: 11,
    providerIndex: 2, // Amitabh Sen
    serviceId: 'srv-elec-mcb',
    serviceTitle: 'Main MCB Tripping & Short Circuit Triage',
    basePrice: 449,
    address: 'A-303, Panchsheel Heights, Mahavir Nagar, Kandivali West',
    city: 'Mumbai',
    pincode: '400067',
    scheduledDate: '2026-11-20',
    timeSlot: '06:00 PM - 08:00 PM',
    status: 'ON_THE_WAY',
    disputeStatus: 'NONE',
    completionOtp: '8877',
    paymentMethod: 'UNPAID',
    paymentStatus: 'PENDING',
    timeline: [
      { step: 'REQUESTED', time: '05:10 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '05:15 PM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '05:40 PM', done: true, current: true },
      { step: 'WORKING', time: 'Pending', done: false, current: false },
      { step: 'COMPLETED', time: 'Pending', done: false, current: false }
    ],
    notes: 'Technician dispatched with multimeter & safety gear.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-13',
    customerIndex: 12,
    providerIndex: 1, // Sunil Shinde
    serviceId: 'srv-plumbing-leak',
    serviceTitle: 'Precision Tap & Concealed Pipe Leak Triage',
    basePrice: 349,
    address: 'Flat 2B, Marina Bay, Carter Road, Bandra West',
    city: 'Mumbai',
    pincode: '400050',
    scheduledDate: '2026-11-20',
    timeSlot: '07:00 PM - 09:00 PM',
    status: 'ACCEPTED',
    disputeStatus: 'NONE',
    completionOtp: '4455',
    paymentMethod: 'UNPAID',
    paymentStatus: 'PENDING',
    timeline: [
      { step: 'REQUESTED', time: '06:30 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '06:35 PM', done: true, current: true },
      { step: 'ON_THE_WAY', time: 'Pending', done: false, current: false },
      { step: 'WORKING', time: 'Pending', done: false, current: false },
      { step: 'COMPLETED', time: 'Pending', done: false, current: false }
    ],
    notes: 'Geyser inlet valve leaking drops onto electric switchboard.',
    isDemo: true
  },
  // Disputed Bookings (for grievance resolution desk)
  {
    bookingId: 'FX-DEMO-14',
    customerIndex: 13,
    providerIndex: 19, // Dinesh Rathod (Suspended / Flagged)
    serviceId: 'srv-plumbing-leak',
    serviceTitle: 'Concealed Bathroom Pipe Inspection',
    basePrice: 499,
    address: '801, Godrej Platinum, Vikhroli East',
    city: 'Mumbai',
    pincode: '400079',
    scheduledDate: '2026-11-10',
    timeSlot: '11:00 AM - 01:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'OPEN',
    completionOtp: '9911',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    invoice: {
      invoiceNo: 'INV-DEMO-14',
      status: 'PAID',
      baseAmount: 499,
      extraAmount: 400,
      totalAmount: 919,
      issuedAt: new Date('2026-11-10T12:30:00Z'),
      paidAt: new Date('2026-11-10T12:35:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '10:00 AM', done: true, current: false },
      { step: 'ACCEPTED', time: '10:15 AM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '10:45 AM', done: true, current: false },
      { step: 'WORKING', time: '11:20 AM', done: true, current: false },
      { step: 'COMPLETED', time: '12:30 PM', done: true, current: true }
    ],
    notes: 'Customer disputed extra charge for sealant.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-15',
    customerIndex: 14,
    providerIndex: 6, // Suresh Prajapati
    serviceId: 'srv-ac-gas',
    serviceTitle: 'Eco-Friendly Refrigerant Gas Refill (R32 / R410A)',
    basePrice: 1299,
    address: 'Flat 402, Gokul Concord, Dattani Park, Thakur Village, Kandivali East',
    city: 'Mumbai',
    pincode: '400101',
    scheduledDate: '2026-11-11',
    timeSlot: '02:00 PM - 04:00 PM',
    status: 'COMPLETED',
    disputeStatus: 'OPEN',
    completionOtp: '6622',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    invoice: {
      invoiceNo: 'INV-DEMO-15',
      status: 'PAID',
      baseAmount: 1299,
      extraAmount: 0,
      totalAmount: 1319,
      issuedAt: new Date('2026-11-11T15:40:00Z'),
      paidAt: new Date('2026-11-11T15:45:00Z')
    },
    timeline: [
      { step: 'REQUESTED', time: '01:00 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '01:10 PM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '01:40 PM', done: true, current: false },
      { step: 'WORKING', time: '02:15 PM', done: true, current: false },
      { step: 'COMPLETED', time: '03:40 PM', done: true, current: true }
    ],
    notes: 'Customer filed dispute: cooling stopped 48 hours after recharge.',
    isDemo: true
  },
  // Requested Bookings waiting for provider acceptance
  {
    bookingId: 'FX-DEMO-16',
    customerIndex: 15,
    providerIndex: null,
    serviceId: 'srv-carpentry-locks',
    serviceTitle: 'Main Door Deadbolt Latch Fitting',
    basePrice: 399,
    address: '14, Sai Sadan, Near Plaza Cinema, Dadar Central',
    city: 'Mumbai',
    pincode: '400014',
    scheduledDate: '2026-11-21',
    timeSlot: '09:00 AM - 11:00 AM',
    status: 'REQUESTED',
    disputeStatus: 'NONE',
    completionOtp: '7733',
    paymentMethod: 'UNPAID',
    paymentStatus: 'PENDING',
    timeline: [
      { step: 'REQUESTED', time: '08:00 AM', done: true, current: true },
      { step: 'ACCEPTED', time: 'Pending', done: false, current: false }
    ],
    notes: 'Door lock jammed from inside.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-17',
    customerIndex: 16,
    providerIndex: null,
    serviceId: 'srv-cleaning-deep',
    serviceTitle: 'Intense Kitchen & Bathroom Steam Decontamination',
    basePrice: 899,
    address: 'Tower B, 1504, Oberoi Woods, Mohan Gokhale Road, Goregaon East',
    city: 'Mumbai',
    pincode: '400063',
    scheduledDate: '2026-11-21',
    timeSlot: '11:00 AM - 01:00 PM',
    status: 'REQUESTED',
    disputeStatus: 'NONE',
    completionOtp: '2244',
    paymentMethod: 'UNPAID',
    paymentStatus: 'PENDING',
    timeline: [
      { step: 'REQUESTED', time: '09:30 AM', done: true, current: true },
      { step: 'ACCEPTED', time: 'Pending', done: false, current: false }
    ],
    notes: 'Deep clean before housewarming ceremony.',
    isDemo: true
  },
  // Cancelled Bookings
  {
    bookingId: 'FX-DEMO-18',
    customerIndex: 17,
    providerIndex: 2, // Amitabh Sen
    serviceId: 'srv-elec-mcb',
    serviceTitle: 'Main MCB Tripping & Short Circuit Triage',
    basePrice: 449,
    address: 'Flat 701, Raheja Atlantis, Worli Naka, Worli',
    city: 'Mumbai',
    pincode: '400018',
    scheduledDate: '2026-11-13',
    timeSlot: '10:00 AM - 12:00 PM',
    status: 'CANCELLED',
    disputeStatus: 'NONE',
    completionOtp: '5566',
    paymentMethod: 'UNPAID',
    paymentStatus: 'PENDING',
    cancellationReason: 'Customer had to travel urgently for medical emergency.',
    cancelledBy: 'CUSTOMER',
    timeline: [
      { step: 'REQUESTED', time: '08:30 AM', done: true, current: false },
      { step: 'ACCEPTED', time: '08:45 AM', done: true, current: false },
      { step: 'CANCELLED', time: '09:15 AM', done: true, current: true }
    ],
    notes: 'Cancelled before technician departure.',
    isDemo: true
  },
  {
    bookingId: 'FX-DEMO-19',
    customerIndex: 18,
    providerIndex: 4, // Mohammad Tariq
    serviceId: 'srv-carpentry-locks',
    serviceTitle: 'Modular Kitchen Hinge Realignment & Lock Fitting',
    basePrice: 399,
    address: '22, Belscot Tower, Lokhandwala Complex, Andheri West',
    city: 'Mumbai',
    pincode: '400053',
    scheduledDate: '2026-11-14',
    timeSlot: '04:00 PM - 06:00 PM',
    status: 'CANCELLED',
    disputeStatus: 'NONE',
    completionOtp: '9988',
    paymentMethod: 'UNPAID',
    paymentStatus: 'PENDING',
    cancellationReason: 'Building society security denied visitor entry.',
    cancelledBy: 'PROVIDER',
    timeline: [
      { step: 'REQUESTED', time: '02:00 PM', done: true, current: false },
      { step: 'ACCEPTED', time: '02:15 PM', done: true, current: false },
      { step: 'ON_THE_WAY', time: '03:30 PM', done: true, current: false },
      { step: 'CANCELLED', time: '04:05 PM', done: true, current: true }
    ],
    notes: 'Cancelled at security gate due to maintenance timing restrictions.',
    isDemo: true
  },
  // Needs Action: No Provider Found
  {
    bookingId: 'FX-DEMO-20',
    customerIndex: 19,
    providerIndex: null,
    serviceId: 'srv-ac-gas',
    serviceTitle: 'Eco-Friendly Refrigerant Gas Refill (R32 / R410A)',
    basePrice: 1299,
    address: 'Flat 302, Neelkanth Valley, Ghatkopar East',
    city: 'Mumbai',
    pincode: '400077',
    scheduledDate: '2026-11-20',
    timeSlot: '08:00 PM - 10:00 PM',
    status: 'NO_PROVIDER_FOUND',
    disputeStatus: 'NONE',
    completionOtp: '3311',
    paymentMethod: 'UNPAID',
    paymentStatus: 'PENDING',
    timeline: [
      { step: 'REQUESTED', time: '07:00 PM', done: true, current: false },
      { step: 'NO_PROVIDER_FOUND', time: '07:30 PM', done: true, current: true }
    ],
    notes: 'All area technicians currently booked or offline. Requires manual dispatch.',
    isDemo: true
  }
];
