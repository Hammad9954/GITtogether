import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'project', 'message', 'other'],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    targetName: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'inappropriate_content',
        'plagiarism',
        'fake_profile',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    moderator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actionTaken: {
      type: String,
      enum: ['none', 'warning_sent', 'content_removed', 'user_suspended'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

export const Report = mongoose.model('Report', reportSchema);
