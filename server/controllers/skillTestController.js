import mongoose from 'mongoose';
import { Question } from '../models/Question.js';
import { SkillTestSession } from '../models/SkillTestSession.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { Provider } from '../models/Provider.js';
import { Setting } from '../models/Setting.js';
import { Category } from '../models/Category.js';

// GET /api/skill-test/:categoryId (starts or resumes exam session, returns 10 questions without answers)
export const startSkillTest = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const settings = await Setting.getSettings();

    // 1. Check 24-hour category cooldown
    const activeCooldown = await TestAttempt.findOne({
      providerId: provider._id,
      categoryId,
      passed: false,
      cooldownUntil: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (activeCooldown) {
      const msLeft = new Date(activeCooldown.cooldownUntil).getTime() - Date.now();
      const hoursLeft = Math.ceil(msLeft / (3600 * 1000));
      return res.status(403).json({
        success: false,
        inCooldown: true,
        cooldownUntil: activeCooldown.cooldownUntil,
        message: `You must wait 24 hours before retrying this skill test. Cooldown expires in ~${hoursLeft} hours.`,
      });
    }

    // 2. Fix 2: Check for an active unsubmitted session for this provider & category
    const existingSession = await SkillTestSession.findOne({
      providerId: provider._id,
      categoryId,
      isSubmitted: false,
    }).sort({ createdAt: -1 });

    if (existingSession) {
      const elapsedSeconds = (Date.now() - new Date(existingSession.startedAt).getTime()) / 1000;
      const maxSeconds = settings.skillTestTimeLimitMinutes * 60;

      if (elapsedSeconds < maxSeconds) {
        // Still unexpired! Return this same session and the exact same questions in original order
        const qDocs = await Question.find({
          _id: { $in: existingSession.questionIds },
        }).select('-correctIndex -explanation');
        const qMap = new Map();
        qDocs.forEach((q) => qMap.set(String(q._id), q));
        const questions = existingSession.questionIds.map((id) => qMap.get(String(id))).filter(Boolean);

        const remainingSeconds = Math.max(0, Math.floor(maxSeconds - elapsedSeconds));

        return res.status(200).json({
          success: true,
          sessionId: existingSession._id,
          categoryId,
          categoryName: existingSession.categoryName,
          durationMinutes: settings.skillTestTimeLimitMinutes,
          remainingSeconds,
          passMark: settings.skillTestPassMark,
          questions,
          isResumed: true,
        });
      } else {
        // Session expired without being submitted: mark failed and start 24h cooldown
        existingSession.isSubmitted = true;
        existingSession.submittedAt = new Date();
        existingSession.score = 0;
        existingSession.passed = false;
        await existingSession.save();

        const cooldownUntil = new Date(Date.now() + settings.skillTestCooldownHours * 3600 * 1000);
        await TestAttempt.create({
          providerId: provider._id,
          userId: req.user._id,
          categoryId,
          categoryName: existingSession.categoryName,
          score: 0,
          passed: false,
          totalQuestions: existingSession.questionIds.length,
          correctAnswers: 0,
          weakTopics: ['Time limit expired'],
          warningCount: 0,
          timeSpentSeconds: Math.round(elapsedSeconds),
          cooldownUntil,
        });

        return res.status(403).json({
          success: false,
          inCooldown: true,
          cooldownUntil,
          message: 'Previous test session expired without submission. You must wait 24 hours before retrying.',
        });
      }
    }

    // 3. Fetch 10 random questions WITHOUT correctIndex or explanation
    const questions = await Question.aggregate([
      { $match: { categoryId, isActive: true } },
      { $sample: { size: 10 } },
      { $project: { correctIndex: 0, explanation: 0 } },
    ]);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active examination questions found for category '${categoryId}'.`,
      });
    }

    const categoryDoc = await Category.findOne({ categoryId });

    // 4. Save new test session on server
    const session = await SkillTestSession.create({
      providerId: provider._id,
      userId: req.user._id,
      categoryId,
      categoryName: categoryDoc?.name || categoryId,
      questionIds: questions.map((q) => q._id),
      startedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      sessionId: session._id,
      categoryId,
      categoryName: session.categoryName,
      durationMinutes: settings.skillTestTimeLimitMinutes,
      remainingSeconds: settings.skillTestTimeLimitMinutes * 60,
      passMark: settings.skillTestPassMark,
      questions,
      isResumed: false,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/skill-test/:categoryId/submit (server-side evaluation & grading)
export const submitSkillTest = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { sessionId, answers, warningCount } = req.body;

    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ success: false, message: 'Valid sessionId is required.' });
    }

    const session = await SkillTestSession.findOne({
      _id: sessionId,
      providerId: provider._id,
      categoryId,
    });

    if (!session) {
      return res.status(400).json({ success: false, message: 'Invalid or expired test session.' });
    }

    if (session.isSubmitted) {
      return res.status(400).json({
        success: false,
        message: 'This test session has already been submitted and cannot be retaken.',
      });
    }

    const settings = await Setting.getSettings();

    // Check 15-minute time limit (+ 30-second network latency tolerance)
    const timeSpentSeconds = Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000);
    const maxSeconds = settings.skillTestTimeLimitMinutes * 60 + 30;

    if (timeSpentSeconds > maxSeconds) {
      await SkillTestSession.findOneAndUpdate(
        { _id: session._id, isSubmitted: false },
        { $set: { isSubmitted: true, submittedAt: new Date(), score: 0, passed: false } }
      );

      const cooldownUntil = new Date(Date.now() + settings.skillTestCooldownHours * 3600 * 1000);
      await TestAttempt.create({
        providerId: provider._id,
        userId: req.user._id,
        categoryId,
        categoryName: session.categoryName,
        score: 0,
        passed: false,
        totalQuestions: session.questionIds.length,
        correctAnswers: 0,
        weakTopics: ['Time limit expired'],
        warningCount: Number(warningCount) || 0,
        timeSpentSeconds,
        cooldownUntil,
      });

      return res.status(400).json({
        success: false,
        message: 'Time limit exceeded (15 minutes limit). Your test session has expired.',
      });
    }

    // Fix 1: Rigorous Answer Validation
    const sessionQIdStrings = session.questionIds.map((id) => String(id));
    const submittedAnswers = Array.isArray(answers) ? answers : [];

    // Reject if more answers than assigned questions
    if (submittedAnswers.length > sessionQIdStrings.length) {
      return res.status(400).json({
        success: false,
        message: `Submitted answers count (${submittedAnswers.length}) exceeds assigned questions (${sessionQIdStrings.length}).`,
      });
    }

    const seenQIds = new Set();
    for (const ans of submittedAnswers) {
      const qIdStr = String(ans.questionId);

      // Reject duplicate questionIds (e.g. submitting multiple options for same question)
      if (seenQIds.has(qIdStr)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate answers submitted for question '${qIdStr}'. Exactly one answer per question is allowed.`,
        });
      }
      seenQIds.add(qIdStr);

      // Reject unknown questionId
      if (!sessionQIdStrings.includes(qIdStr)) {
        return res.status(400).json({
          success: false,
          message: `Question '${qIdStr}' was not assigned in this session.`,
        });
      }

      // Reject selectedIndex if not integer 0 to 3
      if (
        typeof ans.selectedIndex !== 'number' ||
        !Number.isInteger(ans.selectedIndex) ||
        ans.selectedIndex < 0 ||
        ans.selectedIndex > 3
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid selectedIndex for question '${qIdStr}'. Must be an integer between 0 and 3.`,
        });
      }
    }

    // Fix 3: ATOMIC SUBMISSION (flip isSubmitted atomically)
    const atomicSession = await SkillTestSession.findOneAndUpdate(
      { _id: session._id, isSubmitted: false },
      { $set: { isSubmitted: true, submittedAt: new Date() } },
      { new: true }
    );

    if (!atomicSession) {
      return res.status(400).json({
        success: false,
        message: 'This test session has already been submitted and cannot be retaken.',
      });
    }

    // Grade answers against DB questions (missing answers count as wrong)
    const questionDocs = await Question.find({ _id: { $in: session.questionIds } }).select('+correctIndex +explanation');
    const questionMap = new Map();
    questionDocs.forEach((q) => questionMap.set(String(q._id), q));

    const answerMap = new Map();
    submittedAnswers.forEach((a) => answerMap.set(String(a.questionId), a.selectedIndex));

    let correctCount = 0;
    const weakTopics = [];

    session.questionIds.forEach((qId) => {
      const q = questionMap.get(String(qId));
      const userSelected = answerMap.get(String(qId));
      if (q && userSelected !== undefined && userSelected === q.correctIndex) {
        correctCount++;
      } else if (q) {
        weakTopics.push(q.questionText);
      }
    });

    const totalQuestions = session.questionIds.length || 10;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= settings.skillTestPassMark;

    let badge = '';
    if (scorePercent >= 90) badge = 'Gold';
    else if (scorePercent >= 80) badge = 'Silver';
    else if (scorePercent >= 70) badge = 'Bronze';

    let cooldownUntil = null;
    if (passed) {
      const existingSkills = provider.skills || [];
      const skillIdx = existingSkills.findIndex((s) => s.categoryId === categoryId);
      if (skillIdx >= 0) {
        existingSkills[skillIdx].passed = true;
        existingSkills[skillIdx].testScore = scorePercent;
        existingSkills[skillIdx].badge = badge;
        existingSkills[skillIdx].verifiedAt = new Date();
      } else {
        existingSkills.push({
          categoryId,
          categoryName: session.categoryName || categoryId,
          passed: true,
          testScore: scorePercent,
          badge,
          verifiedAt: new Date(),
        });
      }
      provider.skills = existingSkills;

      if (provider.status === 'take_skill_test') {
        provider.status = 'waiting_for_approval';
      }
      if (badge) {
        provider.badges = [...new Set([...(provider.badges || []), `${badge} Certified`])];
      }
      await provider.save();
    } else {
      cooldownUntil = new Date(Date.now() + settings.skillTestCooldownHours * 3600 * 1000);
    }

    // Record attempt
    await TestAttempt.create({
      providerId: provider._id,
      userId: req.user._id,
      categoryId,
      categoryName: session.categoryName || categoryId,
      score: scorePercent,
      passed,
      badge,
      totalQuestions,
      correctAnswers: correctCount,
      weakTopics: weakTopics.slice(0, 3), // Top 3 weak areas
      warningCount: Number(warningCount) || 0, // Informational tab-switch count
      timeSpentSeconds,
      cooldownUntil,
    });

    atomicSession.score = scorePercent;
    atomicSession.passed = passed;
    await atomicSession.save();

    res.status(200).json({
      success: true,
      score: scorePercent,
      passed,
      badge,
      totalQuestions,
      correctAnswers: correctCount,
      weakTopics: weakTopics.slice(0, 3),
      warningCount: Number(warningCount) || 0,
      timeSpentSeconds,
      cooldownUntil,
      newStatus: provider.status,
    });
  } catch (err) {
    next(err);
  }
};
