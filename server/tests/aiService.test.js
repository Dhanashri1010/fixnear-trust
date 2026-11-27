import { describe, it, expect } from 'vitest';
import {
  matchServicesNLP,
  rankTechniciansSmart,
  analyzeReviewSentiment,
  detectPlatformAnomalies,
  assistProblemDiagnosis
} from '../services/aiService.js';

describe('FixNear AI/ML Service Engine', () => {

  describe('1. matchServicesNLP', () => {
    const mockServices = [
      { id: 's1', title: 'Tap & Pipe Leakage Repair', categoryId: 'plumbing', features: ['Washroom', 'Kitchen'] },
      { id: 's2', title: 'Switchboard Short Circuit Fix', categoryId: 'electrician', features: ['Wiring', 'MCB'] },
      { id: 's3', title: 'AC Jet Cleaning & Gas Refill', categoryId: 'ac-repair', features: ['Cooling', 'Filter'] }
    ];

    it('matches free-form water leakage query to plumbing', () => {
      const results = matchServicesNLP('kitchen sink pipe water leakage', mockServices);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].categoryId).toBe('plumbing');
      expect(results[0].searchConfidence).toBeGreaterThan(0.3);
    });

    it('matches electrical sparks query to electrician', () => {
      const results = matchServicesNLP('switch spark in bedroom', mockServices);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].categoryId).toBe('electrician');
    });

    it('handles empty query gracefully', () => {
      const results = matchServicesNLP('', mockServices);
      expect(results).toEqual([]);
    });
  });

  describe('2. rankTechniciansSmart', () => {
    const mockTechs = [
      { id: 't1', name: 'Vikram', city: 'Mumbai', status: 'active', rating: 4.9, jobsCompleted: 35, skills: [{ categoryId: 'plumbing' }] },
      { id: 't2', name: 'Rajesh', city: 'Pune', status: 'active', rating: 4.2, jobsCompleted: 5, skills: [{ categoryId: 'plumbing' }] },
      { id: 't3', name: 'Ganesh', city: 'Mumbai', status: 'take_skill_test', rating: 3.8, jobsCompleted: 1, skills: [] }
    ];

    it('ranks verified local high-rated specialist highest', () => {
      const ranked = rankTechniciansSmart(mockTechs, { categoryId: 'plumbing', city: 'Mumbai' });
      expect(ranked.length).toBe(3);
      expect(ranked[0].technician.id).toBe('t1');
      expect(ranked[0].matchPercent).toBeGreaterThan(ranked[1].matchPercent);
      expect(ranked[0].badge).toBe('Top Recommended Match');
    });
  });

  describe('3. analyzeReviewSentiment', () => {
    it('detects positive sentiment and punctuality aspect', () => {
      const result = analyzeReviewSentiment('Excellent work! The technician was very punctual and on-time.', 5);
      expect(result.label).toBe('Positive');
      expect(result.score).toBeGreaterThan(0.3);
      expect(result.aspects).toContain('Punctuality & Timeliness');
    });

    it('detects negative sentiment and pricing aspect', () => {
      const result = analyzeReviewSentiment('Terrible experience, completely overpriced and slow.', 1);
      expect(result.label).toBe('Negative');
      expect(result.score).toBeLessThan(-0.3);
      expect(result.aspects).toContain('Pricing & Quotation Transparency');
    });
  });

  describe('4. detectPlatformAnomalies', () => {
    it('flags high cancellation anomaly when rate > 15%', () => {
      const mockBookings = [
        { status: 'CANCELLED' },
        { status: 'CANCELLED' },
        { status: 'CANCELLED' },
        { status: 'COMPLETED' },
        { status: 'COMPLETED' },
      ];
      const result = detectPlatformAnomalies({ bookings: mockBookings });
      expect(result.anomaliesCount).toBeGreaterThan(0);
      expect(result.anomalies[0].id).toBe('ANOMALY_HIGH_CANCELLATIONS');
    });

    it('returns healthy status when no anomalies exist', () => {
      const mockBookings = [
        { status: 'COMPLETED' },
        { status: 'COMPLETED' },
        { status: 'COMPLETED' },
      ];
      const result = detectPlatformAnomalies({ bookings: mockBookings, disputes: [], providers: [] });
      expect(result.status).toBe('Healthy');
      expect(result.anomaliesCount).toBe(0);
    });
  });

  describe('5. assistProblemDiagnosis', () => {
    it('detects electrical hazard and sets safety alert', () => {
      const result = assistProblemDiagnosis('There is an electrical spark coming from my switchboard with smoke');
      expect(result.hasHazard).toBe(true);
      expect(result.hazardAlert).toContain('Safety Notice');
      expect(result.categoryId).toBe('electrician');
    });

    it('recommends plumbing for drain clogging', () => {
      const result = assistProblemDiagnosis('Bathroom drain is clogged and water is leaking');
      expect(result.hasHazard).toBe(false);
      expect(result.categoryId).toBe('plumbing');
      expect(result.categoryName).toBe('Plumbing & Water Fittings');
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

});
