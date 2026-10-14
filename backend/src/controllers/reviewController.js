import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Project } from '../models/Project.js';
import { Team } from '../models/Team.js';
import { createNotification } from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createReview = async (req, res, next) => {
  try {
    const {
      revieweeId,
      projectId,
      rating,
      collaborationSkillsRating,
      communicationRating,
      punctualityRating,
      comment,
    } = req.body;
    const reviewerId = req.user._id;

    if (revieweeId === reviewerId.toString()) {
      return errorResponse(res, 'You cannot review yourself', 400);
    }

    // Verify project exists
    const project = await Project.findById(projectId).populate('team');
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Authorization check: Verify reviewer and reviewee actually collaborated on this project
    const isReviewerOwner = project.owner.toString() === reviewerId.toString();
    const isRevieweeOwner = project.owner.toString() === revieweeId;

    let collaborated = false;
    if (project.team) {
      const team = await Team.findById(project.team);
      if (team) {
        const reviewerInTeam = team.members.some((m) => m.user.toString() === reviewerId.toString());
        const revieweeInTeam = team.members.some((m) => m.user.toString() === revieweeId);
        collaborated = (reviewerInTeam || isReviewerOwner) && (revieweeInTeam || isRevieweeOwner);
      }
    } else {
      collaborated = (isReviewerOwner || isRevieweeOwner);
    }

    if (!collaborated && req.user.role !== 'admin') {
      return errorResponse(
        res,
        'Unauthorized: You can only review students you have actively collaborated with on this project.',
        403
      );
    }

    // Check duplicate review
    const existing = await Review.findOne({
      reviewer: reviewerId,
      reviewee: revieweeId,
      project: projectId,
    });

    if (existing) {
      return errorResponse(res, 'You have already submitted a review for this collaborator on this project.', 409);
    }

    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      project: projectId,
      team: project.team?._id || null,
      rating,
      collaborationSkillsRating: collaborationSkillsRating || 5,
      communicationRating: communicationRating || 5,
      punctualityRating: punctualityRating || 5,
      comment,
    });

    await createNotification({
      recipient: revieweeId,
      sender: reviewerId,
      type: 'review_received',
      title: 'New Peer Review Received ⭐',
      message: `${req.user.name} gave you a ${rating}-star collaboration review for "${project.title}".`,
      link: `/students/${revieweeId}`,
      data: { reviewId: review._id },
    });

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'name avatar college')
      .populate('project', 'title');

    return successResponse(res, { review: populated }, 'Review submitted successfully!', 201);
  } catch (err) {
    next(err);
  }
};

export const getReviewsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return errorResponse(res, 'Invalid user ID format', 400);
    }

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name avatar college course')
      .populate('project', 'title category')
      .sort({ createdAt: -1 });

    const stats = await Review.aggregate([
      { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgCollab: { $avg: '$collaborationSkillsRating' },
          avgComm: { $avg: '$communicationRating' },
          avgPunct: { $avg: '$punctualityRating' },
          total: { $sum: 1 },
        },
      },
    ]);

    return successResponse(
      res,
      { reviews, stats: stats[0] || { avgRating: 5, total: 0 } },
      'Reviews retrieved'
    );
  } catch (err) {
    next(err);
  }
};
