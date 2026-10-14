import mongoose from 'mongoose';
import { User } from './User.js';

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    collaborationSkillsRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    communicationRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    punctualityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      required: [true, 'Feedback comment is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique review per reviewer + reviewee + project
reviewSchema.index({ reviewer: 1, reviewee: 1, project: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1 });

// Automatically recalculate user reputation score after review is saved
reviewSchema.post('save', async function () {
  try {
    const stats = await mongoose.model('Review').aggregate([
      { $match: { reviewee: this.reviewee } },
      {
        $group: {
          _id: '$reviewee',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      // Reputation score scale: base 100 + (avgRating * 20 * log(count + 1))
      const avg = stats[0].avgRating;
      const count = stats[0].count;
      const calculatedScore = Math.min(Math.round(100 + avg * 10 * Math.log2(count + 1)), 500);
      await User.findByIdAndUpdate(this.reviewee, { reputationScore: calculatedScore });
    }
  } catch (err) {
    console.error('Error updating reputation score on review save:', err);
  }
});

export const Review = mongoose.model('Review', reviewSchema);
