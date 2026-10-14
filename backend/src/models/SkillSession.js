import mongoose from 'mongoose';

const skillSessionSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: String,
      required: [true, 'Skill is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic / Goal is required'],
      trim: true,
      maxlength: [200, 'Topic cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    proposedDurationMinutes: {
      type: Number,
      default: 45,
      min: 15,
      max: 180,
    },
    preferredTime: {
      type: String,
      default: '',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'requested',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

skillSessionSchema.index({ provider: 1, status: 1 });
skillSessionSchema.index({ requester: 1, status: 1 });

export const SkillSession = mongoose.model('SkillSession', skillSessionSchema);
