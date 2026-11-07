import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global_settings',
    },
    platformFee: {
      type: Number,
      required: true,
      default: 20, // ₹20 standard trust & safety platform fee
    },
    platformCommissionPercent: {
      type: Number,
      required: true,
      default: 10, // 10% platform commission on labor/service fee
    },
    skillTestPassMark: {
      type: Number,
      required: true,
      default: 70, // 70% minimum score to pass
    },
    skillTestTimeLimitMinutes: {
      type: Number,
      required: true,
      default: 15, // 15 minutes per exam session
    },
    skillTestCooldownHours: {
      type: Number,
      required: true,
      default: 24, // 24-hour cooldown after failing a category test
    },
    activeAdminCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to get or initialize singleton settings
settingSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'global_settings' });
  if (!settings) {
    settings = await this.create({ key: 'global_settings' });
  }
  return settings;
};

export const Setting = mongoose.model('Setting', settingSchema);
export default Setting;

