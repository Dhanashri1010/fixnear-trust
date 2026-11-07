import { Setting } from '../models/Setting.js';

// GET /api/settings (public)
export const getPlatformSettings = async (req, res, next) => {
  try {
    const settings = await Setting.getSettings();
    res.status(200).json({
      success: true,
      settings: {
        platformFee: settings.platformFee,
        platformCommissionPercent: settings.platformCommissionPercent,
        skillTestPassMark: settings.skillTestPassMark,
        skillTestTimeLimitMinutes: settings.skillTestTimeLimitMinutes,
        skillTestCooldownHours: settings.skillTestCooldownHours,
      },
    });
  } catch (err) {
    next(err);
  }
};

