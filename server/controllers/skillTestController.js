import mongoose from 'mongoose';
import crypto from 'crypto';
import { Question } from '../models/Question.js';
import { SkillTestSession } from '../models/SkillTestSession.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { Provider } from '../models/Provider.js';
import { User } from '../models/User.js';
import { Setting } from '../models/Setting.js';
import { Category } from '../models/Category.js';
import { sendSkillTestResultEmail } from '../utils/emailHelper.js';

/**
 * Generates a randomized permutation of [0, 1, 2, 3] for option shuffling.
 * optionOrder[displayedIndex] = originalIndex
 */
const generateRandomOptionOrder = () => {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

// GET /api/skill-test/:categoryId (starts or resumes exam session, returns 10 questions without answers)
export const startSkillTest = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const settings = await Setting.getSettings();

    // 0. Requirement 5: Refuse if category has fewer than 10 active questions
    const activeQuestionsCount = await Question.countDocuments({ categoryId, isActive: true });
    if (activeQuestionsCount < 10) {
      return res.status(400).json({
        success: false,
        code: 'TEST_NOT_PREPARED',
        message: 'This test is being prepared. Please check back soon.',
      });
    }

    // 0b. Requirement 7: Check that categoryId is one of provider's selected skills
    if (provider.skills && provider.skills.length > 0) {
      const hasSkill = provider.skills.some((s) => s.categoryId === categoryId);
      if (!hasSkill) {
        return res.status(403).json({
          success: false,
          code: 'SKILL_NOT_SELECTED',
          message: 'This skill test is for a service not selected in your profile. Please add it to your services first.',
        });
      }
    } else {
      // If skills array is empty (e.g. registered before multi-skill selection), auto-add this category as initial skill
      const categoryDoc = await Category.findOne({ categoryId });
      provider.skills = [
        {
          categoryId,
          categoryName: categoryDoc?.name || categoryId,
          passed: false,
          testScore: 0,
          badge: '',
          status: 'not_taken',
        },
      ];
      await provider.save();
    }

    // 0c. Retake Check: Provider cannot start a test for a skill that is already passed unless retake window is open
    const existingSkill = provider.skills?.find((s) => s.categoryId === categoryId);
    const retakeDays = settings.skillRetakeDays || 30;

    if (existingSkill && existingSkill.passed && existingSkill.status !== 'retest_required') {
      let retakeAvailableAt = existingSkill.retakeAvailableAt;
      if (!retakeAvailableAt) {
        const baseTime = existingSkill.verifiedAt ? new Date(existingSkill.verifiedAt).getTime() : Date.now();
        retakeAvailableAt = new Date(baseTime + retakeDays * 24 * 60 * 60 * 1000);
        existingSkill.retakeAvailableAt = retakeAvailableAt;
        await provider.save();
      }

      if (new Date() < new Date(retakeAvailableAt)) {
        const dateStr = new Date(retakeAvailableAt).toISOString().split('T')[0];
        return res.status(400).json({
          success: false,
          code: 'SKILL_ALREADY_PASSED',
          message: `You have already passed this skill. You can improve your badge after ${retakeDays} days. Retake opens on ${dateStr}.`,
          retakeAvailableAt,
          currentScore: existingSkill.testScore,
          currentBadge: existingSkill.badge,
        });
      }
    }

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

    // 2. Check for an active unsubmitted session for this provider & category
    const existingSession = await SkillTestSession.findOne({
      providerId: provider._id,
      categoryId,
      isSubmitted: false,
    }).sort({ createdAt: -1 });

    if (existingSession) {
      const elapsedSeconds = (Date.now() - new Date(existingSession.startedAt).getTime()) / 1000;
      const maxSeconds = settings.skillTestTimeLimitMinutes * 60;

      if (elapsedSeconds < maxSeconds) {
        // Still unexpired! Return this same session and the exact same questions in their stored option order
        const qIds = (existingSession.shuffledQuestions && existingSession.shuffledQuestions.length > 0)
          ? existingSession.shuffledQuestions.map((sq) => sq.questionId)
          : existingSession.questionIds;

        const qDocs = await Question.find({
          _id: { $in: qIds },
        }).select('-correctIndex -explanation');
        const qMap = new Map();
        qDocs.forEach((q) => qMap.set(String(q._id), q));

        let questions = [];
        if (existingSession.shuffledQuestions && existingSession.shuffledQuestions.length > 0) {
          questions = existingSession.shuffledQuestions
            .map((sq) => {
              const rawQ = qMap.get(String(sq.questionId));
              if (!rawQ) return null;
              const shuffledOptions = sq.optionOrder.map((origIdx) => rawQ.options[origIdx]);
              return {
                _id: rawQ._id,
                categoryId: rawQ.categoryId,
                categoryName: rawQ.categoryName,
                topic: rawQ.topic,
                difficulty: rawQ.difficulty,
                questionText: rawQ.questionText,
                options: shuffledOptions,
                isActive: rawQ.isActive,
              };
            })
            .filter(Boolean);
        } else {
          questions = existingSession.questionIds.map((id) => qMap.get(String(id))).filter(Boolean);
        }

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

    // 3. Fetch exactly 10 random questions WITHOUT correctIndex or explanation
    const rawQuestions = await Question.aggregate([
      { $match: { categoryId, isActive: true } },
      { $sample: { size: 10 } },
      {
        $project: {
          _id: 1,
          categoryId: 1,
          categoryName: 1,
          topic: 1,
          difficulty: 1,
          questionText: 1,
          options: 1,
          isActive: 1,
        },
      },
    ]);

    if (!rawQuestions || rawQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active examination questions found for category '${categoryId}'.`,
      });
    }

    // 4. Shuffle options per question and record optionOrder
    const shuffledQuestions = [];
    const clientQuestions = [];

    for (const rawQ of rawQuestions) {
      const optionOrder = generateRandomOptionOrder();
      const shuffledOptions = optionOrder.map((origIdx) => rawQ.options[origIdx]);

      shuffledQuestions.push({
        questionId: rawQ._id,
        optionOrder,
      });

      clientQuestions.push({
        _id: rawQ._id,
        categoryId: rawQ.categoryId,
        categoryName: rawQ.categoryName,
        topic: rawQ.topic,
        difficulty: rawQ.difficulty,
        questionText: rawQ.questionText,
        options: shuffledOptions,
        isActive: rawQ.isActive,
      });
    }

    const categoryDoc = await Category.findOne({ categoryId });

    // 5. Save new test session on server with stored option order
    const session = await SkillTestSession.create({
      providerId: provider._id,
      userId: req.user._id,
      categoryId,
      categoryName: categoryDoc?.name || categoryId,
      questionIds: rawQuestions.map((q) => q._id),
      shuffledQuestions,
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
      questions: clientQuestions,
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

    // Rigorous Answer Validation
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

    // ATOMIC SUBMISSION (flip isSubmitted atomically)
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

    // Build map of questionId -> stored optionOrder from session
    const optionOrderMap = new Map();
    session.shuffledQuestions?.forEach((sq) => {
      optionOrderMap.set(String(sq.questionId), sq.optionOrder);
    });

    let correctCount = 0;
    const rawWeakTopics = [];

    session.questionIds.forEach((qId) => {
      const q = questionMap.get(String(qId));
      const userSelected = answerMap.get(String(qId));
      const order = optionOrderMap.get(String(qId));

      // Map displayed chosen index back to original index using stored optionOrder
      let mappedOriginalChoice = userSelected;
      if (order && userSelected !== undefined && order[userSelected] !== undefined) {
        mappedOriginalChoice = order[userSelected];
      }

      if (q && mappedOriginalChoice !== undefined && mappedOriginalChoice === q.correctIndex) {
        correctCount++;
      } else if (q) {
        // Collect realistic topic (Safety, Tools, Troubleshooting, Installation, Maintenance)
        rawWeakTopics.push(q.topic || 'Safety');
      }
    });

    const uniqueWeakTopics = [...new Set(rawWeakTopics)];
    const totalQuestions = session.questionIds.length || 10;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= settings.skillTestPassMark;

    let badge = '';
    if (scorePercent >= 90) badge = 'Gold';
    else if (scorePercent >= 80) badge = 'Silver';
    else if (scorePercent >= 70) badge = 'Bronze';

    let cooldownUntil = null;
    const providerUser = await User.findById(provider.userId);
    const existingSkills = provider.skills || [];
    const skillIdx = existingSkills.findIndex((s) => s.categoryId === categoryId);
    let targetSkill = skillIdx >= 0 ? existingSkills[skillIdx] : null;

    const retakeDays = settings.skillRetakeDays || 30;
    const wasAlreadyPassed = targetSkill && targetSkill.passed === true && targetSkill.status !== 'retest_required';
    const isRetestRequired = targetSkill && targetSkill.status === 'retest_required';
    const oldScore = targetSkill?.testScore || 0;
    const oldBadge = targetSkill?.badge || '';

    if (wasAlreadyPassed) {
      // Retake for an already-passed skill: Can ONLY improve result
      if (scorePercent > oldScore) {
        // Higher score replaces the badge and score
        targetSkill.testScore = scorePercent;
        targetSkill.badge = badge;
        targetSkill.verifiedAt = new Date();
        targetSkill.passed = true;
        targetSkill.status = 'passed';
        targetSkill.retakeAvailableAt = new Date(Date.now() + retakeDays * 24 * 60 * 60 * 1000);

        if (badge) {
          if (oldBadge && oldBadge !== badge) {
            provider.badges = (provider.badges || []).filter((b) => b !== `${oldBadge} Certified`);
          }
          provider.badges = [...new Set([...(provider.badges || []), `${badge} Certified`])];
        }

        sendSkillTestResultEmail({
          providerEmail: provider.email,
          providerName: provider.name,
          categoryName: session.categoryName,
          score: scorePercent,
          passed: true,
          badge,
          lang: providerUser?.preferredLanguage || 'en',
        }).catch(() => {});
      } else {
        // Lower or equal score, or failed retake: keep old passed, score, and badge unchanged!
        targetSkill.passed = true;
        targetSkill.testScore = oldScore;
        targetSkill.badge = oldBadge;
        targetSkill.status = 'passed';

        if (!passed) {
          // A failed retake starts a normal 24-hour wait
          cooldownUntil = new Date(Date.now() + (settings.skillTestCooldownHours || 24) * 3600 * 1000);
          sendSkillTestResultEmail({
            providerEmail: provider.email,
            providerName: provider.name,
            categoryName: session.categoryName,
            score: scorePercent,
            passed: false,
            weakTopics: uniqueWeakTopics.slice(0, 3),
            cooldownUntil,
            lang: providerUser?.preferredLanguage || 'en',
          }).catch(() => {});
        }
      }
      provider.skills = existingSkills;
      await provider.save();
    } else if (isRetestRequired) {
      // Admin forced re-test: must pass again to clear retest_required
      if (passed) {
        targetSkill.passed = true;
        targetSkill.status = 'passed';
        targetSkill.testScore = scorePercent;
        targetSkill.badge = badge;
        targetSkill.verifiedAt = new Date();
        targetSkill.retakeAvailableAt = new Date(Date.now() + retakeDays * 24 * 60 * 60 * 1000);
        targetSkill.retestReason = undefined;
        targetSkill.retestRequestedAt = undefined;

        if (badge) {
          provider.badges = [...new Set([...(provider.badges || []), `${badge} Certified`])];
        }

        sendSkillTestResultEmail({
          providerEmail: provider.email,
          providerName: provider.name,
          categoryName: session.categoryName,
          score: scorePercent,
          passed: true,
          badge,
          lang: providerUser?.preferredLanguage || 'en',
        }).catch(() => {});
      } else {
        targetSkill.passed = false;
        targetSkill.status = 'retest_required';
        cooldownUntil = new Date(Date.now() + (settings.skillTestCooldownHours || 24) * 3600 * 1000);

        sendSkillTestResultEmail({
          providerEmail: provider.email,
          providerName: provider.name,
          categoryName: session.categoryName,
          score: scorePercent,
          passed: false,
          weakTopics: uniqueWeakTopics.slice(0, 3),
          cooldownUntil,
          lang: providerUser?.preferredLanguage || 'en',
        }).catch(() => {});
      }
      provider.skills = existingSkills;
      await provider.save();
    } else {
      // First-time skill exam
      if (passed) {
        if (targetSkill) {
          targetSkill.passed = true;
          targetSkill.testScore = scorePercent;
          targetSkill.badge = badge;
          targetSkill.verifiedAt = new Date();
          targetSkill.status = 'passed';
          targetSkill.retakeAvailableAt = new Date(Date.now() + retakeDays * 24 * 60 * 60 * 1000);
        } else {
          existingSkills.push({
            categoryId,
            categoryName: session.categoryName || categoryId,
            passed: true,
            testScore: scorePercent,
            badge,
            verifiedAt: new Date(),
            status: 'passed',
            retakeAvailableAt: new Date(Date.now() + retakeDays * 24 * 60 * 60 * 1000),
          });
        }
        provider.skills = existingSkills;

        // Provider can go to waiting_for_approval as soon as ONE skill is passed
        const anyPassed = provider.skills.some((s) => s.passed);
        if (anyPassed && (provider.status === 'take_skill_test' || !provider.status)) {
          provider.status = 'waiting_for_approval';
        }
        if (badge) {
          provider.badges = [...new Set([...(provider.badges || []), `${badge} Certified`])];
        }
        await provider.save();

        sendSkillTestResultEmail({
          providerEmail: provider.email,
          providerName: provider.name,
          categoryName: session.categoryName,
          score: scorePercent,
          passed: true,
          badge,
          lang: providerUser?.preferredLanguage || 'en',
        }).catch(() => {});
      } else {
        cooldownUntil = new Date(Date.now() + (settings.skillTestCooldownHours || 24) * 3600 * 1000);
        if (targetSkill) {
          targetSkill.passed = false;
          targetSkill.testScore = scorePercent;
          targetSkill.status = 'failed';
        }
        provider.skills = existingSkills;
        await provider.save();

        sendSkillTestResultEmail({
          providerEmail: provider.email,
          providerName: provider.name,
          categoryName: session.categoryName,
          score: scorePercent,
          passed: false,
          weakTopics: uniqueWeakTopics.slice(0, 3),
          cooldownUntil,
          lang: providerUser?.preferredLanguage || 'en',
        }).catch(() => {});
      }
    }

    // Record attempt in database
    await TestAttempt.create({
      providerId: provider._id,
      userId: req.user._id,
      categoryId,
      categoryName: session.categoryName || categoryId,
      score: scorePercent,
      passed,
      badge: passed ? badge : '',
      totalQuestions,
      correctAnswers: correctCount,
      weakTopics: uniqueWeakTopics.slice(0, 3), // Realistic weak areas
      warningCount: Number(warningCount) || 0,
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
      skillPassed: targetSkill ? targetSkill.passed : passed,
      badge: targetSkill ? targetSkill.badge : badge,
      improved: wasAlreadyPassed ? scorePercent > oldScore : passed,
      totalQuestions,
      correctAnswers: correctCount,
      weakTopics: uniqueWeakTopics.slice(0, 3),
      warningCount: Number(warningCount) || 0,
      timeSpentSeconds,
      cooldownUntil,
      newStatus: provider.status,
    });
  } catch (err) {
    next(err);
  }
};
