// ===================================================================
// FixNear Trust - 20 Demo Disputes Data Template
// Interconnected with Demo Bookings (0-19), Customers & Providers
// Realistic grievance reasons, claims, open cases & settled resolutions
// ===================================================================

export const DEMO_DISPUTES_TEMPLATE = [
  {
    disputeId: 'DSP-DEMO-01',
    bookingIndex: 13, // FX-DEMO-14
    reason: 'Billing Discrepancy & Extra Cash Demand',
    claimAmount: 400,
    notes: 'Technician Dinesh charged ₹400 extra in cash without uploading a formal in-app quotation. Demand refund of the unapproved cash surcharge.',
    status: 'OPEN',
    adminNote: 'Customer uploaded UPI receipt screenshot. Awaiting technician response.',
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-02',
    bookingIndex: 14, // FX-DEMO-15
    reason: 'Defective Service - Gas Leakage Recurred',
    claimAmount: 650,
    notes: 'Refrigerant was recharged 48 hours ago but cooling completely ceased yesterday. Requesting free secondary inspection or partial refund.',
    status: 'OPEN',
    adminNote: 'Warranty claim within 30-day window. Technician Suresh scheduled for re-check.',
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-03',
    bookingIndex: 0, // FX-DEMO-01
    reason: 'Water Splatter on Bedroom Wallpaper',
    claimAmount: 300,
    notes: 'Jet cleaning runoff left light moisture marks on the adjacent wallpaper panel.',
    status: 'OPEN',
    adminNote: 'Customer submitted photo of wallpaper seam. Reviewing severity.',
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-04',
    bookingIndex: 3, // FX-DEMO-04
    reason: 'Spare Part Price Mismatch',
    claimAmount: 250,
    notes: 'Washing machine shock absorbers were charged at ₹350 while OEM MRP box indicated ₹280.',
    status: 'OPEN',
    adminNote: 'Checking distributor wholesale rate card against invoiced markup.',
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-05',
    bookingIndex: 7, // FX-DEMO-08
    reason: 'Delay Beyond Scheduled Window',
    claimAmount: 150,
    notes: 'Technician reached 90 minutes after scheduled slot without advance courtesy notification.',
    status: 'OPEN',
    adminNote: 'Traffic log verified on Western Express Highway. Courtesy platform credit under review.',
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-06',
    bookingIndex: 10, // FX-DEMO-11
    reason: 'Unfinished Cleaning Residue in Drain Tray',
    claimAmount: 200,
    notes: 'Air conditioner drain tray was rinsed but sludge residue was left in the outdoor pipe outlet.',
    status: 'OPEN',
    adminNote: 'Job marked working; dispute filed midway through service.',
    isDemo: true
  },
  // Resolved with Refund
  {
    disputeId: 'DSP-DEMO-07',
    bookingIndex: 1, // FX-DEMO-02
    reason: 'Overcharged Washer Surcharge',
    claimAmount: 150,
    notes: 'Customer contested ₹150 washer charge claiming it was included in base triage.',
    status: 'RESOLVED_REFUND',
    decision: 'RESOLVED_REFUND',
    adminNote: 'Approved partial refund of ₹150 to customer wallet.',
    adminResolutionNotes: 'Customer goodwill credit applied as first-time booking promotion.',
    refundAmount: 150,
    providerPayout: 349,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-08',
    bookingIndex: 2, // FX-DEMO-03
    reason: 'Damaged Switch Plate Screw',
    claimAmount: 100,
    notes: 'Modular switch plate plastic clip cracked during removal.',
    status: 'RESOLVED_REFUND',
    decision: 'RESOLVED_REFUND',
    adminNote: 'Reimbursed replacement plate cost.',
    adminResolutionNotes: 'Direct credit of ₹100 processed to customer.',
    refundAmount: 100,
    providerPayout: 369,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-09',
    bookingIndex: 4, // FX-DEMO-05
    reason: 'Surface Scratch on Door Frame',
    claimAmount: 200,
    notes: 'Chisel slipped during lock mortise carving leaving a minor indentation.',
    status: 'RESOLVED',
    decision: 'RESOLVED',
    adminNote: 'Technician returned next morning and polished the affected woodwork at zero cost.',
    adminResolutionNotes: 'Customer confirmed satisfaction with wood wax restoration.',
    refundAmount: 0,
    providerPayout: 399,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-10',
    bookingIndex: 5, // FX-DEMO-06
    reason: 'Kitchen Exhaust Mesh Incomplete Soak',
    claimAmount: 300,
    notes: 'Inner baffle filters required secondary degreasing spray.',
    status: 'RESOLVED',
    decision: 'RESOLVED',
    adminNote: 'Service partner re-visited and completed chemical soak.',
    adminResolutionNotes: 'Customer marked ticket closed with full approval.',
    refundAmount: 0,
    providerPayout: 899,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-11',
    bookingIndex: 6, // FX-DEMO-07
    reason: 'Nitrogen Test Fee Discrepancy',
    claimAmount: 200,
    notes: 'Contested the separate ₹200 nitrogen holding test item.',
    status: 'RESOLVED_REFUND',
    decision: 'RESOLVED_REFUND',
    adminNote: 'Refunded ₹200 difference due to unclear itemization on catalog page.',
    adminResolutionNotes: 'Refund issued via original payment gateway.',
    refundAmount: 200,
    providerPayout: 1299,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-12',
    bookingIndex: 8, // FX-DEMO-09
    reason: 'Inverter Cable Lug Loose Connection',
    claimAmount: 150,
    notes: 'Terminal screw needed additional tightening after vibration test.',
    status: 'RESOLVED',
    decision: 'RESOLVED',
    adminNote: 'Technician tightened lug with torque wrench within 4 hours.',
    adminResolutionNotes: 'Safety inspection certified.',
    refundAmount: 0,
    providerPayout: 549,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-13',
    bookingIndex: 9, // FX-DEMO-10
    reason: 'Wardrobe Rail Lubricant Odor',
    claimAmount: 100,
    notes: 'Industrial grease odor lingered in the master bedroom closet.',
    status: 'RESOLVED_REFUND',
    decision: 'RESOLVED_REFUND',
    adminNote: 'Issued ₹100 courtesy voucher and technician re-cleaned with citrus solvent.',
    adminResolutionNotes: 'Courtesy voucher applied to customer profile.',
    refundAmount: 100,
    providerPayout: 349,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-14',
    bookingIndex: 11, // FX-DEMO-12
    reason: 'Scheduling Conflict & Delay Notice',
    claimAmount: 120,
    notes: 'Arrival window pushed by 45 minutes due to heavy monsoon downpour.',
    status: 'RESOLVED',
    decision: 'RESOLVED',
    adminNote: 'Dispatched notification and customer agreed to revised evening slot.',
    adminResolutionNotes: 'Mutual resolution agreed between customer and dispatch.',
    refundAmount: 0,
    providerPayout: 449,
    isDemo: true
  },
  // Resolved in Provider's Favor
  {
    disputeId: 'DSP-DEMO-15',
    bookingIndex: 12, // FX-DEMO-13
    reason: 'Unreasonable Demand for Free Geyser Replacement',
    claimAmount: 1500,
    notes: 'Customer demanded technician replace entire geyser tank under plumbing triage fee.',
    status: 'RESOLVED_PAY_PROVIDER',
    decision: 'RESOLVED_PAY_PROVIDER',
    adminNote: 'Tank corrosion is outside plumbing triage scope. Quoted repair was transparent.',
    adminResolutionNotes: 'Full payout released to provider Sunil. Explanation provided to customer.',
    refundAmount: 0,
    providerPayout: 349,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-16',
    bookingIndex: 15, // FX-DEMO-16
    reason: 'Cancellation Fee Dispute After Technician Arrival',
    claimAmount: 200,
    notes: 'Customer refused door access after technician waited 25 minutes at building reception.',
    status: 'RESOLVED_PAY_PROVIDER',
    decision: 'RESOLVED_PAY_PROVIDER',
    adminNote: 'GPS logs and gate pass record prove technician presence at scheduled time.',
    adminResolutionNotes: 'Standard visitation fee credited to technician account.',
    refundAmount: 0,
    providerPayout: 200,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-17',
    bookingIndex: 16, // FX-DEMO-17
    reason: 'Claim for Pre-Existing Tile Stain',
    claimAmount: 500,
    notes: 'Customer claimed tile acid burn was caused during balcony steam wash.',
    status: 'RESOLVED_PAY_PROVIDER',
    decision: 'RESOLVED_PAY_PROVIDER',
    adminNote: 'Pre-service photo clearly shows identical yellow acid stain before work started.',
    adminResolutionNotes: 'Pre-work inspection photos verified. Claim closed in provider favor.',
    refundAmount: 0,
    providerPayout: 899,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-18',
    bookingIndex: 17, // FX-DEMO-18
    reason: 'Travel Cancellation Fee Refund Contest',
    claimAmount: 150,
    notes: 'Emergency cancellation fee contested by customer relative.',
    status: 'RESOLVED_PAY_PROVIDER',
    decision: 'RESOLVED_PAY_PROVIDER',
    adminNote: 'Technician was already 80% en route when cancellation was triggered.',
    adminResolutionNotes: 'Travel reimbursement verified and disbursed.',
    refundAmount: 0,
    providerPayout: 150,
    isDemo: true
  },
  // Rejected Claims (Frivolous claims)
  {
    disputeId: 'DSP-DEMO-19',
    bookingIndex: 18, // FX-DEMO-19
    reason: 'Demanded Compensation for Building Society Fine',
    claimAmount: 1000,
    notes: 'Customer claimed society penalty for commercial visitor entry should be borne by platform.',
    status: 'REJECTED',
    decision: 'REJECTED',
    adminNote: 'Society visitor policy is the sole legal responsibility of the resident.',
    adminResolutionNotes: 'Claim dismissed per Section 8.4 of FixNear Terms of Service.',
    refundAmount: 0,
    providerPayout: 0,
    isDemo: true
  },
  {
    disputeId: 'DSP-DEMO-20',
    bookingIndex: 19, // FX-DEMO-20
    reason: 'Compensation for Time Spent on Unassigned Booking',
    claimAmount: 500,
    notes: 'Customer requested direct cash compensation because no technician was available at 8:30 PM.',
    status: 'REJECTED',
    decision: 'REJECTED',
    adminNote: 'No service contract formed; full payment was never captured. No loss incurred.',
    adminResolutionNotes: 'Claim dismissed. App correctly indicated unassigned status with zero fee.',
    refundAmount: 0,
    providerPayout: 0,
    isDemo: true
  }
];
