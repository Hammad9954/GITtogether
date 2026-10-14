import mongoose from 'mongoose';

const openPositionSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true },
    count: { type: Number, default: 1, min: 1 },
    filled: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    requiredSkills: { type: [String], default: [] },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web App',
        'Mobile App',
        'AI/ML',
        'Blockchain',
        'Cybersecurity',
        'IoT / Hardware',
        'Game Dev',
        'Open Source',
        'Research',
        'Other',
      ],
      default: 'Web App',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    requiredSkills: {
      type: [String],
      default: [],
      set: (skills) => skills.map((s) => s.trim().toLowerCase()),
    },
    openPositions: [openPositionSchema],
    teamSize: {
      type: Number,
      default: 4,
      min: 1,
      max: 20,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'paused', 'completed', 'closed'],
      default: 'published',
    },
    tags: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      default: '',
    },
    liveUrl: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search, filter & matching
projectSchema.index({ status: 1, category: 1 });
projectSchema.index({ requiredSkills: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Project = mongoose.model('Project', projectSchema);
