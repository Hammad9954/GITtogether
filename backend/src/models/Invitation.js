import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    inviter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      default: 'Teammate',
      trim: true,
    },
    message: {
      type: String,
      default: '',
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'canceled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

invitationSchema.index({ invitee: 1, status: 1 });
invitationSchema.index({ team: 1, invitee: 1 });

export const Invitation = mongoose.model('Invitation', invitationSchema);
