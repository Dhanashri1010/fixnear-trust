// ===================================================================
// FixNear Trust - AI/ML REST Router
// Prefix: /api/ai
// ===================================================================

import { Router } from 'express';
import {
  matchServicesNLP,
  rankTechniciansSmart,
  analyzeReviewSentiment,
  detectPlatformAnomalies,
  assistProblemDiagnosis
} from '../services/aiService.js';
import { Service } from '../models/Service.js';
import { Category } from '../models/Category.js';
import { Provider } from '../models/Provider.js';
import { Booking } from '../models/Booking.js';
import { Dispute } from '../models/Dispute.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// 1. Natural Language Service Search
router.post('/search', async (req, res) => {
  try {
    const { query = '' } = req.body;
    const [services, categories] = await Promise.all([
      Service.find({ isActive: true }).lean(),
      Category.find({}).lean()
    ]);

    const results = matchServicesNLP(query, services, categories);
    res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (err) {
    console.error('AI search error:', err);
    res.status(500).json({ success: false, message: 'AI search error: ' + err.message });
  }
});

// 2. Multi-Factor Smart Technician Recommendation
router.post('/recommend-technicians', async (req, res) => {
  try {
    const { categoryId = '', city = 'Mumbai', urgency = 'normal' } = req.body;
    const providers = await Provider.find({ isBlocked: { $ne: true } })
      .select('-privateKyc -internalNotes')
      .lean();

    const ranked = rankTechniciansSmart(providers, { categoryId, city, urgency });
    res.json({
      success: true,
      criteria: { categoryId, city, urgency },
      count: ranked.length,
      recommendations: ranked.slice(0, 10)
    });
  } catch (err) {
    console.error('AI recommend error:', err);
    res.status(500).json({ success: false, message: 'AI recommendation error: ' + err.message });
  }
});

// 3. Aspect-Based Review Sentiment Scoring
router.post('/analyze-sentiment', (req, res) => {
  try {
    const { comment = '', rating = 5 } = req.body;
    const analysis = analyzeReviewSentiment(comment, rating);
    res.json({
      success: true,
      analysis
    });
  } catch (err) {
    console.error('AI sentiment error:', err);
    res.status(500).json({ success: false, message: 'AI sentiment error: ' + err.message });
  }
});

// 4. Admin Anomaly Detection (Admin Only)
router.get('/anomalies', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [bookings, disputes, providers] = await Promise.all([
      Booking.find({}).select('status createdAt scheduledDate').sort({ createdAt: -1 }).limit(100).lean(),
      Dispute.find({}).select('status claimAmount createdAt').lean(),
      Provider.find({}).select('rating jobsCompleted status').lean()
    ]);

    const report = detectPlatformAnomalies({ bookings, disputes, providers });
    res.json({
      success: true,
      report
    });
  } catch (err) {
    console.error('AI anomalies error:', err);
    res.status(500).json({ success: false, message: 'AI anomalies error: ' + err.message });
  }
});

// 5. Intelligent Problem Diagnosis & Service Assistance
router.post('/diagnose', (req, res) => {
  try {
    const { problemText = '' } = req.body;
    const diagnosis = assistProblemDiagnosis(problemText);
    res.json({
      success: true,
      problemText,
      diagnosis
    });
  } catch (err) {
    console.error('AI diagnose error:', err);
    res.status(500).json({ success: false, message: 'AI diagnosis error: ' + err.message });
  }
});

export default router;
