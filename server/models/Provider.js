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
        verifiedAt: Date,
      },
    ],
    experienceYears: {
      type: Number,
      default: 3,
    },
    idProofUrl: {
      type: String,
      default: '',
    },
    certificateUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['waiting_for_approval', 'approved', 'rejected', 'more_info_needed', 'suspended'],
      default: 'waiting_for_approval',
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

export const Provider = mongoose.model('Provider', providerSchema);
export default Provider;
