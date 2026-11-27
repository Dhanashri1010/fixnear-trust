// ===================================================================
// FixNear Trust - Modular AI/ML Services Engine
// 1. Natural Language Intent & Semantic Service Matcher
// 2. Multi-Factor Smart Technician Recommendation Engine
// 3. Aspect-Based Review Sentiment Analyzer
// 4. Platform Anomaly & Risk Detection Engine
// 5. Intelligent Home Service Diagnostic Wizard
// ===================================================================

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'is', 'are', 'was', 'were', 'my', 'me', 'i', 'we', 'our', 'need', 'want',
  'please', 'help', 'some', 'there', 'having', 'issue', 'problem', 'fix'
]);

const SYMPTOM_TAXONOMY = {
  plumbing: ['leak', 'leaking', 'pipe', 'tap', 'faucet', 'drain', 'clog', 'clogged', 'sink', 'toilet', 'flush', 'water', 'seepage', 'geyser', 'overflow', 'pressure'],
  electrician: ['switch', 'socket', 'wire', 'wiring', 'spark', 'short', 'circuit', 'mcb', 'fuse', 'fan', 'light', 'tripping', 'power', 'shock', 'inverter', 'appliance', 'bulb'],
  'ac-repair': ['ac', 'cooling', 'cool', 'gas', 'compressor', 'filter', 'blower', 'remote', 'noise', 'water leakage ac', 'warm air', 'thermostat', 'split ac', 'window ac'],
  carpenter: ['door', 'lock', 'hinge', 'handle', 'wood', 'furniture', 'cupboard', 'drawer', 'chair', 'table', 'bed', 'shelf', 'sliding', 'cabinet', 'latch'],
  painter: ['paint', 'painting', 'wall', 'primer', 'color', 'damp', 'distemper', 'waterproofing', 'stain', 'crack', 'whitewash', 'ceiling', 'texture'],
  cleaning: ['deep clean', 'sanitize', 'bathroom clean', 'kitchen clean', 'sofa clean', 'dusting', 'mop', 'floor', 'tile', 'grime', 'pest', 'cockroach'],
  'appliance-repair': ['refrigerator', 'fridge', 'washing machine', 'microwave', 'oven', 'ro water', 'water purifier', 'chimney', 'mixer', 'motor']
};

/**
 * 1. Intelligent Service Search (NLP Intent & Semantic Scoring)
 */
export function matchServicesNLP(query = '', services = [], categories = []) {
  if (!query || typeof query !== 'string') return [];

  const rawTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  if (rawTokens.length === 0) return services.slice(0, 10);

  // Score each service
  const scored = services.map((service) => {
    let score = 0;
    const title = (service.title || '').toLowerCase();
    const desc = (service.description || '').toLowerCase();
    const catId = (service.categoryId || service.category || '').toLowerCase();
    const tags = Array.isArray(service.features) ? service.features.map((f) => f.toLowerCase()).join(' ') : '';

    rawTokens.forEach((token) => {
      // Direct title match (highest weight)
      if (title.includes(token)) score += 4.0;
      // Category match
      if (catId.includes(token)) score += 3.0;
      // Features match
      if (tags.includes(token)) score += 2.0;
      // Description match
      if (desc.includes(token)) score += 1.5;

      // Symptom dictionary mapping
      for (const [taxCat, keywords] of Object.entries(SYMPTOM_TAXONOMY)) {
        if (keywords.includes(token) && catId.includes(taxCat)) {
          score += 3.5;
        }
      }
    });

    const maxPossible = Math.max(1, rawTokens.length * 6);
    const confidence = Math.min(0.99, Number((score / maxPossible).toFixed(2)));

    return {
      service,
      score,
      confidence,
      matchReason: confidence > 0.4 ? 'Semantic match based on reported issue keywords' : 'Catalog match'
    };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      ...item.service,
      searchConfidence: item.confidence,
      matchReason: item.matchReason
    }));
}

/**
 * 2. Smart Technician Recommendation (Multi-Factor Scoring)
 * Weights: Verified Skills 30%, Rating 25%, Completion Rate 25%, Proximity 20%
 */
export function rankTechniciansSmart(technicians = [], criteria = {}) {
  const { categoryId = '', city = 'Mumbai', urgency = 'normal' } = criteria;
  const normCity = city.toLowerCase().trim();
  const normCat = categoryId.toLowerCase().trim();

  const ranked = technicians.map((tech) => {
    // 1. Skill Match (0 to 1.0)
    let skillScore = 0.4;
    const hasSkill = Array.isArray(tech.skills) && tech.skills.some((s) => {
      const sId = (s.categoryId || s.id || s).toLowerCase();
      return sId === normCat;
    });
    const isVerified = tech.status === 'active' || tech.verificationStatus === 'approved';
    if (hasSkill && isVerified) skillScore = 1.0;
    else if (hasSkill) skillScore = 0.75;

    // 2. Rating Score (0 to 1.0)
    const rating = Number(tech.rating) || 4.2;
    const ratingScore = Math.min(1.0, Math.max(0.1, rating / 5.0));

    // 3. Completion Rate Score (0 to 1.0)
    const jobs = Number(tech.jobsCompleted) || 0;
    const completionScore = Math.min(1.0, Math.max(0.2, jobs / 25.0));

    // 4. Proximity Match (0 to 1.0)
    const techCity = (tech.city || '').toLowerCase().trim();
    const proximityScore = techCity === normCity ? 1.0 : (techCity ? 0.4 : 0.6);

    // Composite Calculation
    const composite = (
      (skillScore * 0.30) +
      (ratingScore * 0.25) +
      (completionScore * 0.25) +
      (proximityScore * 0.20)
    );

    const matchPercent = Math.round(composite * 100);

    return {
      technician: tech,
      compositeScore: Number(composite.toFixed(3)),
      matchPercent,
      breakdown: {
        skillScore: Math.round(skillScore * 100),
        ratingScore: Math.round(ratingScore * 100),
        completionScore: Math.round(completionScore * 100),
        proximityScore: Math.round(proximityScore * 100)
      },
      badge: matchPercent >= 85 ? 'Top Recommended Match' : (matchPercent >= 70 ? 'Strong Match' : 'Available Specialist')
    };
  });

  return ranked.sort((a, b) => b.compositeScore - a.compositeScore);
}

/**
 * 3. Aspect-Based Review Sentiment Analyzer
 */
const POSITIVE_LEXICON = new Set([
  'great', 'excellent', 'amazing', 'superb', 'prompt', 'quick', 'fast', 'neat',
  'clean', 'polite', 'professional', 'expert', 'perfect', 'satisfied', 'resolved',
  'skilled', 'recommend', 'recommended', 'best', 'honest', 'on-time', 'punctual'
]);

const NEGATIVE_LEXICON = new Set([
  'bad', 'poor', 'terrible', 'horrible', 'slow', 'late', 'rude', 'unprofessional',
  'dirty', 'messy', 'unresolved', 'broken', 'worst', 'overpriced', 'expensive',
  'scam', 'delay', 'delayed', 'careless', 'damaged', 'dissatisfied'
]);

export function analyzeReviewSentiment(comment = '', starRating = 5) {
  if (!comment || typeof comment !== 'string') {
    return {
      score: starRating >= 4 ? 0.75 : (starRating === 3 ? 0.0 : -0.75),
      label: starRating >= 4 ? 'Positive' : (starRating === 3 ? 'Neutral' : 'Negative'),
      aspects: ['General Service']
    };
  }

  const words = comment.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/);
  let posCount = 0;
  let negCount = 0;

  words.forEach((w) => {
    if (POSITIVE_LEXICON.has(w)) posCount++;
    if (NEGATIVE_LEXICON.has(w)) negCount++;
  });

  // Calculate polarity (-1.0 to +1.0)
  const textPolarity = (posCount - negCount) / Math.max(1, posCount + negCount);
  const ratingNormalized = (starRating - 3) / 2; // maps 1..5 to -1..+1
  const finalScore = Number(((textPolarity * 0.5) + (ratingNormalized * 0.5)).toFixed(2));

  let label = 'Neutral';
  if (finalScore >= 0.25) label = 'Positive';
  else if (finalScore <= -0.25) label = 'Negative';

  // Aspect extraction
  const aspects = [];
  const text = comment.toLowerCase();
  if (text.includes('time') || text.includes('late') || text.includes('punctual') || text.includes('fast')) {
    aspects.push('Punctuality & Timeliness');
  }
  if (text.includes('clean') || text.includes('mess') || text.includes('tidy') || text.includes('neat')) {
    aspects.push('Cleanliness & Hygiene');
  }
  if (text.includes('price') || text.includes('cost') || text.includes('charge') || text.includes('affordable')) {
    aspects.push('Pricing & Quotation Transparency');
  }
  if (text.includes('polite') || text.includes('behavior') || text.includes('rude') || text.includes('communication')) {
    aspects.push('Specialist Conduct & Etiquette');
  }
  if (aspects.length === 0) {
    aspects.push('Workmanship Quality');
  }

  return {
    score: finalScore,
    label,
    aspects,
    posCount,
    negCount
  };
}

/**
 * 4. Admin Platform Anomaly & Risk Detection Engine
 */
export function detectPlatformAnomalies({ bookings = [], disputes = [], providers = [] } = {}) {
  const anomalies = [];

  // Anomaly 1: Cancellation Rate Spike
  const total = bookings.length;
  if (total > 0) {
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    const cancelRate = (cancelled / total) * 100;
    if (cancelRate > 15) {
      anomalies.push({
        id: 'ANOMALY_HIGH_CANCELLATIONS',
        type: 'warning',
        title: 'Elevated Cancellation Frequency Detected',
        metric: `${cancelRate.toFixed(1)}% cancellation rate across recent ${total} bookings`,
        recommendation: 'Review cancellation reasons in Bookings Desk to evaluate provider responsiveness and pricing alignment.',
        severity: cancelRate > 25 ? 'critical' : 'moderate'
      });
    }
  }

  // Anomaly 2: Active Dispute Cluster
  const openDisputes = disputes.filter((d) => d.status !== 'RESOLVED' && d.status !== 'CLOSED');
  if (openDisputes.length >= 3) {
    anomalies.push({
      id: 'ANOMALY_DISPUTE_CLUSTER',
      type: 'danger',
      title: 'Active Dispute Cluster Under Review',
      metric: `${openDisputes.length} open complaints awaiting mediation desk adjudication`,
      recommendation: 'Prioritize escrow reconciliation in Dispute Mediation Desk to prevent customer trust erosion.',
      severity: openDisputes.length > 5 ? 'critical' : 'high'
    });
  }

  // Anomaly 3: Specialist Performance Risk
  const atRiskProviders = providers.filter((p) => (p.rating && p.rating < 3.8) || p.status === 'suspended');
  if (atRiskProviders.length > 0) {
    anomalies.push({
      id: 'ANOMALY_PROVIDER_RISK',
      type: 'info',
      title: 'Technicians Under Performance Monitoring',
      metric: `${atRiskProviders.length} specialists flagged for rating review or suspension`,
      recommendation: 'Issue skill retest or review recent customer feedback in Providers Desk.',
      severity: 'moderate'
    });
  }

  return {
    anomaliesCount: anomalies.length,
    status: anomalies.length === 0 ? 'Healthy' : 'Attention Required',
    anomalies,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * 5. Intelligent Customer Service Guidance & Symptom Diagnostic
 */
export function assistProblemDiagnosis(problemText = '') {
  const text = (problemText || '').toLowerCase();
  
  // Safety / Hazard Detection
  const hazardKeywords = ['spark', 'fire', 'smoke', 'shock', 'electric shock', 'gas smell', 'cylinder', 'flooding', 'burning smell'];
  const hasHazard = hazardKeywords.some((h) => text.includes(h));

  let detectedCategory = 'electrician';
  let categoryName = 'Electrician & Power Systems';
  let recommendedService = 'Doorstep Diagnostic & Quick Repair';
  let estimatedPriceRange = '₹199 - ₹499';
  let confidence = 0.70;

  // Evaluate matching category
  let maxMatches = 0;
  for (const [cat, keywords] of Object.entries(SYMPTOM_TAXONOMY)) {
    const matches = keywords.filter((k) => text.includes(k)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedCategory = cat;
    }
  }

  const categoryDetails = {
    plumbing: {
      name: 'Plumbing & Water Fittings',
      service: 'Leak Repair & Pipe Fitting Inspection',
      price: '₹249 - ₹599'
    },
    electrician: {
      name: 'Electrician & Power Systems',
      service: 'Switchboard / Wiring Short Circuit Fix',
      price: '₹199 - ₹499'
    },
    'ac-repair': {
      name: 'AC Service & Cooling Solutions',
      service: 'AC Cooling Diagnostic & Jet Cleaning',
      price: '₹499 - ₹1,199'
    },
    carpenter: {
      name: 'Carpentry & Woodwork Solutions',
      service: 'Door Lock / Hinge / Furniture Repair',
      price: '₹299 - ₹699'
    },
    painter: {
      name: 'Wall Painting & Waterproofing',
      service: 'Wall Patch Repair & Damp Treatment',
      price: '₹499 - ₹1,499'
    },
    cleaning: {
      name: 'Deep Cleaning & Sanitization',
      service: 'Intensive Bathroom & Kitchen Scrubbing',
      price: '₹399 - ₹899'
    },
    'appliance-repair': {
      name: 'Major Appliance Repair',
      service: 'Motor & Circuit Board Diagnostic',
      price: '₹349 - ₹799'
    }
  };

  const details = categoryDetails[detectedCategory] || categoryDetails.electrician;
  confidence = Math.min(0.98, Math.max(0.65, 0.65 + maxMatches * 0.1));

  return {
    hasHazard,
    hazardAlert: hasHazard
      ? 'Safety Notice: Disconnect main power or water line immediately if safe to do so. Our verified emergency specialist has been prioritized for dispatch.'
      : null,
    categoryId: detectedCategory,
    categoryName: details.name,
    recommendedService: details.service,
    estimatedPriceRange: details.price,
    confidence: Number(confidence.toFixed(2)),
    troubleshootingTips: [
      'Ensure the immediate area is clean and accessible for the specialist.',
      'Check if warranty applies to the malfunctioning unit.',
      'Keep your 4-digit finish code confidential until work has been demonstrated.'
    ]
  };
}
