import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      default: 'Member',
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    permissions: {
      type: [String],
      default: ['chat', 'view_workspace'],
    },
  },
  { _id: true }
);

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
    },
    members: [teamMemberSchema],
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    maxMembers: {
      type: Number,
      default: 5,
      min: 2,
      max: 20,
    },
    status: {
      type: String,
      enum: ['recruiting', 'full', 'active', 'completed', 'disbanded'],
      default: 'recruiting',
    },
    links: {
      github: { type: String, default: '' },
      figma: { type: String, default: '' },
      docs: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

teamSchema.index({ leader: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ project: 1 });
teamSchema.index({ hackathon: 1 });

export const Team = mongoose.model('Team', teamSchema);
