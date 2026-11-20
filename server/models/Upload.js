import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    resourceType: {
      type: String,
      enum: ['image', 'raw'],
      required: true,
    },
    contentType: {
      type: String,
      enum: ['image', 'pdf'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export const Upload = mongoose.model('Upload', uploadSchema);
export default Upload;
