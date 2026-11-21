import { describe, it, expect } from 'vitest';
import { calculateInvoice } from '../utils/invoiceCalculator.js';
import { serializePublicProvider } from '../utils/publicProviderSerializer.js';

describe('Invoice Calculator Utility', () => {
  it('calculates invoice amounts with default fees and commissions', () => {
    const result = calculateInvoice({
      baseAmount: 499,
      extraAmount: 200,
      platformFee: 20,
      commissionRate: 10,
    });

    // total = 499 + 200 + 20 = 719
    expect(result.totalAmount).toBe(719);
    // commission = Math.round(719 * 0.10) = 72
    expect(result.platformCommission).toBe(72);
    // providerNet = max(0, 719 - 20 - 72) = 627
    expect(result.providerNet).toBe(627);
    expect(result.baseAmount).toBe(499);
    expect(result.extraAmount).toBe(200);
    expect(result.platformFee).toBe(20);
    expect(result.commissionRate).toBe(10);
  });

  it('handles zero extra amount and settings fallbacks', () => {
    const result = calculateInvoice({
      baseAmount: 300,
      settings: { platformFee: 25, platformCommissionPercent: 12 },
    });

    expect(result.extraAmount).toBe(0);
    expect(result.platformFee).toBe(25);
    expect(result.commissionRate).toBe(12);
    // total = 300 + 0 + 25 = 325
    expect(result.totalAmount).toBe(325);
    // commission = Math.round(325 * 0.12) = 39
    expect(result.platformCommission).toBe(39);
    // providerNet = 325 - 25 - 39 = 261
    expect(result.providerNet).toBe(261);
  });

  it('safely clamps negative amounts to 0', () => {
    const result = calculateInvoice({
      baseAmount: -100,
      extraAmount: -50,
      platformFee: 0,
      commissionRate: 10,
    });

    expect(result.baseAmount).toBe(0);
    expect(result.extraAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
    expect(result.platformCommission).toBe(0);
    expect(result.providerNet).toBe(0);
  });

  it('never produces negative providerNet even if fees exceed total', () => {
    const result = calculateInvoice({
      baseAmount: 10,
      extraAmount: 0,
      platformFee: 50,
      commissionRate: 100,
    });

    // total = 10 + 0 + 50 = 60
    expect(result.totalAmount).toBe(60);
    // commission = 60
    expect(result.platformCommission).toBe(60);
    // providerNet = max(0, 60 - 50 - 60) = 0
    expect(result.providerNet).toBe(0);
  });
});

describe('Public Provider Serializer Utility', () => {
  const mockProvider = {
    _id: 'prov123',
    userId: 'user456',
    name: 'Ramesh Sharma',
    email: 'ramesh.sharma@example.com',
    phone: '9876543210',
    city: 'Mumbai',
    specialty: 'Electrical Specialist',
    ratingAvg: 4.8,
    ratingCount: 15,
    jobsDone: 30,
    experienceYears: 5,
    serviceArea: 'Andheri, Bandra',
    isOnline: true,
    status: 'approved',
    verifiedBadge: true,
    badges: ['Skill Verified', 'Top Rated'],
    adminNotes: 'Internal confidential note',
    rejectionReason: 'Old reason',
    idProofUrl: 'https://cdn.example.com/id.pdf',
    idProofPublicId: 'fixnear_kyc_private/user456/id.pdf',
    certificateUrl: 'https://cdn.example.com/cert.pdf',
    certificatePublicId: 'fixnear_kyc_private/user456/cert.pdf',
    skills: [
      {
        categoryId: 'electrical',
        categoryName: 'Electrical & Safety',
        testScore: 90,
        passed: true,
        badge: 'Gold',
        status: 'approved',
        verifiedAt: new Date('2026-01-01'),
      },
      {
        categoryId: 'plumbing',
        categoryName: 'Plumbing',
        testScore: 40,
        passed: false,
        badge: '',
        status: 'failed',
      },
      {
        categoryId: 'ac-cooling',
        categoryName: 'AC Repair',
        testScore: 85,
        passed: true,
        badge: 'Silver',
        status: 'passed', // Not yet approved by admin!
      },
    ],
  };

  it('strips PII, KYC documents, and admin notes from public responses', () => {
    const serialized = serializePublicProvider(mockProvider);

    expect(serialized.name).toBe('Ramesh Sharma');
    expect(serialized.city).toBe('Mumbai');
    expect(serialized.specialty).toBe('Electrical Specialist');
    expect(serialized.ratingAvg).toBe(4.8);

    // Sensitive fields must NOT exist in public response
    expect(serialized.email).toBeUndefined();
    expect(serialized.phone).toBeUndefined();
    expect(serialized.adminNotes).toBeUndefined();
    expect(serialized.rejectionReason).toBeUndefined();
    expect(serialized.idProofUrl).toBeUndefined();
    expect(serialized.idProofPublicId).toBeUndefined();
    expect(serialized.certificateUrl).toBeUndefined();
    expect(serialized.certificatePublicId).toBeUndefined();
    expect(serialized.userId).toBeUndefined();
  });

  it('includes only admin-approved passed skills for public view', () => {
    const serialized = serializePublicProvider(mockProvider);

    expect(serialized.skills).toHaveLength(1);
    expect(serialized.skills[0].categoryId).toBe('electrical');
    expect(serialized.skills[0].badge).toBe('Gold');
    // Test score should be omitted from public skill representation
    expect(serialized.skills[0].testScore).toBeUndefined();
  });

  it('preserves userId when includeUserId option is true', () => {
    const serialized = serializePublicProvider(mockProvider, { includeUserId: true });
    expect(serialized.userId).toBe('user456');
    expect(serialized.email).toBeUndefined();
  });

  it('returns full document when isAdmin option is true', () => {
    const serialized = serializePublicProvider(mockProvider, { isAdmin: true });

    expect(serialized.email).toBe('ramesh.sharma@example.com');
    expect(serialized.phone).toBe('9876543210');
    expect(serialized.adminNotes).toBe('Internal confidential note');
    expect(serialized.idProofPublicId).toBe('fixnear_kyc_private/user456/id.pdf');
    expect(serialized.skills).toHaveLength(3);
  });
});
