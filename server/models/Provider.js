import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: 'Mumbai',
    },
    specialty: {
      type: String,
      default: 'General Maintenance & Repairs',
    },
    skills: [
      {
        categoryId: String,
        categoryName: String,
        testScore: Number,
        passed: Boolean,
        badge: String,
        verifiedAt: Date,
      },
    ],
    experienceYears: {
      type: Number,
      default: 3,
    },
    serviceArea: {
      type: String,
      default: '',
    },
    idProofUrl: {
      type: String,
      default: '',
    },
    idProofPublicId: {
      type: String,
      default: '',
    },
    idProofResourceType: {
      type: String,
      enum: ['image', 'raw', ''],
      default: 'image',
    },
    certificateUrl: {
      type: String,
      default: '',
    },
    certificatePublicId: {
      type: String,
      default: '',
    },
    certificateResourceType: {
      type: String,
      enum: ['image', 'raw', ''],
      default: 'image',
    },
    status: {
      type: String,
      enum: ['take_skill_test', 'waiting_for_approval', 'approved', 'rejected', 'more_info_needed', 'needs_info', 'suspended'],
      default: 'take_skill_test',
    },
    verifiedBadge: {
      type: Boolean,
      default: false,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    ratingAvg: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    jobsDone: {
      type: Number,
      default: 0,
    },
    earningsToday: {
      type: Number,
      default: 0,
    },
    earningsWeek: {
      type: Number,
      default: 0,
    },
    earningsMonth: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: ['Skill Verified'],
    },
  },
  {
    timestamps: true,
  }
);

providerSchema.index({ status: 1, city: 1 });
providerSchema.index({ skills: 1 });
providerSchema.index({ isOnline: 1 });

export const Provider = mongoose.model('Provider', providerSchema);
export default Provider;
