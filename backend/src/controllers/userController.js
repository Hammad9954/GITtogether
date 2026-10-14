import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Project } from '../models/Project.js';
import { Team } from '../models/Team.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '12', 10);
    const skip = (page - 1) * limit;

    const { search, skill, college, availability, role } = req.query;
    const query = { isSuspended: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (skill) {
      const skillsArray = skill.split(',').map((s) => s.trim().toLowerCase());
      query.skills = { $in: skillsArray };
    }

    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    if (availability) {
      query['availability.status'] = availability;
    }

    if (role) {
      query.preferredRoles = { $in: [new RegExp(role, 'i')] };
    }

    // Exclude current user from list if logged in
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ reputationScore: -1, createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return paginatedResponse(res, users, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'Student profile not found', 404);
    }

    // Fetch user's projects and teams
    const [createdProjects, memberTeams, reviews] = await Promise.all([
      Project.find({ owner: user._id, status: { $ne: 'draft' } }).limit(5),
      Team.find({ 'members.user': user._id, status: { $ne: 'disbanded' } }).populate('project', 'title category'),
      Review.find({ reviewee: user._id }).populate('reviewer', 'name avatar college').populate('project', 'title').limit(10),
    ]);

    return successResponse(
      res,
      {
        user,
        projects: createdProjects,
        teams: memberTeams,
        reviews,
      },
      'User profile retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'college',
      'course',
      'year',
      'bio',
      'skills',
      'interests',
      'portfolioLinks',
      'availability',
      'preferredRoles',
      'experience',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, { user: updatedUser }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file uploaded', 400);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    return successResponse(res, { user: updatedUser, avatarUrl }, 'Avatar uploaded successfully');
  } catch (err) {
    next(err);
  }
};
