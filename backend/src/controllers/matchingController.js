import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import {
  calculateProjectCompatibility,
  calculateStudentCompatibility,
} from '../services/matchingService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getRecommendedProjects = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Get published projects not owned by current user
    const projects = await Project.find({
      owner: { $ne: user._id },
      status: 'published',
      isModerated: false,
    })
      .populate('owner', 'name avatar college reputationScore')
      .populate('team', 'members maxMembers');

    // Score each project
    const scored = projects.map((project) => {
      const { score, reasons } = calculateProjectCompatibility(user, project);
      return {
        project,
        matchScore: score,
        matchReasons: reasons,
      };
    });

    // Sort by matchScore descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    const limit = parseInt(req.query.limit || '10', 10);
    const results = scored.slice(0, limit);

    return successResponse(
      res,
      { recommendations: results, total: scored.length },
      'Recommended projects based on your skills and interests'
    );
  } catch (err) {
    next(err);
  }
};

export const getRecommendedStudents = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const students = await User.find({
      _id: { $ne: user._id },
      isSuspended: false,
    });

    const scored = students.map((otherUser) => {
      const { score, reasons } = calculateStudentCompatibility(user, otherUser);
      return {
        student: otherUser,
        matchScore: score,
        matchReasons: reasons,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    const limit = parseInt(req.query.limit || '10', 10);
    const results = scored.slice(0, limit);

    return successResponse(
      res,
      { recommendations: results, total: scored.length },
      'Recommended teammates based on complementary skills and synergy'
    );
  } catch (err) {
    next(err);
  }
};

export const compareStudentToProject = async (req, res, next) => {
  try {
    const { studentId, projectId } = req.params;

    const [student, project] = await Promise.all([
      User.findById(studentId),
      Project.findById(projectId).populate('owner', 'name avatar'),
    ]);

    if (!student || !project) {
      return errorResponse(res, 'Student or Project not found', 404);
    }

    const match = calculateProjectCompatibility(student, project);

    return successResponse(
      res,
      {
        student: { _id: student._id, name: student.name, skills: student.skills },
        project: { _id: project._id, title: project.title, requiredSkills: project.requiredSkills },
        matchScore: match.score,
        matchReasons: match.reasons,
      },
      'Match analysis completed'
    );
  } catch (err) {
    next(err);
  }
};
