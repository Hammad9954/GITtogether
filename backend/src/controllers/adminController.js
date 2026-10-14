import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Application } from '../models/Application.js';
import { Team } from '../models/Team.js';
import { Report } from '../models/Report.js';
import { Hackathon } from '../models/Hackathon.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalApplications,
      totalTeams,
      totalHackathons,
      pendingReports,
      suspendedUsers,
      categoryDistribution,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Application.countDocuments(),
      Team.countDocuments(),
      Hackathon.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ isSuspended: true }),
      Project.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { category: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Application status breakdown
    const applicationStats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return successResponse(
      res,
      {
        metrics: {
          totalUsers,
          totalProjects,
          totalApplications,
          totalTeams,
          totalHackathons,
          pendingReports,
          suspendedUsers,
        },
        categoryDistribution,
        applicationStats,
      },
      'Admin analytics retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const { search, role, isSuspended } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) query.role = role;
    if (isSuspended !== undefined) query.isSuspended = isSuspended === 'true';

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return successResponse(
      res,
      {
        users,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
      'Users retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const toggleUserSuspension = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isSuspended, suspensionReason } = req.body;

    if (userId === req.user._id.toString()) {
      return errorResponse(res, 'You cannot suspend your own admin account', 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isSuspended: Boolean(isSuspended),
        suspensionReason: suspensionReason || '',
      },
      { new: true }
    );

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(
      res,
      { user },
      `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully`
    );
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user }, `User role updated to ${role}`);
  } catch (err) {
    next(err);
  }
};

export const getReportsAdmin = async (req, res, next) => {
  try {
    const { status, targetType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (targetType) query.targetType = targetType;

    const reports = await Report.find(query)
      .populate('reporter', 'name email avatar')
      .populate('moderator', 'name')
      .sort({ createdAt: -1 });

    return successResponse(res, { reports }, 'Reports retrieved');
  } catch (err) {
    next(err);
  }
};

export const resolveReportAdmin = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, resolutionNotes, actionTaken } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return errorResponse(res, 'Report not found', 404);
    }

    report.status = status || 'resolved';
    report.resolutionNotes = resolutionNotes || '';
    report.actionTaken = actionTaken || 'none';
    report.moderator = req.user._id;

    // Apply action if requested
    if (actionTaken === 'content_removed') {
      if (report.targetType === 'project') {
        await Project.findByIdAndUpdate(report.targetId, {
          isModerated: true,
          status: 'closed',
        });
      }
    } else if (actionTaken === 'user_suspended') {
      const targetUserId = report.targetType === 'user' ? report.targetId : null;
      if (targetUserId) {
        await User.findByIdAndUpdate(targetUserId, {
          isSuspended: true,
          suspensionReason: `Suspended following moderation review: ${resolutionNotes}`,
        });
      }
    }

    await report.save();

    return successResponse(res, { report }, 'Report reviewed and resolved successfully');
  } catch (err) {
    next(err);
  }
};
