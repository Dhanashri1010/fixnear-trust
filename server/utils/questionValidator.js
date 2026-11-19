// ===================================================================
// FixNear Trust - Question Bank Quality & Fairness Validator
// Validates:
// 1. At least 20 active questions per category
// 2. Position spread: positions 0, 1, 2, 3 must each be correct in 20% - 30% of questions
// 3. Longest option metric: correct answer is the longest in at most 30% of questions
// 4. No duplicate options within any question
// 5. Non-empty explanation, topic, questionText, and 4 non-empty options
// ===================================================================

/**
 * Validates the quality, balance, and integrity of the question bank.
 * Throws a descriptive Error if any rule is violated.
 * 
 * @param {Array} questions - Array of Question documents or seed objects
 * @param {Array} categories - Array of category descriptors (e.g. SEED_CATEGORIES)
 * @returns {Object} Quality metrics report
 */
export const verifyQuestionBankQuality = (questions, categories) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Question bank is empty or invalid array.');
  }
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error('Categories list is empty or invalid array.');
  }

  const report = {
    totalQuestions: questions.length,
    categoryReports: {},
  };

  for (const cat of categories) {
    const catId = cat.id || cat.categoryId;
    const catName = cat.name || catId;
    const catQuestions = questions.filter(
      (q) => q.categoryId === catId && q.isActive !== false
    );

    // Rule 1: At least 20 active questions per category
    if (catQuestions.length < 20) {
      throw new Error(
        `[Question Bank Quality Error] Category '${catName}' (${catId}) has only ${catQuestions.length} active questions. Minimum required is 20.`
      );
    }

    const positionCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let longestCorrectCount = 0;
    const topicsSeen = new Set();

    catQuestions.forEach((q, idx) => {
      const qPrefix = `[Category: ${catId}, Question #${idx + 1}]`;

      // Rule 5: Basic completeness
      if (!q.questionText || typeof q.questionText !== 'string' || !q.questionText.trim()) {
        throw new Error(`${qPrefix} questionText is missing or empty.`);
      }

      if (!q.topic || typeof q.topic !== 'string' || !q.topic.trim()) {
        throw new Error(`${qPrefix} "${q.questionText.slice(0, 40)}..." is missing a valid topic.`);
      }
      topicsSeen.add(q.topic.trim());

      if (!q.explanation || typeof q.explanation !== 'string' || !q.explanation.trim()) {
        throw new Error(`${qPrefix} "${q.questionText.slice(0, 40)}..." is missing an explanation.`);
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`${qPrefix} must have exactly 4 options.`);
      }

      // Rule 4: No duplicate options
      const trimmedOptions = q.options.map((opt, oIdx) => {
        if (!opt || typeof opt !== 'string' || !opt.trim()) {
          throw new Error(`${qPrefix} Option ${oIdx} is empty.`);
        }
        return opt.trim();
      });

      const uniqueOptions = new Set(trimmedOptions.map((o) => o.toLowerCase()));
      if (uniqueOptions.size !== 4) {
        throw new Error(`${qPrefix} "${q.questionText.slice(0, 40)}..." contains duplicate options.`);
      }

      // Valid correctIndex
      if (
        typeof q.correctIndex !== 'number' ||
        !Number.isInteger(q.correctIndex) ||
        q.correctIndex < 0 ||
        q.correctIndex > 3
      ) {
        throw new Error(`${qPrefix} correctIndex (${q.correctIndex}) must be 0, 1, 2, or 3.`);
      }

      positionCounts[q.correctIndex]++;

      // Rule 3: Check if correct answer is the longest option (or tied for longest)
      const lengths = trimmedOptions.map((o) => o.length);
      const maxLength = Math.max(...lengths);
      const correctLength = lengths[q.correctIndex];

      if (correctLength === maxLength) {
        longestCorrectCount++;
      }
    });

    // Rule 2: Spread correct answer positions (between 20% and 30% each)
    const positionPercentages = {};
    for (let pos = 0; pos <= 3; pos++) {
      const count = positionCounts[pos];
      const pct = (count / catQuestions.length) * 100;
      positionPercentages[pos] = pct;

      if (pct < 20 || pct > 30) {
        throw new Error(
          `[Question Bank Quality Error] Category '${catName}' (${catId}) has unbalanced position ${pos} (${count}/${catQuestions.length} = ${pct.toFixed(1)}%). Must be between 20.0% and 30.0%.`
        );
      }
    }

    // Rule 3: Correct answer must be longest option in at most 30% of questions
    const longestPct = (longestCorrectCount / catQuestions.length) * 100;
    if (longestPct > 30) {
      throw new Error(
        `[Question Bank Quality Error] Category '${catName}' (${catId}) has ${longestCorrectCount}/${catQuestions.length} (${longestPct.toFixed(1)}%) questions where the correct answer is the longest option. Maximum allowed is 30.0%.`
      );
    }

    report.categoryReports[catId] = {
      name: catName,
      totalQuestions: catQuestions.length,
      positionCounts,
      positionPercentages,
      longestCorrectCount,
      longestCorrectPercentage: longestPct,
      topics: Array.from(topicsSeen),
    };
  }

  return report;
};
