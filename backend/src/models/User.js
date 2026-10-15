import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    college: {
      type: String,
      trim: true,
      default: '',
    },
    course: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: String,
      trim: true,
      default: '1st Year',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
      set: (skills) => skills.map((s) => s.trim().toLowerCase()),
    },
    interests: {
      type: [String],
      default: [],
    },
    portfolioLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    experience: [
      {
        title: { type: String, required: true },
        organization: { type: String, required: true },
        duration: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    availability: {
      hoursPerWeek: { type: Number, default: 10, min: 0, max: 80 },
      status: {
        type: String,
        enum: ['actively-looking', 'open-to-offers', 'busy', 'unavailable'],
        default: 'actively-looking',
      },
    },
    preferredRoles: {
      type: [String],
      default: [],
    },
    reputationScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 500,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query performance and matching
userSchema.index({ skills: 1 });
userSchema.index({ college: 1 });
userSchema.index({ 'availability.status': 1 });
userSchema.index({ role: 1 });

// Password hashing pre-save hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Profile completion percentage virtual
userSchema.virtual('profileCompletion').get(function () {
  let score = 0;
  if (this.name) score += 15;
  if (this.college) score += 15;
  if (this.course) score += 10;
  if (this.bio) score += 15;
  if (this.skills && this.skills.length > 0) score += 20;
  if (this.interests && this.interests.length > 0) score += 10;
  if (this.avatar) score += 5;
  if (this.portfolioLinks?.github || this.portfolioLinks?.linkedin) score += 10;
  return Math.min(score, 100);
});

export const User = mongoose.model('User', userSchema);
