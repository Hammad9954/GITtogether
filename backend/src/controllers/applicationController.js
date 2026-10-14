import { Application } from '../models/Application.js';
import { Project } from '../models/Project.js';
import { Team } from '../models/Team.js';
import { Conversation } from '../models/Conversation.js';
import { createNotification } from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const applyToProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { role, pitch, skills } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.status !== 'published') {
      return errorResponse(res, 'This project is currently not accepting applications', 400);
    }

    if (project.owner.toString() === req.user._id.toString()) {
      return errorResponse(res, 'You cannot apply to your own project', 400);
    }

    // Check existing application
    const existing = await Application.findOne({
      project: projectId,
      applicant: req.user._id,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existing) {
      return errorResponse(
        res,
        existing.status === 'accepted'
          ? 'You are already an accepted member of this project!'
          : 'You already have a pending application for this project.',
        400
      );
    }

    const application = await Application.create({
      project: projectId,
      applicant: req.user._id,
      role,
      pitch,
      skills: skills || req.user.skills || [],
      status: 'pending',
    });

    // Notify project owner
    await createNotification({
      recipient: project.owner,
      sender: req.user._id,
      type: 'application_received',
      title: 'New Project Application',
      message: `${req.user.name} applied for "${role}" on your project "${project.title}".`,
      link: `/projects/${project._id}`,
      data: { projectId: project._id, applicationId: application._id },
    });

    return successResponse(res, { application }, 'Application submitted successfully!', 201);
  } catch (err) {
    next(err);
  }
};

export const getProjectApplications = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to view applications for this project', 403);
    }

    const applications = await Application.find({ project: projectId })
      .populate('applicant', 'name email avatar college course year skills reputationScore portfolioLinks')
      .sort({ createdAt: -1 });

    return successResponse(res, { applications }, 'Applications retrieved');
  } catch (err) {
    next(err);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'project',
        select: 'title category status owner deadline bannerImage',
        populate: { path: 'owner', select: 'name avatar college' },
      })
      .sort({ createdAt: -1 });

    return successResponse(res, { applications }, 'Your applications retrieved');
  } catch (err) {
    next(err);
  }
};

export const reviewApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body; // 'accepted' | 'rejected'

    const application = await Application.findById(id).populate('project');
    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }

    const project = application.project;
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to review this application', 403);
    }

    application.status = status;
    application.feedback = feedback || '';
    application.reviewedAt = new Date();
    await application.save();

    // If accepted, add applicant to the team workspace!
    if (status === 'accepted') {
      const team = await Team.findById(project.team);
      if (team) {
        const isAlreadyMember = team.members.some(
          (m) => m.user.toString() === application.applicant.toString()
        );

        if (!isAlreadyMember) {
          team.members.push({
            user: application.applicant,
            role: application.role || 'Member',
            joinedAt: new Date(),
            permissions: ['chat', 'view_workspace'],
          });

          // Check if team is now full
          if (team.members.length >= team.maxMembers) {
            team.status = 'full';
          }
          await team.save();

          // Add to team chat room participants
          if (team.chatRoom) {
            await Conversation.findByIdAndUpdate(team.chatRoom, {
              $addToSet: { participants: application.applicant },
            });
          }
        }
      }

      // Update open positions filled count
      if (project.openPositions && project.openPositions.length > 0) {
        const targetPos = project.openPositions.find(
          (p) => p.role.toLowerCase() === application.role.toLowerCase()
        );
        if (targetPos) {
          targetPos.filled = Math.min((targetPos.filled || 0) + 1, targetPos.count);
          await project.save();
        }
      }
    }

    // Notify applicant
    await createNotification({
      recipient: application.applicant,
      sender: req.user._id,
      type: 'application_status',
      title: `Application ${status === 'accepted' ? 'Accepted! 🎉' : 'Update'}`,
      message:
        status === 'accepted'
          ? `Congratulations! You were accepted into "${project.title}" as ${application.role}.`
          : `Your application for "${project.title}" was not selected at this time.`,
      link: `/projects/${project._id}`,
      data: { projectId: project._id, status },
    });

    return successResponse(res, { application }, `Application ${status} successfully`);
  } catch (err) {
    next(err);
  }
};

export const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized to withdraw this application', 403);
    }

    if (application.status !== 'pending') {
      return errorResponse(res, `Cannot withdraw an application that is already ${application.status}`, 400);
    }

    application.status = 'withdrawn';
    await application.save();

    return successResponse(res, { application }, 'Application withdrawn');
  } catch (err) {
    next(err);
  }
};
