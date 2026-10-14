import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: [true, 'Role applied for is required'],
      trim: true,
    },
    pitch: {
      type: String,
      required: [true, 'Pitch message is required'],
      maxlength: [2000, 'Pitch cannot exceed 2000 characters'],
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    feedback: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active applications from the same user to the same project
applicationSchema.index({ project: 1, applicant: 1, status: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ project: 1 });

export const Application = mongoose.model('Application', applicationSchema);
