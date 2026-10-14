import mongoose from 'mongoose';

const prizeSchema = new mongoose.Schema(
  {
    place: { type: String, required: true },
    reward: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Hackathon title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [6000, 'Description cannot exceed 6000 characters'],
    },
    organizer: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
    },
    websiteUrl: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      enum: ['Online', 'In-Person', 'Hybrid'],
      default: 'Online',
    },
    location: {
      type: String,
      default: 'Virtual / Discord',
    },
    prizes: [prizeSchema],
    themes: {
      type: [String],
      default: ['AI & ML', 'Web3', 'Open Innovation', 'Social Good'],
    },
    bannerImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'ended'],
      default: 'upcoming',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
  },
  {
    timestamps: true,
  }
);

hackathonSchema.index({ status: 1, startDate: 1 });
hackathonSchema.index({ title: 'text', description: 'text', themes: 'text' });

export const Hackathon = mongoose.model('Hackathon', hackathonSchema);
