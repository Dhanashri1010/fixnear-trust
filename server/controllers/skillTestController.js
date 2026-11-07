import mongoose from 'mongoose';
import { Question } from '../models/Question.js';
import { SkillTestSession } from '../models/SkillTestSession.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { Provider } from '../models/Provider.js';
import { Setting } from '../models/Setting.js';
import { Category } from '../models/Category.js';

// GET /api/skill-test/:categoryId (starts exam session, returns 10 questions without answers)
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

    // 2. Fetch 10 random questions WITHOUT correctIndex or explanation
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

    // 3. Save test session on server
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
      passMark: settings.skillTestPassMark,
      questions,
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
      session.isSubmitted = true;
      session.submittedAt = new Date();
      await session.save();

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

    // Reject answers for questions not in the session
    const sessionQIdStrings = session.questionIds.map((id) => String(id));
    const submittedAnswers = Array.isArray(answers) ? answers : [];
    const hasInvalidQuestion = submittedAnswers.some((a) => !sessionQIdStrings.includes(String(a.questionId)));

    if (hasInvalidQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Submitted answers contain questions that were not assigned in this session.',
      });
    }

    // Grade answers against DB questions
    const questionDocs = await Question.find({ _id: { $in: session.questionIds } }).select('+correctIndex +explanation');
    const questionMap = new Map();
    questionDocs.forEach((q) => questionMap.set(String(q._id), q));

    let correctCount = 0;
    const weakTopics = [];

    submittedAnswers.forEach((ans) => {
      const q = questionMap.get(String(ans.questionId));
      if (q) {
        if (Number(ans.selectedIndex) === q.correctIndex) {
          correctCount++;
        } else {
          weakTopics.push(q.questionText);
        }
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

    session.isSubmitted = true;
    session.submittedAt = new Date();
    session.score = scorePercent;
    session.passed = passed;
    await session.save();

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

