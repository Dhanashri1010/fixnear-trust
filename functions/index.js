// ===================================================================
// FixNear Trust - Cloud Functions Backend for Secure Skill Assessment
// Enforces: Server-side answer evaluation, 15-minute limit, 24h cooldown
// Correct answers are NEVER returned to the candidate's browser.
// ===================================================================

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 1. Secure Question Delivery (Strips correctIndex and explanation)
exports.getExamQuestions = onRequest({ cors: true }, async (req, res) => {
  try {
    const { categoryId = "ac-cooling" } = req.query;

    const snap = await db.collection("questions")
      .where("categoryId", "==", categoryId)
      .get();

    let questionPool = [];
    snap.forEach(doc => {
      const data = doc.data();
      // Crucial: Strip correctIndex and explanation so they NEVER enter the browser!
      questionPool.push({
        id: doc.id,
        questionNumber: 0,
        question: data.question,
        options: data.options,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        craftArea: data.craftArea || data.topic || "General Trade",
        difficulty: data.difficulty || "medium"
      });
    });

    // Shuffle and pick 10
    const shuffled = questionPool.sort(() => 0.5 - Math.random()).slice(0, 10);
    const sanitizedQuestions = shuffled.map((q, idx) => ({
      ...q,
      questionNumber: idx + 1
    }));

    return res.status(200).json({
      success: true,
      questions: sanitizedQuestions,
      examId: `exam-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timeLimitSeconds: 900 // 15 minutes
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Server-side Score Calculation & Cooldown Check
exports.evaluateExamAttempt = onRequest({ cors: true }, async (req, res) => {
  try {
    const {
      providerId,
      categoryId,
      categoryName,
      answers = {}, // { [questionId]: selectedOptionIndex }
      startTime,
      tabSwitches = 0
    } = req.body;

    if (!providerId || !categoryId) {
      return res.status(400).json({ error: "Missing providerId or categoryId" });
    }

    // 1. Enforce 24-Hour Cooldown on the Server
    const providerDoc = await db.collection("providers").doc(providerId).get();
    if (providerDoc.exists) {
      const pData = providerDoc.data();
      if (pData.cooldownUntil && new Date(pData.cooldownUntil).getTime() > Date.now()) {
        const remainingHours = Math.ceil((new Date(pData.cooldownUntil).getTime() - Date.now()) / (1000 * 60 * 60));
        return res.status(403).json({
          error: "Cooldown active",
          message: `24-hour test retake cooldown is active. Please try again in ${remainingHours} hours.`
        });
      }
    }

    // 2. Enforce 15-Minute (+ 30s network buffer) Time Limit
    const elapsedSeconds = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    const MAX_ALLOWED_SECONDS = 900 + 30; // 15 mins + 30s buffer
    const isOverdue = elapsedSeconds > MAX_ALLOWED_SECONDS;

    // 3. Evaluate Answers against server Question Bank
    const questionIds = Object.keys(answers);
    let correctCount = 0;
    const weakTopicsMap = {};

    for (const qId of questionIds) {
      const qDoc = await db.collection("questions").doc(qId).get();
      if (qDoc.exists) {
        const qData = qDoc.data();
        const userChoice = answers[qId];
        const isCorrect = !isOverdue && userChoice === qData.correctIndex;

        const topic = qData.craftArea || qData.topic || "Practical Diagnostics";
        if (!weakTopicsMap[topic]) {
          weakTopicsMap[topic] = { total: 0, wrong: 0 };
        }
        weakTopicsMap[topic].total += 1;

        if (isCorrect) {
          correctCount++;
        } else {
          weakTopicsMap[topic].wrong += 1;
        }
      }
    }

    const totalQuestions = questionIds.length || 10;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;
    const badge = score >= 90 ? "Gold" : passed ? "Silver" : "None";
    const cooldownUntil = !passed ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;

    // Identify weak topics (more than 40% errors)
    const weakTopics = Object.keys(weakTopicsMap).filter(topic => {
      const stat = weakTopicsMap[topic];
      return (stat.wrong / stat.total) >= 0.4;
    });

    const attemptRecord = {
      providerId,
      categoryId,
      categoryName: categoryName || categoryId,
      score,
      correctCount,
      totalQuestions,
      passed,
      badge,
      timeSpentSeconds: elapsedSeconds,
      tabSwitches,
      weakTopics,
      cooldownUntil,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save test attempt for Admin audit trail
    await db.collection("test_attempts").add(attemptRecord);

    // Update Provider Status in Firestore
    const updatedStatus = passed ? "under_review" : "test_failed";
    const updateData = {
      status: updatedStatus,
      testScore: score,
      cooldownUntil: cooldownUntil,
      lastTestAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (passed) {
      updateData.verifiedSkills = admin.firestore.FieldValue.arrayUnion({
        categoryId,
        categoryName: categoryName || categoryId,
        score,
        badge,
        verifiedAt: new Date().toISOString()
      });
    }

    await db.collection("providers").doc(providerId).set(updateData, { merge: true });

    return res.status(200).json({
      success: true,
      score,
      correctCount,
      totalQuestions,
      passed,
      badge,
      weakTopics,
      cooldownUntil,
      tabSwitches
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return res.status(500).json({ error: error.message });
  }
});
